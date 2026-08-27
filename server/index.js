import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import os from "os";
import net from "net";

import courseRoutes from "./src/routes/Course.js";
import userRoutes from "./src/routes/User.js";
import paymentRoutes from "./src/routes/Payments.js";
import profileRoutes from "./src/routes/Profile.js";
import chatbotRoutes from "./src/routes/Chatbot.js";
import adminRoutes from "./src/routes/Admin.js";
import connectDB from "./config/database.js";
import { cloudinaryConnect } from "./config/cloudinary.js";

dotenv.config();

const app = express();
const maxUploadMb = Number(process.env.MAX_VIDEO_UPLOAD_MB || 100);
const maxUploadBytes = maxUploadMb * 1024 * 1024;

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
app.options(/.*/, cors(corsOptions));

app.use("/api/v1/payment/verifySignature", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(cookieParser());

// database
connectDB();

// file upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: os.tmpdir(),
    limits: { fileSize: maxUploadBytes },
    abortOnLimit: true,
    limitHandler: (req, res) => {
      return res.status(413).json({
        success: false,
        message: `File too large. Max upload size is ${maxUploadMb}MB.`,
      });
    },
  })
);

// cloudinary
cloudinaryConnect();

// routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/chatbot", chatbotRoutes);
app.use("/api/v1/admin", adminRoutes);

// test route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Server running 🌱" });
});

app.get("/debug/smtp", async (req, res) => {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 587);

  if (!host) {
    return res.status(500).json({ success: false, message: "MAIL_HOST is not set" });
  }

  const socket = net.createConnection(port, host);
  socket.setTimeout(10000);

  socket.on("connect", () => {
    socket.end();
    res.json({ success: true, message: `SMTP host reachable on ${host}:${port}` });
  });

  socket.on("timeout", () => {
    socket.destroy();
    res.status(504).json({ success: false, message: `Connection to ${host}:${port} timed out` });
  });

  socket.on("error", (error) => {
    socket.destroy();
    const errText = error?.message || error?.code || String(error) || "unknown error";
    res.status(502).json({ success: false, message: `SMTP connection failed: ${errText}` });
  });
});

app.use((err, req, res, next) => {
  if (err?.status === 413 || err?.statusCode === 413 || err?.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: `File too large. Max upload size is ${maxUploadMb}MB.`,
    });
  }

  if (err) {
    return res.status(err.statusCode || err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }

  return next();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
