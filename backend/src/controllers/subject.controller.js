const Subject = require("../models/Subject");

// Create a new subject
const createSubject = async (req, res) => {
  try {
    const {
      name,
      code,
      standard,
      type,
      description,
      duration,
      status,
    } = req.body;

    // Validate required fields
    if (!name || !code || !standard || !type) {
      return res.status(400).json({
        success: false,
        message: "Name, code, standard and type are required",
      });
    }

    // Check duplicate subject code
    const existingSubject = await Subject.findOne({
      code: code.trim().toUpperCase(),
    });

    if (existingSubject) {
      return res.status(409).json({
        success: false,
        message: "Subject code already exists",
      });
    }

    // Create subject
    const subject = await Subject.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      standard,
      type,
      description: description?.trim() || "",
      duration: duration?.trim() || "",
      status: status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: {
        subject,
      },
    });
  } catch (error) {
    console.error("Create subject error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create subject",
    });
  }
};

// Get all subjects
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: {
        subjects,
      },
    });
  } catch (error) {
    console.error("Get subjects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
    });
  }
};

// Update an existing subject
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      code,
      standard,
      type,
      description,
      duration,
      status,
    } = req.body;

    // Validate required fields
    if (!name || !code || !standard || !type) {
      return res.status(400).json({
        success: false,
        message: "Name, code, standard and type are required",
      });
    }

    // Check if subject exists
    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Check duplicate subject code
    const existingSubject = await Subject.findOne({
      code: code.trim().toUpperCase(),
      _id: { $ne: id },
    });

    if (existingSubject) {
      return res.status(409).json({
        success: false,
        message: "Subject code already exists",
      });
    }

    // Update subject
    subject.name = name.trim();
    subject.code = code.trim().toUpperCase();
    subject.standard = standard;
    subject.type = type;
    subject.description = description?.trim() || "";
    subject.duration = duration?.trim() || "";
    
    if (status) {
      subject.status = status;
    }

    await subject.save();

    return res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: {
        subject,
      },
    });
  } catch (error) {
    console.error("Update subject error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update subject",
    });
  }
};

// Activate or deactivate a subject
const updateSubjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either active or inactive",
      });
    }

    // Find subject
    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Update status
    subject.status = status;

    await subject.save();

    return res.status(200).json({
      success: true,
      message:
        status === "active"
          ? "Subject activated successfully"
          : "Subject deactivated successfully",
      data: {
        subject,
      },
    });
  } catch (error) {
    console.error("Update subject status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update subject status",
    });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  updateSubject,
  updateSubjectStatus
};