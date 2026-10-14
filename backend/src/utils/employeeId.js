const Teacher = require("../models/Teacher");

const generateEmployeeId = async () => {
  const teachers = await Teacher.find({})
    .select("employeeId")
    .sort({ employeeId: -1 });

  let nextNumber = 1;

  if (teachers.length > 0) {
    const numbers = teachers
      .map((teacher) => {
        const match = teacher.employeeId?.match(/^TCH(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((number) => number > 0);

    if (numbers.length > 0) {
      nextNumber = Math.max(...numbers) + 1;
    }
  }

  return `TCH${String(nextNumber).padStart(3, "0")}`;
};

module.exports = { generateEmployeeId };