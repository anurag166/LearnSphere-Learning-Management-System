import mongoose,{Schema} from 'mongoose'

const RatingAndReviewsSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course'
    },
    rating: {
        type: Number
    },
    review: {
        type: String,
    }
})

export const RatingAndReviews= mongoose.model("RatingAndReviews",RatingAndReviewsSchema)