import mongoose,{Schema} from 'mongoose'

const RatingAndReviewsSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rating: {
        type: Number
    },
    review: {
        type: String,
    }
})

export const RatingAndReviews= mongoose.model(RatingAndReviews,"RatingAndReviewsSchema")