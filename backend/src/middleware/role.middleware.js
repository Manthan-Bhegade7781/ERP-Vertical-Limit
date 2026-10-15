
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure authentication middleware has populated the user.
    if (!req.user || !Array.isArray(req.user.roles)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Reject invalid or empty role configurations.
    if (allowedRoles.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const hasPermission = req.user.roles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action",
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
