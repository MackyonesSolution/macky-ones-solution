const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/contact", async (req, res) => {
  try {
    const { name, phone, email, city, category, vendor, requirement } = req.body;

    if (!name || !phone || !email || !city || !category || !vendor || !requirement) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const emailContent = `
New Lead Received:

Name: ${name}
Phone: ${phone}
Email: ${email}
City: ${city}
Category: ${category}
Vendor: ${vendor}
Requirement: ${requirement}
    `;

    // 🔥 Brevo API call
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.FROM_EMAIL,
          name: "Macky Ones Solution"
        },
        to: [
          {
            email: process.env.TO_EMAIL
          }
        ],
        subject: "New Requirement Received",
        textContent: emailContent
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Email sent via Brevo API");

    res.status(200).json({ message: "Success" });

  } catch (error) {
    console.error("❌ BREVO ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "Email failed" });
  }
});

app.listen(10000, () => console.log("Server running on port 10000"));