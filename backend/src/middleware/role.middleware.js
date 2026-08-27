const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
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

module.exports = {
  authorizeRoles,
};