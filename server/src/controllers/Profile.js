import { profile } from "../models/profile.model.js";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";


export const updateProfile = async(req , res)=>{
    try {
        //get data
        const {dateOfBirth="",about="",contactNumber,gender}=req.body;

        //get Userid
        const userId = req.user.id;
        //validation
        if(!contactNumber || !gender || !userId){
            throw new ApiError(400,'all fields are required')
        }
        //find profile
        const userDetails = await User.findById(userId);
        const profileId =  userDetails.additionalDetails;
        const profileDetails = await profile.findById(profileId);
        console.log("User ID:", userId);
console.log("Profile ID:", profileId); 
        //update profile
        profileDetails.dateOfBirth=dateOfBirth
        profileDetails.about=about
        profileDetails.gender=gender
        profileDetails.contactNumber=contactNumber
        await profileDetails.save();
        //return response
        return res.status(200).json({
            success: true,
            message: 'profile updated successfully',
            profileDetails
        })
    } catch (error) {
      console.log('error in updating profile')
      throw new ApiError(500,error.message)
    }
}


//deleteAccount

export const deleteAccount = async(req , res)=>{
    try {
        //get id
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            throw new ApiError(400,'user not found')
        }
        //delete profile
        await profile.findByIdAndDelete({_id:userDetails.additionDetails})
        //user delete
        await User.findByIdAndDelete({_id:id})
        //return response
        return res.status({
            success: true,
            message: 'account deleted successfully',

        })
    } catch (error) {
        console.log("error in delete profile")
        throw new ApiError(500,error.message)
    }
}

export const getAllUserDetails = async(req , res)=>{
    try {
        const id = req.user.id;
        const userDetails = await User.findById(id).populate("additionalDetails")
        return res.status(200).json({
            success: true,
            message: 'user details fetched successfully',
            data: userDetails,

        })
    } catch (error) {
        throw new ApiError(500,error.message)
    }
}

export const updateDisplayPicture = async (req, res) => {
    try {
        const userId = req.user.id;
        const displayPicture = req.files?.displayPicture;

        if (!displayPicture) {
            return res.status(400).json({
                success: false,
                message: "displayPicture file is required",
            });
        }

        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME || "LearnSphere"
        );

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profileImage: image.secure_url },
            { new: true }
        ).populate("additionalDetails");

        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update profile picture",
        });
    }
};