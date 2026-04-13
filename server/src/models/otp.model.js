import mongoose,{Schema} from 'mongoose'
import { ApiError } from '../utils/ApiErrors.js'
import { mailSender } from '../utils/mailSender.js'
const otpSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5*60,
    }
},{timestamps: true})

async function sendVerificationMail(email,otp){
    try {
        const mailResponse = await mailSender(email,"Verification email from StudyNotion",otp);
        console.log("email sent successfully")

    } catch (error) {
        console.error("REAL MAIL ERROR ", error);
        throw new ApiError(500,error.message)
    }
}

otpSchema.pre("save",async function (next) {
    await sendVerificationMail(this.email,this.otp);
    next();
})
export const otp= mongoose.model("otp",otpSchema)