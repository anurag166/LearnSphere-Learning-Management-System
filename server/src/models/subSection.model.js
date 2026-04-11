import mongoose,{Schema} from 'mongoose'

const subSectionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    timeDuration: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        reuired: true
    }
})

export const subSection= mongoose.model("subSection",subSectionSchema)