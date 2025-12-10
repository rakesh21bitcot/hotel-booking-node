import Joi from "joi";

export const hotelFilterSchema = Joi.object({
  location: Joi.string().trim(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  minRating: Joi.number().min(0).max(5),
  maxRating: Joi.number().min(0).max(5),
  isFeatured: Joi.boolean(),
  sortBy: Joi.string().valid('featured', 'price_low_to_high', 'price_high_to_low', 'highest_rating').default('featured'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
}).custom((value, helpers) => {
  if (value.minPrice !== undefined && value.maxPrice !== undefined && value.minPrice > value.maxPrice) {
    return helpers.error("any.invalid", { message: "minPrice cannot be greater than maxPrice" });
  }
  if (value.minRating !== undefined && value.maxRating !== undefined && value.minRating > value.maxRating) {
    return helpers.error("any.invalid", { message: "minRating cannot be greater than maxRating" });
  }
  return value;
}, "Hotel filter validation");


