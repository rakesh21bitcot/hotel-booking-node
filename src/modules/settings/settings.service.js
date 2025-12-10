import { SettingsModel } from './settings.model.js';
import { UserModel } from '../../user/user.model.js';

const validSettingsFields = {
  enableNotifications: 'boolean',
  emailNotifications: 'boolean',
  pushNotifications: 'boolean',
  bookingReminders: 'boolean',
  newsletter: 'boolean',
  specialOffers: 'boolean',
  marketingEmails: 'boolean',
};

function validateSettingsFields(update) {
  const errors = [];

  for (const [field, value] of Object.entries(update)) {
    // Check if field is valid
    if (!(field in validSettingsFields)) {
      errors.push(`Invalid field: ${field}`);
      continue;
    }

    // Check if value is not empty/undefined/null
    if (value === undefined || value === null || value === '') {
      errors.push(`Field '${field}' cannot be empty`);
      continue;
    }

    // Check type match
    const expectedType = validSettingsFields[field];
    const actualType = typeof value;

    if (actualType !== expectedType) {
      errors.push(`Field '${field}' must be of type ${expectedType}, but received ${actualType}`);
    }
  }

  if (errors.length > 0) {
    const err = new Error(`Validation failed: ${errors.join('; ')}`);
    err.name = 'ValidationError';
    err.status = 400;
    throw err;
  }
}

export const SettingsService = {
  async assertUserExists(userId) {
    const intId = Number.parseInt(userId, 10);
    if (Number.isNaN(intId)) {
      const err = new Error("Invalid user id");
      err.name = "ValidationError";
      err.status = 400;
      throw err;
    }
    const user = await UserModel.findbyId(intId);
    if (!user) {
      const err = new Error("User not found");
      err.name = "NotFoundError";
      err.status = 404;
      throw err;
    }
    return intId;
  },

  async getSettingsByUserId(userId) {
    const intId = await this.assertUserExists(userId);
    return SettingsModel.getByUserId(intId);
  },

  async updateSettingsByUserId(userId, update) {
    const intId = await this.assertUserExists(userId);
    validateSettingsFields(update);
    return SettingsModel.updateByUserId(intId, update);
  },
};
