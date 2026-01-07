import {RatingAndReview} from '../models/RatingAndReview.js';
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
         const alreadyReviewed =await  RatingAndReview.findOne(
            {
                user: userid,
                course: courseId
            }
         );
         if(alreadyReviewed){
            throw new ApiError(400,'already reviewed');
         }
        //create rating and review  
        const ratingReview = await RatingAndReview.create({
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
        throw new ApiError(500,'invalid request')
    }
}


//get Average rating
export const getAverageRating = async (req ,res)=>{
    try {
        const courseId = req.body.courseId;
        ///calculate average rating
        const result = await RatingAndReview.aggregate([
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
        if(rating.length>0){
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
        await RatingAndReview.find({})
                             .sort(({rating: "desc"}))
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
        throw new ApiError(500,error.message)
    }
}