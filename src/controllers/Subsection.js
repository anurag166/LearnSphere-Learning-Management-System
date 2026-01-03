import { subSection } from "../models/subSection.model";
import { Section } from "../models/section.model";
import { ApiError } from "../utils/ApiErrors";
import { uploadImageToCloudinary } from "../utils/imageUploader";

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

        const updatedSection = await Section.findByIdAndUpdate({_id: sectionId},
            {$push:{
                subSection: subSectionDetails._id,
            }},
            {new: true}
        );

        return res.status({
            success: true,
            message: 'Subsection created successfully',
            updatedSection
        })
    } catch (error) {
        throw new ApiError(500,'something went wrong while creating subSection')
    }
}


//update subSection

//delete subSection