import mongoose,{Schema} from 'mongoose'

const RatingAndReviewsSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    review: {
        type: String,
        required: true,
        trim: true,
    }
}, { timestamps: true })

export const RatingAndReviews= mongoose.model("RatingAndReviews",RatingAndReviewsSchema)