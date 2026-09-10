import { ApiError } from "./ApiErrors.js";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const FROM =
  process.env.MAIL_FROM ||
  process.env.GMAIL_USER ||
  "LearnSphere <no-reply@learnsphere.app>";


// --------------------------------------------------
// Build HTML Email
// --------------------------------------------------

const buildHtml = (title, body) => `
<div style="margin:0; padding:32px 16px; background-color:#f4f5f7; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
    style="max-width:480px; margin:0 auto; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">

    <tr>
      <td style="background-color:#1a1a2e; padding:24px 32px; text-align:center;">
        <span style="font-size:20px; font-weight:700; color:#ffffff; letter-spacing:0.5px;">
          Learn<span style="color:#f2994a;">Sphere</span>
        </span>
      </td>
    </tr>

    <tr>
      <td style="padding:32px;">

        <h2 style="margin:0 0 16px; font-size:20px; color:#1a1a2e;">
          ${title}
        </h2>

        <p style="margin:0 0 20px; font-size:15px; color:#4a4a4a; line-height:1.6;">
          Hello,
        </p>

        <div style="margin:0 0 24px; padding:16px; background-color:#f4f5f7; border-radius:8px; text-align:center;">
          <span style="font-size:24px; font-weight:700; letter-spacing:4px; color:#1a1a2e;">
            ${body}
          </span>
        </div>

        <p style="margin:0; font-size:13px; color:#999999; line-height:1.5;">
          This code expires shortly. If you didn't request this, you can safely ignore this email.
        </p>

      </td>
    </tr>

    <tr>
      <td style="background-color:#fafafa; padding:20px 32px; text-align:center;">
        <p style="margin:0; font-size:12px; color:#aaaaaa;">
          Regards,<br/>LearnSphere Team
        </p>
      </td>
    </tr>

  </table>

</div>
`;


// --------------------------------------------------
// Gmail OAuth2 Client
// --------------------------------------------------

const requiredVars = [
  "GMAIL_USER",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
];

const missingVars = requiredVars.filter(
  (key) => !process.env[key]
);

if (missingVars.length > 0) {
  console.error(
    `Missing Gmail OAuth configuration: ${missingVars.join(", ")}`
  );
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({
  version: "v1",
  auth: oauth2Client,
});


// --------------------------------------------------
// Convert email to Base64URL
// --------------------------------------------------

const makeRawMessage = ({
  from,
  to,
  subject,
  html,
}) => {

  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    html,
  ].join("\r\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};


// --------------------------------------------------
// Send Email Using Gmail API
// --------------------------------------------------

const sendViaGmail = async (email, title, body) => {

  if (missingVars.length > 0) {
    throw new ApiError(
      500,
      `Missing Gmail OAuth configuration: ${missingVars.join(", ")}`
    );
  }

  console.log("Attempting Gmail API email:", {
    from: FROM,
    to: email,
  });

  const html = buildHtml(title, body);

  const raw = makeRawMessage({
    from: FROM,
    to: email,
    subject: title,
    html,
  });

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
    },
  });

  console.log("Gmail API email sent successfully:", {
    messageId: response.data.id,
    threadId: response.data.threadId,
  });

  return response.data;
};


// --------------------------------------------------
// Main Mail Sender
// --------------------------------------------------

const mailSender = async (email, title, body) => {

  try {

    console.log("Using mail service: Gmail API");

    return await sendViaGmail(
      email,
      title,
      body
    );

  } catch (error) {

    console.error(
      "GMAIL API ERROR:",
      error?.response?.data || error
    );

    if (
      error?.code === 401 ||
      error?.response?.status === 401
    ) {
      throw new ApiError(
        500,
        "Gmail authentication failed. Check your OAuth2 credentials and refresh token."
      );
    }

    if (
      error?.code === 403 ||
      error?.response?.status === 403
    ) {
      throw new ApiError(
        500,
        "Gmail API permission denied. Check Gmail API, OAuth scope, and authorized account."
      );
    }

    throw new ApiError(
      500,
      error?.message || "Failed to send mail"
    );
  }
};


export { mailSender };
