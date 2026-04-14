const express = require("express");
const cors = require("cors");
const axios = require("axios");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Temporary lead storage
let leads = [];

// Vendor contact list
const vendorContacts = {
  "Airtel Vendor": "9876543210",
  "Jio Vendor": "9123456780",
  "Solar Vendor": "9988776655",
  "IT Vendor": "9876500001",
  Freelancer: "9876500002",
  "Company Hiring": "9876500003",
  "Job Provider": "9876500004"
};

// WhatsApp notification via CallMeBot
function sendWhatsAppNotification(message) {
  return new Promise((resolve, reject) => {
    const phone = process.env.CALLMEBOT_PHONE;
    const apiKey = process.env.CALLMEBOT_APIKEY;

    if (!phone || !apiKey) {
      return resolve("CallMeBot not configured");
    }

    const url =
      `https://api.callmebot.com/whatsapp.php?phone=${phone}` +
      `&text=${encodeURIComponent(message)}` +
      `&apikey=${apiKey}`;

    https
      .get(url, (resp) => {
        let data = "";

        resp.on("data", (chunk) => {
          data += chunk;
        });

        resp.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Macky Ones Solution backend is running"
  });
});

// Get all leads
app.get("/leads", (req, res) => {
  res.json({
    success: true,
    leads
  });
});

// Submit lead
app.post("/contact", async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      city,
      requirementType,
      vendor,
      requirement
    } = req.body;

    if (!name || !phone || !requirementType || !vendor || !requirement) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    const newLead = {
      id: Date.now(),
      name,
      phone,
      email: email || "",
      city: city || "",
      requirementType,
      vendor,
      vendorPhone: vendorContacts[vendor] || "",
      requirement,
      status: "New",
      createdAt: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata"
      })
    };

    // Save lead first
    leads.unshift(newLead);

    const emailHtml = `
      <h2>New Requirement Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email || ""}</p>
      <p><strong>City:</strong> ${city || ""}</p>
      <p><strong>Category:</strong> ${requirementType}</p>
      <p><strong>Vendor:</strong> ${vendor}</p>
      <p><strong>Vendor Phone:</strong> ${vendorContacts[vendor] || ""}</p>
      <p><strong>Requirement:</strong> ${requirement}</p>
      <p><strong>Date:</strong> ${newLead.createdAt}</p>
    `;

    const whatsappMessage =
      `New Lead Received\n\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Email: ${email || ""}\n` +
      `City: ${city || ""}\n` +
      `Category: ${requirementType}\n` +
      `Vendor: ${vendor}\n` +
      `Vendor Phone: ${vendorContacts[vendor] || ""}\n` +
      `Requirement: ${requirement}\n` +
      `Date: ${newLead.createdAt}`;

    let emailSent = false;
    let whatsappSent = false;
    let emailError = "";
    let whatsappError = "";

    // Send email via Brevo API
    try {
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: {
            name: "Macky Ones Solution",
            email: process.env.FROM_EMAIL
          },
          to: [
            {
              email: process.env.TO_EMAIL
            }
          ],
          subject: "New Requirement Received",
          htmlContent: emailHtml
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json"
          }
        }
      );

      emailSent = true;
      console.log("Email sent via Brevo API");
    } catch (err) {
      emailError =
        err.response?.data?.message ||
        err.response?.data?.code ||
        err.message;
      console.error("BREVO MAIL ERROR:", err.response?.data || err.message);
    }

    // Send WhatsApp via CallMeBot
    try {
      await sendWhatsAppNotification(whatsappMessage);
      whatsappSent = true;
      console.log("WhatsApp notification sent");
    } catch (err) {
      whatsappError = err.message;
      console.error("WHATSAPP ERROR:", err.message);
    }

    return res.json({
      success: true,
      message: emailSent
        ? "Submitted successfully"
        : "Lead saved, but email not sent",
      emailSent,
      whatsappSent,
      emailError,
      whatsappError,
      lead: newLead
    });
  } catch (error) {
    console.error("CONTACT SUBMIT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Update lead status
app.put("/leads/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const leadIndex = leads.findIndex(
      (lead) => String(lead.id) === String(id)
    );

    if (leadIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    leads[leadIndex].status = status;

    return res.json({
      success: true,
      message: "Status updated successfully",
      lead: leads[leadIndex]
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Delete lead
app.delete("/leads/:id", (req, res) => {
  try {
    const { id } = req.params;

    const leadIndex = leads.findIndex(
      (lead) => String(lead.id) === String(id)
    );

    if (leadIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    const deletedLead = leads[leadIndex];
    leads = leads.filter((lead) => String(lead.id) !== String(id));

    return res.json({
      success: true,
      message: "Lead deleted successfully",
      lead: deletedLead
    });
  } catch (error) {
    console.error("DELETE LEAD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});