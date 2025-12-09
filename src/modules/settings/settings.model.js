// Temporary in-memory store for demonstration; replace with DB calls in production.
const settingsStore = new Map(); // key = userId

export const SettingsModel = {
  getByUserId(userId) {
    if (!settingsStore.has(userId)) {
      // Return default settings if not found
      return {
        userId,
        enableNotifications: false,
        emailNotifications: false,
        pushNotifications: false,
        bookingReminders: false,
        newsletter: false,
        specialOffers: false,
        marketingEmails: false,
      };
    }
    return settingsStore.get(userId);
  },

  updateByUserId(userId, update) {
    const existing = SettingsModel.getByUserId(userId);
    const updated = { ...existing, ...update, userId };
    settingsStore.set(userId, updated);
    return updated;
  }
};
