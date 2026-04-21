import { profile } from "../models/profile.model.js";
import {User} from "../models/user.model.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";


export const updateProfile = async(req , res)=>{
    try {
        const {
            dateOfBirth,
            dob,
            about,
            contactNumber,
            gender,
        } = req.body || {};

        const userId = req.user?.id || req.user?._id;
        if(!userId){
            return res.status(400).json({
                success: false,
                message: 'user id is required'
            })
        }

        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: 'user not found'
            })
        }
        const profileId =  userDetails.additionalDetails;
        const profileDetails = await profile.findById(profileId);
        if (!profileDetails) {
            return res.status(404).json({
                success: false,
                message: 'profile not found'
            })
        }

        const resolvedDob = (dob || dateOfBirth || "").trim();
        const nextGender = typeof gender === "string" ? gender.trim() : "";
        const nextContact = typeof contactNumber === "string" ? contactNumber.trim() : "";
        const nextAbout = typeof about === "string" ? about : undefined;

        if (resolvedDob) {
            profileDetails.dob = resolvedDob;
        }

        if (nextGender) {
            profileDetails.gender = nextGender;
        }

        if (nextContact) {
            profileDetails.contactNumber = nextContact;
        }

        if (typeof nextAbout === "string") {
            profileDetails.about = nextAbout;
        }

        await profileDetails.save();

        return res.status(200).json({
            success: true,
            message: 'profile updated successfully',
            profileDetails
        })
    } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'error in updating profile'
            })
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
        const userDetails = await User.findById(id)
            .populate("additionalDetails")
            .populate("courses");

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: 'user not found'
            });
        }

        const normalizedCourses = Array.isArray(userDetails.courses)
            ? userDetails.courses
            : (userDetails.courses ? [userDetails.courses] : []);

        const userPayload = userDetails.toObject();
        userPayload.courses = normalizedCourses;

        return res.status(200).json({
            success: true,
            message: 'user details fetched successfully',
            data: userPayload,

        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'failed to fetch user details'
        });
    }
}

export const updateDisplayPicture = async (req, res) => {
    try {
        const userId = req.user.id;
        const displayPicture =
            req.files?.displayPicture ||
            req.files?.profileImage ||
            req.files?.file;

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