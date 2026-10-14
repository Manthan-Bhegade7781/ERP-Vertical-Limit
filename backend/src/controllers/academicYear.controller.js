const AcademicYear = require("../models/AcademicYear");

// Create a new academic year
const createAcademicYear = async (req, res) => {
  try {
    const { name, startDate, endDate, status } = req.body;

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Academic year name, start date and end date are required",
      });
    }

    // Convert dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date or end date",
      });
    }

    // Validate date order
    if (parsedStartDate >= parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Check duplicate academic year
    const existingAcademicYear = await AcademicYear.findOne({
      name: name.trim(),
    });

    if (existingAcademicYear) {
      return res.status(409).json({
        success: false,
        message: "Academic year already exists",
      });
    }

    // If creating an active year, deactivate existing active year
    if (status === "active") {
      await AcademicYear.updateMany(
        { status: "active" },
        { $set: { status: "inactive" } }
      );
    }

    const academicYear = await AcademicYear.create({
      name: name.trim(),
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      status: status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Academic year created successfully",
      data: {
        academicYear,
      },
    });
  } catch (error) {
    console.error("Create academic year error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create academic year",
    });
  }
};

// Get all academic years
const getAcademicYears = async (req, res) => {
  try {
    const academicYears = await AcademicYear.find()
      .sort({ startDate: -1 });

    return res.status(200).json({
      success: true,
      data: {
        academicYears,
      },
    });
  } catch (error) {
    console.error("Get academic years error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch academic years",
    });
  }
};

// Update an academic year
const updateAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, status } = req.body;

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Academic year name, start date and end date are required",
      });
    }

    // Convert dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date or end date",
      });
    }

    // Validate date order
    if (parsedStartDate >= parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Check if another academic year already has this name
    const existingAcademicYear = await AcademicYear.findOne({
      name: name.trim(),
      _id: { $ne: id },
    });

    if (existingAcademicYear) {
      return res.status(409).json({
        success: false,
        message: "Academic year already exists",
      });
    }

    // If updating to active, deactivate other active academic years
    if (status === "active") {
      await AcademicYear.updateMany(
        {
          status: "active",
          _id: { $ne: id },
        },
        {
          $set: { status: "inactive" },
        }
      );
    }

    const academicYear = await AcademicYear.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        status: status || "active",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: "Academic year not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Academic year updated successfully",
      data: {
        academicYear,
      },
    });
  } catch (error) {
    console.error("Update academic year error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update academic year",
    });
  }
};

module.exports = {
  createAcademicYear,
  getAcademicYears,
  updateAcademicYear
};