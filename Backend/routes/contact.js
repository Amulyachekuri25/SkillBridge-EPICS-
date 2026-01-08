const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "linkdin228@gmail.com",
    pass: process.env.GMAIL_PASSWORD || "your-app-password-here"
  }
});

// Contact form submission endpoint
router.post("/send-message", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Email content
    const mailOptions = {
      from: "linkdin228@gmail.com",
      to: "linkdin228@gmail.com",
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email: " + error.message });
  }
});

module.exports = router;
