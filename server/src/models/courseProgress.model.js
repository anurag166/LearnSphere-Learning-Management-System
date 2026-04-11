import mongoose,{Schema} from 'mongoose'

const courseProgressSchema= new Schema({
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course'
    },
    completedVideos: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subSection'
    }

});



export const courseProgress=mongoose.model(courseProgress,"courseProgressSchema")