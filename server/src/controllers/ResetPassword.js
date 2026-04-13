import { User } from "../models/user.model.js";
//import { JsonWebToken } from "jsonwebtoken";
import crypto from 'crypto';
import { mailSender } from "../utils/mailSender.js";
import bcrpt from 'bcrypt';
import { ApiError } from "../utils/ApiErrors.js";
export const ResetPasswordToken = async(req , res)=>{
    try {
        const {email} = req.body
        if(!email){
            throw new ApiError(400,'Email is invalid')
        }
        const user = await User.findOne({email});
        if(!user){
            throw new ApiError(400,'User not found');
        }
        const token = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken=token
        user.resetPasswordExpires = Date.now() + 5*60*1000;
        await user.save();
        console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        await mailSender(user.email,
            "Reset Password",
             `Click the link below to reset your password:\n\n${resetUrl}\n\nThis link is valid for 5 minutes.`);

         return res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });

    } catch (error) {
        throw new ApiError(500,'error while generating reset token')
    }
}

export const resetPassword = async (req,res)=>{
    try {
        const{token,password,confirmPassword} = req.body
        if(!token || !password || !confirmPassword){
            throw new ApiError(400,'all fields are required');
        }
        if (password !== confirmPassword) {
      throw new ApiError(400, "Passwords do not match");
    }
     const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
     });

     if(!user){
        throw new ApiError(400,'token expired or invalid');
     }
     user.password =await bcrpt.hash(password,10);
     user.resetPasswordToken = undefined;
     user.resetPasswordExpires = undefined;
     await user.save();
     return res.status(200).json({
        success: true,
        message: 'password reset successfully',

     })
    } catch (error) {
        throw new ApiError(500,error.message)
    }
}