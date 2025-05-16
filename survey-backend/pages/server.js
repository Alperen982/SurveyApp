const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  

app.post("/send-email", async (req, res) => {
    const { recipients, subject, message } = req.body;
  
    if (!recipients || !subject || !message) {
      return res.status(400).json({ error: "Lütfen tüm alanları doldurun." });
    }
  
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipients.join(", "),
        subject,
        text: message,
      };
  
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "E-postalar başarıyla gönderildi!" });
    } catch (error) {
      console.error("E-posta gönderilirken hata oluştu:", error);
      res.status(500).json({ error: error.message || "E-posta gönderimi başarısız oldu." });
    }
  });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
