import { successResponse } from "../../utils/response.util.js";
import { ProfileService } from "./profile.service.js";

export const ProfileController = {
  async getProfileById(req, res, next) {
    try {
      const { id } = req.params;
      const profile = await ProfileService.getProfileById(id);
      return successResponse(res, "Profile found", { profile }, 200);
    } catch (err) {
      return next(err);
    }
  },

  async updateProfileById(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updated = await ProfileService.updateProfileById(id, updateData);
      return successResponse(res, "Profile updated", { profile: updated }, 200);
    } catch (err) {
      return next(err);
    }
  },
};
