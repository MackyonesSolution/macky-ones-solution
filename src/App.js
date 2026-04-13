import React, { useState, useEffect } from "react";

function App() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    category: "",
    vendor: "",
    requirement: ""
  });

  const [message, setMessage] = useState("");
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState("home");

  const API = "https://macky-ones-solutions.onrender.com";

  // Fetch leads
  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API}/leads`);
      const data = await res.json();

      if (data.success) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  useEffect(() => {
    if (page === "admin") {
      fetchLeads();
    }
  }, [page]);

  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("Sending...");

    try {
      const res = await fetch(`${API}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Submitted successfully!");
        setForm({
          name: "",
          phone: "",
          email: "",
          city: "",
          category: "",
          vendor: "",
          requirement: ""
        });
      } else {
        setMessage("❌ " + (data.message || "Error"));
      }
    } catch (err) {
      setMessage("❌ Server error");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Mackyones Solution</h1>
      <p>Requirement Matching & Lead Generation Platform</p>

      <button onClick={() => setPage("home")}>Home</button>
      <button onClick={() => setPage("admin")}>Admin Panel</button>

      {/* HOME PAGE */}
      {page === "home" && (
        <form onSubmit={handleSubmit}>
          <h2>Post Your Requirement</h2>

          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required /><br /><br />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required /><br /><br />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required /><br /><br />
          <input name="city" value={form.city} onChange={handleChange} placeholder="City" required /><br /><br />

          <select name="category" value={form.category} onChange={handleChange}>
            <option value="">Select Category</option>
            <option value="Solar">Solar</option>
            <option value="Telecom">Telecom</option>
          </select><br /><br />

          <select name="vendor" value={form.vendor} onChange={handleChange}>
            <option value="">Select Vendor</option>
            <option value="Solar Vendor">Solar Vendor</option>
            <option value="Telecom Vendor">Telecom Vendor</option>
          </select><br /><br />

          <textarea name="requirement" value={form.requirement} onChange={handleChange} placeholder="Requirement" required /><br /><br />

          <button type="submit">Submit</button>

          <p>{message}</p>
        </form>
      )}

      {/* ADMIN PANEL */}
      {page === "admin" && (
        <div>
          <h2>Admin Panel</h2>
          <p>Total Leads: {leads.length}</p>

          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Requirement</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead, i) => (
                <tr key={i}>
                  <td>{lead.name}</td>
                  <td>{lead.phone}</td>
                  <td>{lead.email}</td>
                  <td>{lead.city}</td>
                  <td>{lead.category}</td>
                  <td>{lead.vendor}</td>
                  <td>{lead.requirement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;