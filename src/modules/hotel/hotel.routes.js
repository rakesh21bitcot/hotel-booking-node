import { Router } from "express";
import { HotelController } from "./hotel.controller.js";
import { hotelFilterSchema } from "./hotel.validation.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

function validateFilters(req, res, next) {
  const { error, value } = hotelFilterSchema.validate(req.query, { abortEarly: false, convert: true });
  if (error) {
    const err = new Error(error.details.map((detail) => detail.message).join(", "));
    err.name = "ValidationError";
    err.status = 422;
    return next(err);
  }
  req.hotelFilters = value;
  return next();
}

router.get("/hotels", validateFilters, HotelController.list);
router.get("/hotel/:id", validateFilters, HotelController.getHotelById);
router.get("/hotel/:hotelId/:roomId", HotelController.getRoomById);
router.post("/hotel/:hotelId/reviews", authenticate, HotelController.createReview);
router.put("/hotel/reviews/:reviewId", authenticate, HotelController.editReview);

export default router;


