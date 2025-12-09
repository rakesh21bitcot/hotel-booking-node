import { prisma } from '../../config/db.js';

export const BookingModel = {
  create: (data) => prisma.booking.create({ data }),
  cancel: (id) => prisma.booking.update({ where: { id }, data: { status: 'canceled' } }),
  findById: (id) => prisma.booking.findUnique({ where: { id } }),
  findByUser: (userId) => prisma.booking.findMany({ where: { userId } }),
  findByHotel: (hotelId) => prisma.booking.findMany({ where: { hotelId } }),
};
