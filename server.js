const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

const userRoutes = require("./routes/userRoute");
const jobRoutes = require("./routes/jobRoute");

const app = express();

// CORS - allow both backend and frontend origins
const allowedOrigins = ["https://test-api-9gkd.vercel.app"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman/curl
      if (allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log("Cookies:", req.cookies);
  next();
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/jobs", jobRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("ERROR 💥", err);
  res.status(500).json({ status: "error", message: "Something went wrong!" });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/jobsApp")
  .then(() => console.log("Connected to MongoDB 🔥"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
