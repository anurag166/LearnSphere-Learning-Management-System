import {Section} from '../models/section.model.js'
import { course } from '../models/course.model.js'
import { ApiError } from '../utils/ApiErrors.js';

export const createSection = async (req , res)=>{
    try {
        //data fetch
        const {sectionName,courseId}=req.body;
        //data validation
        if(!sectionName || !courseId){
            throw new ApiError(400,"all fields are required");
        }
        //create section
        const newSection = await Section.create({sectionName});
        //update course with section objectId
        const updateCourse = await course.findByIdAndUpdate(
                                                 courseId,
                                                 {
                                                    $push:{
                                                        courseContent: newSection._id,
                                                    }
                                                 },
                                                 {new: true}
        )
        //return response
        return res.status(200).json({
            success: true,
            message: "section created successfully",
            updateCourse,
            newSection
        })
    } catch (error) {
        throw new ApiError(500,'unable to create section')
    }
}



//update section
export const updateSection = async(req , res)=>{
    try {
        const {sectionName,sectionId} = req.body;
        if(! sectionName || !sectionId){
            throw new ApiError(400,"all fields are required");
        }
        
        if(!sectionName || !sectionId){
                throw new ApiError(400,"all fields are required");
            }
        
        const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new: true});
    
        return res.status(200).json({
            success: true,
            message: 'section updated successfully'
        })
    } catch (error) {
        throw new ApiError(500,'error occured while updating the section');
        
    }
    
}

export const deleteSection = async(req , res)=>{
    try {
        const {sectionId} = req.params;
        const courseId = req.body?.courseId || req.query?.courseId;

        await Section.findByIdAndDelete(sectionId);

        // Remove the section reference from the parent course
        if (courseId) {
            await course.findByIdAndUpdate(courseId, {
                $pull: { courseContent: sectionId }
            });
        }

        return res.status(200).json({
            success: true,
            message: 'section deleted successfully'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'some error occurred while deleting the section'
        });
    }
}