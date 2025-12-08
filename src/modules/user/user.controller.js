import { MESSAGES } from "../../config/messages.js";
import { successResponse } from "../../utils/response.util.js";
import { UserService } from "./user.service.js";

export const UserController = {
 
  async getAllUsers(req, res, next) {
    try {
      const users = await UserService.getAllUsers();
      return successResponse(res, MESSAGES.ALL_USER, { users }, 200);
    } catch (err) {
      return next(err);
    }
  },

  async getUsersbyId(req, res, next) {
    try {
      const { id } = req.params;
      const users = await UserService.getUserById(id);
      return successResponse(res, MESSAGES.USER_FOUND, { users }, 200);
    } catch (err) {
      return next(err);
    }
  },

   async userDeletebyId(req, res, next) {
    try {
      const { id } = req.params;
      const msg = await UserService.userDeleteById(id);
      return successResponse(res, msg?.message, 200);
    } catch (err) {
      return next(err);
    }
  },

  async userUpdateById(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body; 
    const updatedUser = await UserService.userUpdateById(id, updateData);
    return successResponse(res, updatedUser, 200);
  } catch (err) {
    return next(err);
  }
}

};
