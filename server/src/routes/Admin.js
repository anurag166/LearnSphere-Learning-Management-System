import { Router } from "express";
import { auth } from "../middlewares/auth.middlewares.js";
import { isAdmin } from "../middlewares/auth.middlewares.js";
import {
  getAllUsers,
  updateUserRole,
  approveInstructor,
  deleteUser,
  getAllCoursesAdmin,
  deleteCourseAdmin,
  deleteCategoryAdmin,
  getPlatformStats,
} from "../controllers/Admin.js";

const router = Router();

// Every route below requires a logged-in Admin account.
router.use(auth, isAdmin);

router.get("/stats", getPlatformStats);

router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/approve-instructor", approveInstructor);
router.delete("/users/:id", deleteUser);

router.get("/courses", getAllCoursesAdmin);
router.delete("/courses/:id", deleteCourseAdmin);

router.delete("/categories/:id", deleteCategoryAdmin);

export default router;
