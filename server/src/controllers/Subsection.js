import { subSection } from "../models/subSection.model.js";
import { Section } from "../models/section.model.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";

//create subsection

export const createSubSection = async (req , res)=>{
    try {
        const {sectionId, title , timeDuration , description } = req.body;
        const video = req.files?.videoFile;
        if(!sectionId || !title || !timeDuration || !description|| !video){
            return res.status(400).json({
                success: false,
                message: "all fields are required"
            });
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
        ).populate("subSection");

        if (!updatedSection) {
            return res.status(404).json({
                success: false,
                message: "section not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Subsection created successfully',
            updatedSection
        })
    } catch (error) {
        return res.status(error?.statusCode || 500).json({
            success: false,
            message: error?.message || "failed to create subsection"
        });
    }
}


//update subSection

export const updateSubSection = async(req,res)=>{
    try {
        const {sectionId, title , timeDuration , description } = req.body;
        const {subSectionId} = req.body;
        const video = req.files?.videoFile;
        if(!sectionId || !title || !timeDuration || !description|| !video){
            return res.status(400).json({
                success: false,
                message: "all fields are required"
            });
        }
        if(!subSectionId){
            return res.status(400).json({
                success: false,
                message: 'no subsection exist'
            });

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
        const updatedSection = await Section.findById(sectionId).populate("subSection");

        if (!updateDetails || !updatedSection) {
            return res.status(404).json({
                success: false,
                message: "subsection or section not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Subsection updated successfully',
            updatedSection
        })

    } catch (error) {
        return res.status(error?.statusCode || 500).json({
            success: false,
            message: error?.message || "failed to update subsection"
        });
    }
}
//delete subSection

export const deleteSubSection = async (req ,res)=>{
    try {
        const {subSectionId,sectionId} = req.body
        if(!subSectionId){
            return res.status(400).json({
                success: false,
                message: 'no subsection found '
            });

        }
        await subSection.findByIdAndDelete(subSectionId);
        if (sectionId) {
            await Section.findByIdAndUpdate(sectionId, {
                $pull: { subSection: subSectionId }
            });
        }
        return res.status(200).json({
            success: true,
            message: 'subsection deleted successfully'
        })
    } catch (error) {
        return res.status(error?.statusCode || 500).json({
            success: false,
            message: error?.message || "failed to delete subsection"
        });
    }
}