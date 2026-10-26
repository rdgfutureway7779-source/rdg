import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { closePool, migrate, query } from "./db.mjs";

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");

const pages = [
  ["Home", "home", "RDG Future Way home page", "published"],
  ["About Us", "about", "Company story, vision, mission and leadership", "published"],
  [
    "Anmol Ratan Juice",
    "products",
    "Signature herbal and mixed berry wellness product",
    "published",
  ],
  [
    "Business Opportunity",
    "business-opportunity",
    "Direct selling opportunity and journey",
    "published",
  ],
  ["Generation Plan", "generation-plan", "15-level income and reward structure", "published"],
  ["Income Calculator", "income-calculator", "Plan value and referral calculator", "published"],
  ["Contact", "contact", "Contact and enquiry page", "published"],
];

const settings = {
  company_name: "RDG Future Way Pvt. Ltd.",
  hero_title: "Pure Herbal Nutrition for a Healthier Tomorrow",
  hero_description:
    "Anmol Ratan Juice is a herbal and mixed berry wellness drink for Indian families who want a refreshing, fruit-forward addition to their everyday routine.",
  hero_cta_label: "Discover the Goodness",
  hero_cta_url: "/products",
  default_seo_title: "RDG Future Way Pvt. Ltd. | Anmol Ratan Juice",
  default_seo_description:
    "Discover Anmol Ratan Juice, RDG Future Way's herbal and mixed berry wellness product and business opportunity.",
};

const galleryItems = [
  [
    "Annual Leadership Meet",
    "Events",
    "/uploads/gallery-leadership-meet.jpg",
    "Speaker addressing an RDG business conference.",
  ],
  [
    "Corporate Head Office",
    "Office",
    "/uploads/gallery-head-office.jpg",
    "RDG corporate head office.",
  ],
  [
    "Product Launch Stage",
    "Events",
    "/uploads/gallery-product-launch.jpg",
    "RDG product launch event.",
  ],
  [
    "Distributor Training Camp",
    "Training",
    "/uploads/gallery-training-camp.jpg",
    "Distributor training workshop.",
  ],
  [
    "Manufacturing Facility",
    "Office",
    "/uploads/gallery-manufacturing.jpg",
    "RDG manufacturing facility.",
  ],
];

const mediaAssets = [
  ...galleryItems.map(([, , url, altText]) => ({
    originalName: path.basename(url),
    mimeType: "image/jpeg",
    url,
    altText,
    relativePath: url.replace(/^\//, ""),
  })),
  ...Array.from({ length: 7 }, (_, index) => {
    const originalName = `rdg-video-${String(index + 1).padStart(2, "0")}.mp4`;
    return {
      originalName,
      mimeType: "video/mp4",
      url: `/videos/${originalName}`,
      altText: `RDG Future Way video ${index + 1}`,
      relativePath: `videos/${originalName}`,
    };
  }),
];

const downloads = [
  ["company-brochure", "Company Brochure", "4.2 MB", "PDF"],
  ["anmol-ratan-juice-product-sheet", "Anmol Ratan Juice Product Sheet", "12.8 MB", "PDF"],
  ["generation-income-plan", "Generation Income Plan", "3.1 MB", "PDF"],
  ["distributor-application-form", "Distributor Application Form", "0.6 MB", "PDF"],
  ["price-list-dp-mrp", "Price List (DP / MRP)", "1.9 MB", "XLSX"],
  ["business-presentation", "Business Presentation", "9.4 MB", "PPTX"],
  ["training-material-pack", "Training Material Pack", "22.5 MB", "ZIP"],
];

const events = [
  [
    "national-leadership-summit-2026",
    "National Leadership Summit 2026",
    "2026-09-12",
    "Indore",
    "Seminar",
    1200,
  ],
  [
    "ayurveda-product-launch-immunity-series",
    "Ayurveda Product Launch — Immunity Series",
    "2026-08-22",
    "Bhopal",
    "Launch",
    400,
  ],
  [
    "kisan-samriddhi-business-meet",
    "Kisan Samriddhi Business Meet",
    "2026-10-05",
    "Nagpur",
    "Business Meet",
    600,
  ],
  [
    "rewards-recognition-night",
    "Rewards & Recognition Night",
    "2026-11-18",
    "Jaipur",
    "Award Night",
    900,
  ],
];

function categorySlug(value) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product-category"
  );
}

export async function seedDatabase() {
  await migrate();
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 10) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD (minimum 10 characters) are required for the first admin user.",
    );
  }

  const [admins] = await query("SELECT id FROM admin_users WHERE email = ? LIMIT 1", [email]);
  if (!admins.length) {
    const passwordHash = await bcrypt.hash(password, 12);
    await query(
      "INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, 'super_admin')",
      ["RDG Administrator", email, passwordHash],
    );
  }

  for (const [title, slug, description, status] of pages) {
    await query(
      "INSERT IGNORE INTO pages (title, slug, description, status, show_in_nav) VALUES (?, ?, ?, ?, ?)",
      [
        title,
        slug,
        description,
        status,
        ["home", "about", "products", "business-opportunity", "contact"].includes(slug) ? 1 : 0,
      ],
    );
  }

  for (const [key, value] of Object.entries(settings)) {
    await query(
      "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
      [key, JSON.stringify(value)],
    );
  }

  for (const [title, tag, imageUrl, altText] of galleryItems) {
    await query(
      "INSERT IGNORE INTO gallery_items (title, tag, image_url, alt_text, status, sort_order) VALUES (?, ?, ?, ?, 'published', ?)",
      [title, tag, imageUrl, altText, galleryItems.findIndex((item) => item[0] === title)],
    );
  }

  for (const asset of mediaAssets) {
    const filePath = path.join(publicDir, asset.relativePath);
    const file = await fs.stat(filePath).catch(() => null);
    if (!file) continue;
    const [existing] = await query("SELECT id FROM media_assets WHERE url = ? LIMIT 1", [
      asset.url,
    ]);
    if (existing.length) continue;
    await query(
      "INSERT INTO media_assets (filename, original_name, mime_type, size_bytes, url, alt_text) VALUES (?, ?, ?, ?, ?, ?)",
      [asset.originalName, asset.originalName, asset.mimeType, file.size, asset.url, asset.altText],
    );
  }

  for (const [slug, title, sizeLabel, fileType] of downloads) {
    await query(
      "INSERT IGNORE INTO downloads (slug, title, size_label, file_type, status, sort_order) VALUES (?, ?, ?, ?, 'published', ?)",
      [slug, title, sizeLabel, fileType, downloads.findIndex((item) => item[0] === slug)],
    );
  }

  for (const [slug, title, eventDate, city, eventType, seats] of events) {
    await query(
      "INSERT IGNORE INTO events (slug, title, event_date, city, event_type, seats, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, 'published', ?)",
      [
        slug,
        title,
        eventDate,
        city,
        eventType,
        seats,
        events.findIndex((item) => item[0] === slug),
      ],
    );
  }

  const [existingProductCategories] = await query(
    "SELECT DISTINCT TRIM(category) AS name FROM products WHERE category IS NOT NULL AND TRIM(category) <> ''",
  );
  for (const [index, item] of existingProductCategories.entries()) {
    await query("INSERT IGNORE INTO product_categories (name, slug, sort_order) VALUES (?, ?, ?)", [
      item.name,
      categorySlug(item.name),
      index,
    ]);
  }
}

if (process.argv[1]?.endsWith("seed.mjs")) {
  try {
    await seedDatabase();
    console.log("RDG database seed completed.");
  } catch (error) {
    console.error("RDG database seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}
