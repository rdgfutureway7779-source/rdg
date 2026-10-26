import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import multer from "multer";
import { z } from "zod";
import { closePool, migrate, query, transaction } from "./db.mjs";
import { seedDatabase } from "./seed.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, "../public/uploads");
const frontendDist = path.resolve(__dirname, "../dist");
const port = Number(process.env.PORT || 8787);
const jwtSecret = process.env.JWT_SECRET;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

if (!jwtSecret || jwtSecret.length < 24)
  throw new Error("JWT_SECRET must be at least 24 characters.");
await fs.mkdir(uploadDir, { recursive: true });
await migrate();
await seedDatabase();

const app = express();
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: corsOrigin.split(",").map((value) => value.trim()), credentials: true }));
app.use(express.json({ limit: "3mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadDir, { maxAge: "7d" }));
app.use(express.static(frontendDist, { index: false }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many login attempts. Try again later." },
});
const enquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many enquiries. Please try again later." },
});

const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, message, status = 400, details) =>
  res.status(status).json({ success: false, error: message, details });

function parseJson(value, fallback = null) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function validate(schema, value, res) {
  const result = schema.safeParse(value);
  if (!result.success) {
    fail(res, "Please correct the highlighted fields.", 422, result.error.flatten());
    return null;
  }
  return result.data;
}

function tokenFromRequest(req) {
  const header = req.headers.authorization;
  return req.cookies.rdg_admin_token || (header?.startsWith("Bearer ") ? header.slice(7) : null);
}

async function requireAuth(req, res, next) {
  const token = tokenFromRequest(req);
  if (!token) return fail(res, "Authentication required.", 401);
  try {
    const payload = jwt.verify(token, jwtSecret);
    const [rows] = await query(
      "SELECT id, name, email, role, active FROM admin_users WHERE id = ? LIMIT 1",
      [payload.sub],
    );
    if (!rows[0] || !rows[0].active) return fail(res, "Your account is inactive.", 403);
    req.user = rows[0];
    next();
  } catch {
    return fail(res, "Invalid or expired session.", 401);
  }
}

function customerTokenFromRequest(req) {
  const header = req.headers.authorization;
  return req.cookies.rdg_customer_token || (header?.startsWith("Bearer ") ? header.slice(7) : null);
}

function distributorTokenFromRequest(req) {
  const header = req.headers.authorization;
  return (
    req.cookies.rdg_distributor_token || (header?.startsWith("Bearer ") ? header.slice(7) : null)
  );
}

async function requireCustomerAuth(req, res, next) {
  const token = customerTokenFromRequest(req);
  if (!token) return fail(res, "Customer login required.", 401);
  try {
    const payload = jwt.verify(token, jwtSecret);
    const [rows] = await query(
      "SELECT id, name, email, phone FROM customers WHERE id = ? LIMIT 1",
      [payload.sub],
    );
    if (!rows[0]) return fail(res, "Customer account not found.", 401);
    req.customer = rows[0];
    next();
  } catch {
    return fail(res, "Your customer session has expired.", 401);
  }
}

async function requireDistributorAuth(req, res, next) {
  const token = distributorTokenFromRequest(req);
  if (!token) return fail(res, "Distributor login required.", 401);
  try {
    const payload = jwt.verify(token, jwtSecret);
    const [rows] = await query(
      `SELECT a.id AS accountId, a.username, d.id, d.distributor_code AS distributorCode,
         d.name, d.email, d.phone, d.city, d.sponsor_code AS sponsorCode, d.status,
         m.amount AS membershipAmount, m.status AS membershipStatus,
         m.payment_status AS membershipPaymentStatus, m.starts_at AS membershipStartsAt,
         m.expires_at AS membershipExpiresAt,
         CASE WHEN m.id IS NULL THEN 'not_started'
              WHEN m.expires_at < CURDATE() THEN 'expired'
              ELSE m.status END AS membershipCurrentStatus
       FROM distributor_accounts a
       INNER JOIN distributors d ON d.id = a.distributor_id
       LEFT JOIN distributor_memberships m ON m.id = (
         SELECT m2.id FROM distributor_memberships m2
         WHERE m2.distributor_id = d.id
         ORDER BY m2.expires_at DESC, m2.id DESC LIMIT 1
       )
       WHERE a.id = ? AND d.status = 'active'
       LIMIT 1`,
      [payload.sub],
    );
    if (!rows[0]) return fail(res, "Distributor account not found or inactive.", 401);
    req.distributor = rows[0];
    next();
  } catch {
    return fail(res, "Your distributor session has expired.", 401);
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return fail(res, "You do not have permission for this action.", 403);
    next();
  };
}

async function activity(user, action, entityType, entityId, metadata = {}) {
  await query(
    "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata) VALUES (?, ?, ?, ?, ?)",
    [user?.id || null, action, entityType, entityId || null, JSON.stringify(metadata)],
  );
}

const idLevelPlan = [
  [100, 10000],
  [250, 25000],
  [500, 50000],
  [1000, 100000],
  [2500, 250000],
  [5000, 500000],
  [10000, 1000000],
  [25000, 2500000],
  [50000, 5000000],
  [100000, 10000000],
  [250000, 25000000],
  [500000, 50000000],
  [1000000, 100000000],
  [2500000, 250000000],
  [5000000, 500000000],
].map(([packageValue, networkValue], index) => ({
  level: index + 1,
  packageValue,
  networkValue,
}));

function getIdLevelProgress(value) {
  const totalIds = Math.max(0, Number(value) || 0);
  const completedLevel = Math.min(Math.floor(totalIds / 100), idLevelPlan.length);
  const current = completedLevel ? idLevelPlan[completedLevel - 1] : null;
  const next = idLevelPlan[completedLevel] || null;
  const remainingIds = next ? Math.max(next.level * 100 - totalIds, 0) : 0;
  return {
    totalIds,
    completedLevel,
    currentPackageValue: current?.packageValue || 0,
    currentNetworkValue: current?.networkValue || 0,
    nextLevel: next?.level || null,
    nextPackageValue: next?.packageValue || null,
    remainingIds,
    levelPassed: completedLevel > 0,
    message: completedLevel
      ? `Level ${completedLevel} passed — 100 IDs completed. Discount/benefit eligibility for the ₹${current.packageValue.toLocaleString("en-IN")} ID package is unlocked.`
      : `Complete ${remainingIds || 100} paid IDs to pass Level 1 and unlock the first ID package benefit.`,
  };
}

const idSchema = z.coerce.number().int().positive();
const distributorMembershipAmount = 599;
const mobileNumberPattern = /^(?:\+91|91)?[6-9]\d{9}$/;
const isValidMobileNumber = (value) =>
  mobileNumberPattern.test(String(value || "").replace(/[\s()-]/g, ""));
const optionalMobileSchema = z
  .string()
  .trim()
  .max(40)
  .optional()
  .nullable()
  .refine((value) => !value || isValidMobileNumber(value), "Enter a valid mobile number.");
const requiredMobileSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .refine(isValidMobileNumber, "Enter a valid mobile number.");
const distributorPackagePlans = [
  { packageCount: 1, packageValue: 3500 },
  { packageCount: 2, packageValue: 7000 },
  { packageCount: 3, packageValue: 10500 },
  { packageCount: 4, packageValue: 14000 },
];
const customerRegisterSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().email().max(190),
  phone: optionalMobileSchema,
  password: z.string().min(8).max(120),
});
const customerLoginSchema = z.object({
  email: z.string().email().max(190),
  password: z.string().min(1).max(120),
});
const customerOrderSchema = z.object({
  shippingName: z.string().trim().min(2).max(160),
  shippingPhone: requiredMobileSchema,
  shippingAddressLine1: z.string().trim().min(5).max(255),
  shippingAddressLine2: z.string().trim().max(255).optional().nullable(),
  shippingCity: z.string().trim().min(2).max(120),
  shippingState: z.string().trim().min(2).max(120),
  shippingPostalCode: z.string().trim().min(3).max(20),
  shippingCountry: z.string().trim().min(2).max(80).default("India"),
  customerNote: z.string().trim().max(1000).optional().nullable(),
  paymentMethod: z.literal("cash_on_delivery").default("cash_on_delivery"),
});
const distributorRegisterSchema = z.object({
  name: z.string().trim().min(2).max(160),
  username: z
    .string()
    .trim()
    .min(4)
    .max(80)
    .regex(/^[a-zA-Z0-9._-]+$/, "Use only letters, numbers, dot, underscore or hyphen."),
  email: z.string().email().max(190),
  phone: requiredMobileSchema,
  city: z.string().trim().min(2).max(120),
  sponsorCode: z.string().trim().max(80).optional().nullable(),
  packageValue: z.coerce
    .number()
    .int()
    .refine(
      (value) => distributorPackagePlans.some((item) => item.packageValue === value),
      "Select a valid distributor package.",
    ),
  password: z.string().min(8).max(120),
});
const distributorLoginSchema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(120),
});
const pageSchema = z.object({
  title: z.string().trim().min(2).max(255),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(190)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(2000).optional().nullable(),
  body: z.string().max(100000).optional().nullable(),
  status: z.enum(["draft", "published"]),
  seoTitle: z.string().max(255).optional().nullable(),
  seoDescription: z.string().max(320).optional().nullable(),
  showInNav: z.boolean().optional(),
});
const bannerSchema = z.object({
  title: z.string().trim().min(2).max(255),
  subtitle: z.string().max(255).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  ctaLabel: z.string().max(120).optional().nullable(),
  ctaUrl: z.string().max(500).optional().nullable(),
  imageUrl: z.string().max(500).optional().nullable(),
  mobileImageUrl: z.string().max(500).optional().nullable(),
  altText: z.string().max(255).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
const productSchema = z.object({
  name: z.string().trim().min(2).max(255),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(190)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().max(120).optional().nullable(),
  subtitle: z.string().max(500).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  highlights: z.array(z.string().max(255)).default([]),
  price: z.coerce.number().min(0).optional().nullable(),
  imageUrl: z.string().max(500).optional().nullable(),
  status: z.enum(["draft", "published"]),
  sortOrder: z.coerce.number().int().min(0).default(0),
});
const productCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  sortOrder: z.coerce.number().int().min(0).default(0),
});
const downloadSchema = z.object({
  title: z.string().trim().min(2).max(255),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(190)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(2000).optional().nullable(),
  fileType: z.string().trim().max(40).optional().nullable(),
  status: z.enum(["draft", "published"]),
  sortOrder: z.coerce.number().int().min(0).default(0),
});
const eventSchema = z.object({
  title: z.string().trim().min(2).max(255),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(190)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(2000).optional().nullable(),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  city: z.string().trim().min(1).max(120),
  eventType: z.string().trim().min(1).max(120),
  seats: z.coerce.number().int().min(0).default(0),
  registrationUrl: z.string().max(500).optional().nullable(),
  status: z.enum(["draft", "published"]),
  sortOrder: z.coerce.number().int().min(0).default(0),
});
const blogSchema = z.object({
  title: z.string().trim().min(2).max(255),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(190)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().max(3000).optional().nullable(),
  body: z.string().max(100000).optional().nullable(),
  featuredImage: z.string().max(500).optional().nullable(),
  imageAlt: z.string().max(255).optional().nullable(),
  author: z.string().max(120).optional().nullable(),
  category: z.string().max(120).optional().nullable(),
  tags: z.array(z.string().max(80)).default([]),
  seoTitle: z.string().max(255).optional().nullable(),
  seoDescription: z.string().max(320).optional().nullable(),
  status: z.enum(["draft", "scheduled", "published"]),
  publishedAt: z.string().optional().nullable(),
});
const enquirySchema = z.object({
  type: z.enum(["contact", "distributor", "franchise", "other"]).default("contact"),
  name: z.string().trim().min(2).max(160),
  email: z.string().email().max(190).optional().nullable(),
  phone: optionalMobileSchema,
  city: z.string().max(120).optional().nullable(),
  businessType: z.string().max(160).optional().nullable(),
  investmentRange: z.string().max(120).optional().nullable(),
  message: z.string().max(5000).optional().nullable(),
});
const distributorSchema = z.object({
  distributorCode: z.string().trim().max(80).optional().nullable().or(z.literal("")),
  name: z.string().trim().min(2).max(160),
  email: z.string().email().max(190).optional().nullable().or(z.literal("")),
  phone: optionalMobileSchema,
  city: z.string().max(120).optional().nullable(),
  sponsorCode: z.string().max(80).optional().nullable(),
  status: z.enum(["active", "inactive", "blocked"]).default("active"),
  notes: z.string().max(5000).optional().nullable(),
});
const transactionSchema = z.object({
  distributorId: z.coerce.number().int().positive(),
  transactionType: z.enum(["id_purchase", "payment", "income", "refund", "adjustment"]),
  referenceNo: z.string().max(120).optional().nullable(),
  idCount: z.coerce.number().int().min(0).default(0),
  packageLevel: z.coerce.number().int().min(0).optional().nullable(),
  packageValue: z.coerce.number().min(0).optional().nullable(),
  amount: z.coerce.number().min(0),
  paymentMethod: z.string().max(60).optional().nullable(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).default("pending"),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(5000).optional().nullable(),
});
const gallerySchema = z.object({
  title: z.string().trim().min(2).max(255),
  tag: z.string().trim().min(1).max(120),
  imageUrl: z.string().trim().min(1).max(500),
  altText: z.string().max(255).optional().nullable(),
  status: z.enum(["draft", "published"]),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

app.get(
  "/api/health",
  asyncRoute(async (_req, res) => ok(res, { status: "ok", database: "connected" })),
);

app.post(
  "/api/auth/login",
  loginLimiter,
  asyncRoute(async (req, res) => {
    const parsed = z
      .object({ email: z.string().email(), password: z.string().min(1) })
      .safeParse(req.body);
    if (!parsed.success) return fail(res, "Email and password are required.", 422);
    const [rows] = await query("SELECT * FROM admin_users WHERE email = ? LIMIT 1", [
      parsed.data.email.toLowerCase(),
    ]);
    const user = rows[0];
    if (
      !user ||
      !user.active ||
      !(await bcrypt.compare(parsed.data.password, user.password_hash))
    ) {
      return fail(res, "Invalid email or password.", 401);
    }
    const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, jwtSecret, {
      expiresIn: "8h",
    });
    await query("UPDATE admin_users SET last_login = NOW() WHERE id = ?", [user.id]);
    await activity(user, "login", "auth", user.id);
    res.cookie("rdg_admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60 * 1000,
    });
    return ok(res, { user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }),
);

app.post(
  "/api/auth/logout",
  asyncRoute(async (req, res) => {
    res.clearCookie("rdg_admin_token");
    return ok(res, { loggedOut: true });
  }),
);

app.get(
  "/api/auth/me",
  requireAuth,
  asyncRoute(async (req, res) => ok(res, { user: req.user })),
);

function customerProfile(customer) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
  };
}

function setCustomerCookie(res, token) {
  res.cookie("rdg_customer_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function distributorProfile(distributor) {
  return {
    id: distributor.id,
    accountId: distributor.accountId,
    username: distributor.username,
    distributorCode: distributor.distributorCode,
    sponsorId: distributor.sponsorId || distributor.distributorCode,
    name: distributor.name,
    email: distributor.email,
    phone: distributor.phone,
    city: distributor.city,
    sponsorCode: distributor.sponsorCode,
    status: distributor.status,
    membershipAmount: distributor.membershipAmount
      ? Number(distributor.membershipAmount)
      : distributorMembershipAmount,
    membershipStatus:
      distributor.membershipCurrentStatus || distributor.membershipStatus || "not_started",
    membershipPaymentStatus: distributor.membershipPaymentStatus || "pending",
    membershipStartsAt: distributor.membershipStartsAt || null,
    membershipExpiresAt: distributor.membershipExpiresAt || null,
  };
}

async function resolveSponsorCode(value, execute = query) {
  const candidate = String(value || "").trim();
  if (!candidate) return null;
  const [rows] = await execute(
    "SELECT distributor_code AS distributorCode FROM distributors WHERE UPPER(distributor_code) = UPPER(?) AND status <> 'blocked' LIMIT 1",
    [candidate],
  );
  return rows[0]?.distributorCode || null;
}

async function generateDistributorCode(execute = query) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `RDG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
    const [rows] = await execute("SELECT id FROM distributors WHERE distributor_code = ? LIMIT 1", [
      candidate,
    ]);
    if (!rows[0]) return candidate;
  }
  throw new Error("Unable to generate a unique distributor ID.");
}

async function getDistributorNetwork(sponsorCode) {
  const [rows] = await query(
    `WITH RECURSIVE network AS (
       SELECT d.id, d.distributor_code AS distributorCode, d.name, d.email, d.phone, d.city,
         d.sponsor_code AS sponsorCode, d.status, 1 AS networkLevel,
         CAST(d.distributor_code AS CHAR(2000)) AS networkPath
       FROM distributors d
       WHERE UPPER(d.sponsor_code) = UPPER(?) AND d.status <> 'blocked'
       UNION ALL
       SELECT child.id, child.distributor_code AS distributorCode, child.name, child.email,
         child.phone, child.city, child.sponsor_code AS sponsorCode, child.status,
         network.networkLevel + 1,
         CONCAT(network.networkPath, ' > ', child.distributor_code)
       FROM distributors child
       INNER JOIN network ON UPPER(child.sponsor_code) = UPPER(network.distributorCode)
       WHERE child.status <> 'blocked'
         AND network.networkLevel < 15
         AND FIND_IN_SET(
           CAST(UPPER(child.distributor_code) AS BINARY),
           REPLACE(
             CAST(UPPER(network.networkPath) AS BINARY),
             CAST(' > ' AS BINARY),
             CAST(',' AS BINARY)
           )
         ) = 0
     )
     SELECT network.*, a.username,
       m.amount AS membershipAmount,
       m.status AS membershipStatus,
       m.payment_status AS membershipPaymentStatus,
       m.starts_at AS membershipStartsAt,
       m.expires_at AS membershipExpiresAt,
       CASE WHEN m.id IS NULL THEN 'not_started'
            WHEN m.expires_at < CURDATE() THEN 'expired'
            ELSE m.status END AS membershipCurrentStatus,
       COALESCE(tx.totalIds, 0) AS totalIds
     FROM network
     LEFT JOIN distributor_accounts a ON a.distributor_id = network.id
     LEFT JOIN distributor_memberships m ON m.id = (
       SELECT m2.id FROM distributor_memberships m2
       WHERE m2.distributor_id = network.id
       ORDER BY m2.expires_at DESC, m2.id DESC LIMIT 1
     )
     LEFT JOIN (
       SELECT distributor_id,
         SUM(CASE WHEN transaction_type = 'id_purchase' AND payment_status = 'paid' THEN id_count ELSE 0 END) AS totalIds
       FROM distributor_transactions
       GROUP BY distributor_id
     ) tx ON tx.distributor_id = network.id
     ORDER BY network.networkLevel, network.networkPath`,
    [sponsorCode],
  );
  return rows.map((item) => ({
    ...item,
    ...getIdLevelProgress(item.totalIds),
    membershipAmount: item.membershipAmount
      ? Number(item.membershipAmount)
      : distributorMembershipAmount,
  }));
}

async function getAdminDistributorNetwork() {
  const [rows] = await query(
    `SELECT d.*, a.username,
       parent.id AS sponsorId,
       parent.name AS sponsorName,
       parent.distributor_code AS sponsorDistributorCode,
       sponsorAccount.username AS sponsorUsername,
       (
         SELECT COUNT(*) FROM distributors child
         WHERE UPPER(child.sponsor_code) = UPPER(d.distributor_code)
           AND child.status <> 'blocked'
       ) AS directTeamCount,
       m.amount AS membershipAmount,
       m.status AS membershipStatus,
       m.payment_status AS membershipPaymentStatus,
       m.starts_at AS membershipStartsAt,
       m.expires_at AS membershipExpiresAt,
       CASE WHEN m.id IS NULL THEN 'not_started'
            WHEN m.expires_at < CURDATE() THEN 'expired'
            ELSE m.status END AS membershipCurrentStatus,
       COALESCE(tx.totalIds, 0) AS totalIds
     FROM distributors d
     LEFT JOIN distributor_accounts a ON a.distributor_id = d.id
     LEFT JOIN distributors parent ON UPPER(parent.distributor_code) = UPPER(d.sponsor_code)
     LEFT JOIN distributor_accounts sponsorAccount ON sponsorAccount.distributor_id = parent.id
     LEFT JOIN distributor_memberships m ON m.id = (
       SELECT m2.id FROM distributor_memberships m2
       WHERE m2.distributor_id = d.id
       ORDER BY m2.expires_at DESC, m2.id DESC LIMIT 1
     )
     LEFT JOIN (
       SELECT distributor_id,
         SUM(CASE WHEN transaction_type = 'id_purchase' AND payment_status = 'paid' THEN id_count ELSE 0 END) AS totalIds
       FROM distributor_transactions
       GROUP BY distributor_id
     ) tx ON tx.distributor_id = d.id
     ORDER BY d.created_at ASC, d.id ASC`,
  );
  return rows.map((item) => ({
    ...item,
    ...getIdLevelProgress(item.totalIds),
    membershipAmount: item.membershipAmount
      ? Number(item.membershipAmount)
      : distributorMembershipAmount,
  }));
}

function setDistributorCookie(res, token) {
  res.cookie("rdg_distributor_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

async function syncDistributorPackageAccess(
  distributorId,
  paymentStatus,
  paymentMethod = "admin_recorded",
  transactionReference = null,
) {
  await transaction(async (connection) => {
    const [membershipRows] = await connection.execute(
      `SELECT id FROM distributor_memberships
       WHERE distributor_id = ? ORDER BY expires_at DESC, id DESC LIMIT 1`,
      [distributorId],
    );
    const membership = membershipRows[0];

    if (paymentStatus === "paid") {
      await connection.execute(
        "UPDATE distributors SET status = 'active' WHERE id = ? AND status <> 'blocked'",
        [distributorId],
      );
      if (membership) {
        await connection.execute(
          `UPDATE distributor_memberships
           SET status = 'active', payment_status = 'paid', payment_method = ?,
               transaction_reference = ?, starts_at = COALESCE(starts_at, CURDATE()),
               expires_at = COALESCE(expires_at, DATE_ADD(CURDATE(), INTERVAL 1 YEAR))
           WHERE id = ?`,
          [paymentMethod, transactionReference, membership.id],
        );
      } else {
        await connection.execute(
          `INSERT INTO distributor_memberships
             (distributor_id, amount, status, payment_status, payment_method,
              transaction_reference, starts_at, expires_at)
           VALUES (?, ?, 'active', 'paid', ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR))`,
          [distributorId, distributorMembershipAmount, paymentMethod, transactionReference],
        );
      }
      return;
    }

    await connection.execute(
      "UPDATE distributors SET status = 'inactive' WHERE id = ? AND status <> 'blocked'",
      [distributorId],
    );
    if (membership) {
      await connection.execute(
        `UPDATE distributor_memberships
         SET status = 'pending', payment_status = ?, payment_method = ?, transaction_reference = ?
         WHERE id = ?`,
        [paymentStatus, paymentMethod, transactionReference, membership.id],
      );
    }
  });
}

async function getCustomerCart(customerId) {
  const [rows] = await query(
    `SELECT c.id AS cartItemId, c.product_id AS productId, c.quantity,
       p.name, p.slug, p.category, p.subtitle, p.description, p.highlights,
       p.price, p.image_url AS imageUrl
     FROM customer_cart_items c
     INNER JOIN products p ON p.id = c.product_id
     WHERE c.customer_id = ? AND p.status = 'published'
     ORDER BY c.updated_at DESC`,
    [customerId],
  );
  return rows.map((row) => ({
    ...row,
    price:
      row.price === null ? (row.name === "Anmol Ratan Juice" ? 1200 : null) : Number(row.price),
    highlights: parseJson(row.highlights, []),
  }));
}

function formatOrder(order, items = []) {
  return {
    ...order,
    subtotal: Number(order.subtotal || 0),
    shippingFee: Number(order.shipping_fee ?? order.shippingFee ?? 0),
    total: Number(order.total || 0),
    items: items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice ?? item.unit_price ?? 0),
      lineTotal: Number(item.lineTotal ?? item.line_total ?? 0),
      quantity: Number(item.quantity || 0),
    })),
  };
}

app.post(
  "/api/customer/auth/register",
  loginLimiter,
  asyncRoute(async (req, res) => {
    const input = customerRegisterSchema.safeParse(req.body);
    if (!input.success)
      return fail(res, "Enter a name, valid email and password of 8+ characters.", 422);
    const email = input.data.email.toLowerCase();
    try {
      const passwordHash = await bcrypt.hash(input.data.password, 12);
      const [result] = await query(
        "INSERT INTO customers (name, email, phone, password_hash) VALUES (?, ?, ?, ?)",
        [input.data.name, email, input.data.phone || null, passwordHash],
      );
      const customer = {
        id: result.insertId,
        name: input.data.name,
        email,
        phone: input.data.phone || null,
      };
      const token = jwt.sign({ sub: customer.id, scope: "customer", email }, jwtSecret, {
        expiresIn: "30d",
      });
      setCustomerCookie(res, token);
      return ok(res, { customer: customerProfile(customer) }, 201);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY")
        return fail(res, "An account with this email already exists.", 409);
      throw error;
    }
  }),
);

app.post(
  "/api/customer/auth/login",
  loginLimiter,
  asyncRoute(async (req, res) => {
    const input = customerLoginSchema.safeParse(req.body);
    if (!input.success) return fail(res, "Email and password are required.", 422);
    const [rows] = await query("SELECT * FROM customers WHERE email = ? LIMIT 1", [
      input.data.email.toLowerCase(),
    ]);
    const customer = rows[0];
    if (!customer || !(await bcrypt.compare(input.data.password, customer.password_hash))) {
      return fail(res, "Invalid customer email or password.", 401);
    }
    const token = jwt.sign(
      { sub: customer.id, scope: "customer", email: customer.email },
      jwtSecret,
      { expiresIn: "30d" },
    );
    setCustomerCookie(res, token);
    return ok(res, { customer: customerProfile(customer) });
  }),
);

app.post(
  "/api/customer/auth/logout",
  asyncRoute(async (_req, res) => {
    res.clearCookie("rdg_customer_token");
    return ok(res, { loggedOut: true });
  }),
);

app.get(
  "/api/customer/auth/me",
  requireCustomerAuth,
  asyncRoute(async (req, res) => ok(res, { customer: customerProfile(req.customer) })),
);

app.post(
  "/api/distributor/auth/register",
  loginLimiter,
  asyncRoute(async (req, res) => {
    const input = distributorRegisterSchema.safeParse(req.body);
    if (!input.success)
      return fail(
        res,
        "Enter valid account details and select a distributor product package before continuing.",
        422,
      );

    const email = input.data.email.toLowerCase();
    const username = input.data.username.toLowerCase();
    const sponsorCode = await resolveSponsorCode(input.data.sponsorCode);
    if (input.data.sponsorCode && !sponsorCode)
      return fail(res, "Enter a valid active sponsor ID.", 422);
    const selectedPackage = distributorPackagePlans.find(
      (item) => item.packageValue === input.data.packageValue,
    );
    const passwordHash = await bcrypt.hash(input.data.password, 12);
    const distributorCode = await generateDistributorCode();

    try {
      const distributor = await transaction(async (connection) => {
        const [distributorResult] = await connection.execute(
          `INSERT INTO distributors
             (distributor_code, name, email, phone, city, sponsor_code, status)
           VALUES (?, ?, ?, ?, ?, ?, 'inactive')`,
          [distributorCode, input.data.name, email, input.data.phone, input.data.city, sponsorCode],
        );
        const [accountResult] = await connection.execute(
          `INSERT INTO distributor_accounts (distributor_id, username, password_hash)
           VALUES (?, ?, ?)`,
          [distributorResult.insertId, username, passwordHash],
        );
        await connection.execute(
          `INSERT INTO distributor_memberships
             (distributor_id, amount, status, payment_status, payment_method, starts_at, expires_at)
           VALUES (?, ?, 'pending', 'pending', 'package_purchase_pending', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR))`,
          [distributorResult.insertId, distributorMembershipAmount],
        );
        await connection.execute(
          `INSERT INTO distributor_transactions
             (distributor_id, transaction_type, reference_no, id_count, package_value, amount,
              payment_method, payment_status, transaction_date, notes)
           VALUES (?, 'id_purchase', ?, 1, ?, ?, 'package_purchase_pending', 'pending', CURDATE(), ?)`,
          [
            distributorResult.insertId,
            `PACKAGE-${distributorCode}`,
            selectedPackage.packageValue,
            selectedPackage.packageValue,
            `Registration includes ${selectedPackage.packageCount} package(s). Awaiting payment confirmation.`,
          ],
        );
        return {
          id: distributorResult.insertId,
          accountId: accountResult.insertId,
          username,
          distributorCode,
          name: input.data.name,
          email,
          phone: input.data.phone,
          city: input.data.city,
          sponsorCode,
          status: "inactive",
          packageValue: selectedPackage.packageValue,
          packageCount: selectedPackage.packageCount,
          packagePaymentStatus: "pending",
        };
      });
      const [[membership]] = await query(
        `SELECT amount AS membershipAmount, status AS membershipStatus,
           payment_status AS membershipPaymentStatus, starts_at AS membershipStartsAt,
           expires_at AS membershipExpiresAt,
           CASE WHEN expires_at < CURDATE() THEN 'expired' ELSE status END AS membershipCurrentStatus
         FROM distributor_memberships WHERE distributor_id = ?
         ORDER BY expires_at DESC, id DESC LIMIT 1`,
        [distributor.id],
      );
      return ok(
        res,
        {
          distributor: distributorProfile({ ...distributor, ...membership }),
          package: selectedPackage,
          packagePaymentStatus: "pending",
        },
        201,
      );
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY")
        return fail(res, "That username is already registered. Please choose another.", 409);
      throw error;
    }
  }),
);

app.post(
  "/api/distributor/auth/login",
  loginLimiter,
  asyncRoute(async (req, res) => {
    const input = distributorLoginSchema.safeParse(req.body);
    if (!input.success) return fail(res, "Username and password are required.", 422);
    const [rows] = await query(
      `SELECT a.*, d.id AS distributorId, d.distributor_code AS distributorCode,
         d.name, d.email, d.phone, d.city, d.sponsor_code AS sponsorCode, d.status,
         m.amount AS membershipAmount, m.status AS membershipStatus,
         m.payment_status AS membershipPaymentStatus, m.starts_at AS membershipStartsAt,
         m.expires_at AS membershipExpiresAt,
         CASE WHEN m.id IS NULL THEN 'not_started'
              WHEN m.expires_at < CURDATE() THEN 'expired'
              ELSE m.status END AS membershipCurrentStatus
       FROM distributor_accounts a
       INNER JOIN distributors d ON d.id = a.distributor_id
       LEFT JOIN distributor_memberships m ON m.id = (
         SELECT m2.id FROM distributor_memberships m2
         WHERE m2.distributor_id = d.id
         ORDER BY m2.expires_at DESC, m2.id DESC LIMIT 1
       )
       WHERE a.username = ?
       LIMIT 1`,
      [input.data.username.toLowerCase()],
    );
    const account = rows[0];
    if (!account || !(await bcrypt.compare(input.data.password, account.password_hash))) {
      return fail(res, "Invalid username or password.", 401);
    }
    if (account.status !== "active") {
      return fail(
        res,
        "Your package purchase is still pending payment confirmation. Distributor access will activate after RDG confirms the package payment.",
        403,
      );
    }
    const distributor = {
      id: account.distributorId,
      accountId: account.id,
      username: account.username,
      distributorCode: account.distributorCode,
      name: account.name,
      email: account.email,
      phone: account.phone,
      city: account.city,
      sponsorCode: account.sponsorCode,
      status: account.status,
      membershipAmount: account.membershipAmount,
      membershipCurrentStatus: account.membershipCurrentStatus,
      membershipPaymentStatus: account.membershipPaymentStatus,
      membershipStartsAt: account.membershipStartsAt,
      membershipExpiresAt: account.membershipExpiresAt,
    };
    const token = jwt.sign(
      { sub: account.id, scope: "distributor", username: account.username },
      jwtSecret,
      { expiresIn: "30d" },
    );
    await query("UPDATE distributor_accounts SET last_login = NOW() WHERE id = ?", [account.id]);
    setDistributorCookie(res, token);
    return ok(res, { distributor: distributorProfile(distributor) });
  }),
);

app.post(
  "/api/distributor/auth/logout",
  asyncRoute(async (_req, res) => {
    res.clearCookie("rdg_distributor_token");
    return ok(res, { loggedOut: true });
  }),
);

app.get(
  "/api/distributor/auth/me",
  requireDistributorAuth,
  asyncRoute(async (req, res) => ok(res, { distributor: distributorProfile(req.distributor) })),
);

app.get(
  "/api/distributor/network",
  requireDistributorAuth,
  asyncRoute(async (req, res) => {
    const network = await getDistributorNetwork(req.distributor.distributorCode);
    const byLevel = network.reduce((result, item) => {
      const key = String(item.networkLevel);
      result[key] = (result[key] || 0) + 1;
      return result;
    }, {});
    return ok(res, {
      root: distributorProfile(req.distributor),
      network,
      summary: {
        totalMembers: network.length,
        directMembers: byLevel["1"] || 0,
        deepestLevel: network.reduce(
          (max, item) => Math.max(max, Number(item.networkLevel) || 0),
          0,
        ),
        byLevel,
      },
    });
  }),
);

app.get(
  "/api/customer/cart",
  requireCustomerAuth,
  asyncRoute(async (req, res) => ok(res, await getCustomerCart(req.customer.id))),
);

app.post(
  "/api/customer/cart",
  requireCustomerAuth,
  asyncRoute(async (req, res) => {
    const input = z
      .object({ productId: idSchema, quantity: z.coerce.number().int().min(1).max(99).default(1) })
      .safeParse(req.body);
    if (!input.success) return fail(res, "Select a valid product and quantity.", 422);
    const [[product]] = await query(
      "SELECT id FROM products WHERE id = ? AND status = 'published' LIMIT 1",
      [input.data.productId],
    );
    if (!product) return fail(res, "Product is not available.", 404);
    const [[existing]] = await query(
      "SELECT id FROM customer_cart_items WHERE customer_id = ? AND product_id = ? LIMIT 1",
      [req.customer.id, input.data.productId],
    );
    if (existing) {
      await query(
        "UPDATE customer_cart_items SET quantity = LEAST(quantity + ?, 99) WHERE id = ?",
        [input.data.quantity, existing.id],
      );
    } else {
      await query(
        "INSERT INTO customer_cart_items (customer_id, product_id, quantity) VALUES (?, ?, ?)",
        [req.customer.id, input.data.productId, input.data.quantity],
      );
    }
    return ok(res, await getCustomerCart(req.customer.id), 201);
  }),
);

app.patch(
  "/api/customer/cart/:productId",
  requireCustomerAuth,
  asyncRoute(async (req, res) => {
    const productId = idSchema.parse(req.params.productId);
    const input = z
      .object({ quantity: z.coerce.number().int().min(1).max(99) })
      .safeParse(req.body);
    if (!input.success) return fail(res, "Quantity must be between 1 and 99.", 422);
    const [result] = await query(
      "UPDATE customer_cart_items SET quantity = ? WHERE customer_id = ? AND product_id = ?",
      [input.data.quantity, req.customer.id, productId],
    );
    if (!result.affectedRows) return fail(res, "Cart item not found.", 404);
    return ok(res, await getCustomerCart(req.customer.id));
  }),
);

app.delete(
  "/api/customer/cart/:productId",
  requireCustomerAuth,
  asyncRoute(async (req, res) => {
    const productId = idSchema.parse(req.params.productId);
    await query("DELETE FROM customer_cart_items WHERE customer_id = ? AND product_id = ?", [
      req.customer.id,
      productId,
    ]);
    return ok(res, await getCustomerCart(req.customer.id));
  }),
);

app.post(
  "/api/customer/orders",
  requireCustomerAuth,
  asyncRoute(async (req, res) => {
    const input = customerOrderSchema.safeParse(req.body);
    if (!input.success) return fail(res, "Complete all required shipping details.", 422);
    const cart = await getCustomerCart(req.customer.id);
    if (!cart.length) return fail(res, "Your cart is empty.", 422);
    if (cart.some((item) => item.price === null || item.price === undefined)) {
      return fail(res, "Add prices to every product before placing an order.", 422);
    }

    const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const shippingFee = subtotal >= 999 ? 0 : 99;
    const total = subtotal + shippingFee;
    const orderNumber = `RDG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const order = await transaction(async (connection) => {
      const [orderResult] = await connection.execute(
        `INSERT INTO customer_orders
          (order_number, customer_id, status, payment_status, payment_method, subtotal, shipping_fee, total,
           shipping_name, shipping_phone, shipping_address_line1, shipping_address_line2,
           shipping_city, shipping_state, shipping_postal_code, shipping_country, customer_note)
         VALUES (?, ?, 'pending', 'cod', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          req.customer.id,
          input.data.paymentMethod,
          subtotal,
          shippingFee,
          total,
          input.data.shippingName,
          input.data.shippingPhone,
          input.data.shippingAddressLine1,
          input.data.shippingAddressLine2 || null,
          input.data.shippingCity,
          input.data.shippingState,
          input.data.shippingPostalCode,
          input.data.shippingCountry,
          input.data.customerNote || null,
        ],
      );

      for (const item of cart) {
        const unitPrice = Number(item.price);
        await connection.execute(
          `INSERT INTO customer_order_items
            (order_id, product_id, product_name, product_slug, unit_price, quantity, line_total)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            orderResult.insertId,
            item.productId,
            item.name,
            item.slug,
            unitPrice,
            item.quantity,
            unitPrice * item.quantity,
          ],
        );
      }
      await connection.execute("DELETE FROM customer_cart_items WHERE customer_id = ?", [
        req.customer.id,
      ]);
      return { id: orderResult.insertId };
    });

    return ok(
      res,
      {
        order: {
          id: order.id,
          orderNumber,
          status: "pending",
          paymentStatus: "cod",
          subtotal,
          shippingFee,
          total,
        },
      },
      201,
    );
  }),
);

app.get(
  "/api/customer/orders",
  requireCustomerAuth,
  asyncRoute(async (req, res) => {
    const [rows] = await query(
      `SELECT o.id, o.order_number AS orderNumber, o.status, o.payment_status AS paymentStatus,
         o.subtotal, o.shipping_fee AS shippingFee, o.total, o.shipping_city AS shippingCity,
         o.shipping_state AS shippingState, o.created_at AS createdAt,
         COUNT(i.id) AS itemCount
       FROM customer_orders o
       LEFT JOIN customer_order_items i ON i.order_id = o.id
       WHERE o.customer_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.customer.id],
    );
    return ok(
      res,
      rows.map((row) => formatOrder(row)),
    );
  }),
);

app.get(
  "/api/customer/orders/:id",
  requireCustomerAuth,
  asyncRoute(async (req, res) => {
    const id = idSchema.safeParse(req.params.id);
    if (!id.success) return fail(res, "Invalid order number.", 422);
    const [[order]] = await query(
      `SELECT id, order_number AS orderNumber, status, payment_status AS paymentStatus,
         payment_method AS paymentMethod, subtotal, shipping_fee AS shippingFee, total,
         shipping_name AS shippingName, shipping_phone AS shippingPhone,
         shipping_address_line1 AS shippingAddressLine1, shipping_address_line2 AS shippingAddressLine2,
         shipping_city AS shippingCity, shipping_state AS shippingState,
         shipping_postal_code AS shippingPostalCode, shipping_country AS shippingCountry,
         customer_note AS customerNote, created_at AS createdAt, updated_at AS updatedAt
       FROM customer_orders WHERE id = ? AND customer_id = ? LIMIT 1`,
      [id.data, req.customer.id],
    );
    if (!order) return fail(res, "Order not found.", 404);
    const [items] = await query(
      `SELECT product_id AS productId, product_name AS productName, product_slug AS productSlug,
         unit_price AS unitPrice, quantity, line_total AS lineTotal
       FROM customer_order_items WHERE order_id = ? ORDER BY id ASC`,
      [id.data],
    );
    return ok(res, formatOrder(order, items));
  }),
);

const adminOrderUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
  paymentStatus: z.enum(["pending", "cod", "paid", "failed", "refunded"]).optional(),
});

app.get(
  "/api/admin/orders",
  requireAuth,
  asyncRoute(async (req, res) => {
    const status = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ].includes(String(req.query.status))
      ? String(req.query.status)
      : null;
    const params = [];
    const where = [];
    if (status) {
      where.push("o.status = ?");
      params.push(status);
    }
    const [rows] = await query(
      `SELECT o.id, o.order_number AS orderNumber, o.status, o.payment_status AS paymentStatus,
         o.payment_method AS paymentMethod, o.subtotal, o.shipping_fee AS shippingFee, o.total,
         o.shipping_name AS shippingName, o.shipping_phone AS shippingPhone,
         o.shipping_city AS shippingCity, o.shipping_state AS shippingState,
         o.shipping_postal_code AS shippingPostalCode, o.created_at AS createdAt,
         c.name AS customerName, c.email AS customerEmail,
         COUNT(i.id) AS itemCount
       FROM customer_orders o
       INNER JOIN customers c ON c.id = o.customer_id
       LEFT JOIN customer_order_items i ON i.order_id = o.id
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      params,
    );
    return ok(
      res,
      rows.map((row) => formatOrder(row)),
    );
  }),
);

app.patch(
  "/api/admin/orders/:id",
  requireAuth,
  asyncRoute(async (req, res) => {
    const id = idSchema.safeParse(req.params.id);
    const input = adminOrderUpdateSchema.safeParse(req.body);
    if (!id.success || !input.success) return fail(res, "Select a valid order status.", 422);
    const [result] = await query(
      "UPDATE customer_orders SET status = ?, payment_status = COALESCE(?, payment_status) WHERE id = ?",
      [input.data.status, input.data.paymentStatus || null, id.data],
    );
    if (!result.affectedRows) return fail(res, "Order not found.", 404);
    await activity(req.user, "update", "order", id.data, {
      status: input.data.status,
      paymentStatus: input.data.paymentStatus,
    });
    return ok(res, { updated: true });
  }),
);

app.get(
  "/api/admin/dashboard",
  requireAuth,
  asyncRoute(async (_req, res) => {
    const [
      [[pageCounts]],
      [[productCounts]],
      [[blogCounts]],
      [[enquiryCounts]],
      [[distributorCounts]],
      [[transactionCounts]],
      [distributorLevelRows],
    ] = await Promise.all([
      query(
        "SELECT COUNT(*) AS total, SUM(status = 'published') AS published, SUM(status = 'draft') AS drafts FROM pages",
      ),
      query("SELECT COUNT(*) AS total FROM products WHERE status = 'published'"),
      query("SELECT COUNT(*) AS total FROM blog_posts WHERE status = 'published'"),
      query("SELECT COUNT(*) AS total, SUM(status = 'new') AS unread FROM contact_enquiries"),
      query("SELECT COUNT(*) AS total FROM distributors"),
      query(
        `SELECT
             COALESCE(SUM(CASE WHEN transaction_type = 'id_purchase' AND payment_status = 'paid' THEN id_count ELSE 0 END), 0) AS totalIds,
             COALESCE(SUM(CASE WHEN transaction_type IN ('payment', 'id_purchase') AND payment_status = 'paid' THEN amount ELSE 0 END), 0) AS totalPaidAmount,
             COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END), 0) AS pendingPayments,
             COALESCE(SUM(CASE WHEN transaction_type = 'income' AND payment_status = 'paid' THEN amount ELSE 0 END), 0) AS totalIncome
           FROM distributor_transactions`,
      ),
      query(
        `SELECT d.id, d.distributor_code AS distributorCode, d.name, d.created_at,
           COALESCE(SUM(CASE WHEN t.transaction_type = 'id_purchase' AND t.payment_status = 'paid' THEN t.id_count ELSE 0 END), 0) AS totalIds
         FROM distributors d
         LEFT JOIN distributor_transactions t ON t.distributor_id = d.id
         GROUP BY d.id, d.distributor_code, d.name, d.created_at
         ORDER BY totalIds DESC, d.created_at DESC`,
      ),
    ]);
    const [recent] = await query(
      "SELECT id, action, entity_type AS entityType, entity_id AS entityId, created_at AS createdAt FROM activity_logs ORDER BY created_at DESC LIMIT 8",
    );
    const levelProgress = distributorLevelRows.map((item) => ({
      distributorId: item.id,
      distributorCode: item.distributorCode,
      name: item.name,
      ...getIdLevelProgress(item.totalIds),
    }));
    return ok(res, {
      metrics: {
        pages: Number(pageCounts.total || 0),
        publishedPages: Number(pageCounts.published || 0),
        draftPages: Number(pageCounts.drafts || 0),
        products: Number(productCounts.total || 0),
        blogPosts: Number(blogCounts.total || 0),
        enquiries: Number(enquiryCounts.total || 0),
        unreadEnquiries: Number(enquiryCounts.unread || 0),
        distributors: Number(distributorCounts.total || 0),
        totalIds: Number(transactionCounts.totalIds || 0),
        totalPaidAmount: Number(transactionCounts.totalPaidAmount || 0),
        pendingPayments: Number(transactionCounts.pendingPayments || 0),
        totalIncome: Number(transactionCounts.totalIncome || 0),
        passedLevels: levelProgress.reduce((sum, item) => sum + item.completedLevel, 0),
      },
      recent,
      levelProgress,
      levelNotifications: levelProgress.filter((item) => item.levelPassed).slice(0, 8),
    });
  }),
);

app.get(
  "/api/admin/pages",
  requireAuth,
  asyncRoute(async (req, res) => {
    const q = String(req.query.q || "").trim();
    const status =
      req.query.status === "draft" || req.query.status === "published" ? req.query.status : null;
    const conditions = [];
    const params = [];
    if (q) {
      conditions.push("(title LIKE ? OR slug LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    const [rows] = await query(
      `SELECT * FROM pages ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""} ORDER BY updated_at DESC`,
      params,
    );
    return ok(res, rows);
  }),
);

app.get(
  "/api/admin/distributors",
  requireAuth,
  asyncRoute(async (req, res) => {
    const search = String(req.query.search || "").trim();
    const params = [];
    const where = [];
    if (search) {
      where.push(
        "(d.distributor_code LIKE ? OR d.name LIKE ? OR d.phone LIKE ? OR d.email LIKE ?)",
      );
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    const [rows] = await query(
      `SELECT d.*,
        a.username,
        parent.name AS sponsorName,
        parent.distributor_code AS sponsorDistributorCode,
        sponsorAccount.username AS sponsorUsername,
        (
          SELECT COUNT(*) FROM distributors child
          WHERE UPPER(child.sponsor_code) = UPPER(d.distributor_code)
            AND child.status <> 'blocked'
        ) AS directTeamCount,
        m.amount AS membershipAmount,
        m.status AS membershipStatus,
        m.payment_status AS membershipPaymentStatus,
        m.starts_at AS membershipStartsAt,
        m.expires_at AS membershipExpiresAt,
        CASE WHEN m.id IS NULL THEN 'not_started'
             WHEN m.expires_at < CURDATE() THEN 'expired'
             ELSE m.status END AS membershipCurrentStatus,
        COALESCE(tx.totalIds, 0) AS totalIds,
        COALESCE(tx.totalPaid, 0) AS totalPaid,
        COALESCE(tx.totalPending, 0) AS totalPending,
        COALESCE(tx.totalIncome, 0) AS totalIncome,
        COALESCE(tx.transactionCount, 0) AS transactionCount
       FROM distributors d
       LEFT JOIN distributor_accounts a ON a.distributor_id = d.id
       LEFT JOIN distributors parent ON UPPER(parent.distributor_code) = UPPER(d.sponsor_code)
       LEFT JOIN distributor_accounts sponsorAccount ON sponsorAccount.distributor_id = parent.id
       LEFT JOIN distributor_memberships m ON m.id = (
         SELECT m2.id FROM distributor_memberships m2
         WHERE m2.distributor_id = d.id
         ORDER BY m2.expires_at DESC, m2.id DESC LIMIT 1
       )
       LEFT JOIN (
         SELECT distributor_id,
           SUM(CASE WHEN transaction_type = 'id_purchase' AND payment_status = 'paid' THEN id_count ELSE 0 END) AS totalIds,
           SUM(CASE WHEN payment_status = 'paid' AND transaction_type IN ('payment', 'id_purchase') THEN amount ELSE 0 END) AS totalPaid,
           SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END) AS totalPending,
           SUM(CASE WHEN transaction_type = 'income' AND payment_status = 'paid' THEN amount ELSE 0 END) AS totalIncome,
           COUNT(id) AS transactionCount
         FROM distributor_transactions
         GROUP BY distributor_id
       ) tx ON tx.distributor_id = d.id
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
       ORDER BY d.created_at DESC`,
      params,
    );
    return ok(
      res,
      rows.map((item) => ({ ...item, ...getIdLevelProgress(item.totalIds) })),
    );
  }),
);

app.get(
  "/api/admin/distributor-network",
  requireAuth,
  asyncRoute(async (_req, res) => ok(res, await getAdminDistributorNetwork())),
);

app.post(
  "/api/admin/distributors/:id/membership/renew",
  requireAuth,
  allowRoles("super_admin", "enquiry_manager"),
  asyncRoute(async (req, res) => {
    const id = idSchema.safeParse(req.params.id);
    const input = z
      .object({
        paymentMethod: z.string().trim().max(60).default("admin_recorded"),
        transactionReference: z.string().trim().max(120).optional().nullable(),
      })
      .safeParse(req.body);
    if (!id.success || !input.success) return fail(res, "Invalid membership renewal details.", 422);

    const [[distributor]] = await query("SELECT id FROM distributors WHERE id = ? LIMIT 1", [
      id.data,
    ]);
    if (!distributor) return fail(res, "Distributor not found.", 404);
    const [[latest]] = await query(
      "SELECT id, payment_status AS paymentStatus, DATE_FORMAT(expires_at, '%Y-%m-%d') AS expiresAt FROM distributor_memberships WHERE distributor_id = ? ORDER BY expires_at DESC, id DESC LIMIT 1",
      [id.data],
    );
    const today = new Date().toISOString().slice(0, 10);
    if (latest?.id && latest.paymentStatus === "pending" && latest.expiresAt >= today) {
      await query(
        "UPDATE distributor_memberships SET payment_status = 'paid', payment_method = ?, transaction_reference = ?, status = 'active' WHERE id = ?",
        [input.data.paymentMethod, input.data.transactionReference || null, latest.id],
      );
      await activity(req.user, "renew", "distributor_membership", latest.id, {
        distributorId: id.data,
        amount: distributorMembershipAmount,
        paymentStatus: "paid",
      });
      return ok(res, {
        id: latest.id,
        amount: distributorMembershipAmount,
        startsAt: null,
        expiresAt: latest.expiresAt,
        status: "active",
        paymentStatus: "paid",
      });
    }
    const addDays = (dateText, days) => {
      const date = new Date(`${dateText}T00:00:00Z`);
      date.setUTCDate(date.getUTCDate() + days);
      return date.toISOString().slice(0, 10);
    };
    const addYear = (dateText) => {
      const date = new Date(`${dateText}T00:00:00Z`);
      date.setUTCFullYear(date.getUTCFullYear() + 1);
      return date.toISOString().slice(0, 10);
    };
    const startsAt =
      latest?.expiresAt && latest.expiresAt >= today ? addDays(latest.expiresAt, 1) : today;
    const expiresAt = addYear(startsAt);
    const [result] = await query(
      `INSERT INTO distributor_memberships
        (distributor_id, amount, status, payment_status, payment_method, transaction_reference, starts_at, expires_at)
       VALUES (?, ?, 'active', 'paid', ?, ?, ?, ?)`,
      [
        id.data,
        distributorMembershipAmount,
        input.data.paymentMethod,
        input.data.transactionReference || null,
        startsAt,
        expiresAt,
      ],
    );
    await activity(req.user, "renew", "distributor_membership", result.insertId, {
      distributorId: id.data,
      amount: distributorMembershipAmount,
      startsAt,
      expiresAt,
    });
    return ok(
      res,
      {
        id: result.insertId,
        amount: distributorMembershipAmount,
        startsAt,
        expiresAt,
        status: "active",
        paymentStatus: "paid",
      },
      201,
    );
  }),
);

app.post(
  "/api/admin/distributors",
  requireAuth,
  allowRoles("super_admin", "enquiry_manager"),
  asyncRoute(async (req, res) => {
    const input = validate(distributorSchema, req.body, res);
    if (!input) return;
    const sponsorCode = await resolveSponsorCode(input.sponsorCode);
    if (input.sponsorCode && !sponsorCode)
      return fail(res, "Enter a valid active sponsor ID.", 422);
    const distributorCode = input.distributorCode?.trim() || (await generateDistributorCode());
    try {
      const [result] = await query(
        "INSERT INTO distributors (distributor_code, name, email, phone, city, sponsor_code, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          distributorCode,
          input.name,
          input.email || null,
          input.phone || null,
          input.city || null,
          sponsorCode,
          input.status,
          input.notes || null,
        ],
      );
      await activity(req.user, "create", "distributor", result.insertId, { name: input.name });
      return ok(res, { id: result.insertId }, 201);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY")
        return fail(res, "That distributor ID already exists.", 409);
      throw error;
    }
  }),
);

app.put(
  "/api/admin/distributors/:id",
  requireAuth,
  allowRoles("super_admin", "enquiry_manager"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = validate(distributorSchema, req.body, res);
    if (!input) return;
    const [[current]] = await query(
      "SELECT distributor_code AS distributorCode FROM distributors WHERE id = ? LIMIT 1",
      [id],
    );
    if (!current) return fail(res, "Distributor not found.", 404);
    const distributorCode = input.distributorCode?.trim() || current.distributorCode;
    const sponsorCode = await resolveSponsorCode(input.sponsorCode);
    if (input.sponsorCode && !sponsorCode)
      return fail(res, "Enter a valid active sponsor ID.", 422);
    if (sponsorCode) {
      if (current && current.distributorCode.toUpperCase() === sponsorCode.toUpperCase())
        return fail(res, "A distributor cannot sponsor itself.", 422);
    }
    try {
      const [result] = await query(
        "UPDATE distributors SET distributor_code = ?, name = ?, email = ?, phone = ?, city = ?, sponsor_code = ?, status = ?, notes = ? WHERE id = ?",
        [
          distributorCode,
          input.name,
          input.email || null,
          input.phone || null,
          input.city || null,
          sponsorCode,
          input.status,
          input.notes || null,
          id,
        ],
      );
      if (!result.affectedRows) return fail(res, "Distributor not found.", 404);
      await activity(req.user, "update", "distributor", id, { name: input.name });
      return ok(res, { id });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY")
        return fail(res, "That distributor ID already exists.", 409);
      throw error;
    }
  }),
);

app.delete(
  "/api/admin/distributors/:id",
  requireAuth,
  allowRoles("super_admin"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const [result] = await query("DELETE FROM distributors WHERE id = ?", [id]);
    if (!result.affectedRows) return fail(res, "Distributor not found.", 404);
    await activity(req.user, "delete", "distributor", id);
    return ok(res, { id });
  }),
);

app.get(
  "/api/admin/distributors/:id/transactions",
  requireAuth,
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const [rows] = await query(
      `SELECT t.*, d.distributor_code AS distributorCode, d.name AS distributorName
       FROM distributor_transactions t
       INNER JOIN distributors d ON d.id = t.distributor_id
       WHERE t.distributor_id = ?
       ORDER BY t.transaction_date DESC, t.id DESC`,
      [id],
    );
    return ok(res, rows);
  }),
);

function transactionFilters(queryParams) {
  const where = [];
  const params = [];
  if (queryParams.distributorId) {
    where.push("t.distributor_id = ?");
    params.push(Number(queryParams.distributorId));
  }
  if (
    ["id_purchase", "payment", "income", "refund", "adjustment"].includes(
      queryParams.transactionType,
    )
  ) {
    where.push("t.transaction_type = ?");
    params.push(queryParams.transactionType);
  }
  if (["pending", "paid", "failed", "refunded"].includes(queryParams.paymentStatus)) {
    where.push("t.payment_status = ?");
    params.push(queryParams.paymentStatus);
  }
  return { where, params };
}

const transactionSelect = `SELECT t.*, d.distributor_code AS distributorCode, d.name AS distributorName
  FROM distributor_transactions t INNER JOIN distributors d ON d.id = t.distributor_id`;

app.get(
  "/api/admin/transactions",
  requireAuth,
  asyncRoute(async (req, res) => {
    const { where, params } = transactionFilters(req.query);
    const [rows] = await query(
      `${transactionSelect} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY t.transaction_date DESC, t.id DESC`,
      params,
    );
    return ok(res, rows);
  }),
);

app.get(
  "/api/admin/transactions/export",
  requireAuth,
  asyncRoute(async (req, res) => {
    const { where, params } = transactionFilters(req.query);
    const [rows] = await query(
      `${transactionSelect} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY t.transaction_date DESC, t.id DESC`,
      params,
    );
    const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const header = [
      "Date",
      "Distributor ID",
      "Distributor",
      "Type",
      "Reference",
      "IDs",
      "Package level",
      "Package value",
      "Amount",
      "Payment method",
      "Payment status",
      "Notes",
    ];
    const lines = rows.map((item) =>
      [
        item.transaction_date,
        item.distributorCode,
        item.distributorName,
        item.transaction_type,
        item.reference_no,
        item.id_count,
        item.package_level,
        item.package_value,
        item.amount,
        item.payment_method,
        item.payment_status,
        item.notes,
      ]
        .map(escapeCsv)
        .join(","),
    );
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=rdg-transactions.csv");
    return res.send([header.map(escapeCsv).join(","), ...lines].join("\n"));
  }),
);

app.post(
  "/api/admin/transactions",
  requireAuth,
  allowRoles("super_admin", "enquiry_manager"),
  asyncRoute(async (req, res) => {
    const input = validate(transactionSchema, req.body, res);
    if (!input) return;
    const [[distributor]] = await query("SELECT id FROM distributors WHERE id = ? LIMIT 1", [
      input.distributorId,
    ]);
    if (!distributor) return fail(res, "Select a valid distributor.", 422);
    const [result] = await query(
      `INSERT INTO distributor_transactions
       (distributor_id, transaction_type, reference_no, id_count, package_level, package_value, amount, payment_method, payment_status, transaction_date, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.distributorId,
        input.transactionType,
        input.referenceNo || null,
        input.idCount,
        input.packageLevel || null,
        input.packageValue ?? null,
        input.amount,
        input.paymentMethod || null,
        input.paymentStatus,
        input.transactionDate,
        input.notes || null,
        req.user.id,
      ],
    );
    if (input.transactionType === "id_purchase") {
      await syncDistributorPackageAccess(
        input.distributorId,
        input.paymentStatus,
        input.paymentMethod || "admin_recorded",
        input.referenceNo || null,
      );
    }
    await activity(req.user, "create", "transaction", result.insertId, {
      distributorId: input.distributorId,
      amount: input.amount,
      type: input.transactionType,
    });
    return ok(res, { id: result.insertId }, 201);
  }),
);

app.put(
  "/api/admin/transactions/:id",
  requireAuth,
  allowRoles("super_admin", "enquiry_manager"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = validate(transactionSchema, req.body, res);
    if (!input) return;
    const [[previousTransaction]] = await query(
      "SELECT transaction_type AS transactionType FROM distributor_transactions WHERE id = ? LIMIT 1",
      [id],
    );
    const [[distributor]] = await query("SELECT id FROM distributors WHERE id = ? LIMIT 1", [
      input.distributorId,
    ]);
    if (!distributor) return fail(res, "Select a valid distributor.", 422);
    const [result] = await query(
      `UPDATE distributor_transactions SET distributor_id = ?, transaction_type = ?, reference_no = ?, id_count = ?, package_level = ?, package_value = ?, amount = ?, payment_method = ?, payment_status = ?, transaction_date = ?, notes = ? WHERE id = ?`,
      [
        input.distributorId,
        input.transactionType,
        input.referenceNo || null,
        input.idCount,
        input.packageLevel || null,
        input.packageValue ?? null,
        input.amount,
        input.paymentMethod || null,
        input.paymentStatus,
        input.transactionDate,
        input.notes || null,
        id,
      ],
    );
    if (!result.affectedRows) return fail(res, "Transaction not found.", 404);
    if (input.transactionType === "id_purchase") {
      await syncDistributorPackageAccess(
        input.distributorId,
        input.paymentStatus,
        input.paymentMethod || "admin_recorded",
        input.referenceNo || null,
      );
    } else if (previousTransaction?.transactionType === "id_purchase") {
      await syncDistributorPackageAccess(
        input.distributorId,
        "pending",
        input.paymentMethod || "admin_recorded",
        input.referenceNo || null,
      );
    }
    await activity(req.user, "update", "transaction", id, {
      distributorId: input.distributorId,
      amount: input.amount,
    });
    return ok(res, { id });
  }),
);

app.delete(
  "/api/admin/transactions/:id",
  requireAuth,
  allowRoles("super_admin"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const [result] = await query("DELETE FROM distributor_transactions WHERE id = ?", [id]);
    if (!result.affectedRows) return fail(res, "Transaction not found.", 404);
    await activity(req.user, "delete", "transaction", id);
    return ok(res, { id });
  }),
);

app.get(
  "/api/admin/gallery",
  requireAuth,
  asyncRoute(async (_req, res) => {
    const [rows] = await query(
      "SELECT id, title, tag, image_url AS imageUrl, alt_text AS altText, status, sort_order AS sortOrder, created_at AS createdAt, updated_at AS updatedAt FROM gallery_items ORDER BY sort_order ASC, created_at DESC",
    );
    return ok(res, rows);
  }),
);

app.post(
  "/api/admin/gallery",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  asyncRoute(async (req, res) => {
    const input = validate(gallerySchema, req.body, res);
    if (!input) return;
    const [result] = await query(
      "INSERT INTO gallery_items (title, tag, image_url, alt_text, status, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
      [
        input.title,
        input.tag,
        input.imageUrl,
        input.altText || null,
        input.status,
        input.sortOrder,
      ],
    );
    await activity(req.user, "create", "gallery_item", result.insertId, { title: input.title });
    return ok(res, { id: result.insertId }, 201);
  }),
);

app.put(
  "/api/admin/gallery/:id",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = validate(gallerySchema, req.body, res);
    if (!input) return;
    const [result] = await query(
      "UPDATE gallery_items SET title = ?, tag = ?, image_url = ?, alt_text = ?, status = ?, sort_order = ? WHERE id = ?",
      [
        input.title,
        input.tag,
        input.imageUrl,
        input.altText || null,
        input.status,
        input.sortOrder,
        id,
      ],
    );
    if (!result.affectedRows) return fail(res, "Gallery item not found.", 404);
    await activity(req.user, "update", "gallery_item", id, { title: input.title });
    return ok(res, { id });
  }),
);

app.delete(
  "/api/admin/gallery/:id",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const [result] = await query("DELETE FROM gallery_items WHERE id = ?", [id]);
    if (!result.affectedRows) return fail(res, "Gallery item not found.", 404);
    await activity(req.user, "delete", "gallery_item", id);
    return ok(res, { id });
  }),
);

app.post(
  "/api/admin/pages",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  asyncRoute(async (req, res) => {
    const input = validate(pageSchema, req.body, res);
    if (!input) return;
    try {
      const [result] = await query(
        "INSERT INTO pages (title, slug, description, body, status, seo_title, seo_description, show_in_nav) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          input.title,
          input.slug,
          input.description || null,
          input.body || null,
          input.status,
          input.seoTitle || null,
          input.seoDescription || null,
          input.showInNav ? 1 : 0,
        ],
      );
      await activity(req.user, "create", "page", result.insertId, { title: input.title });
      return ok(res, { id: result.insertId }, 201);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") return fail(res, "That page slug already exists.", 409);
      throw error;
    }
  }),
);

app.put(
  "/api/admin/pages/:id",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = validate(pageSchema, req.body, res);
    if (!input) return;
    try {
      const [result] = await query(
        "UPDATE pages SET title = ?, slug = ?, description = ?, body = ?, status = ?, seo_title = ?, seo_description = ?, show_in_nav = ? WHERE id = ?",
        [
          input.title,
          input.slug,
          input.description || null,
          input.body || null,
          input.status,
          input.seoTitle || null,
          input.seoDescription || null,
          input.showInNav ? 1 : 0,
          id,
        ],
      );
      if (!result.affectedRows) return fail(res, "Page not found.", 404);
      await activity(req.user, "update", "page", id, { title: input.title });
      return ok(res, { id });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") return fail(res, "That page slug already exists.", 409);
      throw error;
    }
  }),
);

app.delete(
  "/api/admin/pages/:id",
  requireAuth,
  allowRoles("super_admin"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const [result] = await query("DELETE FROM pages WHERE id = ?", [id]);
    if (!result.affectedRows) return fail(res, "Page not found.", 404);
    await activity(req.user, "delete", "page", id);
    return ok(res, { id });
  }),
);

app.get(
  "/api/admin/banners",
  requireAuth,
  asyncRoute(async (_req, res) => {
    const [rows] = await query(
      "SELECT id, title, subtitle, description, cta_label AS ctaLabel, cta_url AS ctaUrl, image_url AS imageUrl, mobile_image_url AS mobileImageUrl, alt_text AS altText, sort_order AS sortOrder, active, starts_at AS startsAt, ends_at AS endsAt FROM banners ORDER BY sort_order ASC, created_at DESC",
    );
    return ok(res, rows);
  }),
);

app.post(
  "/api/admin/banners",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  asyncRoute(async (req, res) => {
    const input = validate(bannerSchema, req.body, res);
    if (!input) return;
    const [result] = await query(
      "INSERT INTO banners (title, subtitle, description, cta_label, cta_url, image_url, mobile_image_url, alt_text, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        input.title,
        input.subtitle || null,
        input.description || null,
        input.ctaLabel || null,
        input.ctaUrl || null,
        input.imageUrl || null,
        input.mobileImageUrl || null,
        input.altText || null,
        input.sortOrder,
        input.active ? 1 : 0,
      ],
    );
    await activity(req.user, "create", "banner", result.insertId, { title: input.title });
    return ok(res, { id: result.insertId }, 201);
  }),
);

app.put(
  "/api/admin/banners/:id",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = validate(bannerSchema, req.body, res);
    if (!input) return;
    const [result] = await query(
      "UPDATE banners SET title = ?, subtitle = ?, description = ?, cta_label = ?, cta_url = ?, image_url = ?, mobile_image_url = ?, alt_text = ?, sort_order = ?, active = ? WHERE id = ?",
      [
        input.title,
        input.subtitle || null,
        input.description || null,
        input.ctaLabel || null,
        input.ctaUrl || null,
        input.imageUrl || null,
        input.mobileImageUrl || null,
        input.altText || null,
        input.sortOrder,
        input.active ? 1 : 0,
        id,
      ],
    );
    if (!result.affectedRows) return fail(res, "Banner not found.", 404);
    await activity(req.user, "update", "banner", id, { title: input.title });
    return ok(res, { id });
  }),
);

app.delete(
  "/api/admin/banners/:id",
  requireAuth,
  allowRoles("super_admin"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const [result] = await query("DELETE FROM banners WHERE id = ?", [id]);
    if (!result.affectedRows) return fail(res, "Banner not found.", 404);
    await activity(req.user, "delete", "banner", id);
    return ok(res, { id });
  }),
);

app.get(
  "/api/admin/products",
  requireAuth,
  asyncRoute(async (_req, res) => {
    const [rows] = await query(
      "SELECT id, name, slug, category, subtitle, description, highlights, price, image_url AS imageUrl, status, sort_order AS sortOrder, updated_at AS updatedAt FROM products ORDER BY sort_order ASC, updated_at DESC",
    );
    return ok(
      res,
      rows.map((row) => ({
        ...row,
        price:
          row.price === null ? (row.name === "Anmol Ratan Juice" ? 1200 : null) : Number(row.price),
        highlights: parseJson(row.highlights, []),
      })),
    );
  }),
);

app.post(
  "/api/admin/products",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  asyncRoute(async (req, res) => {
    const input = validate(productSchema, req.body, res);
    if (!input) return;
    try {
      const [result] = await query(
        "INSERT INTO products (name, slug, category, subtitle, description, highlights, price, image_url, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          input.name,
          input.slug,
          input.category || null,
          input.subtitle || null,
          input.description || null,
          JSON.stringify(input.highlights),
          input.price ?? null,
          input.imageUrl || null,
          input.status,
          input.sortOrder,
        ],
      );
      await activity(req.user, "create", "product", result.insertId, { name: input.name });
      return ok(res, { id: result.insertId }, 201);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") return fail(res, "That product slug already exists.", 409);
      throw error;
    }
  }),
);

app.put(
  "/api/admin/products/:id",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = validate(productSchema, req.body, res);
    if (!input) return;
    try {
      const [result] = await query(
        "UPDATE products SET name = ?, slug = ?, category = ?, subtitle = ?, description = ?, highlights = ?, price = ?, image_url = ?, status = ?, sort_order = ? WHERE id = ?",
        [
          input.name,
          input.slug,
          input.category || null,
          input.subtitle || null,
          input.description || null,
          JSON.stringify(input.highlights),
          input.price ?? null,
          input.imageUrl || null,
          input.status,
          input.sortOrder,
          id,
        ],
      );
      if (!result.affectedRows) return fail(res, "Product not found.", 404);
      await activity(req.user, "update", "product", id, { name: input.name });
      return ok(res, { id });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") return fail(res, "That product slug already exists.", 409);
      throw error;
    }
  }),
);

app.delete(
  "/api/admin/products/:id",
  requireAuth,
  allowRoles("super_admin"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const [result] = await query("DELETE FROM products WHERE id = ?", [id]);
    if (!result.affectedRows) return fail(res, "Product not found.", 404);
    await activity(req.user, "delete", "product", id);
    return ok(res, { id });
  }),
);

app.get(
  "/api/admin/product-categories",
  requireAuth,
  asyncRoute(async (_req, res) => {
    const [rows] = await query(
      `SELECT c.id, c.name, c.slug, c.sort_order AS sortOrder,
         c.created_at AS createdAt, c.updated_at AS updatedAt,
         (SELECT COUNT(*) FROM products p WHERE p.category = c.name) AS productCount
       FROM product_categories c
       ORDER BY c.sort_order ASC, c.name ASC`,
    );
    return ok(
      res,
      rows.map((row) => ({ ...row, productCount: Number(row.productCount || 0) })),
    );
  }),
);

app.post(
  "/api/admin/product-categories",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  asyncRoute(async (req, res) => {
    const input = validate(productCategorySchema, req.body, res);
    if (!input) return;
    try {
      const [result] = await query(
        "INSERT INTO product_categories (name, slug, sort_order) VALUES (?, ?, ?)",
        [input.name, input.slug, input.sortOrder],
      );
      await activity(req.user, "create", "product_category", result.insertId, {
        name: input.name,
      });
      return ok(res, { id: result.insertId }, 201);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY")
        return fail(res, "That category name or slug already exists.", 409);
      throw error;
    }
  }),
);

app.put(
  "/api/admin/product-categories/:id",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = validate(productCategorySchema, req.body, res);
    if (!input) return;
    const [[current]] = await query("SELECT name FROM product_categories WHERE id = ? LIMIT 1", [
      id,
    ]);
    if (!current) return fail(res, "Product category not found.", 404);
    try {
      const result = await transaction(async (connection) => {
        const [update] = await connection.execute(
          "UPDATE product_categories SET name = ?, slug = ?, sort_order = ? WHERE id = ?",
          [input.name, input.slug, input.sortOrder, id],
        );
        await connection.execute("UPDATE products SET category = ? WHERE category = ?", [
          input.name,
          current.name,
        ]);
        return update;
      });
      if (!result.affectedRows) return fail(res, "Product category not found.", 404);
      await activity(req.user, "update", "product_category", id, { name: input.name });
      return ok(res, { id });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY")
        return fail(res, "That category name or slug already exists.", 409);
      throw error;
    }
  }),
);

app.delete(
  "/api/admin/product-categories/:id",
  requireAuth,
  allowRoles("super_admin"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const [[category]] = await query(
      `SELECT c.name, (SELECT COUNT(*) FROM products p WHERE p.category = c.name) AS productCount
       FROM product_categories c WHERE c.id = ? LIMIT 1`,
      [id],
    );
    if (!category) return fail(res, "Product category not found.", 404);
    if (Number(category.productCount || 0) > 0)
      return fail(res, "Move products to another category before deleting this category.", 409);
    const [result] = await query("DELETE FROM product_categories WHERE id = ?", [id]);
    if (!result.affectedRows) return fail(res, "Product category not found.", 404);
    await activity(req.user, "delete", "product_category", id, { name: category.name });
    return ok(res, { id });
  }),
);

app.get(
  "/api/admin/events",
  requireAuth,
  asyncRoute(async (_req, res) => {
    const [rows] = await query(
      "SELECT id, slug, title, description, DATE_FORMAT(event_date, '%Y-%m-%d') AS eventDate, city, event_type AS eventType, seats, registration_url AS registrationUrl, status, sort_order AS sortOrder, created_at AS createdAt, updated_at AS updatedAt FROM events ORDER BY sort_order ASC, event_date ASC, created_at DESC",
    );
    return ok(res, rows);
  }),
);

app.post(
  "/api/admin/events",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  asyncRoute(async (req, res) => {
    const input = validate(eventSchema, req.body, res);
    if (!input) return;
    try {
      const [result] = await query(
        "INSERT INTO events (slug, title, description, event_date, city, event_type, seats, registration_url, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          input.slug,
          input.title,
          input.description || null,
          input.eventDate,
          input.city,
          input.eventType,
          input.seats,
          input.registrationUrl || null,
          input.status,
          input.sortOrder,
        ],
      );
      await activity(req.user, "create", "event", result.insertId, { title: input.title });
      return ok(res, { id: result.insertId }, 201);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") return fail(res, "That event slug already exists.", 409);
      throw error;
    }
  }),
);

app.put(
  "/api/admin/events/:id",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = validate(eventSchema, req.body, res);
    if (!input) return;
    try {
      const [result] = await query(
        "UPDATE events SET slug = ?, title = ?, description = ?, event_date = ?, city = ?, event_type = ?, seats = ?, registration_url = ?, status = ?, sort_order = ? WHERE id = ?",
        [
          input.slug,
          input.title,
          input.description || null,
          input.eventDate,
          input.city,
          input.eventType,
          input.seats,
          input.registrationUrl || null,
          input.status,
          input.sortOrder,
          id,
        ],
      );
      if (!result.affectedRows) return fail(res, "Event not found.", 404);
      await activity(req.user, "update", "event", id, { title: input.title });
      return ok(res, { id });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") return fail(res, "That event slug already exists.", 409);
      throw error;
    }
  }),
);

app.delete(
  "/api/admin/events/:id",
  requireAuth,
  allowRoles("super_admin"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const [result] = await query("DELETE FROM events WHERE id = ?", [id]);
    if (!result.affectedRows) return fail(res, "Event not found.", 404);
    await activity(req.user, "delete", "event", id);
    return ok(res, { id });
  }),
);

app.get(
  "/api/admin/blog-posts",
  requireAuth,
  asyncRoute(async (_req, res) => {
    const [rows] = await query(
      "SELECT id, title, slug, excerpt, body, featured_image AS featuredImage, image_alt AS imageAlt, author, category, tags, seo_title AS seoTitle, seo_description AS seoDescription, status, published_at AS publishedAt, updated_at AS updatedAt FROM blog_posts ORDER BY updated_at DESC",
    );
    return ok(
      res,
      rows.map((row) => ({ ...row, tags: parseJson(row.tags, []) })),
    );
  }),
);

app.post(
  "/api/admin/blog-posts",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  asyncRoute(async (req, res) => {
    const input = validate(blogSchema, req.body, res);
    if (!input) return;
    try {
      const [result] = await query(
        "INSERT INTO blog_posts (title, slug, excerpt, body, featured_image, image_alt, author, category, tags, seo_title, seo_description, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          input.title,
          input.slug,
          input.excerpt || null,
          input.body || null,
          input.featuredImage || null,
          input.imageAlt || null,
          input.author || null,
          input.category || null,
          JSON.stringify(input.tags),
          input.seoTitle || null,
          input.seoDescription || null,
          input.status,
          input.publishedAt || null,
        ],
      );
      await activity(req.user, "create", "blog_post", result.insertId, { title: input.title });
      return ok(res, { id: result.insertId }, 201);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") return fail(res, "That article slug already exists.", 409);
      throw error;
    }
  }),
);

app.put(
  "/api/admin/blog-posts/:id",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = validate(blogSchema, req.body, res);
    if (!input) return;
    try {
      const [result] = await query(
        "UPDATE blog_posts SET title = ?, slug = ?, excerpt = ?, body = ?, featured_image = ?, image_alt = ?, author = ?, category = ?, tags = ?, seo_title = ?, seo_description = ?, status = ?, published_at = ? WHERE id = ?",
        [
          input.title,
          input.slug,
          input.excerpt || null,
          input.body || null,
          input.featuredImage || null,
          input.imageAlt || null,
          input.author || null,
          input.category || null,
          JSON.stringify(input.tags),
          input.seoTitle || null,
          input.seoDescription || null,
          input.status,
          input.publishedAt || null,
          id,
        ],
      );
      if (!result.affectedRows) return fail(res, "Article not found.", 404);
      await activity(req.user, "update", "blog_post", id, { title: input.title });
      return ok(res, { id });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") return fail(res, "That article slug already exists.", 409);
      throw error;
    }
  }),
);

app.delete(
  "/api/admin/blog-posts/:id",
  requireAuth,
  allowRoles("super_admin"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const [result] = await query("DELETE FROM blog_posts WHERE id = ?", [id]);
    if (!result.affectedRows) return fail(res, "Article not found.", 404);
    await activity(req.user, "delete", "blog_post", id);
    return ok(res, { id });
  }),
);

app.get(
  "/api/admin/enquiries/export",
  requireAuth,
  allowRoles("super_admin", "enquiry_manager"),
  asyncRoute(async (_req, res) => {
    const [rows] = await query(
      "SELECT id, enquiry_type, name, email, phone, city, business_type, investment_range, message, status, created_at FROM contact_enquiries ORDER BY created_at DESC",
    );
    const headers = [
      "id",
      "type",
      "name",
      "email",
      "phone",
      "city",
      "business_type",
      "investment_range",
      "message",
      "status",
      "created_at",
    ];
    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((key) => JSON.stringify(row[key] ?? "")).join(",")),
    ].join("\n");
    res.header("Content-Type", "text/csv");
    res.attachment("rdg-enquiries.csv");
    return res.send(csv);
  }),
);

app.get(
  "/api/admin/enquiries",
  requireAuth,
  asyncRoute(async (req, res) => {
    const status = ["new", "in_progress", "contacted", "closed"].includes(req.query.status)
      ? req.query.status
      : null;
    const [rows] = await query(
      `SELECT e.*, u.name AS assignedName FROM contact_enquiries e LEFT JOIN admin_users u ON u.id = e.assigned_to ${status ? "WHERE e.status = ?" : ""} ORDER BY e.created_at DESC`,
      status ? [status] : [],
    );
    return ok(res, rows);
  }),
);

app.put(
  "/api/admin/enquiries/:id",
  requireAuth,
  allowRoles("super_admin", "enquiry_manager"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const parsed = z
      .object({
        status: z.enum(["new", "in_progress", "contacted", "closed"]),
        internalNotes: z.string().max(5000).optional().nullable(),
      })
      .safeParse(req.body);
    if (!parsed.success) return fail(res, "Invalid enquiry update.", 422);
    const [result] = await query(
      "UPDATE contact_enquiries SET status = ?, internal_notes = ? WHERE id = ?",
      [parsed.data.status, parsed.data.internalNotes || null, id],
    );
    if (!result.affectedRows) return fail(res, "Enquiry not found.", 404);
    await activity(req.user, "update", "enquiry", id, { status: parsed.data.status });
    return ok(res, { id });
  }),
);

app.delete(
  "/api/admin/enquiries/:id",
  requireAuth,
  allowRoles("super_admin"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const [result] = await query("DELETE FROM contact_enquiries WHERE id = ?", [id]);
    if (!result.affectedRows) return fail(res, "Enquiry not found.", 404);
    await activity(req.user, "delete", "enquiry", id);
    return ok(res, { id });
  }),
);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) =>
    callback(
      null,
      `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${path.extname(file.originalname).toLowerCase()}`,
    ),
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, callback) =>
    callback(
      null,
      /^(image\/(jpeg|png|webp|gif)|video\/(mp4|webm|quicktime)|application\/pdf)$/.test(
        file.mimetype,
      ),
    ),
});
const downloadUpload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, callback) =>
    callback(
      null,
      /^(application\/pdf|application\/zip|application\/x-7z-compressed|application\/msword|application\/vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)|application\/vnd\.ms-(excel|powerpoint)|image\/(jpeg|png|webp|gif))$/.test(
        file.mimetype,
      ),
    ),
});

function fileTypeFromName(name) {
  const extension = path
    .extname(name || "")
    .replace(/^\./, "")
    .toUpperCase();
  return extension || "FILE";
}

function fileSizeLabel(sizeBytes) {
  if (!sizeBytes) return null;
  const units = ["B", "KB", "MB", "GB"];
  let size = Number(sizeBytes);
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size >= 10 || unit === 0 ? Math.round(size) : size.toFixed(1)} ${units[unit]}`;
}

app.get(
  "/api/admin/media",
  requireAuth,
  asyncRoute(async (req, res) => {
    const search = String(req.query.q || "").trim();
    const [rows] = await query(
      `SELECT id, filename, original_name AS originalName, mime_type AS mimeType, size_bytes AS sizeBytes, url, alt_text AS altText, created_at AS createdAt FROM media_assets ${search ? "WHERE original_name LIKE ?" : ""} ORDER BY created_at DESC`,
      search ? [`%${search}%`] : [],
    );
    return ok(res, rows);
  }),
);

app.post(
  "/api/admin/media",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  upload.single("file"),
  asyncRoute(async (req, res) => {
    if (!req.file) return fail(res, "Upload an image, video or PDF up to 100 MB.", 422);
    const altText = String(req.body.altText || "").slice(0, 255) || null;
    const url = `/uploads/${req.file.filename}`;
    const [result] = await query(
      "INSERT INTO media_assets (filename, original_name, mime_type, size_bytes, url, alt_text, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        url,
        altText,
        req.user.id,
      ],
    );
    await activity(req.user, "upload", "media", result.insertId, {
      filename: req.file.originalname,
    });
    return ok(res, { id: result.insertId, url, filename: req.file.filename }, 201);
  }),
);

app.delete(
  "/api/admin/media/:id",
  requireAuth,
  allowRoles("super_admin"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const [rows] = await query("SELECT filename FROM media_assets WHERE id = ? LIMIT 1", [id]);
    if (!rows[0]) return fail(res, "Media asset not found.", 404);
    await query("DELETE FROM media_assets WHERE id = ?", [id]);
    await fs.unlink(path.join(uploadDir, rows[0].filename)).catch(() => undefined);
    await activity(req.user, "delete", "media", id);
    return ok(res, { id });
  }),
);

app.get(
  "/api/admin/downloads",
  requireAuth,
  asyncRoute(async (_req, res) => {
    const [rows] = await query(
      `SELECT id, slug, title, description, file_name AS fileName, file_url AS fileUrl, file_type AS fileType, mime_type AS mimeType, size_bytes AS sizeBytes, size_label AS sizeLabel, status, sort_order AS sortOrder, created_at AS createdAt, updated_at AS updatedAt FROM downloads ORDER BY sort_order ASC, created_at DESC`,
    );
    return ok(res, rows);
  }),
);

app.post(
  "/api/admin/downloads",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  downloadUpload.single("file"),
  asyncRoute(async (req, res) => {
    const input = validate(downloadSchema, req.body, res);
    if (!input) return;
    const file = req.file;
    const fileName = file?.filename || null;
    const fileUrl = file ? `/uploads/${file.filename}` : null;
    const fileType = input.fileType || (file ? fileTypeFromName(file.originalname) : "FILE");
    const [result] = await query(
      "INSERT INTO downloads (slug, title, description, file_name, file_url, file_type, mime_type, size_bytes, size_label, status, sort_order, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        input.slug,
        input.title,
        input.description || null,
        fileName,
        fileUrl,
        fileType,
        file?.mimetype || null,
        file?.size || null,
        file ? fileSizeLabel(file.size) : null,
        input.status,
        input.sortOrder,
        req.user.id,
      ],
    );
    await activity(req.user, "create", "download", result.insertId, { title: input.title });
    return ok(res, { id: result.insertId }, 201);
  }),
);

app.put(
  "/api/admin/downloads/:id",
  requireAuth,
  allowRoles("super_admin", "content_editor"),
  downloadUpload.single("file"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const input = validate(downloadSchema, req.body, res);
    if (!input) return;
    const [rows] = await query(
      "SELECT file_name AS fileName, file_url AS fileUrl, file_type AS fileType, mime_type AS mimeType, size_bytes AS sizeBytes, size_label AS sizeLabel FROM downloads WHERE id = ? LIMIT 1",
      [id],
    );
    const existing = rows[0];
    if (!existing) return fail(res, "Download not found.", 404);

    const file = req.file;
    const fileName = file?.filename || existing.fileName;
    const fileUrl = file ? `/uploads/${file.filename}` : existing.fileUrl;
    const fileType =
      input.fileType || (file ? fileTypeFromName(file.originalname) : existing.fileType);
    const mimeType = file?.mimetype || existing.mimeType;
    const sizeBytes = file?.size || existing.sizeBytes;
    const sizeLabel = file ? fileSizeLabel(file.size) : existing.sizeLabel;

    await query(
      "UPDATE downloads SET slug = ?, title = ?, description = ?, file_name = ?, file_url = ?, file_type = ?, mime_type = ?, size_bytes = ?, size_label = ?, status = ?, sort_order = ?, uploaded_by = ? WHERE id = ?",
      [
        input.slug,
        input.title,
        input.description || null,
        fileName,
        fileUrl,
        fileType,
        mimeType,
        sizeBytes,
        sizeLabel,
        input.status,
        input.sortOrder,
        file ? req.user.id : null,
        id,
      ],
    );
    if (file && existing.fileName && existing.fileName !== file.filename)
      await fs.unlink(path.join(uploadDir, existing.fileName)).catch(() => undefined);
    await activity(req.user, "update", "download", id, { title: input.title });
    return ok(res, { id });
  }),
);

app.delete(
  "/api/admin/downloads/:id",
  requireAuth,
  allowRoles("super_admin"),
  asyncRoute(async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const [rows] = await query("SELECT file_name AS fileName FROM downloads WHERE id = ? LIMIT 1", [
      id,
    ]);
    if (!rows[0]) return fail(res, "Download not found.", 404);
    await query("DELETE FROM downloads WHERE id = ?", [id]);
    if (rows[0].fileName)
      await fs.unlink(path.join(uploadDir, rows[0].fileName)).catch(() => undefined);
    await activity(req.user, "delete", "download", id);
    return ok(res, { id });
  }),
);

app.get(
  "/api/admin/settings",
  requireAuth,
  asyncRoute(async (_req, res) => {
    const [rows] = await query(
      "SELECT setting_key AS settingKey, setting_value AS settingValue, updated_at AS updatedAt FROM site_settings ORDER BY setting_key",
    );
    return ok(
      res,
      Object.fromEntries(
        rows.map((row) => [row.settingKey, parseJson(row.settingValue, row.settingValue)]),
      ),
    );
  }),
);

app.put(
  "/api/admin/settings",
  requireAuth,
  allowRoles("super_admin"),
  asyncRoute(async (req, res) => {
    const settings = req.body?.settings;
    if (!settings || typeof settings !== "object" || Array.isArray(settings))
      return fail(res, "Settings payload is invalid.", 422);
    for (const [key, value] of Object.entries(settings)) {
      if (!/^[a-z0-9_]{2,120}$/.test(key)) continue;
      await query(
        "INSERT INTO site_settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)",
        [key, JSON.stringify(String(value).slice(0, 5000)), req.user.id],
      );
    }
    await activity(req.user, "update", "settings", null, { keys: Object.keys(settings) });
    return ok(res, settings);
  }),
);

app.get(
  "/api/admin/activity-logs",
  requireAuth,
  allowRoles("super_admin"),
  asyncRoute(async (_req, res) => {
    const [rows] = await query(
      "SELECT a.id, a.action, a.entity_type AS entityType, a.entity_id AS entityId, a.metadata, a.created_at AS createdAt, u.name AS userName FROM activity_logs a LEFT JOIN admin_users u ON u.id = a.user_id ORDER BY a.created_at DESC LIMIT 100",
    );
    return ok(
      res,
      rows.map((row) => ({ ...row, metadata: parseJson(row.metadata, {}) })),
    );
  }),
);

app.post(
  "/api/public/enquiries",
  enquiryLimiter,
  asyncRoute(async (req, res) => {
    const input = validate(enquirySchema, req.body, res);
    if (!input) return;
    const [result] = await query(
      "INSERT INTO contact_enquiries (enquiry_type, name, email, phone, city, business_type, investment_range, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        input.type,
        input.name,
        input.email || null,
        input.phone || null,
        input.city || null,
        input.businessType || null,
        input.investmentRange || null,
        input.message || null,
      ],
    );
    return ok(res, { id: result.insertId, message: "Your enquiry has been received." }, 201);
  }),
);

app.get(
  "/api/public/gallery",
  asyncRoute(async (_req, res) => {
    const [rows] = await query(
      "SELECT id, title, tag, image_url AS imageUrl, alt_text AS altText FROM gallery_items WHERE status = 'published' ORDER BY sort_order ASC, created_at DESC",
    );
    return ok(res, rows);
  }),
);

app.get(
  "/api/public/media",
  asyncRoute(async (req, res) => {
    const type = String(req.query.type || "")
      .trim()
      .toLowerCase();
    const where = type === "video" ? "WHERE mime_type LIKE 'video/%'" : "";
    const [rows] = await query(
      `SELECT id, original_name AS originalName, mime_type AS mimeType, size_bytes AS sizeBytes, url, alt_text AS altText, created_at AS createdAt FROM media_assets ${where} ORDER BY created_at ASC, id ASC`,
    );
    return ok(res, rows);
  }),
);

app.get(
  "/api/public/downloads",
  asyncRoute(async (_req, res) => {
    const [rows] = await query(
      "SELECT id, slug, title, description, file_name AS fileName, file_url AS fileUrl, file_type AS fileType, mime_type AS mimeType, size_bytes AS sizeBytes, size_label AS sizeLabel FROM downloads WHERE status = 'published' ORDER BY sort_order ASC, created_at DESC",
    );
    return ok(res, rows);
  }),
);

app.get(
  "/api/public/events",
  asyncRoute(async (_req, res) => {
    const [rows] = await query(
      "SELECT id, slug, title, description, DATE_FORMAT(event_date, '%Y-%m-%d') AS eventDate, city, event_type AS eventType, seats, registration_url AS registrationUrl FROM events WHERE status = 'published' ORDER BY sort_order ASC, event_date ASC, created_at DESC",
    );
    return ok(res, rows);
  }),
);

app.get(
  "/api/public/products",
  asyncRoute(async (_req, res) => {
    const [rows] = await query(
      "SELECT id, name, slug, category, subtitle, description, highlights, price, image_url AS imageUrl FROM products WHERE status = 'published' ORDER BY sort_order ASC, updated_at DESC",
    );
    return ok(
      res,
      rows.map((row) => ({
        ...row,
        price:
          row.price === null ? (row.name === "Anmol Ratan Juice" ? 1200 : null) : Number(row.price),
        highlights: parseJson(row.highlights, []),
      })),
    );
  }),
);

app.get(
  "/api/public/blog-posts",
  asyncRoute(async (_req, res) => {
    const [rows] = await query(
      "SELECT id, title, slug, excerpt, category, COALESCE(DATE_FORMAT(published_at, '%Y-%m-%d'), DATE_FORMAT(created_at, '%Y-%m-%d')) AS date, 5 AS readMinutes FROM blog_posts WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC",
    );
    return ok(
      res,
      rows.map((row) => ({ ...row, read: row.readMinutes })),
    );
  }),
);

app.get(
  "/api/public/site-config",
  asyncRoute(async (_req, res) => {
    const [settingsRows] = await query(
      "SELECT setting_key AS settingKey, setting_value AS settingValue FROM site_settings",
    );
    const [banners] = await query(
      "SELECT id, title, subtitle, description, cta_label AS ctaLabel, cta_url AS ctaUrl, image_url AS imageUrl, mobile_image_url AS mobileImageUrl, alt_text AS altText FROM banners WHERE active = 1 AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW()) ORDER BY sort_order ASC",
    );
    return ok(res, {
      settings: Object.fromEntries(
        settingsRows.map((row) => [row.settingKey, parseJson(row.settingValue, row.settingValue)]),
      ),
      banners,
    });
  }),
);

app.get("/api/docs", (_req, res) =>
  ok(res, {
    auth: ["POST /api/auth/login", "POST /api/auth/logout", "GET /api/auth/me"],
    admin: [
      "/api/admin/dashboard",
      "/api/admin/pages",
      "/api/admin/banners",
      "/api/admin/products",
      "/api/admin/product-categories",
      "/api/admin/blog-posts",
      "/api/admin/enquiries",
      "/api/admin/distributors",
      "/api/admin/distributors/:id/transactions",
      "/api/admin/transactions",
      "/api/admin/transactions/export",
      "/api/admin/gallery",
      "/api/admin/media",
      "/api/admin/downloads",
      "/api/admin/events",
      "/api/admin/settings",
      "/api/admin/activity-logs",
    ],
    public: [
      "POST /api/public/enquiries",
      "GET /api/public/gallery",
      "GET /api/public/downloads",
      "GET /api/public/events",
      "GET /api/public/products",
      "GET /api/public/blog-posts",
      "GET /api/public/site-config",
    ],
  }),
);

// In production, serve the Vite build from the same origin as the API.
// API and upload routes are handled above and are allowed to continue through.
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (req.path === "/api" || req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
    return next();
  }
  return res.sendFile(path.join(frontendDist, "index.html"), (error) => {
    if (error) next(error);
  });
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError || error?.code === "LIMIT_FILE_SIZE")
    return fail(res, "File is too large. Maximum size is 8 MB.", 413);
  if (error?.code === "ER_DUP_ENTRY")
    return fail(res, "A record with that unique value already exists.", 409);
  console.error("API error:", error.message);
  return fail(res, "Something went wrong. Please try again.", 500);
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`RDG CMS running on port ${port}`);
});

const shutdown = async () => {
  server.close();
  await closePool();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
