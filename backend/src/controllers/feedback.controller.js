const Feedback = require("../models/Feedback");

const hasRole = (user, role) => user.roles?.includes(role);

const submitFeedback = async (req, res) => {
  try {
    if (!hasRole(req.user, "student")) {
      return res.status(403).json({
        success: false,
        message: "Only students can submit feedback",
      });
    }

    const { subject, category, rating, comments } = req.body;

    if (!subject || !category || rating === undefined || !comments) {
      return res.status(400).json({
        success: false,
        message: "Subject, category, rating, and comments are required",
      });
    }

    const numericRating = Number(rating);

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const feedback = await Feedback.create({
      studentId: req.user._id,
      branchId: req.user.branchId || null,
      subject,
      category,
      rating: numericRating,
      comments,
    });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });
  } catch (error) {
    console.error("Submit feedback error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
    });
  }
};

const getFeedback = async (req, res) => {
  try {
    const filter = {};

    // Branch Admin: only feedback from their branch
    if (req.user.role === "admin") {
      filter.branchId = req.user.branchId;
    }

    // Super Admin: no branch filter, so all branches are included
    const feedback = await Feedback.find(filter)
      .populate("studentId", "fullName email")
      .populate("branchId", "branchName name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
      error: error.message,
    });
  }
};

const updateFeedbackStatus = async (req, res) => {
  try {
    const isSuperAdmin = hasRole(req.user, "super_admin");
    const isAdmin = hasRole(req.user, "admin");

    if (!isSuperAdmin && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only Admin and Super Admin can update feedback",
      });
    }

    const { status } = req.body;

    if (!["New", "Reviewed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be New or Reviewed",
      });
    }

    const filter = { _id: req.params.id };

    // Keep Admin updates restricted to their branch.
    if (isAdmin && !isSuperAdmin) {
      if (!req.user.branchId) {
        return res.status(403).json({
          success: false,
          message: "Your account is not assigned to a branch",
        });
      }

      filter.branchId = req.user.branchId;
    }

    const feedback = await Feedback.findOneAndUpdate(
      filter,
      { status },
      { new: true, runValidators: true }
    ).populate("studentId", "fullName email");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Feedback status updated",
      data: feedback,
    });
  } catch (error) {
    console.error("Update feedback status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update feedback status",
    });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const isSuperAdmin = req.user.roles?.includes("super_admin");
    const isAdmin = req.user.roles?.includes("admin");

    if (!isSuperAdmin && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only Admin and Super Admin can delete feedback",
      });
    }

    const filter = { _id: req.params.id };

    // Admins can delete feedback only from their own branch.
    if (isAdmin && !isSuperAdmin) {
      if (!req.user.branchId) {
        return res.status(403).json({
          success: false,
          message: "Your account is not assigned to a branch",
        });
      }

      filter.branchId = req.user.branchId;
    }

    const feedback = await Feedback.findOneAndDelete(filter);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("Delete feedback error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete feedback",
    });
  }
};

module.exports = {
  submitFeedback,
  getFeedback,
  updateFeedbackStatus,
  deleteFeedback,
};