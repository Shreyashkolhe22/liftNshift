import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../store/authSlice";

const VIDEO_SRC = "/src/assets/liftnshift_intro.mp4";

export default function Register() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [showPwd, setShowPwd] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const { name, email, phone, password, confirm } = form;
    if (!name || !email || !phone || !password || !confirm) {
      setError("Please fill in all fields."); return;
    }
    if (password !== confirm) {
      setError("Passwords do not match."); return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setLoading(true);
    try {
      await dispatch(registerUser({ name, email, phone, password })).unwrap();
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{CSS}</style>

      <div id="register-page">

        {/* LEFT BRAND PANEL */}
        <div className="brand-panel">
          <video autoPlay muted loop playsInline>
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
          <div className="brand-content">
            <div className="brand-logo">Lift<span>N</span>Shift</div>
            <div className="brand-tagline">Home Relocation · Simplified</div>
            <div className="brand-divider" />
            <p className="brand-desc">
              Join thousands of happy customers who trusted LiftNShift
              with their home moves. Fast, reliable, and stress-free.
            </p>

            {/* Steps teaser */}
            <div className="brand-steps">
              <div className="step">
                <div className="step-num">01</div>
                <div className="step-text">Create your account</div>
              </div>
              <div className="step">
                <div className="step-num">02</div>
                <div className="step-text">Book a shifting date</div>
              </div>
              <div className="step">
                <div className="step-num">03</div>
                <div className="step-text">We handle the rest</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="form-panel">
          <div className="register-card">

            <div className="login-greeting">New here? 🚛</div>
            <div className="login-heading">
              Create your<br /><span>free account</span>
            </div>
            <p className="login-sub">
              Get started with your first booking today.
            </p>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>

              {/* Name */}
              <div className="field">
                <label>Full Name</label>
                <div className="field-wrap">
                  <span className="field-icon">👤</span>
                  <input
                    type="text" name="name" placeholder="Shreyash Kolhe"
                    value={form.name} onChange={handleChange} autoComplete="name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="field" style={{ marginTop: 14 }}>
                <label>Email Address</label>
                <div className="field-wrap">
                  <span className="field-icon">✉</span>
                  <input
                    type="email" name="email" placeholder="you@example.com"
                    value={form.email} onChange={handleChange} autoComplete="email"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="field" style={{ marginTop: 14 }}>
                <label>Phone Number</label>
                <div className="field-wrap">
                  <span className="field-icon">📞</span>
                  <input
                    type="tel" name="phone" placeholder="+91 98765 43210"
                    value={form.phone} onChange={handleChange} autoComplete="tel"
                  />
                </div>
              </div>

              {/* Two column: password + confirm */}
              <div className="two-col" style={{ marginTop: 14 }}>
                <div className="field">
                  <label>Password</label>
                  <div className="field-wrap">
                    <span className="field-icon">🔒</span>
                    <input
                      type={showPwd ? "text" : "password"}
                      name="password" placeholder="Min 6 chars"
                      value={form.password} onChange={handleChange}
                    />
                    <button
                      type="button" className="pwd-toggle"
                      onClick={() => setShowPwd(p => !p)} tabIndex={-1}
                    >
                      {showPwd ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label>Confirm Password</label>
                  <div className="field-wrap">
                    <span className="field-icon">🔒</span>
                    <input
                      type={showPwd ? "text" : "password"}
                      name="confirm" placeholder="Repeat password"
                      value={form.confirm} onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <button
                className="btn-primary"
                type="submit"
                disabled={loading}
                style={{ marginTop: 26 }}
              >
                {loading ? "Creating account…" : "Create Account →"}
              </button>

            </form>

            <p className="signup-cta" style={{ marginTop: 22 }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "var(--orange)", fontWeight: 500, textDecoration: "none" }}>
                Sign in
              </Link>
            </p>

            <p className="signup-cta" style={{ marginTop: 8 }}>
              By registering you agree to our{" "}
              <a href="#">Terms of Service</a>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

// ── Styles — same design language as Login ─────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --orange:      #F47B20;
    --orange-deep: #D4601A;
    --dark:        #141414;
    --card:        #252525;
    --border:      rgba(255,255,255,0.07);
    --light:       #f0ede8;
    --muted:       #888;
  }

  body {
    background: #000;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
    height: 100vh;
  }

  #register-page {
    position: fixed;
    inset: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--dark);
    animation: pageIn 0.7s ease both;
  }

  @keyframes pageIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* BRAND PANEL */
  .brand-panel {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 52px;
  }

  .brand-panel video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.38) saturate(1.3);
  }

  .brand-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(160deg, rgba(244,123,32,0.10) 0%, rgba(20,20,20,0.85) 100%);
    z-index: 1;
  }

  .brand-panel::after {
    content: '';
    position: absolute;
    top: -100px; right: -100px;
    width: 400px; height: 400px;
    border-radius: 50%;
    border: 55px solid rgba(244,123,32,0.08);
    z-index: 1;
  }

  .brand-content {
    position: relative;
    z-index: 2;
    animation: slideIn 0.9s ease 0.2s both;
  }

  @keyframes slideIn {
    from { transform: translateX(-28px); opacity: 0; }
    to   { transform: translateX(0); opacity: 1; }
  }

  .brand-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 3.8rem;
    color: #fff;
    letter-spacing: 0.06em;
    line-height: 1;
  }

  .brand-logo span { color: var(--orange); }

  .brand-tagline {
    font-size: 0.76rem;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: rgba(255,255,255,0.42);
    margin-top: 4px;
    margin-bottom: 26px;
  }

  .brand-divider {
    width: 48px; height: 2px;
    background: var(--orange);
    border-radius: 2px;
    margin-bottom: 20px;
  }

  .brand-desc {
    color: rgba(255,255,255,0.62);
    font-size: 0.9rem;
    line-height: 1.8;
    max-width: 300px;
    margin-bottom: 32px;
  }

  .brand-steps { display: flex; flex-direction: column; gap: 14px; }

  .step { display: flex; align-items: center; gap: 14px; }

  .step-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.4rem;
    color: var(--orange);
    letter-spacing: 0.06em;
    min-width: 30px;
    line-height: 1;
  }

  .step-text {
    font-size: 0.86rem;
    color: rgba(255,255,255,0.55);
    letter-spacing: 0.02em;
  }

  /* FORM PANEL */
  .form-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: var(--dark);
    position: relative;
    overflow-y: auto;
  }

  .form-panel::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 480px; height: 480px;
    background: radial-gradient(circle, rgba(244,123,32,0.055) 0%, transparent 70%);
    pointer-events: none;
  }

  .register-card {
    width: 100%;
    max-width: 440px;
    position: relative;
    animation: cardIn 0.8s ease 0.2s both;
  }

  @keyframes cardIn {
    from { transform: translateY(28px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }

  .login-greeting {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--orange);
    margin-bottom: 10px;
  }

  .login-heading {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.8rem;
    color: var(--light);
    letter-spacing: 0.04em;
    line-height: 1.05;
    margin-bottom: 6px;
  }

  .login-heading span { color: var(--orange); }

  .login-sub {
    color: var(--muted);
    font-size: 0.86rem;
    margin-bottom: 26px;
  }

  .error-box {
    background: rgba(220,60,60,0.12);
    border: 1px solid rgba(220,60,60,0.3);
    color: #ff8080;
    font-size: 0.84rem;
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .field label {
    display: block;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--muted);
    margin-bottom: 7px;
  }

  .field-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .field-icon {
    position: absolute;
    left: 14px;
    font-style: normal;
    font-size: 0.88rem;
    pointer-events: none;
    z-index: 2;
    line-height: 1;
    color: #444;
    transition: color 0.2s;
  }

  .field-wrap:focus-within .field-icon { color: var(--orange); }

  .field-wrap input {
    width: 100%;
    padding: 12px 42px 12px 42px;
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    color: var(--light);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
  }

  .field-wrap input::placeholder { color: #3a3a3a; }

  .field-wrap input:focus {
    border-color: var(--orange);
    background: #2a2a2a;
    box-shadow: 0 0 0 3px rgba(244,123,32,0.12);
  }

  .pwd-toggle {
    position: absolute;
    right: 14px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.88rem;
    color: #555;
    padding: 0;
    z-index: 2;
    transition: color 0.2s;
  }

  .pwd-toggle:hover { color: var(--orange); }

  .btn-primary {
    width: 100%;
    padding: 14px;
    background: var(--orange);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.15rem;
    letter-spacing: 0.12em;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 8px 28px rgba(244,123,32,0.38);
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--orange-deep);
    transform: translateY(-2px);
    box-shadow: 0 14px 36px rgba(244,123,32,0.48);
  }

  .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

  .signup-cta {
    text-align: center;
    font-size: 0.8rem;
    color: #555;
  }

  .signup-cta a { color: var(--orange); text-decoration: none; }
  .signup-cta a:hover { text-decoration: underline; }

  @media (max-width: 780px) {
    #register-page { grid-template-columns: 1fr; }
    .brand-panel { display: none; }
    .form-panel { padding: 32px 20px; align-items: flex-start; }
    .two-col { grid-template-columns: 1fr; }
    .login-heading { font-size: 2.2rem; }
  }
`;