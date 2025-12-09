import { prisma } from "../src/config/db.js";

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Booking" (
      "id" SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL,
      "hotelId" TEXT NOT NULL,
      "roomId" TEXT,
      "status" TEXT NOT NULL DEFAULT 'booked',
      "paymentStatus" TEXT,
      "paymentReference" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION set_updated_at_booking()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW."updatedAt" = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS booking_set_updated_at ON "Booking";
    CREATE TRIGGER booking_set_updated_at
    BEFORE UPDATE ON "Booking"
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at_booking();
  `);

  // Sample data (id will auto increment)
  await prisma.$executeRawUnsafe(
    `INSERT INTO "Booking" ("userId", "hotelId", "roomId", "status", "paymentStatus")
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT DO NOTHING`,
    1,
    'hotel-001',
    'room-001',
    'booked',
    'pending'
  );

  console.log("✅ Booking table ensured and sample data inserted (if not present).");
}

main()
  .catch((e) => {
    console.error("❌ Error ensuring Booking table:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


