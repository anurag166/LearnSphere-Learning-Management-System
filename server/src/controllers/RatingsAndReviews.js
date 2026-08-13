import {RatingAndReviews} from '../models/RatingAndReviews.model.js';
import { ApiError } from '../utils/ApiErrors.js';   
import { course } from '../models/course.model.js';
import mongoose from 'mongoose';

export const createRatingAndReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { rating, review, courseId } = req.body;

        if (!courseId || rating == null || !review || !review.trim()) {
            return res.status(400).json({
                success: false,
                message: 'courseId, rating and review are required',
            });
        }

        const parsedRating = Number(rating);
        if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({
                success: false,
                message: 'rating must be a number between 1 and 5',
            });
        }

        const courseDetails = await course.findOne({
            _id: courseId,
            $or: [
                { studentsEnrolled: { $elemMatch: { $eq: userId } } },
                { studentEnrolled: { $elemMatch: { $eq: userId } } },
            ],
        });

        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: 'user not enrolled in course',
            });
        }

        const alreadyReviewed = await RatingAndReviews.findOne({
            user: userId,
            course: courseId,
        });

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: 'you have already reviewed this course',
            });
        }

        const ratingReview = await RatingAndReviews.create({
            rating: parsedRating,
            review: review.trim(),
            course: courseId,
            user: userId,
        });

        await course.findByIdAndUpdate(
            courseId,
            {
                $addToSet: {
                    ratingsAndReviews: ratingReview._id,
                },
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'rating and review submitted successfully',
            data: ratingReview,
        });
    } catch (error) {
        console.log('createRatingAndReview error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to submit review',
        });
    }
}


//get Average rating
export const getAverageRating = async (req, res) => {
    try {
        const courseId = req.params.id || req.query.courseId || req.body.courseId;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'courseId is required',
            });
        }

        let matchCourse;
        try {
            matchCourse = new mongoose.Types.ObjectId(courseId);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid courseId format',
            });
        }

        const result = await RatingAndReviews.aggregate([
            { $match: { course: matchCourse } },
            { $group: { _id: null, averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
        ]);

        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: Number(result[0].averageRating.toFixed(1)),
                reviewCount: result[0].reviewCount,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'No ratings yet for this course',
            averageRating: 0,
            reviewCount: 0,
        });
    } catch (error) {
        console.log('getAverageRating error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to fetch average rating',
        });
    }
}


//get all rating
export const getAllRatingAndReviews = async (req, res) => {
    try {
        const courseId = req.params.id || req.query.courseId;
        let query = {};

        if (courseId) {
            try {
                query.course = new mongoose.Types.ObjectId(courseId);
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid courseId format',
                });
            }
        }

        const allReviews = await RatingAndReviews.find(query)
            .sort({ createdAt: -1 })
            .populate({
                path: 'user',
                select: 'firstName lastName email image',
            })
            .populate({
                path: 'course',
                select: 'courseName',
            })
            .exec();

        return res.status(200).json({
            success: true,
            message: 'All reviews fetched successfully',
            data: allReviews,
        });
    } catch (error) {
        console.log('Review fetch error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Unable to fetch reviews',
            data: [],
        });
    }
}