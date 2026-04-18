import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import os from "os";

import courseRoutes from "./src/routes/Course.js";
import userRoutes from "./src/routes/User.js";
import paymentRoutes from "./src/routes/Payments.js";
import profileRoutes from "./src/routes/Profile.js";
import connectDB from "./config/database.js";
import { cloudinaryConnect } from "./config/cloudinary.js";

dotenv.config();

const app = express();

const normalizeOrigin = (origin) => origin?.trim().replace(/\/$/, "");

const envAllowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || "").split(","),
]
  .map(normalizeOrigin)
  .filter(Boolean);

const allowedOrigins = new Set([
  ...envAllowedOrigins,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://studynotion-mu-five.vercel.app",
]);

// Default to allowing Vercel domains unless explicitly disabled.
const allowVercelPreviewOrigins = process.env.ALLOW_VERCEL_PREVIEWS !== "false";

const isAllowedOrigin = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin);

  if (allowedOrigins.has(normalizedOrigin)) {
    return true;
  }

  if (allowVercelPreviewOrigins) {
    try {
      const { hostname } = new URL(normalizedOrigin);
      return hostname.endsWith(".vercel.app");
    } catch {
      return false;
    }
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server tools and same-origin requests without an Origin header.
    if (!origin) {
      return callback(null, true);
    }

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


app.use(express.json());
app.use(cookieParser());

// database
connectDB();

// file upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: os.tmpdir(),
  })
);

// cloudinary
cloudinaryConnect();

// routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payment", paymentRoutes);

// test route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Server running 🌱" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
