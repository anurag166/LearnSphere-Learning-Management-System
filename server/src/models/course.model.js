import mongoose,{Schema} from 'mongoose'
import { category } from './category.model.js'

const courseSchema = new Schema({
    courseName: {
        type: String,
        required: true,
    },
    courseDescription: {
        type: String,
        required: true,
    },
    instructor: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseContent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'section'
    },
    whatWillYouLearn: {
        type: String,
    },
        tag: [
            {
                type: String,
                trim: true,
            },
        ],
        instructions: [
            {
                type: String,
                trim: true,
            },
        ],
        level: {
            type: String,
            default: "Beginner",
        },
        language: {
            type: String,
            default: "English",
        },
        introVideoUrl: {
            type: String,
        },
    RatingandReviews: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'RatingAndReviews'
    },
    price: {
        type: Number,
        required: true
    },
    thumbnail: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    studentEnrolled:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,

    }
]

})

export const course= mongoose.model("course",courseSchema)