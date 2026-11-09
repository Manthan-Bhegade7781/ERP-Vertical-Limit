const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const Message = require("../models/Message");

// GET /api/notifications
// Get notifications belonging to the logged-in user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const isSuperAdmin =
      Array.isArray(req.user.roles) &&
      req.user.roles.includes("super_admin");

    // 1. Fetch direct notifications
    const notifications = await Notification.find({
      recipient: userId,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // 2. Fetch messages addressed to this user
    const messages = await Message.find({
      "recipients.user": userId,
      $or: [
        { "recipients.deletedAt": null },
        { "recipients.deletedAt": { $exists: false } },
      ],
    })
      .populate("sender", "fullName email")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const existingNotificationTitles = new Set(
      notifications.map((n) => n.title)
    );

    const messageNotifications = messages
      .filter((msg) => !existingNotificationTitles.has(`New Message: ${msg.subject}`))
      .map((msg) => {
        const recipientData = msg.recipients?.find(
          (r) => r.user?.toString() === userId.toString()
        );
        const isRead = Boolean(recipientData?.readAt);
        const senderName = msg.sender?.fullName || "User";

        return {
          _id: msg._id,
          id: msg._id.toString(),
          title: `New Message: ${msg.subject}`,
          message: `${senderName}: ${
            msg.body.length > 80
              ? msg.body.slice(0, 80) + "..."
              : msg.body
          }`,
          type: "general",
          icon: "email-outline",
          isRead,
          link: isSuperAdmin
            ? "/(super_admin)/explore?feature=Messages"
            : "/(admin)/explore?feature=Messages",
          createdAt: msg.createdAt,
          isMessage: true,
        };
      });

    // Merge and sort
    const allNotifications = [...notifications, ...messageNotifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);

    const unreadCount = allNotifications.filter((item) => !item.isRead).length;

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: {
        notifications: allNotifications,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifUnread = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    const msgUnread = await Message.countDocuments({
      recipients: {
        $elemMatch: {
          user: userId,
          readAt: null,
          deletedAt: null,
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { unreadCount: notifUnread + msgUnread },
    });
  } catch (error) {
    console.error("Get unread count error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread notification count",
    });
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    let notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        recipient: userId,
      },
      {
        $set: { isRead: true },
      },
      {
        new: true,
      }
    );

    if (!notification) {
      // Check if it's a message
      const message = await Message.findOneAndUpdate(
        {
          _id: id,
          "recipients.user": userId,
        },
        {
          $set: { "recipients.$.readAt": new Date() },
        },
        {
          new: true,
        }
      );

      if (message) {
        notification = { _id: message._id, isRead: true };
      }
    }

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: { notification },
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

// PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      Notification.updateMany(
        {
          recipient: userId,
          isRead: false,
        },
        {
          $set: { isRead: true },
        }
      ),
      Message.updateMany(
        {
          "recipients.user": userId,
          "recipients.readAt": null,
        },
        {
          $set: { "recipients.$.readAt": new Date() },
        }
      ),
    ]);

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};