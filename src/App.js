import React, { useEffect, useState } from "react";

function App() {
  const [page, setPage] = useState("home");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    requirementType: "",
    vendor: "",
    requirement: ""
  });

  const [message, setMessage] = useState("");
  const [leads, setLeads] = useState([]);

  const fetchLeads = async () => {
    try {
      const res = await fetch("https://macky-ones-solution.onrender.com/leads");
const data = await res.json();

      if (data.success) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.log("Fetch leads error:", error);
    }
  };

  useEffect(() => {
    if (page === "admin") {
      fetchLeads();
    }
  }, [page]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("https://macky-ones-solution.onrender.com/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Form submitted successfully ✅");
        setFormData({
          name: "",
          phone: "",
          email: "",
          city: "",
          requirementType: "",
          vendor: "",
          requirement: ""
        });
      } else {
        setMessage(data.message || "Server error ❌");
      }
    } catch (error) {
      console.log("Submit error:", error);
      setMessage("Error connecting to server ❌");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`https://macky-ones-solution.onrender.com/leads/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();

      if (data.success) {
        fetchLeads();
      }
    } catch (error) {
      console.log("Update status error:", error);
    }
  };

  const deleteLead = async (id) => {
    try {
      const res = await fetch(`https://macky-ones-solution.onrender.com/leads/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (data.success) {
        fetchLeads();
      }
    } catch (error) {
      console.log("Delete error:", error);
    }
  };

  const containerStyle = {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box"
  };

  const buttonStyle = {
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "8px"
  };

  return (
    <div style={containerStyle}>
      <h1>Mackyones Solution</h1>
      <p>Requirement Matching & Lead Generation Platform</p>

      <div style={{ marginBottom: "20px" }}>
        <button
          style={{ ...buttonStyle, backgroundColor: "#007bff", color: "#fff" }}
          onClick={() => setPage("home")}
        >
          Home
        </button>

        <button
          style={{ ...buttonStyle, backgroundColor: "#28a745", color: "#fff" }}
          onClick={() => setPage("admin")}
        >
          Admin Panel
        </button>
      </div>

      {page === "home" && (
        <div>
          <h2>Post Your Requirement</h2>

          <form onSubmit={handleSubmit}>
            <input
              style={inputStyle}
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              style={inputStyle}
              type="text"
              name="phone"
              placeholder="Mobile Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <input
              style={inputStyle}
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              style={inputStyle}
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
            />

            <select
              style={inputStyle}
              name="requirementType"
              value={formData.requirementType}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="Solar">Solar</option>
              <option value="Telecom">Telecom</option>
              <option value="IT">IT</option>
              <option value="Work From Home Job">Work From Home Job</option>
              <option value="Vendor Requirement">Vendor Requirement</option>
            </select>

            <select
              style={inputStyle}
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
            >
              <option value="">Select Vendor</option>
              <option value="Airtel Vendor">Airtel Vendor</option>
              <option value="Jio Vendor">Jio Vendor</option>
              <option value="Solar Vendor">Solar Vendor</option>
              <option value="IT Vendor">IT Vendor</option>
              <option value="Freelancer">Freelancer</option>
              <option value="Company Hiring">Company Hiring</option>
              <option value="Job Provider">Job Provider</option>
            </select>

            <textarea
              style={inputStyle}
              name="requirement"
              placeholder="Enter your requirement"
              value={formData.requirement}
              onChange={handleChange}
              rows="5"
              required
            />

            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: "#000", color: "#fff" }}
            >
              Submit
            </button>
          </form>

          {message && (
            <p style={{ marginTop: "15px", fontWeight: "bold" }}>{message}</p>
          )}
        </div>
      )}

      {page === "admin" && (
        <div>
          <h2>Admin Panel</h2>
          <p>Total Leads: {leads.length}</p>

          <div style={{ overflowX: "auto" }}>
            <table
              border="1"
              cellPadding="10"
              cellSpacing="0"
              width="100%"
              style={{ borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Category</th>
                  <th>Vendor</th>
                  <th>Requirement</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {leads.length > 0 ? (
                  leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>{lead.name}</td>
                      <td>{lead.phone}</td>
                      <td>{lead.email}</td>
                      <td>{lead.city}</td>
                      <td>{lead.requirementType}</td>

                      <td>
                        <strong>{lead.vendor}</strong>
                        <br />
                        <br />
                        <a
                          href={`tel:${lead.vendorPhone}`}
                          style={{ color: "blue" }}
                        >
                          Call
                        </a>
                        {" | "}
                        <a
                          href={`https://wa.me/91${lead.vendorPhone}?text=Hello%20I%20have%20a%20requirement%20for%20${lead.requirementType}%20in%20${lead.city}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "green" }}
                        >
                          WhatsApp
                        </a>
                      </td>

                      <td>{lead.requirement}</td>

                      <td>
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                        >
                          <option value="New">New</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      <td>{lead.createdAt}</td>

                      <td>
                        <button
                          style={{
                            ...buttonStyle,
                            backgroundColor: "red",
                            color: "#fff",
                            marginRight: 0
                          }}
                          onClick={() => deleteLead(lead.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center" }}>
                      No leads found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;