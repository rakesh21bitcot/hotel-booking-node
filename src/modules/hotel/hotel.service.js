import { prisma } from "../../config/db.js";

function buildWhereClause({ location, minRating, maxRating, isFeatured }) {
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

  if (minRating !== undefined) {
    conditions.push(`"rating" >= $${index}`);
    params.push(minRating);
    index += 1;
  }

  if (maxRating !== undefined) {
    conditions.push(`"rating" <= $${index}`);
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
      // Sort by minimum room price (ascending)
      sorted.sort((a, b) => {
        const aPrice = a.pricing?.minRoomPrice ?? a.price ?? Infinity;
        const bPrice = b.pricing?.minRoomPrice ?? b.price ?? Infinity;
        return aPrice - bPrice;
      });
      break;

    case 'price_high_to_low':
      // Sort by minimum room price (descending)
      sorted.sort((a, b) => {
        const aPrice = a.pricing?.minRoomPrice ?? a.price ?? 0;
        const bPrice = b.pricing?.minRoomPrice ?? b.price ?? 0;
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
      return hotel.rooms;
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
      const [hotel] = await prisma.$queryRawUnsafe('SELECT id, name, "rooms" FROM "hotels" WHERE id = $1', hotelId);
      
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
        },
      };
    } catch (err) {
      throw err;
    }
  },

  async getHotels(filters = {}) {
    const {
      location,
      minRating,
      maxRating,
      minPrice,
      maxPrice,
      isFeatured,
      sortBy = 'featured',
      page,
      limit,
    } = filters;

    const pageNumber = toPositiveNumber(page, 1);
    const limitNumber = toPositiveNumber(limit, 10);

    const { whereClause, params } = buildWhereClause({ location, minRating, maxRating, isFeatured });

    // Remove ORDER BY from SQL query since we'll sort after computing prices
    const hotels = await prisma.$queryRawUnsafe(
      `SELECT * FROM "hotels" ${whereClause}`,
      ...params
    );

    const normalizedHotels = hotels.map((hotel) => normalizeHotelRow(hotel));

    const hotelsWithPrice = normalizedHotels.map((hotel) => ({
      ...hotel,
      pricing: computePriceStats(hotel),
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
};


