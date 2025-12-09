import { successResponse } from "../../utils/response.util.js";
import { SettingsService } from "./settings.service.js";

export const SettingsController = {
  getSettings(req, res, next) {
    try {
      const userId = req.user?.id || req.query.userId || req.body.userId;
      if (!userId) throw new Error("User id required");
      const settings = SettingsService.getSettingsByUserId(userId);
      return successResponse(res, "Settings fetched", { settings }, 200);
    } catch (err) {
      return next(err);
    }
  },
  updateSettings(req, res, next) {
    try {
      const userId = req.user?.id || req.body.userId;
      if (!userId) throw new Error("User id required");
      const update = req.body;
      const settings = SettingsService.updateSettingsByUserId(userId, update);
      return successResponse(res, "Settings updated", { settings }, 200);
    } catch (err) {
      return next(err);
    }
  },
};
