import bcrypt from "bcrypt";
import { UserModel } from "../../user/user.model.js";
import nodemailer from "nodemailer";

const SALT_ROUNDS = 10;
export const AuthService = {
  async signup({ firstName, lastName, email, password }) {
    const existUser = await UserModel.findbyEmail(email);
    if (existUser) {
      const err = new Error("User already exists");
      err.name = "ConflictError";
      err.status = 409;
      throw err;
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    return user;
  },

  async signin({ email, password }) {
    const user = await UserModel.findbyEmail(email);
    if (!user) {
      const err = new Error("Invalid email or password");
      err.name = "AuthError";
      err.status = 401;
      throw err;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const err = new Error("Invalid email or password");
      err.name = "AuthError";
      err.status = 401;
      throw err;
    }
    return user;
  },

  // Send password reset email with reset link
  async sendResetPasswordEmail(email, resetLink) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email, // Replace with your email
        pass: "ResetPassword@123", // Replace with your email password or app password
      },
    });

    const mailOptions = {
      from: email, // Replace with your email
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>We received a request to reset your password. Please click the link below to reset it:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };
    await transporter.sendMail(mailOptions);
  },

  // Forgot password: Generate a reset token and send the reset email
  async forgotPassword({ email }) {
    const user = await UserModel.findbyEmail(email);
    if (!user) {
      const err = new Error("Email not found");
      err.name = "NotFoundError";
      err.status = 404;
      throw err;
    }

    // Generate and store the reset token
    const resetToken = await UserModel.createPasswordResetToken(email);
    // Create the reset link
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`;

    // Send the reset link to the user's email
    await this.sendResetPasswordEmail(email, resetLink);

    return { message: "Password reset link sent to your email" };
  },

  // Reset password: Verify token and update the user's password
  async resetPassword({ email, token, newPassword }) {
    const tokenRecord = await UserModel.verifyResetToken(email, token);
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    if (tokenRecord) {
      await UserModel.updateByEmail(email, hashedPassword);
      await UserModel.deleteResetToken(email, token);
      return { message: "Password successfully reset" };
    }

    return { message: "Nikle" };
  },

  /**
   * Change password for logged-in user
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   * @param {string} confirmPassword
   */
  async changePassword(userId, currentPassword, newPassword, confirmPassword) {
    const user = await UserModel.findbyId(userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      const err = new Error('Current password is incorrect');
      err.status = 401;
      throw err;
    }
    if (newPassword !== confirmPassword) {
      const err = new Error("New password and confirm password don't match");
      err.status = 422;
      throw err;
    }
    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await UserModel.updateById(userId, { password: hashed });
    return { message: 'Password changed successfully' };
  },
};
