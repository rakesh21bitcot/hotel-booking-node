import { BookingModel } from './booking.model.js';
import { HotelService } from '../hotel/hotel.service.js';

const validBookingFields = {
  userId: 'number',
  hotelId: 'string',
  roomId: 'string',
  checkIn: 'string',
  checkOut: 'string',
  guestCount: 'number',
  firstName: 'string',
  lastName: 'string',
  email: 'string',
  phoneNumber: 'string',
  specialRequest: 'string',
  status: 'string',
  paymentStatus: 'string',
  bookingReference: 'string',
  totalPrice: 'number',
};

function validateBookingData(data) {
  const errors = [];

  // Validate required fields
  const requiredFields = [
    'userId',
    'hotelId',
    'roomId',
    'checkIn',
    'checkOut',
    'guestCount',
    'firstName',
    'lastName',
    'email',
    'phoneNumber',
    'totalPrice',
  ];
  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      errors.push(`Field '${field}' is required and cannot be empty`);
      continue;
    }

    // Check type match
    const expectedType = validBookingFields[field];
    const actualType = typeof value;

    if (expectedType === 'number') {
      const num = Number(value);
      if (!Number.isFinite(num) || Number.isNaN(num)) {
        errors.push(`Field '${field}' must be a valid number`);
      }
    } else if (actualType !== expectedType) {
      errors.push(`Field '${field}' must be of type ${expectedType}, but received ${actualType}`);
    }
  }

  // Validate optional fields if provided
  const optionalFields = ['status', 'paymentStatus', 'specialRequest', 'bookingReference'];
  for (const field of optionalFields) {
    const value = data[field];
    if (value !== undefined && value !== null) {
      // If provided, it cannot be empty string
      if (value === '') {
        errors.push(`Field '${field}' cannot be an empty string`);
        continue;
      }

      // Check type match
      const expectedType = validBookingFields[field];
      const actualType = typeof value;

      if (actualType !== expectedType) {
        errors.push(`Field '${field}' must be of type ${expectedType}, but received ${actualType}`);
      }
    }
  }

  // Validate any extra fields that shouldn't be there
  for (const field of Object.keys(data)) {
    if (!(field in validBookingFields) && !['id', 'paymentReference', 'createdAt', 'updatedAt'].includes(field)) {
      errors.push(`Invalid field: ${field}`);
    }
  }

  const dateFields = ['checkIn', 'checkOut'];
  for (const field of dateFields) {
    const value = data[field];
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      errors.push(`Field '${field}' must be a valid date string`);
    }
  }

  if (data.checkIn && data.checkOut) {
    const checkInDate = new Date(data.checkIn);
    const checkOutDate = new Date(data.checkOut);
    if (!Number.isNaN(checkInDate.getTime()) && !Number.isNaN(checkOutDate.getTime())) {
      if (checkOutDate <= checkInDate) {
        errors.push("Field 'checkOut' must be later than 'checkIn'");
      }
    }
  }

  if (data.guestCount !== undefined) {
    const guestCount = Number(data.guestCount);
    if (!Number.isInteger(guestCount) || guestCount <= 0) {
      errors.push("Field 'guestCount' must be a positive integer");
    }
  }

  if (errors.length > 0) {
    const err = new Error(`Validation failed: ${errors.join('; ')}`);
    err.name = 'ValidationError';
    err.status = 400;
    throw err;
  }
}

function toIntOrThrow(value, fieldName) {
  const num = Number(value);
  if (!Number.isFinite(num) || Number.isNaN(num) || !Number.isInteger(num)) {
    const err = new Error(`${fieldName} must be a number`);
    err.name = 'ValidationError';
    err.status = 400;
    throw err;
  }
  return num;
}

function generateBookingReference() {
  const nowPart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BK-${nowPart}${randomPart}`;
}

function computeBookingStatus(booking) {
  if (!booking) return null;

  if (booking.status === 'canceled') return 'Cancelled';

  const now = new Date();
  const checkIn = booking.checkIn ? new Date(booking.checkIn) : null;
  const checkOut = booking.checkOut ? new Date(booking.checkOut) : null;

  if (!checkIn || Number.isNaN(checkIn.getTime()) || !checkOut || Number.isNaN(checkOut.getTime())) {
    return booking.status || null;
  }

  if (now < checkIn) return 'Upcoming';
  if (now >= checkIn && now <= checkOut) return 'Ongoing';
  if (now > checkOut) return 'Completed';
  return booking.status || null;
}

export const BookingService = {
  async createBooking({
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
  } = {}) {
    const bookingData = {
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
      status: status || 'confirmed',
      paymentStatus: paymentStatus || 'pending',
      totalPrice,
    };

    validateBookingData(bookingData);

    const userIdInt = toIntOrThrow(userId, 'User id');
    const guestCountInt = toIntOrThrow(guestCount, 'Guest count');
    const totalPriceInt = toIntOrThrow(totalPrice, 'Total price');
    const hotelIdStr = String(hotelId);
    const roomIdStr = roomId ? String(roomId) : null;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const bookingReference = generateBookingReference();

    const booking = await BookingModel.create({
      userId: userIdInt,
      hotelId: hotelIdStr,
      roomId: roomIdStr,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guestCount: guestCountInt,
      firstName: String(firstName),
      lastName: String(lastName),
      email: String(email),
      phoneNumber: String(phoneNumber),
      specialRequest: specialRequest ?? null,
      status: bookingData.status,
      paymentStatus: bookingData.paymentStatus,
      bookingReference,
      totalPrice: totalPriceInt,
    });
    return booking;
  },
  async cancelBooking(id) {
    const bookingId = toIntOrThrow(id, 'Booking id');
    const existing = await BookingModel.findById(bookingId);
    if (!existing) {
      const err = new Error('Booking not found');
      err.name = 'NotFoundError';
      err.status = 404;
      throw err;
    }
    const canceled = await BookingModel.cancel(bookingId);
    return canceled;
  },
  async getBookingByIdForUser(id, userId) {
    const bookingId = toIntOrThrow(id, 'Booking id');
    const booking = await BookingModel.findById(bookingId);

    if (!booking) {
      const err = new Error('Booking not found');
      err.name = 'NotFoundError';
      err.status = 404;
      throw err;
    }

    if (booking.userId !== userId) {
      const err = new Error('Not authorized to view this booking');
      err.name = 'AuthorizationError';
      err.status = 403;
      throw err;
    }

    let hotel = null;
    let room = null;

    try {
      hotel = await HotelService.getHotelById(booking.hotelId);
    } catch (err) {
      hotel = null;
    }

    try {
      room = await HotelService.getRoomById(booking.hotelId, booking.roomId);
    } catch (err) {
      room = null;
    }

    return {
      ...booking,
      hotel,
      room,
      status: computeBookingStatus(booking),
    };
  },
  async listBookingsByUser(userId) {
    const bookings = await BookingModel.findByUser(userId);

    const enriched = await Promise.all(
      bookings.map(async (booking) => {
        let hotel = null;
        let room = null;

        try {
          hotel = await HotelService.getHotelById(booking.hotelId);
        } catch (err) {
          // Swallow errors so booking list still returns even if hotel missing
          hotel = null;
        }

        try {
          room = await HotelService.getRoomById(booking.hotelId, booking.roomId);
        } catch (err) {
          room = null;
        }

        return {
          ...booking,
          hotel,
          room,
          status: computeBookingStatus(booking),
        };
      })
    );

    return enriched;
  },
  async listBookingsByHotel(hotelId) {
    const bookings = await BookingModel.findByHotel(hotelId);
    return bookings.map((booking) => ({
      ...booking,
      status: computeBookingStatus(booking),
    }));
  },
};
