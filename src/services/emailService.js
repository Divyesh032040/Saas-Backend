

 const nodemailer = require("nodemailer");


async function sendEmail(senderEmail , subject , otp ) {
    // Validate input
    console.log(senderEmail , "this is receiver")
    if (!senderEmail || !subject || !otp ) {
      throw new Error("Missing required fields: email, subject, or otp.");
    }
  
    // Configure the transporter
    let transporter = nodemailer.createTransport({
      service: "gmail", // Use Gmail SMTP
      auth: {
        user: process.env.EMAIL, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your email password or app password
      },
    });
  
    // HTML email template
    const htmlMessage = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f9f9f9;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  max-width: 500px;
                  margin: 20px auto;
                  background: #ffffff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
              }
              h2 {
                  color: #333;
              }
              p {
                  font-size: 16px;
                  color: #555;
                  line-height: 1.5;
              }
              .reset-button {
                  display: inline-block;
                  background-color: #007bff;
                  color: white;
                  text-decoration: none;
                  padding: 10px 15px;
                  border-radius: 5px;
                  font-size: 16px;
                  margin-top: 10px;
              }
              .footer {
                  margin-top: 20px;
                  font-size: 12px;
                  color: #888;
              }
              .h1{
              font-size:large;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Password Reset Request</h2>
              <p>Hello</p>
              <p>Need to reset your password? Use your secret code!</p>
              <h1>
                  ${otp}
              </h1>
              <p>This otp will expire in 5 minutes.</p>
              <p>If you didn’t request a password reset, you can ignore this email.</p>
              <p class="footer">Best regards,<br>Divyesh and Team</p>
          </div>
      </body>
      </html>
    `;
  
    // Configure the email options
    let mailOptions = {
      from: 'Technozions', 
      to: senderEmail, 
      subject: subject, 
      html: htmlMessage, 
    };
  
    // try {
      // Send the email
      let info = await transporter.sendMail(mailOptions);
      console.log("Email sent: %s", info.messageId);
      return { success: true, messageId: info.messageId }; // Return success with messageId
    // } catch (error) {
    //   console.error("Error sending email:", error);
    //   throw new Error("Failed to send email."); // Throw error to handle in the calling function
    // }
  }
  
  module.exports = sendEmail;

