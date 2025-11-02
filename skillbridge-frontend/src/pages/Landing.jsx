import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const nav = useNavigate();
  return (
    <>
      <div className="mesh" />
      {/* optional svg mesh for subtle lines */}
      <svg className="mesh-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stopColor="#0b67c2" stopOpacity="0.06" />
            <stop offset="1" stopColor="#00b39f" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g1)"/>
      </svg>

      <div className="container">
        <nav className="navbar" role="navigation" aria-label="main">
          <a className="brand" href="/home">SkillBridge</a>
          <div className="nav-links">
            <a href="/about">About</a>
            <a href="/faq">FAQ</a>
            <a href="/contact">Contact</a>
            <a className="link" href="/login">Login</a>
          </div>
        </nav>

        <section className="landing">
          <div className="landing-hero">
            <div className="kicker">Skills · Internships · Growth</div>
            <h1 className="hero-title">Find the right internships and skill paths — faster.</h1>
            <p className="hero-lead">SkillBridge matches your academic year and skills to internships and ranked learning paths. Personalized, trustworthy, and ready for industry.</p>

            <div className="hero-ctas">
              <button className="btn-primary" onClick={() => nav("/signup")}>Get Started — Free</button>
              <button className="btn-ghost" onClick={() => nav("/login")}>Sign in</button>
            </div>

            <div style={{ marginTop: 22 }}>
              <div style={{ display: "flex", gap: 18 }}>
                <div className="feature">
                  <div className="dot">S</div>
                  <div>
                    <h4 style={{margin:'0 0 6px'}}>Student-first matching</h4>
                    <div style={{ color:'#4a6b7d'}}>Year-aware recommendations & resume-first course ranking.</div>
                  </div>
                </div>

                <div className="feature">
                  <div className="dot">I</div>
                  <div>
                    <h4 style={{margin:'0 0 6px'}}>Verified internships</h4>
                    <div style={{ color:'#4a6b7d'}}>Companies verified by admin — apply with confidence.</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <aside className="landing-card" aria-hidden>
            <h3>Why SkillBridge matters</h3>
            <p style={{ marginTop:8, color:'#39586d' }}>
              Smart recommendations reduce time-to-internship. Track your applications, learn high-value courses, and build a career-ready profile.
            </p>

            <div style={{ marginTop: 18 }}>
              <div className="card" style={{ display:'flex', gap:12, alignItems:'center' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#073957' }}>Top course picks</div>
                  <div style={{ color:'#386073' }}>NPTEL · Coursera · University certificates</div>
                </div>
                <div style={{ fontSize:18, color:'#0b67c2' }}>→</div>
              </div>

              <div className="card mt-12" style={{ display:'flex', gap:12, alignItems:'center' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#073957' }}>Verified company list</div>
                  <div style={{ color:'#386073' }}>Companies ranked for ease of hiring & learning value</div>
                </div>
              </div>

            </div>
          </aside>
        </section>

        <div className="app-footer">
          Built with care • SkillBridge — Learn. Connect. Grow.
        </div>
      </div>
    </>
  );
}
