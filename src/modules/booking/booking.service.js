import { BookingModel } from './booking.model.js';

function toIntOrThrow(value, fieldName) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    const err = new Error(`${fieldName} must be a number`);
    err.name = 'ValidationError';
    err.status = 400;
    throw err;
  }
  return num;
}

export const BookingService = {
  async createBooking(userId, hotelId, roomId) {
    const userIdInt = toIntOrThrow(userId, 'User id');
    const hotelIdStr = String(hotelId);

    const booking = await BookingModel.create({
      userId: userIdInt,
      hotelId: hotelIdStr,
      roomId,
      status: 'confirmed',
      paymentStatus: 'pending',
    });
    return booking;
  },
  async cancelBooking(id) {
    const canceled = await BookingModel.cancel(id);
    return canceled;
  },
  async listBookingsByUser(userId) {
    return BookingModel.findByUser(userId);
  },
  async listBookingsByHotel(hotelId) {
    return BookingModel.findByHotel(hotelId);
  },
};
