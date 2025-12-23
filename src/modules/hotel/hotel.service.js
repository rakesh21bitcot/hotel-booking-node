import { prisma } from "../../config/db.js";

function buildWhereClause({ location, maxRating, isFeatured }) {
  const conditions = [];
  const params = [];
  let index = 1;

  if (location) {
    // Handle location stored as JSON/JSONB string in the "location" column
    // We cast to jsonb so it works whether the column is text or jsonb.
    conditions.push(`(
      LOWER(CAST("location" AS jsonb)->>'city') LIKE LOWER($${index}) OR
      LOWER(CAST("location" AS jsonb)->>'state') LIKE LOWER($${index}) OR
      LOWER(CAST("location" AS jsonb)->>'country') LIKE LOWER($${index})
    )`);
    params.push(`%${location.trim()}%`);
    index += 1;
  }

  if (typeof isFeatured === "boolean") {
    conditions.push(`"is_featured" = $${index}`);
    params.push(isFeatured);
    index += 1;
  }

  if (maxRating !== undefined) {
    conditions.push(`"rating" >= $${index}`);
    params.push(maxRating);
    index += 1;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  return { whereClause, params };
}

function safeParseJSON(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeHotelRow(hotel) {
  if (!hotel) return hotel;

  const jsonFields = [
    "location",
    "images",
    "rooms",
    "reviews",
    "amenities",
    "tags",
    "policies",
    "services",
    "contact",
  ];

  const normalized = { ...hotel };

  jsonFields.forEach((field) => {
    if (hotel[field] !== undefined) {
      normalized[field] = safeParseJSON(hotel[field]);
    }
  });

  normalized.rating =
    normalized.rating !== undefined && normalized.rating !== null
      ? Number(normalized.rating)
      : normalized.rating;

  normalized.price =
    normalized.price !== undefined && normalized.price !== null
      ? Number(normalized.price)
      : normalized.price;

  normalized.reviewCount =
    normalized.reviewCount !== undefined && normalized.reviewCount !== null
      ? Number(normalized.reviewCount)
      : normalized.reviewCount;

  if (!Array.isArray(normalized.rooms)) normalized.rooms = [];
  if (!Array.isArray(normalized.images)) normalized.images = [];
  if (!Array.isArray(normalized.reviews)) normalized.reviews = [];
  if (!Array.isArray(normalized.amenities)) normalized.amenities = [];
  if (!Array.isArray(normalized.tags)) normalized.tags = [];

  return normalized;
}

function computePriceStats(hotel) {
  if (!hotel || !Array.isArray(hotel.rooms)) {
    return { minRoomPrice: null, maxRoomPrice: null };
  }
  const prices = hotel.rooms
    .map((room) => Number(room?.base_price))
    .filter((price) => Number.isFinite(price));

  if (!prices.length) {
    return { minRoomPrice: null, maxRoomPrice: null };
  }

  return {
    minRoomPrice: Math.min(...prices),
    maxRoomPrice: Math.max(...prices),
  };
}

function filterByPrice(hotels, minPrice, maxPrice) {
  return hotels.filter((hotel) => {
    const { minRoomPrice } = hotel.pricing ?? computePriceStats(hotel);

    if (minPrice !== undefined && (minRoomPrice === null || minRoomPrice < minPrice)) {
      return false;
    }

    if (maxPrice !== undefined && (minRoomPrice === null || minRoomPrice > maxPrice)) {
      return false;
    }

    return true;
  });
}

function sortHotels(hotels, sortBy) {
  const sorted = [...hotels];

  switch (sortBy) {
    case 'featured':
      // Featured hotels first (is_featured = true), then by rating
      sorted.sort((a, b) => {
        const aFeatured = a.is_featured === true ? 1 : 0;
        const bFeatured = b.is_featured === true ? 1 : 0;
        if (aFeatured !== bFeatured) {
          return bFeatured - aFeatured; // Featured first
        }
        // If both have same featured status, sort by rating
        const aRating = a.rating || 0;
        const bRating = b.rating || 0;
        return bRating - aRating;
      });
      break;

    case 'price_low_to_high':
      // Sort by hotel price (ascending)
      sorted.sort((a, b) => {
        const aPrice = a.price ?? Infinity;
        const bPrice = b.price ?? Infinity;
        return aPrice - bPrice;
      });
      break;

    case 'price_high_to_low':
      // Sort by hotel price (descending)
      sorted.sort((a, b) => {
        const aPrice = a.price ?? 0;
        const bPrice = b.price ?? 0;
        return bPrice - aPrice;
      });
      break;

    case 'highest_rating':
      // Sort by rating (descending)
      sorted.sort((a, b) => {
        const aRating = a.rating || 0;
        const bRating = b.rating || 0;
        return bRating - aRating;
      });
      break;

    default:
      // Default: featured first
      sorted.sort((a, b) => {
        const aFeatured = a.is_featured === true ? 1 : 0;
        const bFeatured = b.is_featured === true ? 1 : 0;
        if (aFeatured !== bFeatured) {
          return bFeatured - aFeatured;
        }
        const aRating = a.rating || 0;
        const bRating = b.rating || 0;
        return bRating - aRating;
      });
  }

  return sorted;
}

function paginate(hotels, page, limit) {
  const total = hotels.length;
  const start = (page - 1) * limit;
  const data = hotels.slice(start, start + limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

function toPositiveNumber(value, fallback) {
  const num = Number(value);
  if (Number.isFinite(num) && num > 0) {
    return num;
  }
  return fallback;
}

export const HotelService = {
    
  async getHotelById(id) {
    try {
      if (!id) {
        const err = new Error("Hotel ID is required");
        err.name = "ValidationError";
        err.status = 400;
        throw err;
      }
      const [hotel] = await prisma.$queryRawUnsafe('SELECT * FROM "hotels" WHERE id = $1', id);
      if (!hotel) {
        const err = new Error("Hotel not found");
        err.name = "NotFoundError";
        err.status = 404;
        throw err;
      }
      return normalizeHotelRow(hotel);
    } catch (err) {
      throw err;
    }
  },

  async getHotelRooms(id) {
    try {
      if (!id) {
        const err = new Error("Hotel ID is required");
        err.name = "ValidationError";
        err.status = 400;
        throw err;
      }
      const [hotel] = await prisma.$queryRawUnsafe('SELECT * FROM "hotels" WHERE id = $1', id);
      if (!hotel) {
        const err = new Error("Hotel not found");
        err.name = "NotFoundError";
        err.status = 404;
        throw err;
      }
      const rooms = safeParseJSON(hotel.rooms);
      if (!rooms || !Array.isArray(rooms)) {
        const err = new Error("Rooms not found");
        err.name = "NotFoundError";
        err.status = 404;
        throw err;
      }
      return rooms;
    } catch (err) {
      throw err;
    }
  },

  async getRoomById(hotelId, roomId) {
    try {
      if (!hotelId) {
        const err = new Error("Hotel ID is required");
        err.name = "ValidationError";
        err.status = 400;
        throw err;
      }

      if (!roomId) {
        const err = new Error("Room ID is required");
        err.name = "ValidationError";
        err.status = 400;
        throw err;
      }

      if (typeof roomId !== 'string' || roomId.trim() === '') {
        const err = new Error("Room ID must be a non-empty string");
        err.name = "ValidationError";
        err.status = 400;
        throw err;
      }

      // Get the specific hotel
      const [hotel] = await prisma.$queryRawUnsafe('SELECT id, name, location, rating, "reviewCount", "rooms" FROM "hotels" WHERE id = $1', hotelId);
      
      if (!hotel) {
        const err = new Error("Hotel not found");
        err.name = "NotFoundError";
        err.status = 404;
        throw err;
      }

      // Parse and find the room
      const rooms = safeParseJSON(hotel.rooms);
      if (!Array.isArray(rooms)) {
        const err = new Error("Room not found");
        err.name = "NotFoundError";
        err.status = 404;
        throw err;
      }

      const room = rooms.find((r) => r && r.id === roomId);
      if (!room) {
        const err = new Error("Room not found");
        err.name = "NotFoundError";
        err.status = 404;
        throw err;
      }

      // Return room with hotel information
      return {
        ...room,
        hotel: {
          id: hotel.id,
          name: hotel.name,
          rating: hotel.rating,
          reviewCount: hotel.reviewCount,
          location: hotel.location
        },
      };
    } catch (err) {
      throw err;
    }
  },

  async getHotels(filters = {}, userId) {
    const {
      location,
      minRating,
      minPrice,
      maxPrice,
      isFeatured,
      sortBy = 'featured',
      page,
      limit,
    } = filters;

    const pageNumber = toPositiveNumber(page, 1);
    const limitNumber = toPositiveNumber(limit, 10);

    const userIdInt =
      userId === undefined || userId === null || userId === ''
        ? null
        : Number.isFinite(Number(userId))
          ? Number(userId)
          : null;

    const { whereClause, params } = buildWhereClause({ location, minRating, isFeatured });

    // Remove ORDER BY from SQL query since we'll sort after computing prices
    const hotels = await prisma.$queryRawUnsafe(
      `SELECT * FROM "hotels" ${whereClause}`,
      ...params
    );

    const normalizedHotels = hotels.map((hotel) => normalizeHotelRow(hotel));

    // Fetch favourite hotel ids for the user (if provided)
    let favouriteIds = new Set();
    if (userIdInt !== null) {
      try {
        const favourites = await prisma.favourite.findMany({
          where: { userId: userIdInt },
          select: { hotelId: true },
        });
        favouriteIds = new Set(favourites.map((f) => String(f.hotelId)));
      } catch (err) {
        // If favourites table is missing or query fails, continue without flagging favourites
        favouriteIds = new Set();
      }
    }

    const hotelsWithPrice = normalizedHotels.map((hotel) => ({
      ...hotel,
      pricing: computePriceStats(hotel),
      isFavourite: favouriteIds.has(String(hotel.id)),
    }));

    const priceFiltered = filterByPrice(
      hotelsWithPrice,
      minPrice,
      maxPrice
    );

    // Apply sorting before pagination
    const sortedHotels = sortHotels(priceFiltered, sortBy);

    return paginate(sortedHotels, pageNumber, limitNumber);
  },

  async hasUserReviewedBooking(userId, bookingId) {
    try {
      // Get all hotels (we need to check reviews across all hotels since reviews are stored per hotel)
      const hotels = await prisma.$queryRawUnsafe('SELECT id, "reviews" FROM "hotels"');

      for (const hotel of hotels) {
        const reviews = safeParseJSON(hotel.reviews);
        if (Array.isArray(reviews)) {
          // Check if user has already reviewed this specific booking
          const existingReview = reviews.find(review =>
            review && review.userId === userId && review.bookingId === bookingId
          );
          if (existingReview) {
            return true;
          }
        }
      }

      return false;
    } catch (err) {
      // If there's an error (e.g., reviews table doesn't exist), assume no review exists
      return false;
    }
  },

  async createReview(hotelId, userId, reviewData) {
    try {
      if (!hotelId) {
        const err = new Error("Hotel ID is required");
        err.name = "ValidationError";
        err.status = 400;
        throw err;
      }

      if (!reviewData.bookingId) {
        const err = new Error("Booking ID is required");
        err.name = "ValidationError";
        err.status = 400;
        throw err;
      }

      // Check if user has already reviewed this booking
      const hasReviewed = await this.hasUserReviewedBooking(userId, reviewData.bookingId);
      if (hasReviewed) {
        const err = new Error("You have already reviewed this booking");
        err.name = "ValidationError";
        err.status = 409; // Conflict status code
        throw err;
      }

      // Get the current hotel data
      const [hotel] = await prisma.$queryRawUnsafe('SELECT * FROM "hotels" WHERE id = $1', hotelId);
      if (!hotel) {
        const err = new Error("Hotel not found");
        err.name = "NotFoundError";
        err.status = 404;
        throw err;
      }

      const normalizedHotel = normalizeHotelRow(hotel);
      const currentReviews = Array.isArray(normalizedHotel.reviews) ? normalizedHotel.reviews : [];
      const currentReviewCount = normalizedHotel.reviewCount || 0;

      // Generate review ID and create new review object
      const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newReview = {
        id: reviewId,
        bookingId: reviewData.bookingId,
        userId: userId,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        rating: reviewData.rating,
        comment: reviewData.comment,
        user_name: reviewData.user_name,
      };

      // Add new review to the array
      const updatedReviews = [...currentReviews, newReview];

      // Calculate new average rating
      const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
      const newAverageRating = updatedReviews.length > 0 ? Number((totalRating / updatedReviews.length).toFixed(1)) : 0;

      // Update hotel with new reviews, rating, and review count
      const updateData = {
        reviews: JSON.stringify(updatedReviews),
        rating: newAverageRating,
        reviewCount: currentReviewCount + 1,
      };

      await prisma.$queryRawUnsafe(
        'UPDATE "hotels" SET "reviews" = $1::jsonb, "rating" = $2, "reviewCount" = $3 WHERE id = $4',
        JSON.stringify(updatedReviews),
        newAverageRating,
        currentReviewCount + 1,
        hotelId
      )

      return {
        ...newReview,
        hotelId,
        userId,
      };
    } catch (err) {
      throw err;
    }
  },

  async editReview(reviewId, userId, reviewData) {
    try {
      if (!reviewId) {
        const err = new Error("Review ID is required");
        err.name = "ValidationError";
        err.status = 400;
        throw err;
      }

      // Find the hotel that contains this review
      const hotels = await prisma.$queryRawUnsafe('SELECT * FROM "hotels"');
      let targetHotel = null;
      let reviewIndex = -1;

      for (const hotel of hotels) {
        const normalizedHotel = normalizeHotelRow(hotel);
        const reviews = Array.isArray(normalizedHotel.reviews) ? normalizedHotel.reviews : [];

        const foundIndex = reviews.findIndex(review => review && review.id === reviewId);
        if (foundIndex !== -1) {
          targetHotel = normalizedHotel;
          reviewIndex = foundIndex;
          break;
        }
      }

      if (!targetHotel || reviewIndex === -1) {
        const err = new Error("Review not found");
        err.name = "NotFoundError";
        err.status = 404;
        throw err;
      }

      // Check if the review belongs to the authenticated user
      const existingReview = targetHotel.reviews[reviewIndex];
      if (existingReview.userId !== userId) {
        const err = new Error("You can only edit your own reviews");
        err.name = "ForbiddenError";
        err.status = 403;
        throw err;
      }

      // Update the review
      const updatedReview = {
        ...existingReview,
        rating: reviewData.rating,
        comment: reviewData.comment,
        date: new Date().toISOString().split('T')[0], // Update the date to show it was edited
      };

      // Update the reviews array
      const updatedReviews = [...targetHotel.reviews];
      updatedReviews[reviewIndex] = updatedReview;

      // Calculate new average rating
      const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
      const newAverageRating = updatedReviews.length > 0 ? Number((totalRating / updatedReviews.length).toFixed(1)) : 0;

      // Update hotel with new reviews and rating
      await prisma.$queryRawUnsafe(
        'UPDATE "hotels" SET "reviews" = $1::jsonb, "rating" = $2 WHERE id = $3',
        JSON.stringify(updatedReviews),
        newAverageRating,
        targetHotel.id
      );

      return {
        ...updatedReview,
        hotelId: targetHotel.id,
        userId,
      };
    } catch (err) {
      throw err;
    }
  },
};


