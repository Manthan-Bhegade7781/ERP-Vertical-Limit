const mongoose = require("mongoose");
const BatchSubject = require("../models/BatchSubject");
const Batch = require("../models/Batch");
const Subject = require("../models/Subject");
const User = require("../models/User");

const isAdminOnly = (user) =>
  Boolean(user?.roles?.includes("admin") && !user?.roles?.includes("super_admin"));

const sameId = (left, right) => Boolean(left && right && String(left) === String(right));

const validObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getBatchForUser = async (batchId, user) => {
  if (!validObjectId(batchId)) return { error: "invalid" };
  const batch = await Batch.findOne({ _id: batchId, isRemoved: { $ne: true } });
  if (!batch) return { error: "not_found" };
  if (isAdminOnly(user) && (!user.branchId || !sameId(batch.branchId, user.branchId))) {
    return { error: "forbidden" };
  }
  return { batch };
};

const respondBatchAccessError = (res, error) => {
  if (error === "invalid") {
    res.status(400).json({ success: false, message: "Invalid batch ID" });
  } else if (error === "not_found") {
    res.status(404).json({ success: false, message: "Batch not found" });
  } else if (error === "forbidden") {
    res.status(403).json({ success: false, message: "You can only manage batches belonging to your branch" });
  }
};

const getTeacherForBatch = async (teacherId, batch, user) => {
  if (!validObjectId(teacherId)) return { error: "invalid" };
  const teacher = await User.findById(teacherId);
  if (!teacher || !teacher.roles?.includes("teacher") || teacher.status !== "active") {
    return { error: "invalid_teacher" };
  }
  // Admin assignments require an explicit matching branch. Never allow null branch IDs.
  if (isAdminOnly(user)) {
    if (!user.branchId || !sameId(batch.branchId, user.branchId) || !sameId(teacher.branchId, batch.branchId)) {
      return { error: "forbidden_teacher" };
    }
  } else if (teacher.branchId && batch.branchId && !sameId(teacher.branchId, batch.branchId)) {
    return { error: "forbidden_teacher" };
  }
  return { teacher };
};

const assignSubjectToBatch = async (req, res) => {
  try {
    const { batchId, subjectId, teacherId } = req.body;
    if (!batchId || !subjectId || !teacherId) {
      return res.status(400).json({ success: false, message: "Batch, subject and teacher are required" });
    }

    const batchResult = await getBatchForUser(batchId, req.user);
    if (batchResult.error) return respondBatchAccessError(res, batchResult.error);
    const { batch } = batchResult;

    if (!validObjectId(subjectId)) {
      return res.status(400).json({ success: false, message: "Invalid subject ID" });
    }
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found" });

    const teacherResult = await getTeacherForBatch(teacherId, batch, req.user);
    if (teacherResult.error === "invalid") {
      return res.status(400).json({ success: false, message: "Invalid teacher ID" });
    }
    if (teacherResult.error === "invalid_teacher") {
      return res.status(400).json({ success: false, message: "An active teacher account is required" });
    }
    if (teacherResult.error === "forbidden_teacher") {
      return res.status(403).json({ success: false, message: "Teacher and batch must belong to the same branch" });
    }

    const existingAssignment = await BatchSubject.findOne({ batchId, subjectId });
    if (existingAssignment) {
      if (existingAssignment.status === "inactive") {
        existingAssignment.teacherId = teacherId;
        existingAssignment.status = "active";
        await existingAssignment.save();
        return res.status(200).json({ success: true, message: "Subject assignment reactivated successfully", data: { batchSubject: existingAssignment } });
      }
      return res.status(409).json({ success: false, message: "Subject is already assigned to this batch" });
    }

    const batchSubject = await BatchSubject.create({ batchId, subjectId, teacherId });
    return res.status(201).json({ success: true, message: "Subject assigned to batch successfully", data: { batchSubject } });
  } catch (error) {
    console.error("Assign subject to batch error:", error);
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "Subject is already assigned to this batch" });
    }
    return res.status(500).json({ success: false, message: "Failed to assign subject to batch" });
  }
};

const getBatchSubjects = async (req, res) => {
  try {
    const batchResult = await getBatchForUser(req.params.batchId, req.user);
    if (batchResult.error) return respondBatchAccessError(res, batchResult.error);

    const batchSubjects = await BatchSubject.find({ batchId: batchResult.batch._id })
      .populate("subjectId", "name code standard type")
      .populate("teacherId", "fullName email branchId roles status")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: { batchSubjects } });
  } catch (error) {
    console.error("Get batch subjects error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch batch subjects" });
  }
};

const changeTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId } = req.body;
    if (!teacherId) return res.status(400).json({ success: false, message: "Teacher is required" });
    if (!validObjectId(id)) return res.status(400).json({ success: false, message: "Invalid batch subject assignment ID" });

    const batchSubject = await BatchSubject.findById(id);
    if (!batchSubject) return res.status(404).json({ success: false, message: "Batch subject assignment not found" });

    const batchResult = await getBatchForUser(batchSubject.batchId, req.user);
    if (batchResult.error) return respondBatchAccessError(res, batchResult.error);

    const teacherResult = await getTeacherForBatch(teacherId, batchResult.batch, req.user);
    if (teacherResult.error === "invalid") return res.status(400).json({ success: false, message: "Invalid teacher ID" });
    if (teacherResult.error === "invalid_teacher") return res.status(400).json({ success: false, message: "An active teacher account is required" });
    if (teacherResult.error === "forbidden_teacher") return res.status(403).json({ success: false, message: "Teacher and batch must belong to the same branch" });

    batchSubject.teacherId = teacherId;
    batchSubject.status = "active";
    await batchSubject.save();
    return res.status(200).json({ success: true, message: "Teacher changed successfully", data: { batchSubject } });
  } catch (error) {
    console.error("Change teacher error:", error);
    return res.status(500).json({ success: false, message: "Failed to change teacher" });
  }
};

const updateBatchSubjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be active or inactive" });
    }
    if (!validObjectId(id)) return res.status(400).json({ success: false, message: "Invalid batch subject assignment ID" });

    const batchSubject = await BatchSubject.findById(id);
    if (!batchSubject) return res.status(404).json({ success: false, message: "Batch subject assignment not found" });

    const batchResult = await getBatchForUser(batchSubject.batchId, req.user);
    if (batchResult.error) return respondBatchAccessError(res, batchResult.error);

    batchSubject.status = status;
    await batchSubject.save();
    return res.status(200).json({
      success: true,
      message: status === "active" ? "Subject assignment activated successfully" : "Subject assignment deactivated successfully",
      data: { batchSubject },
    });
  } catch (error) {
    console.error("Update batch subject status error:", error);
    return res.status(500).json({ success: false, message: "Failed to update batch subject status" });
  }
};

module.exports = { assignSubjectToBatch, getBatchSubjects, changeTeacher, updateBatchSubjectStatus };
