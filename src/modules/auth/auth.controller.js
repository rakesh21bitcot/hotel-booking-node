import { MESSAGES } from "../../config/messages.js";
import { generateToken } from "../../utils/jwt.util.js";
import { errorResponse, successResponse } from "../../utils/response.util.js";
import { AuthService } from "./auth.service.js";

export const AuthController = {
  async signup(req, res, next) {
    try {
      const { password, confirmPassword, ...rest } = req.body;
      if (password !== confirmPassword) {
        return errorResponse(res, "Password and confirm password do not match", "ValidationError", 422);
      }
      const user = await AuthService.signup({ ...rest, password });
      const { password: pw, ...userWithoutPassword } = user;
      return successResponse(res, MESSAGES.USER_CREATED, { user: userWithoutPassword }, 201);
    } catch (err) {
      return next(err);
    }
  },
  async signin(req, res, next) {
    try {
      const user = await AuthService.signin(req.body);
      const token = generateToken({ id: user.id });
      // Exclude password from user object
      const { password, ...userWithoutPassword } = user;
      return successResponse(res, MESSAGES.LOGIN_SUCCESS, { token, user: userWithoutPassword });
    } catch (err) {
      return errorResponse(res, err.message, err.name, err.status);
    }
  },

   // Forgot password endpoint
  async forgotPassword(req, res, next) {
    try {
      const result = await AuthService.forgotPassword(req.body);
      console.log(result)
      return successResponse(res, result.message, {}, 200);
    } catch (err) {
      console.log(err)
      return next(err);
    }
  },

  // Reset password endpoint
  async resetPassword(req, res, next) {
    try {
      const result = await AuthService.resetPassword(req.body);
      return successResponse(res, result.message, {}, 200);
    } catch (err) {
      return next(err);
    }
  },

  // Logout endpoint
  logout(req, res) {
    // The frontend should remove the token on logout. For JWT, no server-side action required unless using blacklist (not implemented here).
    return successResponse(
      res,
      "Logout successful. Please discard the token on client side.",
      {},
      200
    );
  },

  
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const result = await AuthService.changePassword(userId, currentPassword, newPassword, confirmPassword);
      return successResponse(res, result.message, {}, 200);
    } catch (err) {
      return next(err);
    }
  },
};
