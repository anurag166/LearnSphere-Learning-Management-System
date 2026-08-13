import { ApiError } from './ApiErrors.js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const FROM = process.env.MAIL_FROM || process.env.MAIL_USER || 'LearnSphere <no-reply@learnsphere.app>'

const buildHtml = (title, body) => `
<div style="margin:0; padding:32px 16px; background-color:#f4f5f7; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; margin:0 auto; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <tr>
      <td style="background-color:#1a1a2e; padding:24px 32px; text-align:center;">
        <span style="font-size:20px; font-weight:700; color:#ffffff; letter-spacing:0.5px;">Learn<span style="color:#f2994a;">Sphere</span></span>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <h2 style="margin:0 0 16px; font-size:20px; color:#1a1a2e;">${title}</h2>
        <p style="margin:0 0 20px; font-size:15px; color:#4a4a4a; line-height:1.6;">Hello,</p>
        <div style="margin:0 0 24px; padding:16px; background-color:#f4f5f7; border-radius:8px; text-align:center;">
          <span style="font-size:24px; font-weight:700; letter-spacing:4px; color:#1a1a2e;">${body}</span>
        </div>
        <p style="margin:0; font-size:13px; color:#999999; line-height:1.5;">
          This code expires shortly. If you didn't request this, you can safely ignore this email.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color:#fafafa; padding:20px 32px; text-align:center;">
        <p style="margin:0; font-size:12px; color:#aaaaaa;">Regards,<br/>LearnSphere Team</p>
      </td>
    </tr>
  </table>
</div>`

const sendViaSmtp = async (email, title, body) => {
    // Require host/user/pass. MAIL_PORT is optional and defaults to 587.
    const requiredMailVars = ['MAIL_HOST', 'MAIL_USER', 'MAIL_PASS']
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
        const requiredMailVars = ['MAIL_HOST', 'MAIL_USER', 'MAIL_PASS']
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