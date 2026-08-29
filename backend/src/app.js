const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const branchRoutes = require("./routes/branch.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin/branches", branchRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Vertical Classes ERP API is running",
  });
});

module.exports = app;