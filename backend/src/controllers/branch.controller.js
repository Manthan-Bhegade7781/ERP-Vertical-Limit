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

module.exports = {
  createBranch,
};