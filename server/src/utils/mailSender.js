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

const sendViaMailjet = async (email, title, body) => {
    const apiKey = process.env.MAILJET_API_KEY
    const apiSecret = process.env.MAILJET_API_SECRET
    if (!apiKey || !apiSecret) {
        throw new ApiError(500, 'Mailjet configuration missing. Set MAILJET_API_KEY and MAILJET_API_SECRET.')
    }

    if (typeof fetch !== 'function') {
        throw new ApiError(500, 'Fetch API is not available in this Node runtime. Please use Node 18+ or install a fetch polyfill.')
    }

    const payload = {
        Messages: [
            {
                From: {
                    Email: FROM.match(/<(.+)>/)?.[1] || FROM,
                    Name: FROM.split(' <')[0],
                },
                To: [{ Email: email }],
                Subject: title,
                HTMLPart: buildHtml(title, body),
            },
        ],
    }

    const response = await fetch('https://api.mailjet.com/v3.1/send', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    const responseBody = await response.text()
    if (!response.ok) {
        console.error('Mailjet send failed:', response.status, responseBody)
        throw new ApiError(response.status, `Mailjet send failed: ${response.status} ${responseBody}`)
    }

    console.log('Mailjet send succeeded:', response.status)
    return { provider: 'mailjet', status: response.status }
}

const isMailjetConfigured = Boolean(process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET)

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
        const mailService = (process.env.MAIL_SERVICE || '').toLowerCase().trim()
        console.log('Using mail service:', mailService || 'default')
        console.log('Mailjet configured:', isMailjetConfigured)

        if (mailService === 'mailjet' || (isMailjetConfigured && mailService !== 'smtp')) {
            return await sendViaMailjet(email, title, body)
        }

        if (mailService === 'smtp') {
            return await sendViaSmtp(email, title, body)
        }

        if (isMailjetConfigured) {
            return await sendViaMailjet(email, title, body)
        }

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