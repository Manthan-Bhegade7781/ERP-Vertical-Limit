const Batch = require("../models/Batch");
const Branch = require("../models/Branch");

/*
  Calculate batch status from dates.

  Upcoming  -> current date is before start date
  Active    -> current date is between start and end date
  Completed -> current date is after end date

  Removed batches are handled separately using isRemoved.
*/
const getBatchStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return "upcoming";
  }

  if (now > end) {
    return "completed";
  }

  return "active";
};

// ============================================================
// CREATE BATCH
// ============================================================

const createBatch = async (req, res) => {
  try {
    const {
      name,
      code,
      standard,
      academicYear,
      branchId,
      startDate,
      endDate,
      schedule,
      capacity,
      description,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !code ||
      !standard ||
      !academicYear ||
      !branchId ||
      !startDate ||
      !endDate ||
      !schedule?.startTime ||
      !schedule?.endTime ||
      !schedule?.days ||
      schedule.days.length === 0 ||
      capacity === undefined ||
      capacity === null
    ) {
      return res.status(400).json({
        success: false,
        message: "All required batch fields must be provided",
      });
    }

    // Check branch exists
    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Only active branches can have new batches
    if (branch.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot create a batch for an inactive branch",
      });
    }

    // Check duplicate batch code
    const existingBatch = await Batch.findOne({
      code: code.toUpperCase().trim(),
    });

    if (existingBatch) {
      return res.status(409).json({
        success: false,
        message: "Batch code already exists",
      });
    }

    // Validate capacity
    if (!Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive whole number",
      });
    }

    // Validate dates
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

    if (parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }

    // Create batch
    const batch = await Batch.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      standard,
      academicYear: academicYear.trim(),
      branchId,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      schedule: {
        startTime: schedule.startTime.trim(),
        endTime: schedule.endTime.trim(),
        days: schedule.days,
      },
      capacity: Number(capacity),
      description: description?.trim() || "",
      isRemoved: false,
      removedAt: null,
    });

    return res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: {
        batch: {
          ...batch.toObject(),
          status: getBatchStatus(
            batch.startDate,
            batch.endDate
          ),
        },
      },
    });
  } catch (error) {
    console.error("Create batch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create batch",
    });
  }
};

// ============================================================
// GET ALL BATCHES
// ============================================================

const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find({
      isRemoved: { $ne: true },
    })
      .populate("branchId", "name code")
      .sort({ startDate: 1, createdAt: -1 });

    const batchesWithStatus = batches.map((batch) => ({
      ...batch.toObject(),
      status: getBatchStatus(
        batch.startDate,
        batch.endDate
      ),
    }));

    return res.status(200).json({
      success: true,
      count: batchesWithStatus.length,
      data: {
        batches: batchesWithStatus,
      },
    });
  } catch (error) {
    console.error("Get batches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch batches",
    });
  }
};

// ============================================================
// GET SINGLE BATCH
// ============================================================

const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findOne({
      _id: id,
      isRemoved: { $ne: true },
    }).populate("branchId", "name code");

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        batch: {
          ...batch.toObject(),
          status: getBatchStatus(
            batch.startDate,
            batch.endDate
          ),
        },
      },
    });
  } catch (error) {
    console.error("Get batch by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch batch",
    });
  }
};

// ============================================================
// UPDATE BATCH
// ============================================================

const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      code,
      standard,
      academicYear,
      branchId,
      startDate,
      endDate,
      schedule,
      capacity,
      description,
    } = req.body;

    // Find existing batch
    const batch = await Batch.findOne({
      _id: id,
      isRemoved: { $ne: true },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Validate required fields
    if (
      !name ||
      !code ||
      !standard ||
      !academicYear ||
      !branchId ||
      !startDate ||
      !endDate ||
      !schedule?.startTime ||
      !schedule?.endTime ||
      !schedule?.days ||
      schedule.days.length === 0 ||
      capacity === undefined ||
      capacity === null
    ) {
      return res.status(400).json({
        success: false,
        message: "All required batch fields must be provided",
      });
    }

    // Check branch
    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    if (branch.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign a batch to an inactive branch",
      });
    }

    // Check duplicate code excluding current batch
    const duplicateBatch = await Batch.findOne({
      code: code.toUpperCase().trim(),
      _id: { $ne: id },
    });

    if (duplicateBatch) {
      return res.status(409).json({
        success: false,
        message: "Batch code already exists",
      });
    }

    // Validate capacity
    if (!Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be a positive whole number",
      });
    }

    // Validate dates
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

    if (parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }

    // Update batch
    batch.name = name.trim();
    batch.code = code.toUpperCase().trim();
    batch.standard = standard;
    batch.academicYear = academicYear.trim();
    batch.branchId = branchId;
    batch.startDate = parsedStartDate;
    batch.endDate = parsedEndDate;

    batch.schedule = {
      startTime: schedule.startTime.trim(),
      endTime: schedule.endTime.trim(),
      days: schedule.days,
    };

    batch.capacity = Number(capacity);
    batch.description = description?.trim() || "";

    await batch.save();

    return res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      data: {
        batch: {
          ...batch.toObject(),
          status: getBatchStatus(
            batch.startDate,
            batch.endDate
          ),
        },
      },
    });
  } catch (error) {
    console.error("Update batch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update batch",
    });
  }
};

// ============================================================
// REMOVE BATCH
// ============================================================

const removeBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findOne({
      _id: id,
      isRemoved: { $ne: true },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    batch.isRemoved = true;
    batch.removedAt = new Date();

    await batch.save();

    return res.status(200).json({
      success: true,
      message: "Batch removed successfully",
      data: {
        batchId: batch._id,
      },
    });
  } catch (error) {
    console.error("Remove batch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove batch",
    });
  }
};

// ============================================================
// GET BATCHES FOR REGISTRATION — PUBLIC
// ============================================================

const getRegistrationBatches = async (req, res) => {
  try {
    const { branchId } = req.query;

    // Validate branch ID
    if (!branchId || !require("mongoose").Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        success: false,
        message: "A valid branch ID is required",
      });
    }

    // Check that the branch exists and is active
    const branch = await Branch.findOne({
      _id: branchId,
      status: "active",
    }).select("_id");

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found or inactive",
      });
    }

    // Find batches belonging to the selected branch
    const batches = await Batch.find({
      branchId: branch._id,
      isRemoved: { $ne: true },
    })
      .select(
        "name code standard academicYear branchId startDate endDate isRemoved"
      )
      .populate("branchId", "name code")
      .sort({ startDate: 1 });

    return res.status(200).json({
      success: true,
      count: batches.length,
      data: {
        batches,
      },
    });
  } catch (error) {
    console.error("Get registration batches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch registration batches",
    });
  }
};

module.exports = {
  createBatch,
  getBatches,
  getBatchById,
  getRegistrationBatches,
  updateBatch,
  removeBatch,
};