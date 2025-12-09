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
      "status" TEXT NOT NULL DEFAULT 'booked',
      "paymentStatus" TEXT,
      "paymentReference" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
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
