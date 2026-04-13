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
        const{courseName,courseDescription,whatWillYouLearn,whatYouWillLearn,price,category1} = req.body;
        const learnContent = whatWillYouLearn || whatYouWillLearn;

        //get thumbnail
        const thumbnail = req.files?.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !learnContent || !price || !category1 || !thumbnail){
            return res.status(400).json({
                success: false,
                message: "All fields are required (courseName, courseDescription, whatWillYouLearn, price, category1, thumbnailImage)"
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

        //create entry in db
        const newCourse = await course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatWillYouLearn: learnContent,
            price,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
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
        const allCourses =  await course.find({},{
            courseName: true,
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
        throw new ApiError(500,"cannot get course data");
    }
}

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
            courseDetails = await course.findById(courseId,{
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingsAndReviews: true,
                studentsEnrolled: true,
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