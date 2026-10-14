const Notification = require("../models/Notification");

const createNotification = async ({
  recipient,
  title,
  message,
  type = "general",
  icon = "bell-outline",
  link = null,
}) => {
  if (!recipient) {
    console.warn("Notification skipped: recipient is required");
    return null;
  }

  try {
    return await Notification.create({
      recipient,
      title,
      message,
      type,
      icon,
      link,
    });
  } catch (error) {
    // Notification failure should not interrupt the main operation.
    console.error("Failed to create notification:", error.message);
    return null;
  }
};

module.exports = createNotification;