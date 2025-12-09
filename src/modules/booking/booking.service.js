import { BookingModel } from './booking.model.js';

export const BookingService = {
  async createBooking(userId, hotelId) {
    // Optionally: validate hotel/user exists
    // For MVP, just create
    const booking = await BookingModel.create({
      userId,
      hotelId,
      status: 'booked',
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
