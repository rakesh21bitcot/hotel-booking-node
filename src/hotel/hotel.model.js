import { prisma } from "../config/db.js";

/**
 * Determine SQL column type based on a JS value.
 * Complex structures default to JSONB for flexibility.
 */
function inferColumnType(value) {
  if (value === null || value === undefined) return "TEXT";
  if (Array.isArray(value) || typeof value === "object") return "JSONB";
  if (typeof value === "boolean") return "BOOLEAN";
  if (typeof value === "number") return Number.isInteger(value) ? "INTEGER" : "DOUBLE PRECISION";
  return "TEXT";
}

/**
 * Normalize a JS value so it can be inserted into the column type.
 * JSONB columns store stringified JSON.
 */
function normalizeValue(value, columnType) {
  if (columnType === "JSONB") {
    return JSON.stringify(value ?? null);
  }
  if (columnType === "UUID" && typeof value === "string") {
    return value;
  }
  return value;
}

function getCastForType(columnType) {
  switch (columnType) {
    case "UUID":
      return "::uuid";
    case "JSONB":
      return "::jsonb";
    case "BOOLEAN":
      return "::boolean";
    case "INTEGER":
      return "::integer";
    case "DOUBLE PRECISION":
      return "::double precision";
    default:
      return "";
  }
}

async function fetchExistingColumns() {
  const rows = await prisma.$queryRaw`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hotels'
  `;

  const map = new Map();
  rows.forEach((row) => {
    map.set(row.column_name, row.data_type.toUpperCase());
  });
  return map;
}

async function ensureColumn(columnName, value, columnMap) {
  if (columnMap.has(columnName)) {
    return columnMap.get(columnName);
  }

  const columnType = inferColumnType(value);
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "hotels" ADD COLUMN IF NOT EXISTS "${columnName}" ${columnType}`
  );
  columnMap.set(columnName, columnType);
  return columnType;
}

// Generic helper to insert into the "hotels" table.
export const HotelModel = {
  existingColumnsPromise: null,

  async getColumnMap() {
    if (!this.existingColumnsPromise) {
      this.existingColumnsPromise = fetchExistingColumns();
    }
    return this.existingColumnsPromise;
  },

  /**
   * Insert a single hotel row into the "hotels" table.
   * Automatically creates missing columns (JSONB by default for complex values).
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    const keys = Object.keys(data || {});
    if (!keys.length) {
      throw new Error("No data provided to create hotel");
    }

    const columnMap = await this.getColumnMap();

    // Ensure every field has a column. Columns added on-the-fly.
    const columnTypes = await Promise.all(
      keys.map((key) => ensureColumn(key, data[key], columnMap))
    );

    const columns = keys.map((k) => `"${k}"`).join(", ");
    const params = columnTypes
      .map((type, i) => `$${i + 1}${getCastForType(type)}`)
      .join(", ");
    const values = keys.map((key, index) => normalizeValue(data[key], columnTypes[index]));

    const [row] = await prisma.$queryRawUnsafe(
      `INSERT INTO "hotels" (${columns}) VALUES (${params}) RETURNING *`,
      ...values
    );

    return row;
  },

  /**
   * Insert multiple hotel rows.
   * @param {Array<Object>} hotels
   * @returns {Promise<Array<Object>>}
   */
  async bulkCreate(hotels = []) {
    const results = [];
    for (const h of hotels) {
      const row = await this.create(h);
      results.push(row);
    }
    return results;
  },
};


