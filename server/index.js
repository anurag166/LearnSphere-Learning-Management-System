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

const allowedOrigins = new Set([
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server tools and same-origin requests without an Origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


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
