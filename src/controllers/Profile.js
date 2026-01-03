import { profile } from "../models/profile.model";
import {User} from "../models/user.model";
import { ApiError } from "../utils/ApiErrors";


export const updateProfile = async(req , res)=>{
    try {
        //get data
        const {dateOfBirth="",about="",contactNumber,gender}=req.body;

        //get Userid
        const {userId} = req.user.id;
        //validation
        if(!contactNumber || !gender || !userId){
            throw new ApiError(400,'all fields are required')
        }
        //find profile
        const userDetails = await User.findById(id);
        const profileId =  userDetails.additionDetails;
        const profileDetails = await profile.findById(profileId);
        //update profile
        profileDetails.dateOfBirth=dateOfBirth
        profileDetails.about=about
        profileDetails.gender=gender
        profileDetails.contactNumber=contactNumber
        await profileDetails.save();
        //return response
        return res.status({
            success: true,
            message: 'profile updated successfully',
            profileDetails
        })
    } catch (error) {
        throw new ApiError(500,'something went wrong while updating the profile')
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
        throw new ApiError(500,'something went wrong while deleting the account')
    }
}

export const getAllUserDetails = async(req , res)=>{
    try {
        const id = req.user.id;
        const userDetails = await User.findById(id).populate("additionalDetails")
        return res.status({
            success: true,
            message: 'user details fetched successfully',

        })
    } catch (error) {
        throw new ApiError(500,'user details not found')
    }
}