import {ApiError} from "../utils/ApiErrors.js"
//import { tags } from "../models/tags.model.js";
import { category } from "../models/category.model.js";

export const createCategory = async(req , res)=>{
    try {
        const {name,description} = req.body;
        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: "Name and description are required"
            });
        }

        // Check if category already exists
        const existing = await category.findOne({ name: name.toLowerCase() });
        if(existing){
            return res.status(400).json({
                success: false,
                message: "Category already exists"
            });
        }

        const categoryDetails = await category.create({
            name: name,
            description: description
        });
        console.log(categoryDetails);

        return res.status(200).json({
            success: true,
            message: "Category created successfully",
            data: categoryDetails
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error creating category: " + error.message
        });
    }
};


//getAlltags handler function

export const showAllCategory = async(req,res)=>{
    try {
       const allCategory = await category.find({},{name: true, description: true});
       return res.status(200).json({
        success: true,
        message: "All categories returned successfully",
        allCategory,
       })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error fetching categories: " + error.message
        });
    }
}