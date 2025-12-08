import { MESSAGES } from "../../config/messages.js";
import { successResponse, errorResponse } from "../../utils/response.util.js";
import { HotelService } from "./hotel.service.js";

export const HotelController = {
  async list(req, res, next) {
    try {
      const result = await HotelService.getHotels(req.hotelFilters || {});
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
};
