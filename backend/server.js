const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const vendorContacts = {
  "Airtel Vendor": "9876543210",
  "Jio Vendor": "9123456780",
  "Solar Vendor": "9988776655",
  "IT Vendor": "9876500001",
  "Freelancer": "9876500002",
  "Company Hiring": "9876500003",
  "Job Provider": "9876500004"
};

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      city TEXT,
      requirement_type TEXT NOT NULL,
      vendor TEXT NOT NULL,
      requirement TEXT NOT NULL,
      status TEXT DEFAULT 'New',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Database ready");
}

app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend running" });
});

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

    const insertResult = await pool.query(
      `INSERT INTO leads (name, phone, email, city, requirement_type, vendor, requirement)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, phone, email || "", city || "", requirementType, vendor, requirement]
    );

    const newLead = insertResult.rows[0];

    try {
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: {
            email: process.env.FROM_EMAIL,
            name: "Macky Ones Solution"
          },
          to: [{ email: process.env.TO_EMAIL }],
          subject: "New Lead Received",
          htmlContent: `
            <h3>New Lead Received</h3>
            <p><b>Name:</b> ${name}</p>
            <p><b>Phone:</b> ${phone}</p>
            <p><b>Email:</b> ${email || ""}</p>
            <p><b>City:</b> ${city || ""}</p>
            <p><b>Category:</b> ${requirementType}</p>
            <p><b>Vendor:</b> ${vendor}</p>
            <p><b>Vendor Phone:</b> ${vendorContacts[vendor] || ""}</p>
            <p><b>Requirement:</b> ${requirement}</p>
          `
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json"
          }
        }
      );
      console.log("Email sent via Brevo API");
    } catch (mailError) {
      console.error("BREVO ERROR:", mailError.response?.data || mailError.message);
    }

    res.json({
      success: true,
      message: "Submitted successfully",
      lead: {
        id: newLead.id,
        name: newLead.name,
        phone: newLead.phone,
        email: newLead.email,
        city: newLead.city,
        requirementType: newLead.requirement_type,
        vendor: newLead.vendor,
        vendorPhone: vendorContacts[newLead.vendor] || "",
        requirement: newLead.requirement,
        status: newLead.status,
        createdAt: newLead.created_at
      }
    });
  } catch (error) {
    console.error("CONTACT ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

app.get("/leads", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM leads ORDER BY id DESC");

    const leads = result.rows.map((lead) => ({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      city: lead.city,
      requirementType: lead.requirement_type,
      vendor: lead.vendor,
      vendorPhone: vendorContacts[lead.vendor] || "",
      requirement: lead.requirement,
      status: lead.status,
      createdAt: lead.created_at
    }));

    res.json({
      success: true,
      leads
    });
  } catch (error) {
    console.error("GET LEADS ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

app.put("/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      "UPDATE leads SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    res.json({
      success: true,
      message: "Status updated successfully"
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

app.delete("/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM leads WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    res.json({
      success: true,
      message: "Lead deleted successfully"
    });
  } catch (error) {
    console.error("DELETE ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB INIT ERROR:", err.message);
  });