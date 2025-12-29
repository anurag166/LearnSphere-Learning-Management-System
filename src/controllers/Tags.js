import {ApiError, ApiErrors} from "../utils/ApiErrors.js"
import { tags } from "../models/tags.model";

export const createTags = async(req , res)=>{
    try {
        const {name,desrciption} = req.body;
        if(!name || !desrciption){
            throw new ApiError(400,"All fields are required")
        }

        const tagDetails = await tags.create({
            name: name,
            desrciption: desrciption
        });
        console.log(tagDetails);

        return res.status(200).json({
            success: true,
            message: "Tag created successfully"
        })
    } catch (error) {
        return new ApiError(500,"Something went wrong while creating tag")
    }
};


//getAlltags handler function

export const showAlltags = async(req,res)=>{
    try {
       const allTags = await tags.find({},{name: true,desrciption: true});
       res.status(200).json({
        success: true,
        message: "All tags returned successfully",
        allTags,
       })
    } catch (error) {
         throw new ApiError(500,"something went wrong while creating tags")
    }
}