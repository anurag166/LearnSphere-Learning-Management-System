import { Router } from "express";
import { handleChat, handleCourseChat } from "../controllers/Chatbot.js";
import { auth } from "../middlewares/auth.middlewares.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const router = Router();

/**
 * Optional authentication middleware
 * Attaches req.user if a valid token is provided, but does not block guest visitors
 */
const optionalAuth = async (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded?.id) {
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // If token is invalid, continue as unauthenticated guest
  }

  next();
};

// Route for sending a chat message to AI
router.post("/chat", optionalAuth, handleChat);

// Route for course-aware chat (requires login + enrollment, verified in controller)
router.post("/course-chat", auth, handleCourseChat);

export default router;
