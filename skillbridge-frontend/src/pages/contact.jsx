import React, { useState } from "react";
import API from "../api/api";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await API.post("/contact/send-message", form);
      setSuccessMessage("Message sent successfully! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-card">
//         <h2 className="section-header">Contact Us</h2>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
//           <div>
//             <h3>We’d love to hear from you!</h3>
//             <p style={{ color: "#3a5c6e" }}>
//               Whether you have questions, feedback, or partnership ideas,
//               our team is ready to listen.
//             </p>
//             <p><b>Email:</b> support@skillbridge.com</p>
//             <p><b>Address:</b> Hyderabad, India</p>
//           </div>

//           <div className="form-card">
//             {successMessage && <div style={{ color: "green", marginBottom: "10px" }}>{successMessage}</div>}
//             {errorMessage && <div style={{ color: "red", marginBottom: "10px" }}>{errorMessage}</div>}
//             <form onSubmit={handleSubmit}>
//               <div className="form-group">
//                 <label>Name</label>
//                 <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
//               </div>
//               <div className="form-group">
//                 <label>Email</label>
//                 <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
//               </div>
//               <div className="form-group">
//                 <label>Message</label>
//                 <textarea name="message" value={form.message} onChange={handleChange} rows="4" required />
//               </div>
//               <button className="btn-primary" style={{ marginTop: 8 }} type="submit" disabled={loading}>
//                 {loading ? "Sending..." : "Send Message"}
</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

