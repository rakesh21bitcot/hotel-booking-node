import { MESSAGES } from "../../config/messages.js";
import { successResponse, errorResponse } from "../../utils/response.util.js";
import { HotelService } from "./hotel.service.js";
import { reviewSchema, editReviewSchema } from "./hotel.validation.js";

export const HotelController = {
  async list(req, res, next) {
    try {
      const userId = req.user?.id ?? req.query.userId;
      const result = await HotelService.getHotels(req.hotelFilters || {}, userId);
      return successResponse(res, MESSAGES.HOTEL_LIST, result);
    } catch (err) {
      return errorResponse(res, MESSAGES.HOTEL_LIST_ERROR, err.message, err.status);
    }
  },

  async getHotelById(req, res, next) {
    try {
      const { id } = req.params;
      const hotel = await HotelService.getHotelById(id);
      return successResponse(res, MESSAGES.HOTEL_DETAILS_FOUND, hotel);
    } catch (err) {
      return errorResponse(res, MESSAGES.HOTEL_NOT_FOUND, err.message, err.status);
    }
  },
  async getHotelRooms(req, res, next) {
    try {
      const { id } = req.params;
      const rooms = await HotelService.getHotelRooms(id);
      return successResponse(res, MESSAGES.HOTEL_ROOMS_FOUND, rooms);
    } catch (err) {
      return errorResponse(res, MESSAGES.HOTEL_ROOMS_NOT_FOUND, err.message, err.status);
    }
  },

  async getRoomById(req, res, next) {
    try {
      const { hotelId, roomId } = req.params;
      const room = await HotelService.getRoomById(hotelId, roomId);
      return successResponse(res, MESSAGES.ROOM_DETAILS_FOUND, room);
    } catch (err) {
      return errorResponse(res, MESSAGES.ROOM_NOT_FOUND, err.message, err.status);
    }
  },

  async createReview(req, res, next) {
    try {
      const { hotelId } = req.params;
      const { error, value } = reviewSchema.validate(req.body, { abortEarly: false, convert: true });

      if (error) {
        const err = new Error(error.details.map((detail) => detail.message).join(", "));
        err.name = "ValidationError";
        err.status = 422;
        return errorResponse(res, MESSAGES.REVIEW_VALIDATION_ERROR, err.message, err.status);
      }

      const reviewData = {
        ...value,
        user_name: req.user.name,
      };

      // Verify that the booking belongs to the authenticated user and is completed
      const { BookingService } = await import('../booking/booking.service.js');
      const booking = await BookingService.getBookingByIdForUser(value.bookingId, req.user.id);

      if (!booking) {
        const err = new Error("Booking not found or does not belong to you");
        err.name = "NotFoundError";
        err.status = 404;
        return errorResponse(res, MESSAGES.BOOKING_NOT_FOUND, err.message, err.status);
      }

      // Check if booking is completed (past checkout date)
      const checkOutDate = new Date(booking.checkOut);
      const now = new Date();
      if (now <= checkOutDate) {
        const err = new Error("You can only review bookings that have been completed");
        err.name = "ValidationError";
        err.status = 400;
        return errorResponse(res, MESSAGES.REVIEW_CREATE_ERROR, err.message, err.status);
      }

      const review = await HotelService.createReview(hotelId, req.user.id, reviewData);
      return successResponse(res, MESSAGES.REVIEW_CREATED, review);
    } catch (err) {
      return errorResponse(res, MESSAGES.REVIEW_CREATE_ERROR, err.message, err.status);
    }
  },

  async editReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const { error, value } = editReviewSchema.validate(req.body, { abortEarly: false, convert: true });

      if (error) {
        const err = new Error(error.details.map((detail) => detail.message).join(", "));
        err.name = "ValidationError";
        err.status = 422;
        return errorResponse(res, MESSAGES.REVIEW_VALIDATION_ERROR, err.message, err.status);
      }

      const reviewData = value;

      const review = await HotelService.editReview(reviewId, req.user.id, reviewData);
      return successResponse(res, MESSAGES.REVIEW_UPDATED, review);
    } catch (err) {
      return errorResponse(res, MESSAGES.REVIEW_UPDATE_ERROR, err.message, err.status);
    }
  },
};
