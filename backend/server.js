import express from "express";
import mongoose from "mongoose";
import urlRoutes from "./routes/urlRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 60000,
});

mongoose.connection.on("connected", () =>
  console.log("MongoDB connected successfully.")
);
mongoose.connection.on("error", (err) =>
  console.error(`MongoDB connection error: ${err.message}`)
);

// Routes
app.use("/api/url", urlRoutes);
app.use("/api/config", configRoutes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
