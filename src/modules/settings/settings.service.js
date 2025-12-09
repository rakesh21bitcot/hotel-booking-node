import { SettingsModel } from './settings.model.js';

export const SettingsService = {
  getSettingsByUserId(userId) {
    return SettingsModel.getByUserId(userId);
  },
  updateSettingsByUserId(userId, update) {
    return SettingsModel.updateByUserId(userId, update);
  },
};
