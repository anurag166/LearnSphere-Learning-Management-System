import { course } from "../models/course.model.js";
//import { tags } from "../models/tags.model.js";
import { category } from "../models/category.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";


//create course
export const createCourse = async (req , res)=>{
    try {
        //fetch data
        const{
            courseName,
            courseDescription,
            whatWillYouLearn,
            whatYouWillLearn,
            price,
            category1,
            tags,
            tag,
            instructions,
            level,
            language,
        } = req.body;
        const learnContent = whatWillYouLearn || whatYouWillLearn;

        const parseListInput = (input) => {
            if (!input) return [];

            if (Array.isArray(input)) {
                return input.map((item) => String(item).trim()).filter(Boolean);
            }

            if (typeof input === "string") {
                const trimmed = input.trim();
                if (!trimmed) return [];

                if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
                    try {
                        const parsed = JSON.parse(trimmed);
                        if (Array.isArray(parsed)) {
                            return parsed.map((item) => String(item).trim()).filter(Boolean);
                        }
                    } catch {
                        // Fallback to comma/newline split below.
                    }
                }

                return trimmed
                    .split(/\r?\n|,/)
                    .map((item) => item.trim())
                    .filter(Boolean);
            }

            return [];
        };

        const resolvedTags = parseListInput(tags || tag);
        const resolvedInstructions = parseListInput(instructions);

        //get thumbnail
        const thumbnail = req.files?.thumbnailImage;
        const introVideo = req.files?.introVideo;

        //validation
        if(!courseName || !courseDescription || !learnContent || !price || !category1 || !thumbnail){
            return res.status(400).json({
                success: false,
                message: "All fields are required (courseName, courseDescription, whatWillYouLearn, price, category1, thumbnailImage)"
            });
        }
        if (Number(price) < 0) {
            return res.status(400).json({
            success: false,
            message: "Course price cannot be negative"
            });
        }
        
        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details" , instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success: false,
                message: "Instructor not found. Please ensure you're logged in."
            });
        }

        //check given category is valid or not
        const categoryDetails = await category.findById(category1);
        if(!categoryDetails){
            return res.status(404).json({
                success: false,
                message: "Invalid category selected"
            });
        }

        //upload image on cloudinary
        let thumbnailImage;
        try {
            thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
        } catch (uploadErr) {
            console.log("Upload error:", uploadErr);
            return res.status(500).json({
                success: false,
                message: "Failed to upload thumbnail. Please try again."
            });
        }

        let introVideoUrl = "";
        if (introVideo) {
            try {
                const uploadedVideo = await uploadImageToCloudinary(introVideo, process.env.FOLDER_NAME);
                introVideoUrl = uploadedVideo.secure_url;
            } catch (videoUploadErr) {
                console.log("Video upload error:", videoUploadErr);
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload intro video. Please try again."
                });
            }
        }

        //create entry in db
        const newCourse = await course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatWillYouLearn: learnContent,
            price,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            tag: resolvedTags,
            instructions: resolvedInstructions,
            level: level || "Beginner",
            language: language || "English",
            introVideoUrl,
        })

        //add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            { $push: { courses: newCourse._id } },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse,
        });
    } catch (error) {
        console.log("Create course error:", error);
        return res.status(500).json({
            success: false,
            message: "Error creating course: " + error.message
        });
    }
}





//get all courses

export const showAllCourses = async (req , res)=>{
    try {
        const allCourses =  await course.find({}, {
            courseName: true,
            courseDescription: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingsAndReviews: true,
            studentsEnrolled: true,
        }).populate("instructor")
        .exec();
        return res.status(200).json({
            success: true,
            message: 'Data for all courses fetched successfully',
            data: allCourses
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'cannot get course data'
        });
    }
}

export const getInstructorCourses = async (req, res) => {
    try {
        const instructorId = req.user?._id || req.user?.id;
        if (!instructorId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized request"
            });
        }

        const instructorDoc = await User.findById(instructorId).select("courses");
        const userCourseIds = Array.isArray(instructorDoc?.courses)
            ? instructorDoc.courses.map(c => String(c))
            : [];

        const query = {
            $or: [
                { instructor: instructorId },
                { instructor: String(instructorId) },
                ...(userCourseIds.length ? [{ _id: { $in: userCourseIds } }] : []),
            ],
        };

        const instructorCourses = await course.find(query)
            .populate("instructor")
            .populate("ratingsAndReviews")
            .exec();

        const normalizedCourses = instructorCourses.map((courseDoc) => {
            const courseObject = courseDoc.toObject();
            const studentIds = [
                ...(Array.isArray(courseObject.studentsEnrolled) ? courseObject.studentsEnrolled : []),
                ...(Array.isArray(courseObject.studentEnrolled) ? courseObject.studentEnrolled : []),
            ];
            const uniqueStudents = [...new Set(studentIds.map((student) => String(student)))];
            const reviews = Array.isArray(courseObject.ratingsAndReviews) ? courseObject.ratingsAndReviews : [];
            const averageRating = reviews.length
                ? reviews.reduce((sum, review) => sum + Number(review?.rating || 0), 0) / reviews.length
                : 0;

            return {
                ...courseObject,
                studentsEnrolled: uniqueStudents,
                studentEnrolled: uniqueStudents,
                enrolledCount: uniqueStudents.length,
                averageRating: Number(averageRating.toFixed(1)),
                reviewCount: reviews.length,
            };
        });

        return res.status(200).json({
            success: true,
            message: "Instructor courses fetched successfully",
            data: normalizedCourses,
        });
    } catch (error) {
        console.log("getInstructorCourses error:", error);
        return res.status(500).json({
            success: false,
            message: "cannot get instructor course data: " + error.message
        });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const courseId = req.params.id || req.body.courseId;
        const userId = req.user?.id || req.user?._id;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required"
            });
        }

        const existingCourse = await course.findById(courseId);
        if (!existingCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        if (String(existingCourse.instructor) !== String(userId)) {
            return res.status(403).json({
                success: false,
                message: "You can only edit your own courses"
            });
        }

        const {
            courseName,
            courseDescription,
            whatWillYouLearn,
            whatYouWillLearn,
            price,
            category1,
            category,
            tags,
            tag,
            instructions,
            level,
            language,
        } = req.body || {};

        const learnContent = whatWillYouLearn || whatYouWillLearn;
        const nextCategory = category1 || category;

        if (nextCategory) {
            const categoryDetails = await category.findById(nextCategory);
            if (!categoryDetails) {
                return res.status(404).json({
                    success: false,
                    message: "Invalid category selected"
                });
            }
            existingCourse.category = categoryDetails._id;
        }

        if (courseName) existingCourse.courseName = courseName;
        if (courseDescription) existingCourse.courseDescription = courseDescription;
        if (learnContent) existingCourse.whatWillYouLearn = learnContent;
        if (price !== undefined && price !== "") existingCourse.price = Number(price);
        if (tags !== undefined) existingCourse.tag = Array.isArray(tags) ? tags : String(tags).split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
        if (instructions !== undefined) existingCourse.instructions = Array.isArray(instructions) ? instructions : String(instructions).split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
        if (level) existingCourse.level = level;
        if (language) existingCourse.language = language;

        await existingCourse.save();

        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: existingCourse,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error updating course: " + error.message
        });
    }
};

export const getCourseDetails   = async( req ,res)=>{
    try {
        const courseId = req.params.id || req.body.courseId;
        if(!courseId){
            return res.status(400).json({
                success: false,
                message: 'Course ID is required'
            });
        }
        let courseDetails;
        try {
            courseDetails = await course.findById(courseId, {
                courseName: true,
                courseDescription: true,
                price: true,
                thumbnail: true,
                instructor: true,
                category: true,
                whatWillYouLearn: true,
                tag: true,
                instructions: true,
                level: true,
                language: true,
                introVideoUrl: true,
                courseContent: true,
                ratingsAndReviews: true,
                studentsEnrolled: true,
                studentEnrolled: true,
            })
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                    model: "subSection"
                }
            })
        } catch (dbError) {
            // Handle invalid ObjectId format
            console.log('Course lookup error:', dbError.message);
            return res.status(404).json({
                success: false,
                message: 'Course not found. Invalid course ID format.'
            });
        }
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Data for  course fetched successfully',
            data: courseDetails
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching course details: ' + error.message
        });
    }
}
