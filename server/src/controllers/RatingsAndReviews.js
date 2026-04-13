import {RatingAndReviews} from '../models/RatingAndReviews.model.js';
import { ApiError } from '../utils/ApiErrors.js';   
import { course } from '../models/course.model.js';
import mongoose from 'mongoose';

export const createRatingAndReview = async (req , res)=>{
    try {
        //get user id
        const userid = req.user.id;
        //fetch data from req body
        const {rating,review,courseId} = req.body;
        //check if user is enrolled or not
        const courseDetails = await course.findOne(
            {
                _id: courseId,
                studentsEnrolled: {$elemMatch : {$eq: userid}}
            }
        )
        if(!courseDetails){
            throw  new ApiError(400,'user not enrolled in course')
        }
        //check if user already reviwed the course
         const alreadyReviewed =await  RatingAndReviews.findOne(
            {
                user: userid,
                course: courseId
            }
         );
         if(alreadyReviewed){
            throw new ApiError(400,'already reviewed');
         }
        //create rating and review  
        const ratingReview = await RatingAndReviews.create({
            rating,review,
            course: courseId,
            user: userid
        })
        //update course with this rating/review
        await course.findByIdAndUpdate(courseId,{
            $push: {
                RatingandReviews: ratingReview._id,
            },
            
        },{new: true})
        //return response
        return res.status(200).json({
            success: true,
            message: 'rating and reviewed successfully'
        })
    } catch (error) {
        throw new ApiError(500,error.message)
    }
}


//get Average rating
export const getAverageRating = async (req ,res)=>{
    try {
        const courseId = req.body.courseId;
        ///calculate average rating
        const result = await RatingAndReviews.aggregate([
            {
               $match: {
                course: new mongoose.Types.ObjectId(courseId),
               }
            },
            {
                $group: {
                    _id: null,
                    averageRating: {$avg:"$rating"}
                }
            }
        ])
        if(result.length>0){
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating
            })
        }
        return res.status(200).json({
            success: true,
            message:'Average rating is 0, no rating is given till now',
            averageRating: 0
        })
    } catch (error) {
        throw new ApiError(500,error.message);
    }
}


//get all rating
export const getAllRatingAndReviews = async ( req , res)=>{
    try {
        const courseId = req.params.id || req.query.courseId;
        let query = {};
        if(courseId){
            try {
                query.course = new mongoose.Types.ObjectId(courseId);
            } catch (err) {
                // If courseId is not a valid ObjectId, still fetch all reviews
                console.log('Invalid ObjectId format, returning all reviews');
                query = {};
            }
        }
        const allReviews=await RatingAndReviews.find(query)
                             .sort({rating: -1})
                             .populate({
                                path: "user",
                                select: "firstName lastName email image"
                             })
                             .populate({
                                path: "course",
                                select: "courseName"
                             })
                             .exec();
    
                return res.status(200).json({
                    success: true,
                    message: 'All reviews fetched successfully',
                    data: allReviews ,
                })
    } catch (error) {
        console.log('Review fetch error:', error.message);
        return res.status(200).json({
            success: true,
            message: 'All reviews fetched successfully',
            data: []
        });
    }
}