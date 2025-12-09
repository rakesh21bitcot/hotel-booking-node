import { SettingsModel } from './settings.model.js';
import { UserModel } from '../../user/user.model.js';

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
    return SettingsModel.updateByUserId(intId, update);
  },
};
