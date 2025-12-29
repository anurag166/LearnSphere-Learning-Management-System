import mongoose,{Schema} from 'mongoose'

const courseSchema = new Schema({
    courseName: {
        type: String,
        required: true,
    },
    courseDescription: {
        type: String,
        required: true,
    },
    instrutor: {
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
    tag: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tags'
    },
    studentEnrolled:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,

    }
]

})

export const course= mongoose.model(course,"courseSchema")