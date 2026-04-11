import Razorpay from "razorpay";
import {instance} from "../../config/razorpay.js";
import {course} from "../models/course.model.js"
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import crypto from "crypto";
import { ApiError } from "../utils/ApiErrors.js";
import {mailSender} from "../utils/mailSender.js"



//capture the pyment and initiate the razorpay order
export const capturePayment = async(req , res)=>{
    try {
        //get courseid nd userid
        const {course_id, courseId}=req.body;
        const actualCourseId = courseId || course_id;
        const userId = req.user.id;

        //validation
        //valid courseid
        if(!actualCourseId){
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid course ID'
            });
        }
        //valid courseDetails
        let courseData;
        try {
            courseData = await course.findById(actualCourseId);
        } catch (dbErr) {
            console.log('Course lookup error:', dbErr.message);
            return res.status(404).json({
                success: false,
                message: 'Could not find the course. Invalid course ID.'
            });
        }
        
        if(!courseData){
            return res.status(404).json({
                success: false,
                message: 'Could not find the course'
            });
        }
        
        //user already pay for samecourse
        const uid = new mongoose.Types.ObjectId(userId);
        const enrolledStudents = courseData.studentEnrolled || courseData.studentsEnrolled || [];
        if (Array.isArray(enrolledStudents) && enrolledStudents.includes(uid)){
            return res.status(400).json({
                success: false,
                message: 'You have already purchased this course'
            });
        }
        
        //order create
        const amount = courseData.price;
        const currency = "INR";
        const options = {
            amount: amount*100,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes: {
                courseId: actualCourseId,
                userId,
            }
        };
        try {
           //initiate the payment using razorpay
           const paymentResponse = await instance.orders.create(options);
           console.log(paymentResponse);
           return res.status(200).json({
            success: true,
            key: process.env.RAZORPAY_KEY,
            order_id: paymentResponse.id,
            courseName: courseData.courseName,
            courseDescription: courseData.courseDescription,
            thumbnail: courseData.thumbnail,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount
           })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                message: 'Error initializing payment: ' + error.message
            });
        }
    } catch (error) {
        console.log('Payment capture error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error processing payment: ' + error.message
        });
    }

}

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            courseId,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification details",
            });
        }

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        const enrolledCourse = await course.findByIdAndUpdate(
            courseId,
            { $addToSet: { studentEnrolled: req.user.id } },
            { new: true }
        );

        if (!enrolledCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { courses: courseId } },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Payment verified and course added",
        });
    } catch (error) {
        console.log("verifyPayment error:", error);
        return res.status(500).json({
            success: false,
            message: "Error verifying payment: " + error.message,
        });
    }
};


//verify signature
export const verifySignature = async(req , res)=>{
    const webhookSecret = "12345678";
    const signature = req.headers["x-razorpay-signature"];
    const shasum=crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");
    
    if(digest===signature){
        console.log("payment is authorised");

        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try {
            //fulfill the action
            //find the course and eroll student in it
            const enrolledCourse = await course.findOneAndUpdate(
                {_id: courseId},
                {$push:{studentEnrolled: userId}},
                {new: true},

            );
            if(!enrolledCourse){
                throw new ApiError(500,'course not found');
            }
            console.log(enrolledCourse);
            //find the student and add the course in list of enrolled courses
            const enrolledStudent = await User.findOneAndUpdate(
                {_id: userId},
                {$push:{ courses:courseId}},
                {new: true},
            );
            console.log(enrolledStudent);
            //mail send for confirmation
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "COngratulation !!!",
                "Congratulation , you are enrolled into new course",

            );
            console.log(emailResponse);
            return res.status({
                success: true,
                message: "Signature verified and course added",

            })
        } catch (error) {
            throw new ApiError(500,error.message)
        }
    }

    else{
        throw new ApiError(400,'Invalid request')
    }

}
