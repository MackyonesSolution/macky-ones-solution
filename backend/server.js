const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 5000;

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
    user: "mackyonessolutions@gmail.com",
    pass: "szjk yyae tunc gbxq"
  }
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

    if (!name || !phone || !requirementType || !requirement) {
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
      vendor: vendor || "",
      vendorPhone: vendorContacts[vendor] || "",
      requirement,
      status: "New",
      createdAt: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata"
      })
    };

    leads.unshift(newLead);

    const info = await transporter.sendMail({
      from: "mackyonessolutions@gmail.com",
      to: "mackyonessolutions@gmail.com",
      subject: "New Requirement Received",
      text: `Name: ${name}
Phone: ${phone}
Email: ${email || ""}
City: ${city || ""}
Category: ${requirementType}
Vendor: ${vendor || ""}
Vendor Phone: ${vendorContacts[vendor] || ""}
Requirement: ${requirement}
Status: New`
    });

    console.log("MAIL SENT:", info.response);

    res.json({
      success: true,
      message: "Lead submitted successfully"
    });
  } catch (error) {
    console.log("MAIL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Email failed"
    });
  }
});

// Get all leads
app.get("/leads", (req, res) => {
  res.json({
    success: true,
    leads
  });
});

// Update lead status
app.put("/leads/:id", (req, res) => {
  const leadId = Number(req.params.id);
  const { status } = req.body;

  const index = leads.findIndex((lead) => lead.id === leadId);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Lead not found"
    });
  }

  leads[index].status = status || leads[index].status;

  res.json({
    success: true,
    message: "Lead updated",
    lead: leads[index]
  });
});

// Delete lead
app.delete("/leads/:id", (req, res) => {
  const leadId = Number(req.params.id);
  leads = leads.filter((lead) => lead.id !== leadId);

  res.json({
    success: true,
    message: "Lead deleted"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});