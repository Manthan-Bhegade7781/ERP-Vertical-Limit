const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      roles: user.roles,
      branchId: user.branchId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

module.exports = {
  generateToken,
};