import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const auth = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw new ApiError(401, "Invalid access token");
  }

  req.user = user;
  next();
});


export const isStudent = (req, res, next) => {
  if (req.user.accountType !== "Student") {
    throw new ApiError(403, "Access denied. Students only");
  }
  next();
};

export const isInstructor = (req, res, next) => {
  if (req.user.accountType !== "Instructor") {
    throw new ApiError(403, "Access denied. Instructors only");
  }
  if (req.user.instructorStatus !== "approved") {
    throw new ApiError(
      403,
      "Your instructor account is still pending admin approval."
    );
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user.accountType !== "Admin") {
    throw new ApiError(403, "Access denied. Admins only");
  }
  next();
};
