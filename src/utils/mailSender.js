import { ApiError } from './ApiErrors.js'
import nodemailer from 'nodemailer'

const mailSender= async(email , title , body)=>{
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                password: process.env.MAIL_PASSWORD
            }
        })
        let info= await transporter.sendMail({
            from: 'StudyNotion || by Anurag',
            to:  `${email}`   ,
            subject: `${title}`   ,
            html: `${body}` ,

        })
        console.log(info)
        return info
    } catch (error) {
        throw new ApiError(500,"something went wrong")
    }
}


export{
    mailSender
}