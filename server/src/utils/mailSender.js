import { ApiError } from './ApiErrors.js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const FROM = process.env.MAIL_FROM || process.env.MAIL_USER || 'StudyNotion <no-reply@studynotion.app>'

const buildHtml = (title, body) => ` <div style="font-family: Arial, sans-serif;">
    <h2>${title}</h2>
    <p>Hello,</p>
    <p>${body}</p>
    <br/>
    <p>Regards,<br/>StudyNotion Team</p>
</div>`

const sendViaSmtp = async (email, title, body) => {
    const requiredMailVars = ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USER', 'MAIL_PASS']
    const missingMailVars = requiredMailVars.filter((key) => !process.env[key])
    if (missingMailVars.length > 0) {
        throw new ApiError(500, `Missing SMTP configuration: ${missingMailVars.join(', ')}`)
    }

    const mailOptions = {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT || 587),
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
        connectionTimeout: Number(process.env.MAIL_TIMEOUT_MS || 20000),
    }

    console.log('Attempting SMTP connection with:', {
        host: mailOptions.host,
        port: mailOptions.port,
        secure: mailOptions.secure,
        timeoutMs: mailOptions.connectionTimeout,
    })

    const transporter = nodemailer.createTransport(mailOptions)
    const info = await transporter.sendMail({
        from: FROM,
        to: email,
        subject: title,
        html: buildHtml(title, body),
    })

    console.log('SMTP send info:', info)
    return info
}

const mailSender = async (email, title, body) => {
    try {
        const requiredMailVars = ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USER', 'MAIL_PASS']
        const missingMailVars = requiredMailVars.filter((key) => !process.env[key])
        if (missingMailVars.length > 0) {
            throw new ApiError(500, `Missing SMTP configuration: ${missingMailVars.join(', ')}`)
        }

        console.log('Using mail service: smtp')
        return await sendViaSmtp(email, title, body)
    } catch (error) {
        console.error('MAIL SENDER ERROR ', error)
        if (error?.code === 'ETIMEDOUT' || error?.message?.includes('timed out')) {
            throw new ApiError(500, 'SMTP connection timed out. Check MAIL_HOST, MAIL_PORT, and any outbound firewall/network rules.')
        }
        throw new ApiError(500, error?.message || 'Failed to send mail')
    }
}

export { mailSender }