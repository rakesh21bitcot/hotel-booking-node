import { successResponse } from '../../utils/response.util.js';
import { BookingService } from './booking.service.js';

export const BookingController = {
  async createBooking(req, res, next) {
    try {
      const userId = req.user?.id;
      const { hotelId } = req.body;
      if (!hotelId || !userId) throw new Error('Hotel or user missing');
      const booking = await BookingService.createBooking(userId, hotelId);
      return successResponse(res, 'Booking created', { booking }, 201);
    } catch (err) {
      return next(err);
    }
  },
  async cancelBooking(req, res, next) {
    try {
      const { id } = req.params;
      const booking = await BookingService.cancelBooking(Number(id));
      return successResponse(res, 'Booking canceled', { booking });
    } catch (err) {
      return next(err);
    }
  },
  async getMyBookings(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not authenticated');
      const bookings = await BookingService.listBookingsByUser(userId);
      return successResponse(res, 'My bookings', { bookings }, 200);
    } catch (err) {
      return next(err);
    }
  },
  async getBookingsByHotel(req, res, next) {
    try {
      const { hotelId } = req.params;
      if (!hotelId) throw new Error('Missing hotel id');
      const bookings = await BookingService.listBookingsByHotel(Number(hotelId));
      return successResponse(res, 'Bookings for hotel', { bookings }, 200);
    } catch (err) {
      return next(err);
    }
  },
};
