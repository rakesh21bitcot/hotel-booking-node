import { UserModel } from "../../user/user.model.js";

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
    const updated = await UserModel.updateById(intId, updateData);
    if (!updated) {
      const err = new Error("Profile not found");
      err.status = 404;
      throw err;
    }
    return updated;
  },
};
