
const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const isValidObjectId = (id) =>
  Boolean(id) && mongoose.Types.ObjectId.isValid(String(id));

const getUserId = (user) => user?._id ?? user?.id ?? null;

const getUserRoles = (user) => {
  const rawRoles = user?.roles ?? user?.role ?? [];
  const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];

  return [
    ...new Set(
      roles
        .map((role) => {
          const value =
            typeof role === "object" && role !== null
              ? role.name ??
                role.value ??
                role.role ??
                role.slug ??
                ""
              : role;

          return String(value)
            .trim()
            .replace(/([a-z])([A-Z])/g, "$1_$2")
            .toLowerCase()
            .replace(/[\s-]+/g, "_");
        })
        .filter(Boolean)
    ),
  ];
};

const isSuperAdmin = (user) =>
  getUserRoles(user).includes("super_admin");

const getBranchId = (user) => {
  const branch =
    user?.branchId ?? user?.branch ?? user?.assignedBranch ?? null;

  if (branch && typeof branch === "object") {
    return branch._id ?? branch.id ?? null;
  }

  return branch;
};

const sameBranch = (first, second) => {
  const firstBranch = getBranchId(first);
  const secondBranch = getBranchId(second);

  return Boolean(
    firstBranch &&
      secondBranch &&
      firstBranch.toString() === secondBranch.toString()
  );
};

const getUserBranchFilter = (user) => {
  if (isSuperAdmin(user)) {
    return {};
  }

  const branchId = getBranchId(user);

  if (!branchId || !isValidObjectId(branchId)) {
    return null;
  }

  return { branchId };
};

const ALLOWED_CATEGORIES = [
  "General",
  "Academic",
  "Examination",
  "Fees",
  "Reports",
  "Training",
  "Events",
  "Assignments",
];

const ALLOWED_PRIORITIES = ["Important", "Normal"];

const populateMessage = (query) =>
  query
    .populate("sender", "fullName email roles branchId")
    .populate("recipients.user", "fullName email roles branchId")
    .populate("branchId", "name");

// --------------------------------------------------
// RECIPIENT PERMISSIONS
// --------------------------------------------------

const canMessageRecipient = (sender, recipient) => {
  const senderId = getUserId(sender);
  const recipientId = getUserId(recipient);

  if (
    !senderId ||
    !recipientId ||
    senderId.toString() === recipientId.toString()
  ) {
    return false;
  }

  const senderRoles = getUserRoles(sender);
  const recipientRoles = getUserRoles(recipient);

  // Super Admin can contact active users across branches.
  if (senderRoles.includes("super_admin")) {
    return true;
  }

  // Every supported role can contact Super Admin.
  if (recipientRoles.includes("super_admin")) {
    return true;
  }

  // All other communications must remain within one branch.
  if (!sameBranch(sender, recipient)) {
    return false;
  }

  // Branch Admin can contact users in their own branch.
  if (senderRoles.includes("admin")) {
    return true;
  }

  // Teachers can contact branch admins, teachers and students.
  if (senderRoles.includes("teacher")) {
    return recipientRoles.some((role) =>
      ["admin", "teacher", "student"].includes(role)
    );
  }

  // Students can contact branch admins and teachers.
  if (senderRoles.includes("student")) {
    return recipientRoles.some((role) =>
      ["admin", "teacher"].includes(role)
    );
  }

  return false;
};

// --------------------------------------------------
// GET MESSAGES
// GET /api/messages?folder=inbox
// GET /api/messages?folder=sent
// GET /api/messages?folder=unread
// GET /api/messages?folder=archived
// GET /api/messages?folder=important
// --------------------------------------------------

const getMessages = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const folder = String(req.query.folder || "inbox").toLowerCase();

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID is missing or invalid.",
      });
    }

    let filter = {};

    if (folder === "sent") {
      filter.sender = userId;
    } else if (
      ["inbox", "unread", "archived", "important"].includes(folder)
    ) {
      const recipientFilter = {
        user: userId,
        deletedAt: null,
      };

      if (folder === "archived") {
        recipientFilter.archivedAt = { $ne: null };
      } else {
        recipientFilter.archivedAt = null;
      }

      if (folder === "unread") {
        recipientFilter.readAt = null;
      }

      if (folder === "important") {
        recipientFilter.isImportant = true;
      }

      filter.recipients = {
        $elemMatch: recipientFilter,
      };
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Invalid folder. Use inbox, sent, unread, archived or important.",
      });
    }

    const messages = await populateMessage(
      Message.find(filter).sort({ createdAt: -1 })
    );

    const data = messages.map((message) => {
      const item = message.toObject();

      if (folder === "sent") {
        // Sender can see recipients but not their private
        // archive, delete or important settings.
        item.recipients = item.recipients.map((recipient) => ({
          user: recipient.user,
          readAt: recipient.readAt,
        }));
      } else {
        // Return only the current user's mailbox status.
        item.recipients = item.recipients.filter(
          (recipient) =>
            recipient.user?._id?.toString() === userId.toString()
        );
      }

      return item;
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages.",
    });
  }
};

// --------------------------------------------------
// CREATE MESSAGE
// POST /api/messages
//
// Body:
// {
//   "recipientIds": ["USER_ID"],
//   "subject": "Message subject",
//   "body": "Message content",
//   "category": "General",
//   "priority": "Normal"
// }
// --------------------------------------------------

const createMessage = async (req, res) => {
  try {
    const sender = req.user;
    const senderId = getUserId(sender);

    const {
      recipientIds,
      subject,
      body,
      category = "General",
      priority = "Normal",
    } = req.body;

    if (!senderId || !isValidObjectId(senderId)) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID is missing or invalid.",
      });
    }

    if (
      !Array.isArray(recipientIds) ||
      recipientIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Select at least one recipient.",
      });
    }

    if (
      recipientIds.some((id) => !isValidObjectId(id)) ||
      new Set(recipientIds.map(String)).size !== recipientIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Recipient IDs are invalid or duplicated.",
      });
    }

    if (
      typeof subject !== "string" ||
      !subject.trim() ||
      subject.trim().length > 200 ||
      typeof body !== "string" ||
      !body.trim() ||
      body.trim().length > 10000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid subject and message body are required. Subject limit: 200 characters; body limit: 10000 characters.",
      });
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message category.",
      });
    }

    if (!ALLOWED_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Priority must be Important or Normal.",
      });
    }

    const recipients = await User.find({
      _id: { $in: recipientIds },
      status: "active",
    }).select("fullName email roles branchId status");

    if (recipients.length !== recipientIds.length) {
      return res.status(400).json({
        success: false,
        message:
          "One or more recipients were not found or are inactive.",
      });
    }

    const unauthorizedRecipient = recipients.find(
      (recipient) => !canMessageRecipient(sender, recipient)
    );

    if (unauthorizedRecipient) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to message one or more selected recipients.",
      });
    }

    const branchId = isSuperAdmin(sender)
      ? null
      : getBranchId(sender);

    const message = await Message.create({
      sender: senderId,
      recipients: recipients.map((recipient) => ({
        user: recipient._id,
      })),
      subject: subject.trim(),
      body: body.trim(),
      category,
      priority,
      branchId: branchId || null,
    });

    const populatedMessage = await populateMessage(
      Message.findById(message._id)
    );

    // Notify recipients
    try {
      await Promise.allSettled(
        recipients.map((recipient) => {
          const isSuperAdminRecipient =
            Array.isArray(recipient.roles) &&
            recipient.roles.includes("super_admin");

          return createNotification({
            recipient: recipient._id,
            title: `New Message: ${subject.trim()}`,
            message: `${sender.fullName || "User"}: ${
              body.trim().length > 80
                ? body.trim().slice(0, 80) + "..."
                : body.trim()
            }`,
            type: "general",
            icon: "email-outline",
            link: isSuperAdminRecipient
              ? "/(super_admin)/explore?feature=Messages"
              : "/(admin)/explore?feature=Messages",
          });
        })
      );
    } catch (notifError) {
      console.error("Message notification error:", notifError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Create message error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to send message.",
    });
  }
};

// --------------------------------------------------
// GET MESSAGE BY ID
// GET /api/messages/:id
// --------------------------------------------------

const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req.user);

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    const isSender =
      message.sender.toString() === userId.toString();

    const recipient = message.recipients.find(
      (item) => item.user.toString() === userId.toString()
    );

    if (!isSender && (!recipient || recipient.deletedAt)) {
      return res.status(404).json({
        success: false,
        message: "Message not found or access denied.",
      });
    }

    // Opening a received message marks it as read.
    if (recipient && !recipient.readAt) {
      recipient.readAt = new Date();
      await message.save();
    }

    const populatedMessage = await populateMessage(
      Message.findById(id)
    );

    const data = populatedMessage.toObject();

    if (isSender) {
      // Do not expose private recipient mailbox settings.
      data.recipients = data.recipients.map((item) => ({
        user: item.user,
        readAt: item.readAt,
      }));
    } else {
      data.recipients = data.recipients.filter(
        (item) =>
          item.user?._id?.toString() === userId.toString()
      );
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get message by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch message.",
    });
  }
};

// --------------------------------------------------
// REPLY TO MESSAGE
// POST /api/messages/:id/reply
//
// Body: { "body": "Reply content" }
// --------------------------------------------------

const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const sender = req.user;
    const senderId = getUserId(sender);
    const { body } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    if (
      typeof body !== "string" ||
      !body.trim() ||
      body.trim().length > 10000
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid reply of at most 10000 characters is required.",
      });
    }

    const original = await Message.findById(id);

    if (!original) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    const isSender =
      original.sender.toString() === senderId.toString();

    const originalRecipient = original.recipients.find(
      (item) => item.user.toString() === senderId.toString()
    );

    // Replies are for received messages only.
    if (isSender || !originalRecipient || originalRecipient.deletedAt) {
      return res.status(403).json({
        success: false,
        message: "You cannot reply to this message.",
      });
    }

    const originalSender = await User.findById(original.sender).select(
      "fullName email roles branchId status"
    );

    if (!originalSender || originalSender.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "The original sender is no longer active.",
      });
    }

    if (!canMessageRecipient(sender, originalSender)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reply to this sender.",
      });
    }

    const replySubject = /^\s*re\s*:/i.test(original.subject)
      ? original.subject
      : `Re: ${original.subject}`;

    const reply = await Message.create({
      sender: senderId,
      recipients: [{ user: originalSender._id }],
      subject: replySubject,
      body: body.trim(),
      category: original.category,
      priority: original.priority,
      replyTo: original._id,
      branchId: getBranchId(sender) || null,
    });

    const populatedReply = await populateMessage(
      Message.findById(reply._id)
    );

    // Notify original sender of the reply
    try {
      const isSuperAdminRecipient =
        Array.isArray(originalSender.roles) &&
        originalSender.roles.includes("super_admin");

      await createNotification({
        recipient: originalSender._id,
        title: `Reply: ${original.subject}`,
        message: `${sender.fullName || "User"}: ${
          body.trim().length > 80
            ? body.trim().slice(0, 80) + "..."
            : body.trim()
        }`,
        type: "general",
        icon: "email-reply-outline",
        link: isSuperAdminRecipient
          ? "/(super_admin)/explore?feature=Messages"
          : "/(admin)/explore?feature=Messages",
      });
    } catch (notifError) {
      console.error("Reply notification error:", notifError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Reply sent successfully.",
      data: populatedReply,
    });
  } catch (error) {
    console.error("Reply to message error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to send reply.",
    });
  }
};

// --------------------------------------------------
// UPDATE RECIPIENT MESSAGE STATUS
// PATCH /api/messages/:id/status
//
// Body:
// { "action": "read" }
// { "action": "unread" }
// { "action": "important" }
// { "action": "normal" }
// { "action": "archive" }
// { "action": "unarchive" }
// --------------------------------------------------

const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const userId = getUserId(req.user);

    const allowedActions = [
      "read",
      "unread",
      "important",
      "normal",
      "archive",
      "unarchive",
    ];

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message status action.",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    const recipient = message.recipients.find(
      (item) => item.user.toString() === userId.toString()
    );

    if (!recipient || recipient.deletedAt) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this message.",
      });
    }

    switch (action) {
      case "read":
        recipient.readAt = recipient.readAt || new Date();
        break;

      case "unread":
        recipient.readAt = null;
        break;

      case "important":
        recipient.isImportant = true;
        break;

      case "normal":
        recipient.isImportant = false;
        break;

      case "archive":
        recipient.archivedAt = new Date();
        break;

      case "unarchive":
        recipient.archivedAt = null;
        break;
    }

    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message status updated successfully.",
      data: {
        readAt: recipient.readAt,
        archivedAt: recipient.archivedAt,
        isImportant: recipient.isImportant,
      },
    });
  } catch (error) {
    console.error("Update message status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update message status.",
    });
  }
};

// --------------------------------------------------
// DELETE MESSAGE FROM CURRENT USER'S INBOX
// DELETE /api/messages/:id
// --------------------------------------------------

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req.user);

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    const recipient = message.recipients.find(
      (item) => item.user.toString() === userId.toString()
    );

    if (!recipient || recipient.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Message not found in your inbox.",
      });
    }

    // Soft-delete only this recipient's copy.
    // Other recipients retain their messages.
    recipient.deletedAt = new Date();

    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message deleted from your inbox.",
    });
  } catch (error) {
    console.error("Delete message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete message.",
    });
  }
};

module.exports = {
  getMessages,
  createMessage,
  getMessageById,
  replyToMessage,
  updateMessageStatus,
  deleteMessage,
};
