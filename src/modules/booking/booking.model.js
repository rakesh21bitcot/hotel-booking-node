import { prisma } from '../../config/db.js';

let ensuredBookingTable = false;

async function ensureBookingTable() {
  if (ensuredBookingTable) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Booking" (
      "id" SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL,
      "hotelId" TEXT NOT NULL,
      "roomId" TEXT,
      "checkIn" TIMESTAMP WITH TIME ZONE NOT NULL,
      "checkOut" TIMESTAMP WITH TIME ZONE NOT NULL,
      "guestCount" INTEGER NOT NULL,
      "firstName" TEXT NOT NULL,
      "totalPrice" INTEGER NOT NULL,
      "lastName" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "phoneNumber" TEXT NOT NULL,
      "specialRequest" TEXT,
      "status" TEXT NOT NULL DEFAULT 'confirmed',
      "paymentStatus" TEXT,
      "paymentReference" TEXT,
      "bookingReference" TEXT UNIQUE,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);

  // Ensure columns exist (run individually to avoid multi-statement errors in Supabase)
  await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "checkIn" TIMESTAMP WITH TIME ZONE`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "checkOut" TIMESTAMP WITH TIME ZONE`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "guestCount" INTEGER DEFAULT 1`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "totalPrice" INTEGER DEFAULT 0`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "firstName" TEXT DEFAULT ''`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "lastName" TEXT DEFAULT ''`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "email" TEXT DEFAULT ''`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT DEFAULT ''`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "specialRequest" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "bookingReference" TEXT UNIQUE`);

  // Backfill any older rows that were created before these columns existed
  await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "checkIn" = COALESCE("checkIn", "createdAt") WHERE "checkIn" IS NULL`);
  await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "totalPrice" = COALESCE("totalPrice", 0) WHERE "totalPrice" IS NULL`);
  await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "checkOut" = COALESCE("checkOut", "createdAt" + interval '1 day') WHERE "checkOut" IS NULL`);
  await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "guestCount" = COALESCE("guestCount", 1) WHERE "guestCount" IS NULL`);
  await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "firstName" = COALESCE("firstName", '') WHERE "firstName" IS NULL`);
  await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "lastName" = COALESCE("lastName", '') WHERE "lastName" IS NULL`);
  await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "email" = COALESCE("email", '') WHERE "email" IS NULL`);
  await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "phoneNumber" = COALESCE("phoneNumber", '') WHERE "phoneNumber" IS NULL`);

  ensuredBookingTable = true;
}

export const BookingModel = {
  async create(data) {
    await ensureBookingTable();
    return prisma.booking.create({ data: {
      ...data,
      totalPrice: data.totalPrice || 0,
    } });
  },
  async cancel(id) {
    await ensureBookingTable();
    return prisma.booking.update({ where: { id }, data: { status: 'canceled' } });
  },
  async findById(id) {
    await ensureBookingTable();
    return prisma.booking.findUnique({ where: { id } });
  },
  async findByUser(userId) {
    await ensureBookingTable();
    return prisma.booking.findMany({ where: { userId } });
  },
  async findByHotel(hotelId) {
    await ensureBookingTable();
    return prisma.booking.findMany({ where: { hotelId } });
  },
};
