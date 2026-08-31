const Branch = require("../models/Branch");

// Create a new branch
const createBranch = async (req, res) => {
  try {
    const { name, code, address } = req.body;
 
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Branch name and code are required",
      });
    }

    const existingBranch = await Branch.findOne({
      code: code.toUpperCase(),
    });

    if (existingBranch) {
      return res.status(409).json({
        success: false,
        message: "Branch code already exists",
      });
    }

    const branch = await Branch.create({
      name,
      code: code.toUpperCase(),
      address,
      status: "active",
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

// Get all active branches
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
      message: "Failed to fetch branches",
    });
  }
};

module.exports = {
  createBranch,
  getActiveBranches,
};