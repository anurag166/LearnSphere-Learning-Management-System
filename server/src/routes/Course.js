 import { Router } from "express";
 import {
    createCourse,
    showAllCourses,
    getInstructorCourses,
    getCourseDetails,
    updateCourse,
    getPlatformStats,
    getTopInstructors,
 } from '../controllers/Course.js';
 import { createSection,updateSection,deleteSection } from "../controllers/Section.js";
 import {createSubSection,updateSubSection,deleteSubSection} from "../controllers/Subsection.js"
import { createCategory,showAllCategory } from "../controllers/Category.js";
 import { auth } from "../middlewares/auth.middlewares.js";
 import { isAdmin,isInstructor,isStudent } from "../middlewares/auth.middlewares.js";

 import { createRatingAndReview,getAllRatingAndReviews,getAverageRating } from "../controllers/RatingsAndReviews.js";
const router = Router();

 router.post("/createCourse",auth ,isInstructor,createCourse);
 router.get("/showAllCourses",showAllCourses);
 router.get("/platformStats", getPlatformStats);
 router.get("/topInstructors", getTopInstructors);
 router.get("/getInstructorCourses",auth, isInstructor, getInstructorCourses);
 router.get("/getCourseDetails/:id",getCourseDetails);
 router.put("/updateCourse/:id",auth, isInstructor, updateCourse);
 router.post("/createCategory",auth,isAdmin,createCategory);
 
 router.get("/showAllCategory",showAllCategory);
 router.post("/createSection", auth, isInstructor, createSection)
 router.post("/updateSection", auth, isInstructor, updateSection)
 router.delete("/deleteSection/:sectionId", auth, isInstructor, deleteSection)

 router.post("/createSubSection", auth, isInstructor, createSubSection)
 router.post("/updateSubSection", auth, isInstructor, updateSubSection)
 router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)


 router.post("/createRatingAndReview",auth,createRatingAndReview)
 router.get("/getAverageRating/:id",getAverageRating)
 router.get("/getAverageRating",getAverageRating)
 router.get("/getAllRatingAndReviews/:id",getAllRatingAndReviews)
 router.get("/getAllRatingAndReviews",getAllRatingAndReviews)
 export default router