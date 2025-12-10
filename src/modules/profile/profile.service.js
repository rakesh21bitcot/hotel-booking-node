import { UserModel } from "../../user/user.model.js";

const validProfileFields = {
  firstName: 'string',
  lastName: 'string',
  email: 'string',
  gender: 'string',
  dateOfBirth: 'string',
  state: 'string',
  nationality: 'string',
  profileImage: 'string', // optional in schema but validated if provided
};

function validateProfileFields(updateData) {
  const errors = [];

  for (const [field, value] of Object.entries(updateData)) {
    // Check if field is valid
    if (!(field in validProfileFields)) {
      // Skip internal fields that shouldn't be validated
      if (['password', 'id', 'createdAt', 'updatedAt', 'settings'].includes(field)) {
        continue;
      }
      errors.push(`Invalid field: ${field}`);
      continue;
    }

    // For required fields (firstName, lastName, email), check if not empty
    const requiredFields = ['firstName', 'lastName', 'email'];
    if (requiredFields.includes(field)) {
      if (value === undefined || value === null || value === '') {
        errors.push(`Field '${field}' cannot be empty`);
        continue;
      }
    }

    // For optional fields (profileImage), if provided, validate type and not empty string
    if (field === 'profileImage' && value !== undefined && value !== null) {
      if (value === '') {
        errors.push(`Field '${field}' cannot be an empty string`);
        continue;
      }
    }

    // Check type match for all fields
    const expectedType = validProfileFields[field];
    const actualType = typeof value;

    if (value !== undefined && value !== null && actualType !== expectedType) {
      errors.push(`Field '${field}' must be of type ${expectedType}, but received ${actualType}`);
    }

    // Validate email format if email is being updated
    if (field === 'email' && value !== undefined && value !== null) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`Field '${field}' must be a valid email address`);
      }
    }
  }

  if (errors.length > 0) {
    const err = new Error(`Validation failed: ${errors.join('; ')}`);
    err.name = 'ValidationError';
    err.status = 400;
    throw err;
  }
}

export const ProfileService = {
  async getProfileById(id) {
    const intId = Number.parseInt(id, 10);
    if (Number.isNaN(intId)) {
      const err = new Error("Invalid ID format");
      err.status = 400;
      throw err;
    }
    const user = await UserModel.findbyId(intId);
    if (!user) {
      const err = new Error("Profile not found");
      err.status = 404;
      throw err;
    }
    return user;
  },

  async updateProfileById(id, updateData) {
    const intId = Number.parseInt(id, 10);
    if (Number.isNaN(intId)) {
      const err = new Error("Invalid ID format");
      err.status = 400;
      throw err;
    }
    validateProfileFields(updateData);
    const updated = await UserModel.updateById(intId, updateData);
    if (!updated) {
      const err = new Error("Profile not found");
      err.status = 404;
      throw err;
    }
    return updated;
  },
};
