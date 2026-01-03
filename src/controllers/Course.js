import { course } from "../models/course.model";
import { tags } from "../models/tags.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiErrors";
import { uploadImageToCloudinary } from "../utils/imageUploader";


//create course
export const createCourse = async (req , res)=>{
    try {
        //fetch data
        const{courseName,courseDescription,whatWillYouLearn,price,tag} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName||!courseDescription||!whatWillYouLearn||!price||!tag || !thumbnail){
            throw new ApiError(400,"all fields are required");
        }
        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details" , instructorDetails);

        if(!instructorDetails){
            throw new ApiError(404,"instructor details not found")
        }

        //check given tag is valid or not

        const tagDetails = await tag.findbyId(tag);
        if(!tagDetails){
            throw new ApiError(404,"tag details not found")
        }

        //upload image on cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        //create enrty in db

        const newCourse = await course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatWillYouLearn,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url,
            

        })

        //add the  new course to the user schema of instructor

        await User.findByIdAndUpdate(
            {
                _id: instructorDetails._id
            },
            {
             $push: {
                courses: newCourse._id,
                
             }
            },
             {new: true},
            
        );

        return res.status(200).json({
            success: true,
            message: "Course",
            data: newCourse,
        });
    } catch (error) {
        console.log(error);
        throw new ApiError(500,"failed to create Course");
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