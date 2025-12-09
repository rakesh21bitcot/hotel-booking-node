import { Router } from 'express';
import { BookingController } from './booking.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/create-booking', authenticate, BookingController.createBooking);
router.patch('/booking/:id/cancel', authenticate, BookingController.cancelBooking);
router.get('/mybookings', authenticate, BookingController.getMyBookings);
router.get('/hotel/:hotelId/bookings', authenticate, BookingController.getBookingsByHotel);

export default router;
