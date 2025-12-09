import { prisma } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const UserModel = {
  create: (data) => prisma.user.create({ data }),
  findbyEmail: (email) => prisma.user.findUnique({ where: { email } }),
  findbyId: (id) => {
    const intId = Number(id);
    if (!Number.isFinite(intId)) return null;
    return prisma.user.findUnique({ where: { id: intId } });
  },
  find: () => prisma.user.findMany(),
  deletebyId: (id) => {
    const intId = Number(id);
    if (!Number.isFinite(intId)) return null;
    return prisma.user.delete({ where: { id: intId } });
  },
  updateById: (id, updateData) =>
    prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
    }),
  
  updateByEmail: (email, password) =>
    prisma.user.update({
      where: { email: email },
      data: { password: password },
    }),

  async createPasswordResetToken(email) {
    const resetToken = uuidv4();

    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expiresAt: new Date(Date.now() + 3600000),
      },
    });

    return resetToken;
  },

  async verifyResetToken(email, token) {
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: {
        email_token: {
          email: email,
          token: token,
        },
      },
    });

    return tokenRecord;
  },

  // Delete the reset token after it's used or expired
  async deleteResetToken(email, token) {
    await prisma.passwordResetToken.delete({
      where: {
        email_token: {
          email: email,
          token: token,
        },
      },
    });
  },
};
