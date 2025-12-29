import mongoose,{Schema} from 'mongoose'

const profileSchema = new Schema({
    gender: {
        type: String
    },
    dob: {
        type: String,
        required: true
    },
    about: {
        type: String 
    },
    contactNumber: {
        type: String,
        required: true
    }
})

export const profile= mongoose.model(profile,"profileSchema")