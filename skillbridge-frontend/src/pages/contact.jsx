import React, { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="container">
      <div className="page-card">
        <h2 className="section-header">Contact Us</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <div>
            <h3>We’d love to hear from you!</h3>
            <p style={{ color: "#3a5c6e" }}>
              Whether you have questions, feedback, or partnership ideas,
              our team is ready to listen.
            </p>
            <p><b>Email:</b> support@skillbridge.com</p>
            <p><b>Address:</b> Hyderabad, India</p>
          </div>

          <div className="form-card">
            <div className="form-group">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} rows="4" />
            </div>
            <button className="btn-primary" style={{ marginTop: 8 }}>Send Message</button>
          </div>
        </div>
      </div>
    </div>
  );
}
