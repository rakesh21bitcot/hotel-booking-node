import { prisma } from "../../config/db.js";

const defaultSettings = {
  enableNotifications: false,
  emailNotifications: false,
  pushNotifications: false,
  bookingReminders: false,
  newsletter: false,
  specialOffers: false,
  marketingEmails: false,
};

let settingsColumnEnsured = false;

async function ensureSettingsColumn() {
  if (settingsColumnEnsured) return;
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "settings" JSONB DEFAULT \'{}\'::jsonb'
  );
  settingsColumnEnsured = true;
}

export const SettingsModel = {
  async getByUserId(userId) {
    await ensureSettingsColumn();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true },
    });
    if (!user) return null;
    return { ...defaultSettings, ...(user.settings || {}) };
  },

  async updateByUserId(userId, update) {
    await ensureSettingsColumn();
    const current = await this.getByUserId(userId);
    const merged = { ...defaultSettings, ...(current || {}), ...update };
    await prisma.user.update({
      where: { id: userId },
      data: { settings: merged },
    });
    return merged;
  },
};
