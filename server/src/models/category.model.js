import mongoose,{modelNames, Schema} from 'mongoose'

const categorySchema = new Schema({
    name:{
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course'
    }
})

export const category= mongoose.model("category",categorySchema)