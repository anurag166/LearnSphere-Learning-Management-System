import { ApiError } from './ApiErrors.js'
import nodemailer from 'nodemailer'
import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'
dotenv.config()

const MAIL_SERVICE = (process.env.MAIL_SERVICE || 'smtp').toLowerCase()
const FROM = process.env.MAIL_FROM || process.env.MAIL_USER || 'StudyNotion <no-reply@studynotion.app>'

const buildHtml = (title, body) => ` <div style="font-family: Arial, sans-serif;">
    <h2>${title}</h2>
    <p>Hello,</p>
    <p>${body}</p>
    <br/>
    <p>Regards,<br/>StudyNotion Team</p>
</div>`

const mailSender = async (email, title, body) => {
    try {
        if (MAIL_SERVICE === 'sendgrid') {
            const apiKey = process.env.SENDGRID_API_KEY
            if (!apiKey) throw new ApiError(500, 'SendGrid API key not configured')
            sgMail.setApiKey(apiKey)
            const msg = {
                to: email,
                from: FROM,
                subject: title,
                html: buildHtml(title, body),
            }
            const res = await sgMail.send(msg)
            console.log('SendGrid send result:', res && res.length ? res[0].statusCode : res)
            return res
        }

        // Default: SMTP via Nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT || 587),
            secure: process.env.MAIL_SECURE === 'true',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            connectionTimeout: Number(process.env.MAIL_TIMEOUT_MS || 20000),
        })

        const info = await transporter.sendMail({
            from: FROM,
            to: email,
            subject: title,
            html: buildHtml(title, body),
        })

        console.log('SMTP send info:', info)
        return info
    } catch (error) {
        console.error('NODEMAILER ERROR ', error)
        throw new ApiError(500, error?.message || 'Failed to send mail')
    }
}

export { mailSender }