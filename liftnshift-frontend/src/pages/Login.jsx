import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../store/authSlice";
import introVideo from "../assets/liftnshift_intro.mp4";

const VIDEO_SRC = introVideo;

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [phase, setPhase] = useState("splash"); // "splash" | "login"
  const [progress, setProgress] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const vidRef = useRef(null);
  const fallbackRef = useRef(null);

  // ── Reveal login after splash ──────────────────────────────────────────────
  function revealLogin() {
    setPhase("login");
  }

  useEffect(() => {
    // Fallback: if video never plays, reveal login after 8s
    fallbackRef.current = setTimeout(() => {
      if (phase === "splash") revealLogin();
    }, 8000);
    return () => clearTimeout(fallbackRef.current);
  }, []); // eslint-disable-line

  function handleTimeUpdate() {
    const v = vidRef.current;
    if (v && v.duration) {
      setProgress((v.currentTime / v.duration) * 100);
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{CSS}</style>

      {/* ════ SPLASH ════ */}
      <div id="splash" className={phase !== "splash" ? "fade-out" : ""}>
        <video
          ref={vidRef}
          id="splash-vid"
          playsInline
          muted
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onEnded={revealLogin}
          onError={() => setTimeout(revealLogin, 300)}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>

        {/* Progress bar */}
        <div id="vid-progress" style={{ width: `${progress}%` }} />

        {/* LiftNShift branding over video */}
        <div id="splash-brand">
          <div className="splash-logo">Lift<span>N</span>Shift</div>
          <div className="splash-tagline">Home Relocation · Simplified</div>
        </div>

        <button id="skip-btn" onClick={revealLogin}>Skip ›</button>
      </div>

      {/* ════ LOGIN PAGE ════ */}
      <div id="login-page" className={phase === "login" ? "show" : ""}>

        {/* LEFT — brand panel with looping video bg */}
        <div className="brand-panel">
          <video autoPlay muted loop playsInline>
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
          <div className="brand-content">
            <div className="brand-logo">Lift<span>N</span>Shift</div>
            <div className="brand-tagline">Home Relocation · Simplified</div>
            <div className="brand-divider" />
            <p className="brand-desc">
              Book your home shifting appointment in minutes. We handle
              furniture, appliances, and everything in between — safely
              moved from your door to your new home.
            </p>
            <div className="brand-stats">
              <div className="stat">
                <span className="stat-num">2K+</span>
                <span className="stat-label">Bookings</span>
              </div>
              <div className="stat-sep" />
              <div className="stat">
                <span className="stat-num">4.9★</span>
                <span className="stat-label">Rating</span>
              </div>
              <div className="stat-sep" />
              <div className="stat">
                <span className="stat-num">100%</span>
                <span className="stat-label">Safe</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — form panel */}
        <div className="form-panel">
          <div className="login-card">

            <div className="login-greeting">Welcome back 👋</div>
            <div className="login-heading">
              Sign in to<br /><span>your account</span>
            </div>
            <p className="login-sub">
              Enter your credentials to manage your bookings.
            </p>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>

              <div className="field">
                <label>Email Address</label>
                <div className="field-wrap">
                  <span className="field-icon">✉</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="field" style={{ marginTop: 18 }}>
                <label>Password</label>
                <div className="field-wrap">
                  <span className="field-icon">🔒</span>
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="pwd-toggle"
                    onClick={() => setShowPwd(p => !p)}
                    tabIndex={-1}
                  >
                    {showPwd ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div className="field-row">
                <label className="remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot">Forgot password?</a>
              </div>

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign In →"}
              </button>

            </form>

            <div className="divider"><span>new here?</span></div>

            <Link to="/register" className="btn-ghost" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
              Create a free account
            </Link>

            <p className="signup-cta">
              By signing in you agree to our{" "}
              <a href="#">Terms of Service</a>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

// ── All styles inlined so the component is self-contained ──────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --orange:      #F47B20;
    --orange-deep: #D4601A;
    --orange-glow: rgba(244,123,32,0.35);
    --dark:        #141414;
    --mid:         #1f1f1f;
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
    width: 100vw;
  }

  /* ─── SPLASH ─────────────────────────────────────────────────── */
  #splash {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.9s cubic-bezier(.4,0,.2,1),
                transform 0.9s cubic-bezier(.4,0,.2,1);
  }

  #splash.fade-out {
    opacity: 0;
    transform: scale(1.04);
    pointer-events: none;
  }

  #splash video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  #splash::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center,
      rgba(0,0,0,0.2) 30%,
      rgba(0,0,0,0.65) 100%
    );
    pointer-events: none;
    z-index: 1;
  }

  #splash-brand {
    position: relative;
    z-index: 2;
    text-align: center;
    animation: splashReveal 0.8s ease 0.5s both;
  }

  @keyframes splashReveal {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .splash-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3.5rem, 8vw, 7rem);
    color: #fff;
    letter-spacing: 0.06em;
    line-height: 1;
    text-shadow: 0 4px 40px rgba(0,0,0,0.6);
  }

  .splash-logo span { color: var(--orange); }

  .splash-tagline {
    font-size: clamp(0.7rem, 1.5vw, 0.95rem);
    text-transform: uppercase;
    letter-spacing: 0.28em;
    color: rgba(255,255,255,0.55);
    margin-top: 8px;
  }

  #vid-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: var(--orange);
    z-index: 10;
    box-shadow: 0 0 10px var(--orange);
    transition: width 0.25s linear;
  }

  #skip-btn {
    position: absolute;
    bottom: 36px;
    right: 40px;
    z-index: 10;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(244,123,32,0.4);
    color: rgba(255,255,255,0.7);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 9px 20px;
    border-radius: 50px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
    opacity: 0;
    animation: fadeInSkip 0.5s ease 1.5s forwards;
  }

  @keyframes fadeInSkip {
    to { opacity: 1; }
  }

  #skip-btn:hover {
    background: var(--orange);
    border-color: var(--orange);
    color: #fff;
  }

  /* ─── LOGIN PAGE ─────────────────────────────────────────────── */
  #login-page {
    position: fixed;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.9s ease;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--dark);
  }

  #login-page.show {
    opacity: 1;
    pointer-events: all;
  }

  /* LEFT BRAND */
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
    background: linear-gradient(
      160deg,
      rgba(244,123,32,0.10) 0%,
      rgba(20,20,20,0.85) 100%
    );
    z-index: 1;
  }

  .brand-panel::after {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    border: 55px solid rgba(244,123,32,0.08);
    z-index: 1;
  }

  .brand-content {
    position: relative;
    z-index: 2;
    transform: translateX(-28px);
    opacity: 0;
    transition: transform 0.9s ease 0.35s, opacity 0.9s ease 0.35s;
  }

  #login-page.show .brand-content {
    transform: translateX(0);
    opacity: 1;
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
    width: 48px;
    height: 2px;
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

  .brand-stats {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .stat { display: flex; flex-direction: column; gap: 2px; }

  .stat-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.6rem;
    color: var(--orange);
    letter-spacing: 0.04em;
    line-height: 1;
  }

  .stat-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: rgba(255,255,255,0.38);
  }

  .stat-sep {
    width: 1px;
    height: 32px;
    background: rgba(255,255,255,0.12);
  }

  /* RIGHT FORM */
  .form-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 40px;
    background: var(--dark);
    position: relative;
    overflow: hidden;
  }

  .form-panel::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 480px;
    height: 480px;
    background: radial-gradient(circle, rgba(244,123,32,0.055) 0%, transparent 70%);
    pointer-events: none;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
    transform: translateY(28px);
    opacity: 0;
    transition: transform 0.8s ease 0.2s, opacity 0.8s ease 0.2s;
    position: relative;
  }

  #login-page.show .login-card {
    transform: translateY(0);
    opacity: 1;
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
    font-size: 3rem;
    color: var(--light);
    letter-spacing: 0.04em;
    line-height: 1.05;
    margin-bottom: 6px;
  }

  .login-heading span { color: var(--orange); }

  .login-sub {
    color: var(--muted);
    font-size: 0.86rem;
    margin-bottom: 30px;
  }

  .error-box {
    background: rgba(220, 60, 60, 0.12);
    border: 1px solid rgba(220, 60, 60, 0.3);
    color: #ff8080;
    font-size: 0.84rem;
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 18px;
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
    transition: color 0.2s;
    line-height: 1;
    color: #444;
  }

  .field-wrap:focus-within .field-icon { color: var(--orange); }

  .field-wrap input {
    width: 100%;
    padding: 13px 42px 13px 42px;
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    color: var(--light);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.93rem;
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
    line-height: 1;
    z-index: 2;
    transition: color 0.2s;
  }

  .pwd-toggle:hover { color: var(--orange); }

  .field-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 18px 0 26px;
  }

  .remember {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }

  .remember input[type=checkbox] {
    accent-color: var(--orange);
    width: 14px;
    height: 14px;
  }

  .remember span { font-size: 0.82rem; color: var(--muted); }

  .forgot {
    font-size: 0.82rem;
    color: var(--orange);
    text-decoration: none;
    opacity: 0.85;
  }

  .forgot:hover { opacity: 1; text-decoration: underline; }

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
  .btn-primary:active:not(:disabled) { transform: translateY(0); }

  .divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 22px 0;
  }

  .divider::before, .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .divider span {
    font-size: 0.72rem;
    color: #444;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .btn-ghost {
    width: 100%;
    padding: 12px;
    background: transparent;
    color: var(--muted);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }

  .btn-ghost:hover {
    border-color: var(--orange);
    color: var(--light);
    background: rgba(244,123,32,0.06);
  }

  .signup-cta {
    text-align: center;
    margin-top: 20px;
    font-size: 0.8rem;
    color: #555;
  }

  .signup-cta a {
    color: var(--orange);
    text-decoration: none;
    font-weight: 500;
  }

  .signup-cta a:hover { text-decoration: underline; }

  /* ─── RESPONSIVE ─────────────────────────────────────────────── */
  @media (max-width: 780px) {
    #login-page { grid-template-columns: 1fr; }
    .brand-panel { display: none; }
    .form-panel { padding: 40px 24px; }
    .login-heading { font-size: 2.4rem; }
  }
`;