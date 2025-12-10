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
    );

    ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "checkIn" TIMESTAMP WITH TIME ZONE;
    ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "checkOut" TIMESTAMP WITH TIME ZONE;
    ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "guestCount" INTEGER DEFAULT 1;
    ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "firstName" TEXT DEFAULT '';
    ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "lastName" TEXT DEFAULT '';
    ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "email" TEXT DEFAULT '';
    ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT DEFAULT '';
    ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "specialRequest" TEXT;
    ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "bookingReference" TEXT UNIQUE;
  `);

  ensuredBookingTable = true;
}

export const BookingModel = {
  async create(data) {
    await ensureBookingTable();
    return prisma.booking.create({ data });
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
