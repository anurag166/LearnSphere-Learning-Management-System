import { User } from "../models/user.model.js";
import { course } from "../models/course.model.js";
import { category } from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { mailSender } from "../utils/mailSender.js";

// GET /api/v1/admin/users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select("-password")
    .populate("additionalDetails")
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Fetched all users successfully"));
});

// PUT /api/v1/admin/users/:id/role  { accountType: "Student"|"Instructor"|"Admin" }
export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { accountType } = req.body;

  if (!["Student", "Instructor", "Admin"].includes(accountType)) {
    throw new ApiError(400, "Invalid accountType");
  }

  const update = { accountType };
  // Admin directly assigning the Instructor role counts as approval;
  // any other role clears instructor pending/approved status.
  update.instructorStatus = accountType === "Instructor" ? "approved" : "none";

  const updated = await User.findByIdAndUpdate(id, update, {
    new: true,
  }).select("-password");

  if (!updated) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "User role updated successfully"));
});

// PUT /api/v1/admin/users/:id/approve-instructor
export const approveInstructor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const targetUser = await User.findById(id);
  if (!targetUser) throw new ApiError(404, "User not found");

  if (targetUser.accountType !== "Instructor") {
    throw new ApiError(400, "This user has not applied as an instructor");
  }

  if (targetUser.instructorStatus === "approved") {
    throw new ApiError(400, "This instructor is already approved");
  }

  targetUser.instructorStatus = "approved";
  await targetUser.save();

  try {
    await mailSender(
      targetUser.email,
      "Instructor account approved",
      `Congratulations ${targetUser.firstName}! Your instructor account on LearnSphere has been approved. You can now log in and start creating courses.`
    );
  } catch (mailErr) {
    console.error("Failed to send instructor approval email:", mailErr);
  }

  const sanitized = targetUser.toObject();
  delete sanitized.password;

  return res
    .status(200)
    .json(new ApiResponse(200, sanitized, "Instructor approved successfully"));
});

// DELETE /api/v1/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id === req.user._id.toString()) {
    throw new ApiError(400, "You cannot delete your own admin account");
  }
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

// GET /api/v1/admin/courses
export const getAllCoursesAdmin = asyncHandler(async (req, res) => {
  const courses = await course
    .find({})
    .populate("instructor", "firstName lastName email")
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return res
    .status(200)
    .json(new ApiResponse(200, courses, "Fetched all courses successfully"));
});

// DELETE /api/v1/admin/courses/:id
export const deleteCourseAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await course.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "Course not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Course deleted successfully"));
});

// DELETE /api/v1/admin/categories/:id
export const deleteCategoryAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const inUse = await course.exists({ category: id });
  if (inUse) {
    throw new ApiError(
      400,
      "Cannot delete a category that still has courses assigned to it"
    );
  }

  const deleted = await category.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "Category not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Category deleted successfully"));
});

// GET /api/v1/admin/stats
export const getPlatformStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalStudents, totalInstructors, pendingInstructors, totalCourses, totalCategories] =
    await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ accountType: "Student" }),
      User.countDocuments({ accountType: "Instructor" }),
      User.countDocuments({ accountType: "Instructor", instructorStatus: { $ne: "approved" } }),
      course.countDocuments({}),
      category.countDocuments({}),
    ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { totalUsers, totalStudents, totalInstructors, pendingInstructors, totalCourses, totalCategories },
      "Fetched platform stats successfully"
    )
  );
});
