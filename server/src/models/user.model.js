import mongoose,{Schema} from 'mongoose'

const userSchema = new Schema ({
    firstName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    lastName: {
        type: String,
        required: true,

    },
    password: {
        type: String,
        required: [true,'Password is required']
    },
    confirmPassword:{
        type: String,
    },
    accountType: {
        type: String,
        required: true,
        enum: ['Student','Instructor','Admin']
    },
    additionalDetails:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "profile"
    },
    courses: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course"
    },
    courseProgress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courseProgress"
    },
    profileImage: {
        type: String,
        required: true
    },
    resetPasswordToken: {
    type: String,
},
resetPasswordExpires: {
    type: Date,
},
})

export const User= mongoose.model("User",userSchema)