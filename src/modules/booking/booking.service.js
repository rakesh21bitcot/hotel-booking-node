import { BookingModel } from './booking.model.js';

const validBookingFields = {
  userId: 'number',
  hotelId: 'string',
  roomId: 'string', // optional in schema but validated if provided
  status: 'string',
  paymentStatus: 'string', // optional in schema but validated if provided
};

function validateBookingData(data) {
  const errors = [];

  // Validate required fields
  const requiredFields = ['userId', 'hotelId'];
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
  const optionalFields = ['roomId', 'status', 'paymentStatus'];
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

  if (errors.length > 0) {
    const err = new Error(`Validation failed: ${errors.join('; ')}`);
    err.name = 'ValidationError';
    err.status = 400;
    throw err;
  }
}

function toIntOrThrow(value, fieldName) {
  const num = Number(value);
  if (!Number.isFinite(num) || Number.isNaN(num)) {
    const err = new Error(`${fieldName} must be a number`);
    err.name = 'ValidationError';
    err.status = 400;
    throw err;
  }
  return num;
}

export const BookingService = {
  async createBooking(userId, hotelId, roomId, additionalData = {}) {
    // Prepare booking data object for validation
    const bookingData = {
      userId,
      hotelId,
      roomId,
      status: additionalData.status || 'confirmed',
      paymentStatus: additionalData.paymentStatus || 'pending',
      ...additionalData,
    };

    // Validate all fields
    validateBookingData(bookingData);

    const userIdInt = toIntOrThrow(userId, 'User id');
    const hotelIdStr = String(hotelId);
    const roomIdStr = roomId ? String(roomId) : null;

    const booking = await BookingModel.create({
      userId: userIdInt,
      hotelId: hotelIdStr,
      roomId: roomIdStr,
      status: bookingData.status,
      paymentStatus: bookingData.paymentStatus,
    });
    return booking;
  },
  async cancelBooking(id) {
    const canceled = await BookingModel.cancel(id);
    return canceled;
  },
  async listBookingsByUser(userId) {
    return BookingModel.findByUser(userId);
  },
  async listBookingsByHotel(hotelId) {
    return BookingModel.findByHotel(hotelId);
  },
};
