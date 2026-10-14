const Student = require("../models/Student");

const generateStudentId = async () => {
  const students = await Student.find({})
    .select("studentId")
    .sort({ studentId: -1 });

  let nextNumber = 1;

  if (students.length > 0) {
    const numbers = students
      .map((student) => {
        const match = student.studentId?.match(/^STU(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((number) => number > 0);

    if (numbers.length > 0) {
      nextNumber = Math.max(...numbers) + 1;
    }
  }

  return `STU${String(nextNumber).padStart(3, "0")}`;
};

module.exports = { generateStudentId };