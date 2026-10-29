import "dotenv/config";
import fs from "node:fs/promises";
import mysql from "mysql2/promise";

let pool;

function identifier(value, fallback) {
  const candidate = value || fallback;
  if (!/^[a-zA-Z0-9_]+$/.test(candidate)) throw new Error("Invalid MySQL identifier");
  return candidate;
}

export async function getPool() {
  if (pool) return pool;

  const config = {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    waitForConnections: true,
    connectionLimit: 10,
    charset: "utf8mb4",
  };
  const database = identifier(process.env.MYSQL_DATABASE, "rdg");
  const shouldCreateDatabase =
    process.env.CREATE_DATABASE === "true" || process.env.NODE_ENV !== "production";
  if (shouldCreateDatabase) {
    const bootstrap = await mysql.createConnection(config);
    await bootstrap.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await bootstrap.end();
  }
  pool = mysql.createPool({ ...config, database });
  return pool;
}

export async function query(sql, params = []) {
  const activePool = await getPool();
  return activePool.execute(sql, params);
}

export async function transaction(callback) {
  const activePool = await getPool();
  const connection = await activePool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function migrate() {
  const activePool = await getPool();
  const schema = await fs.readFile(new URL("./schema.sql", import.meta.url), "utf8");
  const statements = schema
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) await activePool.query(statement);
  const [paymentReferenceColumn] = await activePool.query(
    "SHOW COLUMNS FROM customer_orders LIKE 'payment_reference'",
  );
  if (!paymentReferenceColumn.length) {
    await activePool.query(
      "ALTER TABLE customer_orders ADD COLUMN payment_reference VARCHAR(100) NULL AFTER payment_method",
    );
  }
  const [mediaFileDataColumn] = await activePool.query(
    "SHOW COLUMNS FROM media_assets LIKE 'file_data'",
  );
  if (!mediaFileDataColumn.length) {
    await activePool.query(
      "ALTER TABLE media_assets ADD COLUMN file_data MEDIUMBLOB NULL AFTER size_bytes",
    );
  }
  const [productDpPriceColumn] = await activePool.query(
    "SHOW COLUMNS FROM products LIKE 'dp_price'",
  );
  if (!productDpPriceColumn.length) {
    await activePool.query(
      "ALTER TABLE products ADD COLUMN dp_price DECIMAL(12,2) NULL AFTER price",
    );
  }
  const [productStockColumn] = await activePool.query(
    "SHOW COLUMNS FROM products LIKE 'stock_quantity'",
  );
  if (!productStockColumn.length) {
    await activePool.query(
      "ALTER TABLE products ADD COLUMN stock_quantity INT NULL AFTER dp_price",
    );
  }
  const [productServiceableColumn] = await activePool.query(
    "SHOW COLUMNS FROM products LIKE 'is_serviceable'",
  );
  if (!productServiceableColumn.length) {
    await activePool.query(
      "ALTER TABLE products ADD COLUMN is_serviceable TINYINT(1) NOT NULL DEFAULT 1 AFTER stock_quantity",
    );
  }
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
