import { subSection } from "../models/subSection.model.js";
import { Section } from "../models/section.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";

//create subsection

export const createSubSection = async (req , res)=>{
    try {
        const {sectionId, title , timeDuration , description } = req.body;
        const video = req.files.videoFile;
        if(!sectionId || !title || !timeDuration || !description|| !video){
            throw new ApiError(400,"all fields are required");
        }

        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME)

        const subSectionDetails = await subSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url,
        })
        console.log(subSectionDetails._id)
        const updatedSection = await Section.findByIdAndUpdate({_id: sectionId},
            {$push:{
                subSection: subSectionDetails._id,
            }},
            {new: true}
        );

        return res.status(200).json({
            success: true,
            message: 'Subsection created successfully',
            updatedSection
        })
    } catch (error) {
        throw new ApiError(500,error.message)
    }
}


//update subSection

export const updateSubSection = async(req,res)=>{
    try {
        const {sectionId, title , timeDuration , description } = req.body;
        const {subSectionId} = req.body;
        const video = req.files.videoFile;
        if(!sectionId || !title || !timeDuration || !description|| !video){
            throw new ApiError(400,"all fields are required");
        }
        if(!subSectionId){
            throw new ApiError(400,'no subsection exist')

        }
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME)
        const updateDetails = await subSection.findByIdAndUpdate(subSectionId,{
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url,
        }
    ,
  { new: true })
        const updatedSection = await Section.findByIdAndUpdate({_id: sectionId},
            {$push:{
                subSection: updateDetails._id,
            }},
            {new: true}
        );

        return res.status(200).json({
            success: true,
            message: 'Subsection updated successfully',
            updatedSection
        })

    } catch (error) {
        throw new ApiError(500,error.message)
    }
}
//delete subSection

export const deleteSubSection = async (req ,res)=>{
    try {
        const {subSectionId,sectionId} = req.body
        if(!subSectionId){
            throw new ApiError(400,'no subsection found ')

        }
        await subSection.findByIdAndDelete(subSectionId);
        return res.status(200).json({
            success: true,
            message: 'subsection deleted successfully'
        })
    } catch (error) {
        throw new ApiError(500,error.message)
    }
}