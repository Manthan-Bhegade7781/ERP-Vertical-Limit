const Branch = require("../models/Branch");

// Create a new branch
const createBranch = async (req, res) => {
  try {
    const {
      name,
      code,
      address,
      city,
      state,
      contactNumber,
      email,
      status,
    } = req.body;

    // Required fields
    if (
      !name?.trim() ||
      !code?.trim() ||
      !address?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !contactNumber?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Branch name, code, address, city, state, and contact number are required",
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    // Check duplicate branch code
    const existingBranch = await Branch.findOne({
      code: normalizedCode,
    });

    if (existingBranch) {
      return res.status(409).json({
        success: false,
        message: "Branch code already exists",
      });
    }

    const normalizedStatus =
      status?.toLowerCase() === "inactive" ? "inactive" : "active";

    // Create branch
    const branch = await Branch.create({
      name: name.trim(),
      code: normalizedCode,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      contactNumber: contactNumber.trim(),
      email: email?.trim().toLowerCase() || "",
      status: normalizedStatus,
    });

    return res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: {
        branch,
      },
    });
  } catch (error) {
    console.error("Create branch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create branch",
    });
  }
};

// Get all branches
const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find().sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: {
        branches,
      },
    });
  } catch (error) {
    console.error("Get all branches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch branches",
    });
  }
};

// Get active branches
const getActiveBranches = async (req, res) => {
  try {
    const branches = await Branch.find(
      { status: "active" },
      {
        name: 1,
        code: 1,
      }
    ).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: {
        branches,
      },
    });
  } catch (error) {
    console.error("Get active branches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active branches",
    });
  }
};

const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      address,
      city,
      state,
      contactNumber,
      email,
      status,
    } = req.body;

    if (
      !name?.trim() ||
      !code?.trim() ||
      !address?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !contactNumber?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Branch name, code, address, city, state, and contact number are required",
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    // Check whether another branch already uses this code
    const existingBranch = await Branch.findOne({
      code: normalizedCode,
      _id: { $ne: id },
    });

    if (existingBranch) {
      return res.status(409).json({
        success: false,
        message: "Branch code already exists",
      });
    }

    const normalizedStatus =
      status?.toLowerCase() === "inactive" ? "inactive" : "active";

    const branch = await Branch.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        code: normalizedCode,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        contactNumber: contactNumber.trim(),
        email: email?.trim().toLowerCase() || "",
        status: normalizedStatus,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: {
        branch,
      },
    });
  } catch (error) {
    console.error("Update branch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update branch",
    });
  }
};

module.exports = {
  createBranch,
  getAllBranches,
  getActiveBranches,
  updateBranch
};