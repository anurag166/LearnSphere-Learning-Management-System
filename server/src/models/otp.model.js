import mongoose,{Schema} from 'mongoose'
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

async function sendVerificationMail(email, otp) {
    if (process.env.SKIP_OTP_EMAIL === "true") {
        console.log("Skipping OTP email delivery because SKIP_OTP_EMAIL=true");
        return false;
    }

    try {
        await mailSender(email, "Verification email from StudyNotion", otp);
        console.log("email sent successfully");
        return true;
    } catch (error) {
        console.warn("OTP email could not be sent; continuing without blocking signup:", error?.message || error);
        return false;
    }
}

otpSchema.pre("save", async function (next) {
    try {
        await sendVerificationMail(this.email, this.otp);
    } catch (error) {
        console.warn("OTP pre-save hook failed:", error?.message || error);
    }
    next();
})

export const otp= mongoose.model("otp",otpSchema)