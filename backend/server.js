const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

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
  "Freelancer": "9876500002",
  "Company Hiring": "9876500003",
  "Job Provider": "9876500004"
};

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Home route
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

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Requirement Received - Macky Ones Solution",
      html: `
        <h2>New Lead Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email || ""}</p>
        <p><strong>City:</strong> ${city || ""}</p>
        <p><strong>Category:</strong> ${requirementType}</p>
        <p><strong>Vendor:</strong> ${vendor}</p>
        <p><strong>Vendor Phone:</strong> ${vendorContacts[vendor] || ""}</p>
        <p><strong>Requirement:</strong> ${requirement}</p>
        <p><strong>Date:</strong> ${newLead.createdAt}</p>
      `
    });

    res.json({
      success: true,
      message: "Form submitted successfully",
      lead: newLead
    });
  } catch (error) {
    console.error("Contact submit error:", error);

    res.status(500).json({
      success: false,
      message: "Email failed"
    });
  }
});

// Update lead status
app.put("/leads/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const leadIndex = leads.findIndex((lead) => String(lead.id) === String(id));

    if (leadIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    leads[leadIndex].status = status;

    res.json({
      success: true,
      message: "Status updated successfully",
      lead: leads[leadIndex]
    });
  } catch (error) {
    console.error("Update status error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Delete lead
app.delete("/leads/:id", (req, res) => {
  try {
    const { id } = req.params;

    const leadIndex = leads.findIndex((lead) => String(lead.id) === String(id));

    if (leadIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    const deletedLead = leads[leadIndex];
    leads = leads.filter((lead) => String(lead.id) !== String(id));

    res.json({
      success: true,
      message: "Lead deleted successfully",
      lead: deletedLead
    });
  } catch (error) {
    console.error("Delete lead error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});