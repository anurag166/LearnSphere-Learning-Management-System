import { User } from "../models/user.model.js";
import { otp } from "../models/otp.model.js";
import { profile } from "../models/profile.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { customAlphabet } from "nanoid";  // <-- nanoid import
import dotenv from "dotenv";
import jwt from 'jsonwebtoken'
import { mailSender } from "../utils/mailSender.js";
import bcrypt from 'bcrypt'
dotenv.config()
// Custom numeric-only OTP generator (6 digits)
const generateOTP = customAlphabet("1234567890", 6);

// send otp
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(400).json({
        success: false,
        message: 'user already exist'
      })
    }

    // Generate a unique 6-digit OTP
    const otpCode = generateOTP();
    console.log("OTP generated successfully:", otpCode);

    const otpPayload = { email, otp: otpCode };

    // Create OTP entry in DB
    const otpBody = await otp.create(otpPayload);
    console.log("OTP entry saved:", otpBody);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp: otpCode, // You’ll later send this via email/SMS instead
    });
  } catch (error) {
    console.error("Error while sending OTP:", error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Something went wrong on our side",
  });
  }
};




//sign up

export const signUp = async (req ,res )=>{
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            otp: enteredOtp
        }=req.body;
    
        //validatr
        if(!firstName||!lastName|| !email ||!password||!enteredOtp||!confirmPassword){
            throw new ApiError(403,"all fields are required")
        }
    
        //check if user exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            console.log("user already reg")
            throw new ApiError(400,"user already registered")
        }
        //otp recent stored
        const recentOtp = await otp.findOne({email}).sort({createdAt: -1})
        if(!recentOtp){
            throw new ApiError(400,"otp not found")
    
        }
        else if(enteredOtp!=recentOtp.otp){
            throw new ApiError(401,"otp not matched")
        }
    
        //hash password
        const hashPassword = await bcrypt.hash(password,10);
    
        //create entry
        
    
        const profileDetails = await profile.create({
            gender: null,
            dob: new Date("2000-01-01"),
            about: null,
            contactNumber: "0000000000"
        })
        const user= await User.create({
            firstName,
            lastName,
            email,
            password: hashPassword,
            accountType,
            additionalDetails: profileDetails._id,
            profileImage: `http://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })
        console.log(user)
        return res.status(200).json({
            success:true,
            message: 'user registered successfully',
            user
        })
    } catch (error) {
       console.error("SIGNUP REAL ERROR ", error);
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "User cannot be registered",
  });
    }
     
}

//login

export const login = async(req , res)=>{
    try {
        //get data from req body

        const {email,password}= req.body;
        if(!email||!password){
            throw new ApiError(400,"all fields are required")
        }

        //user check exists or not
        const user=await User.findOne({email}).populate("additionalDetails")
        if(!user){
            throw new ApiError(400,'user does not exist')
        }
        //generate jwt, after password matching
        if(await bcrypt.compare(password,user.password)){
            const payload = {
                email : user.email,
                id: user._id,
                accountType: user.accountType

            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2d"
            })
            user.token=token
            user.password=password
        
        //create cookie and send response
        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly: true,
        }
        res.cookie("token",token,options).status(200).json({
            success:true,
            token,
            user
        })
        } 
        else{
            throw new ApiError(400,"password is incorrect")
        }

    } catch (error) {
        console.log("login error")
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Login failed",
        });
    }
}

// reset password

export const changePass=async (req , res)=>{
    try {
        const{oldpassword,newPassword,confirmPassword}=req.body
        if(!oldpassword||!newPassword||!confirmPassword){
            throw new ApiError(400,"some fields are missing")
        }
        if(newPassword!=confirmPassword){
            throw new ApiError(400,"password didn't matched")
        }
        const userId= req.user?._id
        if(!userId){
            throw new ApiError(400,"user not authenticated")
        }
        const user= await User.findById(userId)
        if(!user){
            throw new ApiError(400,"user not found")
        }
        const isMatch = await bcrypt.compare(oldpassword,user.password)
        if(!isMatch){
            throw new ApiError(400,"old password does not match with entered")
        }
        const isSameAsOld = await bcrypt.compare(newPassword, user.password);
        if(isSameAsOld){
            throw new ApiError(400,"new password can not be same as old password")
        }
    
        user.password= await bcrypt.hash(newPassword,10)
        await user.save();
        try {
            await mailSender(user.email, "Password changed", "Your password was changed successfully.");
        } catch (mailErr) {
            throw new ApiError(500,"something went wrong while sending the mail")
        }
        return res.status(200).json({message:"password changed successfully"});
    
    } catch (error) {
        throw new ApiError(500,"something went wrong while changing the password")
    }
}