import Razorpay from "razorpay";
import {instance} from "../config/razorpay"
import {course} from "../models/course.model"
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiErrors";
import {mailSender} from "../utils/mailSender"



//capture the pyment and initiate the razorpay order
export const capturePayment = async(req , res)=>{
    //get courseid nd userid
    const {course_id}=req.body;
    const userId = req.user.id;

    //validation
    //valid courseid
    if(!course_id){
        throw new ApiError(400,'please provide valid course id')
    }
    //valid courseDetails
    let course;
    try {
        course = await course.findById(course_id);
        if(!course){
            throw new ApiError(400,'could not find the course')

        }
        //user already pay for samecourse
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentEnrolled.included(uid)){
            throw new ApiError(400,'already purchased the course')
        }
    } catch (error) {
        console.log(error);
        throw new ApiError(500,error.message)
    }
    
    //order create
    const amount = course.price;
    const currency = "INR";
    const options = {
        amount: amount*100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId: course_id,
            userId,
        }
    };
    try {
       //initiate the payment using razorpay
       const paymentResponse = await instance.orders.create(options);
       console.log(paymentResponse);
       return res.status({
        success: true,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        thumbnail: course.thumbnail,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount
       })
    } catch (error) {
        console.log(error)
        throw new ApiError(500,'could not initiate order')
    }
    

}


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
