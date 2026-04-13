import { ApiError } from './ApiErrors.js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()
const mailSender= async(email , title , body)=>{
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })
        let info= await transporter.sendMail({
            from: 'StudyNotion || by Anurag',
            to:  `${email}`   ,
            subject: `${title}`   ,
            html: ` <div style="font-family: Arial, sans-serif;">
      <h2>${title}</h2>
      <p>Hello,</p>
      <p>Your One-Time Password (OTP) is:</p>
      <h1 style="color: #4F46E5;">${body}</h1>
      <p>This OTP is valid for <b>5 minutes</b>.</p>
      <br/>
      <p>Regards,<br/>StudyNotion Team</p>
    </div>` ,

        })
        console.log(info)
        return info
    } catch (error) {
        console.error("NODEMAILER ERROR ", error);
        throw new ApiError(500,error.message)
    }
}


export{
    mailSender
}