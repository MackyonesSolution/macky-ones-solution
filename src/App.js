import React, { useEffect, useState } from "react";

function App() {
  const API = "https://macky-ones-solutions.onrender.com";

  const [page, setPage] = useState("home");
  const [message, setMessage] = useState("");
  const [leads, setLeads] = useState([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    requirementType: "",
    vendor: "",
    requirement: ""
  });

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API}/leads`);
      const data = await res.json();

      if (data.success) {
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error("Fetch leads error:", error);
    }
  };

  useEffect(() => {
    if (page === "admin") {
      fetchLeads();
    }
  }, [page]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Sending...");

    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      city: form.city,
      requirementType: form.requirementType,
      vendor: form.vendor,
      requirement: form.requirement
    };

    try {
      const res = await fetch(`${API}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Submitted successfully ✅");
        setForm({
          name: "",
          phone: "",
          email: "",
          city: "",
          requirementType: "",
          vendor: "",
          requirement: ""
        });
      } else {
        setMessage(data.message || "Error");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setMessage("Server error");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/leads/${id}`, {
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
      console.error("Update status error:", error);
    }
  };

  const deleteLead = async (id) => {
    try {
      const res = await fetch(`${API}/leads/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (data.success) {
        fetchLeads();
      }
    } catch (error) {
      console.error("Delete lead error:", error);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Mackyones Solution</h1>
      <p>Requirement Matching & Lead Generation Platform</p>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setPage("home")} style={{ marginRight: "10px" }}>
          Home
        </button>
        <button onClick={() => setPage("admin")}>
          Admin Panel
        </button>
      </div>

      {page === "home" && (
        <form onSubmit={handleSubmit}>
          <h2>Post Your Requirement</h2>

          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              style={{ width: "300px", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Mobile Number"
              required
              style={{ width: "300px", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              style={{ width: "300px", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
              style={{ width: "300px", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <select
              name="requirementType"
              value={form.requirementType}
              onChange={handleChange}
              required
              style={{ width: "318px", padding: "8px" }}
            >
              <option value="">Select Category</option>
              <option value="Solar">Solar</option>
              <option value="Telecom">Telecom</option>
              <option value="IT">IT</option>
              <option value="Freelancer">Freelancer</option>
              <option value="Jobs">Jobs</option>
            </select>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <select
              name="vendor"
              value={form.vendor}
              onChange={handleChange}
              required
              style={{ width: "318px", padding: "8px" }}
            >
              <option value="">Select Vendor</option>
              <option value="Solar Vendor">Solar Vendor</option>
              <option value="Airtel Vendor">Airtel Vendor</option>
              <option value="Jio Vendor">Jio Vendor</option>
              <option value="IT Vendor">IT Vendor</option>
              <option value="Freelancer">Freelancer</option>
              <option value="Company Hiring">Company Hiring</option>
              <option value="Job Provider">Job Provider</option>
            </select>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <textarea
              name="requirement"
              value={form.requirement}
              onChange={handleChange}
              placeholder="Enter your requirement"
              required
              rows="4"
              style={{ width: "300px", padding: "8px" }}
            />
          </div>

          <button type="submit">Submit</button>

          {message && (
            <p style={{ marginTop: "15px" }}>
              {message}
            </p>
          )}
        </form>
      )}

      {page === "admin" && (
        <div>
          <h2>Admin Panel</h2>
          <p>Total Leads: {leads.length}</p>

          <div style={{ overflowX: "auto" }}>
            <table
              border="1"
              cellPadding="8"
              style={{ borderCollapse: "collapse", width: "100%" }}
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
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center" }}>
                      No leads found
                    </td>
                  </tr>
                ) : (
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
                        {lead.vendorPhone && (
                          <>
                            <a href={`tel:${lead.vendorPhone}`}>Call</a>
                            {" | "}
                            <a
                              href={`https://wa.me/91${lead.vendorPhone}?text=${encodeURIComponent(
                                `Hello ${lead.vendor}, new lead received:
Name: ${lead.name}
Phone: ${lead.phone}
City: ${lead.city}
Requirement: ${lead.requirement}`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              WhatsApp
                            </a>
                          </>
                        )}
                      </td>
                      <td>{lead.requirement}</td>
                      <td>
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                        >
                          <option value="New">New</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td>{lead.createdAt}</td>
                      <td>
                        <button onClick={() => deleteLead(lead.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
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