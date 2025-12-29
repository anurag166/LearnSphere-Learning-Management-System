import mongoose,{modelNames, Schema} from 'mongoose'

const tagsSchema = new Schema({
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

export const tags= mongoose.model(tags,"tagSchema")