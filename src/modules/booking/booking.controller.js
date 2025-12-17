import { successResponse } from '../../utils/response.util.js';
import { BookingService } from './booking.service.js';

export const BookingController = {
  async createBooking(req, res, next) {
    try {
      const {
        hotelId,
        roomId,
        checkIn,
        checkOut,
        guestCount,
        firstName,
        lastName,
        email,
        phoneNumber,
        specialRequest,
        status,
        paymentStatus,
        totalPrice,
      } = req.body;
      const userId = req.user?.id ?? req.body.userId;

      const booking = await BookingService.createBooking({
        userId,
        hotelId,
        roomId,
        checkIn,
        checkOut,
        guestCount,
        firstName,
        lastName,
        email,
        phoneNumber,
        specialRequest,
        status,
        paymentStatus,
        totalPrice,
      });
      return successResponse(
        res,
        'Booking created',
        { bookingId: booking.id, bookingReference: booking.bookingReference, booking },
        201
      );
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
  async getMyBookingById(req, res, next) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) throw new Error('User not authenticated');
      if (!id) throw new Error('Booking id is required');

      const booking = await BookingService.getBookingByIdForUser(Number(id), userId);
      return successResponse(res, 'Booking details', { booking }, 200);
    } catch (err) {
      return next(err);
    }
  },
};
