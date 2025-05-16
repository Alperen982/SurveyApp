const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { recipients, subject, message } = req.body;

  if (!recipients || !subject || !message) {
    return res.status(400).json({ error: "Lütfen tüm alanları doldurun." });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

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
};