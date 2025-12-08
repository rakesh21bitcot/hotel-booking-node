import { UserModel } from "../../user/user.model.js";

export const UserService = {
  async getAllUsers() {
    try {
      const users = await UserModel.find();
      if (!users || users.length === 0) {
        const err = new Error("No users found");
        err.name = "NotFoundError";
        err.status = 404;
        throw err;
      }
      return users;
    } catch (err) {
      throw err;
    }
  },
  async getUserById(id) {
    try {
      const intId = Number.parseInt(id, 10);
      if (Number.isNaN(intId)) {
        const err = new Error("Invalid ID format");
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

      return user;
    } catch (err) {
      throw err;
    }
  },

  async userDeleteById(id) {
    try {
      const intId = Number.parseInt(id, 10);
      if (Number.isNaN(intId)) {
        const err = new Error("Invalid ID format");
        err.name = "ValidationError";
        err.status = 400;
        throw err;
      }
      await UserModel.deletebyId(intId);
      return { message: "User deleted successfully" };
    } catch (err) {
      throw err;
    }
  },

  async userUpdateById(id, updateData) {
  try {
    const intId = Number.parseInt(id, 10);
    if (Number.isNaN(intId)) {
      const err = new Error("Invalid ID format");
      err.name = "ValidationError";
      err.status = 400;
      throw err;
    }

    // Assuming you are updating specific fields of the user
    const updatedUser = await UserModel.updateById(intId, updateData);
    if (!updatedUser) {
      const err = new Error("User not found");
      err.name = "NotFoundError";
      err.status = 404;
      throw err;
    }

    return updatedUser;
  } catch (err) {
    throw err;
  }
}

};
