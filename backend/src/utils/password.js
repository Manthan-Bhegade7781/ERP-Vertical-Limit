const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, passwordHash) => {
  return await bcrypt.compare(password, passwordHash);
};

module.exports = {
  hashPassword,
  comparePassword,
};