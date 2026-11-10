const dotenv = require("dotenv");

const result = dotenv.config();

console.log("Env file path:", process.cwd());
console.log("Dotenv error:", result.error?.message ?? "none");
console.log("MONGODB_URI exists:", Boolean(process.env.MONGODB_URI));
console.log("MONGO_URI exists:", Boolean(process.env.MONGO_URI));

const connectDB = require("./config/database");
const app = require("./app");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
