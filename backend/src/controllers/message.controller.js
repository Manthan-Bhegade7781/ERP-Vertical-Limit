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

const canAccessMessages = (user) => {
  const roles = getUserRoles(user);

  return (
    roles.includes("super_admin") ||
    roles.includes("admin")
  );
};

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
// SHARED ADMIN MAILBOX
// --------------------------------------------------

const getAdminMailboxUserIds = async () => {
  const users = await User.find({ status: "active" })
    .select("_id roles role")
    .lean();

  return users
    .filter((user) => {
      const roles = getUserRoles(user);

      return (
        roles.includes("admin") ||
        roles.includes("super_admin")
      );
    })
    .map((user) => user._id);
};

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

  if (senderRoles.includes("super_admin")) {
    return true;
  }

  if (senderRoles.includes("teacher")) {
    return (
      recipientRoles.includes("super_admin") ||
      (
        recipientRoles.includes("admin") &&
        sameBranch(sender, recipient)
      )
    );
  }

  if (senderRoles.includes("admin")) {
    return (
      recipientRoles.includes("super_admin") ||
      sameBranch(sender, recipient)
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
    const roles = getUserRoles(req.user);

    const isTeacher = roles.includes("teacher");
    const isAdminMailbox = canAccessMessages(req.user);

    const folder = String(
      req.query.folder || "inbox"
    ).toLowerCase();

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID is missing or invalid.",
      });
    }

    if (!isTeacher && !isAdminMailbox) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access messages.",
      });
    }

    let filter = {};
    let visibleRecipientIds;

    // ----------------------------------------------
    // TEACHER PERSONAL INBOX
    // ----------------------------------------------

    if (isTeacher) {
      if (!["inbox", "unread"].includes(folder)) {
        return res.status(403).json({
          success: false,
          message: "Teachers can access received messages only.",
        });
      }

      const recipientFilter = {
        user: userId,
        deletedAt: null,
        archivedAt: null,
      };

      if (folder === "unread") {
        recipientFilter.readAt = null;
      }

      filter.recipients = {
        $elemMatch: recipientFilter,
      };

      visibleRecipientIds = new Set([
        userId.toString(),
      ]);
    }

    // ----------------------------------------------
    // SHARED ADMIN / SUPER ADMIN MAILBOX
    // ----------------------------------------------

    else {
      const mailboxIds = await getAdminMailboxUserIds();

      if (
        !mailboxIds.some(
          (id) => id.toString() === userId.toString()
        )
      ) {
        mailboxIds.push(userId);
      }

      visibleRecipientIds = new Set(
        mailboxIds.map((id) => id.toString())
      );

      if (folder === "sent") {
        filter.sender = {
          $in: mailboxIds,
        };
      } else if (
        [
          "inbox",
          "unread",
          "archived",
          "important",
        ].includes(folder)
      ) {
        const recipientFilter = {
          user: { $in: mailboxIds },
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
          message: "Invalid message folder.",
        });
      }
    }

    const messages = await populateMessage(
      Message.find(filter).sort({
        createdAt: -1,
      })
    );

    const data = messages.map((message) => {
      const item = message.toObject();

      item.recipients = (item.recipients || [])
        .filter((recipient) => {
          const recipientId =
            recipient.user?._id || recipient.user;

          return (
            recipientId &&
            visibleRecipientIds.has(recipientId.toString())
          );
        })
        .map((recipient) => ({
          user: recipient.user,
          readAt: recipient.readAt,
          archivedAt: recipient.archivedAt,
          deletedAt: recipient.deletedAt,
          isImportant: recipient.isImportant,
        }));

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
// --------------------------------------------------

const createMessage = async (req, res) => {
  try {
    const sender = req.user;
    const senderRoles = getUserRoles(sender);

    const canSend =
      senderRoles.includes("super_admin") ||
      senderRoles.includes("admin") ||
      senderRoles.includes("teacher");

    if (!canSend) {
      return res.status(403).json({
        success: false,
        message:
          "Only Admin, Super Admin and Teachers can send messages.",
      });
    }

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
        message: "Valid subject and message body are required.",
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
    }).select("fullName email roles role branchId status");

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

    // Send notifications to recipients.
    for (const recipient of recipients) {
      try {
        const recipientRoles = getUserRoles(recipient);

        const isSuperAdminRecipient =
          recipientRoles.includes("super_admin");

        const isTeacherRecipient =
          recipientRoles.includes("teacher");

        const notificationLink = isTeacherRecipient
          ? "/(teacher)/explore?feature=Messages"
          : isSuperAdminRecipient
            ? "/(super_admin)/explore?feature=Messages"
            : "/(admin)/explore?feature=Messages";

        await createNotification({
          recipient: recipient._id,
          title: subject.trim(),
          message:
            body.trim().length > 80
              ? body.trim().slice(0, 80) + "..."
              : body.trim(),
          type: "general",
          icon: "email-outline",
          link: notificationLink,
        });
      } catch (notifError) {
        console.error(
          "Message notification error:",
          notifError.message
        );
      }
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
    const roles = getUserRoles(req.user);

    const isTeacher = roles.includes("teacher");
    const isAdminMailbox = canAccessMessages(req.user);

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    if (!userId || (!isTeacher && !isAdminMailbox)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this message.",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    let visibleRecipientIds;
    let hasAccess = false;

    if (isTeacher) {
      // Teacher can open only messages addressed to their account.
      const ownRecipient = message.recipients.find(
        (item) =>
          item.user.toString() === userId.toString() &&
          !item.deletedAt
      );

      hasAccess = Boolean(ownRecipient);

      visibleRecipientIds = new Set([
        userId.toString(),
      ]);

      if (ownRecipient && !ownRecipient.readAt) {
        ownRecipient.readAt = new Date();
        await message.save();
      }
    } else {
      const mailboxIds = await getAdminMailboxUserIds();

      if (
        !mailboxIds.some(
          (mailboxId) =>
            mailboxId.toString() === userId.toString()
        )
      ) {
        mailboxIds.push(userId);
      }

      visibleRecipientIds = new Set(
        mailboxIds.map((mailboxId) => mailboxId.toString())
      );

      const senderIsAdminMailbox = visibleRecipientIds.has(
        message.sender.toString()
      );

      const hasAdminRecipient = message.recipients.some(
        (item) => {
          const recipientId = item.user?._id || item.user;

          return (
            recipientId &&
            visibleRecipientIds.has(recipientId.toString()) &&
            !item.deletedAt
          );
        }
      );

      hasAccess = senderIsAdminMailbox || hasAdminRecipient;

      const currentRecipient = message.recipients.find(
        (item) =>
          item.user.toString() === userId.toString() &&
          !item.deletedAt
      );

      if (currentRecipient && !currentRecipient.readAt) {
        currentRecipient.readAt = new Date();
        await message.save();
      }
    }

    if (!hasAccess) {
      return res.status(404).json({
        success: false,
        message: "Message not found or access denied.",
      });
    }

    const populatedMessage = await populateMessage(
      Message.findById(id)
    );

    const data = populatedMessage.toObject();

    data.recipients = (data.recipients || []).filter((item) => {
      const recipientId = item.user?._id || item.user;

      return (
        recipientId &&
        visibleRecipientIds.has(recipientId.toString())
      );
    });

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
// Teacher replies to Admin/Super Admin.
// Admin/Super Admin replies to Teacher.
// --------------------------------------------------

const replyToMessage = async (req, res) => {
  try {
    const sender = req.user;
    const senderId = getUserId(sender);
    const senderRoles = getUserRoles(sender);

    const senderIsTeacher = senderRoles.includes("teacher");
    const senderIsAdminMailbox = canAccessMessages(sender);

    if (!senderIsTeacher && !senderIsAdminMailbox) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reply to messages.",
      });
    }

    const { id } = req.params;
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
        message: "Original message not found.",
      });
    }

    const originalSender = await User.findOne({
      _id: original.sender,
      status: "active",
    }).select("fullName email roles role branchId status");

    if (!originalSender) {
      return res.status(404).json({
        success: false,
        message: "Original sender not found or inactive.",
      });
    }

    const originalSenderRoles = getUserRoles(originalSender);

    const originalSenderIsTeacher =
      originalSenderRoles.includes("teacher");

    const originalSenderIsAdmin =
      originalSenderRoles.includes("admin") ||
      originalSenderRoles.includes("super_admin");

    // ----------------------------------------------
    // TEACHER REPLY PERMISSION
    // ----------------------------------------------

    if (senderIsTeacher) {
      // Teacher can reply only to Admin or Super Admin.
      if (!originalSenderIsAdmin) {
        return res.status(403).json({
          success: false,
          message:
            "Teachers can reply only to Admin or Super Admin messages.",
        });
      }

      // Verify original message was addressed to this Teacher.
      const teacherIsRecipient = original.recipients.some(
        (recipient) => {
          const recipientId =
            recipient.user?._id || recipient.user;

          return (
            recipientId &&
            recipientId.toString() === senderId.toString() &&
            !recipient.deletedAt
          );
        }
      );

      if (!teacherIsRecipient) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot reply to a message that was not addressed to you.",
        });
      }
    }

    // ----------------------------------------------
    // ADMIN / SUPER ADMIN REPLY PERMISSION
    // ----------------------------------------------

    if (senderIsAdminMailbox) {
      // Admin/Super Admin replies to messages sent by Teachers.
      if (!originalSenderIsTeacher) {
        return res.status(403).json({
          success: false,
          message:
            "Admin and Super Admin can use this reply action for Teacher messages.",
        });
      }

      const mailboxIds = await getAdminMailboxUserIds();

      const senderBelongsToMailbox = mailboxIds.some(
        (mailboxId) =>
          mailboxId.toString() === senderId.toString()
      );

      if (!senderBelongsToMailbox) {
        return res.status(403).json({
          success: false,
          message: "You cannot reply from the shared Admin mailbox.",
        });
      }

      // Confirm original Teacher message was sent to Admin/Super Admin.
      const originalWasSentToAdminMailbox =
        original.recipients.some((recipient) => {
          const recipientId =
            recipient.user?._id || recipient.user;

          return (
            recipientId &&
            mailboxIds.some(
              (mailboxId) =>
                mailboxId.toString() === recipientId.toString()
            ) &&
            !recipient.deletedAt
          );
        });

      if (!originalWasSentToAdminMailbox) {
        return res.status(403).json({
          success: false,
          message:
            "This Teacher message was not addressed to the Admin mailbox.",
        });
      }
    }

    // Apply existing recipient and branch restrictions.
    if (!canMessageRecipient(sender, originalSender)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reply to this sender.",
      });
    }

    const replySubject = /^\s*re\s*:/i.test(original.subject)
      ? original.subject
      : `Re: ${original.subject}`;

    // IMPORTANT:
    // Reply is a new message addressed directly to the original sender.
    // Admin reply -> Teacher's personal inbox.
    // Teacher reply -> Admin/Super Admin shared inbox.
    const reply = await Message.create({
      sender: senderId,
      recipients: [
        {
          user: originalSender._id,
        },
      ],
      subject: replySubject,
      body: body.trim(),
      category: original.category || "General",
      priority: original.priority || "Normal",
      replyTo: original._id,
      branchId: getBranchId(sender) || null,
    });

    const populatedReply = await populateMessage(
      Message.findById(reply._id)
    );

    // ----------------------------------------------
    // NOTIFICATION
    // ----------------------------------------------

    try {
      const recipientRoles = getUserRoles(originalSender);

      const recipientIsTeacher =
        recipientRoles.includes("teacher");

      const recipientIsSuperAdmin =
        recipientRoles.includes("super_admin");

      const notificationLink = recipientIsTeacher
        ? "/(teacher)/explore?feature=Messages"
        : recipientIsSuperAdmin
          ? "/(super_admin)/explore?feature=Messages"
          : "/(admin)/explore?feature=Messages";

      await createNotification({
        recipient: originalSender._id,
        title: `New Reply: ${replySubject}`,
        message:
          body.trim().length > 100
            ? `${body.trim().slice(0, 100)}...`
            : body.trim(),
        type: "general",
        icon: "email-reply-outline",
        link: notificationLink,
      });
    } catch (notificationError) {
      console.error(
        "Reply notification error:",
        notificationError.message
      );
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
// Admin and Super Admin only
// --------------------------------------------------

const updateMessageStatus = async (req, res) => {
  try {
    if (!canAccessMessages(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin and Super Admin can manage messages.",
      });
    }

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

    const mailboxIds = await getAdminMailboxUserIds();

    const mailboxIdSet = new Set(
      mailboxIds.map((mailboxId) => mailboxId.toString())
    );

    const recipient =
      message.recipients.find(
        (item) =>
          item.user.toString() === userId.toString() &&
          !item.deletedAt
      ) ||
      message.recipients.find((item) => {
        const recipientId = item.user?._id || item.user;

        return (
          recipientId &&
          mailboxIdSet.has(recipientId.toString()) &&
          !item.deletedAt
        );
      });

    if (!recipient) {
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
// DELETE MESSAGE FROM CURRENT ADMIN INBOX
// DELETE /api/messages/:id
// Admin and Super Admin only
// --------------------------------------------------

const deleteMessage = async (req, res) => {
  try {
    if (!canAccessMessages(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin and Super Admin can manage messages.",
      });
    }

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

    const mailboxIds = await getAdminMailboxUserIds();

    const mailboxIdSet = new Set(
      mailboxIds.map((mailboxId) => mailboxId.toString())
    );

    const recipient =
      message.recipients.find(
        (item) =>
          item.user.toString() === userId.toString() &&
          !item.deletedAt
      ) ||
      message.recipients.find((item) => {
        const recipientId = item.user?._id || item.user;

        return (
          recipientId &&
          mailboxIdSet.has(recipientId.toString()) &&
          !item.deletedAt
        );
      });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Message not found in your inbox.",
      });
    }

    // Soft-delete the selected recipient copy.
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

// --------------------------------------------------
// EXPORT CONTROLLERS
// --------------------------------------------------

module.exports = {
  getMessages,
  createMessage,
  getMessageById,
  replyToMessage,
  updateMessageStatus,
  deleteMessage,
};