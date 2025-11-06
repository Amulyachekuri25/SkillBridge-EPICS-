import React, { useState } from "react";

const faqs = [
  { q: "How does SkillBridge match internships?", a: "We analyze your academic year, skill tags, and preferences using our recommendation engine." },
  { q: "Is SkillBridge free to use?", a: "Yes! Students can explore internships and courses without cost." },
  { q: "Are internships verified?", a: "Yes, our admin team validates all listings before publishing." },
  { q: "Can I update my skills later?", a: "Absolutely. You can edit your profile anytime to refresh your recommendations." }
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="container">
      <div className="page-card">
        <h2 className="section-header">Frequently Asked Questions</h2>
        {faqs.map((f, i) => (
          <div key={i} className="card-sm" style={{ marginBottom: 10, cursor: "pointer" }} onClick={() => setOpen(open === i ? null : i)}>
            <h4>{f.q}</h4>
            {open === i && <p style={{ color: "#3a5b6c", marginTop: 6 }}>{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
