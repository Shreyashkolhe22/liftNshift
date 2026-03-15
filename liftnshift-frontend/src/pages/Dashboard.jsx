import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyBookings } from "../store/bookingSlice";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const { bookings } = useSelector((s) => s.booking);
  const { token }    = useSelector((s) => s.auth);

  let userName = "there";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    userName = (payload.sub || "").split("@")[0] || "there";
  } catch (_) {}

  useEffect(() => { dispatch(fetchMyBookings()); }, [dispatch]);

  const total     = bookings.length;
  const pending   = bookings.filter((b) => b.status === "PENDING").length;
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
  const inProg    = bookings.filter((b) => b.status === "IN_PROGRESS").length;
  const completed = bookings.filter((b) => b.status === "COMPLETED").length;

  return (
    <>
      <style>{CSS}</style>
      <div className="d-page">
        <Navbar />

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="d-hero">
          <div className="d-container">

            <div className="d-hero-grid">

              {/* Left — headline */}
              <div className="d-hero-left">
                <p className="d-label">Home relocation service</p>
                <h1 className="d-h1">
                  Welcome back,<br />
                  <span className="d-h1-name">{userName}.</span>
                </h1>
                <p className="d-hero-p">
                  Manage your shifting bookings, track every move,
                  and stay in control — from pickup to doorstep delivery.
                </p>
                <div className="d-hero-actions">
                  <button className="d-btn-primary" onClick={() => navigate("/bookings/new")}>
                    Create new booking
                  </button>
                  <button className="d-btn-ghost" onClick={() => navigate("/my-bookings")}>
                    View bookings
                  </button>
                </div>
              </div>

              {/* Right — stats card */}
              <div className="d-stats-card">
                <p className="d-stats-eyebrow">Your overview</p>
                <div className="d-stats-grid">
                  <div className="d-stat">
                    <div className="d-stat-val" style={{ color: "#F47B20" }}>{total}</div>
                    <div className="d-stat-key">Total</div>
                  </div>
                  <div className="d-stat">
                    <div className="d-stat-val" style={{ color: "#FBBF24" }}>{pending}</div>
                    <div className="d-stat-key">Pending</div>
                  </div>
                  <div className="d-stat">
                    <div className="d-stat-val" style={{ color: "#3B9EFF" }}>{confirmed}</div>
                    <div className="d-stat-key">Confirmed</div>
                  </div>
                  <div className="d-stat">
                    <div className="d-stat-val" style={{ color: "#A78BFA" }}>{inProg}</div>
                    <div className="d-stat-key">In progress</div>
                  </div>
                </div>
                <div className="d-stats-sep" />
                <button className="d-stats-link" onClick={() => navigate("/my-bookings")}>
                  See all bookings
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <section className="d-section">
          <div className="d-container">

            <div className="d-sec-header">
              <p className="d-label">Process</p>
              <h2 className="d-h2">How it works</h2>
            </div>

            <div className="d-steps">
              {[
                { n: "01", title: "Create a booking",   desc: "Enter your pickup and drop addresses. Takes under two minutes.",              accent: "#F47B20" },
                { n: "02", title: "Add your items",     desc: "Choose from our catalog or add custom furniture and appliances.",            accent: "#FBBF24" },
                { n: "03", title: "We handle the rest", desc: "Our team confirms, packs, and delivers safely to your new home.",            accent: "#34D399" },
              ].map((s, i) => (
                <div className="d-step" key={i} style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="d-step-num" style={{ color: s.accent }}>{s.n}</div>
                  <div className="d-step-divider" style={{ background: s.accent }} />
                  <div className="d-step-title">{s.title}</div>
                  <div className="d-step-desc">{s.desc}</div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── WHY LIFTNSHIFT ───────────────────────────────────────── */}
        <section className="d-section d-section-alt">
          <div className="d-container">

            <div className="d-sec-header">
              <p className="d-label">Why us</p>
              <h2 className="d-h2">Built around your move</h2>
            </div>

            <div className="d-features">
              {[
                { title: "End-to-end tracking",    desc: "Every booking has a live status so you always know where things stand.",         num: "01" },
                { title: "Transparent pricing",    desc: "Pre-priced catalog items mean no surprise charges — see your total upfront.",    num: "02" },
                { title: "Flexible item list",     desc: "Add, remove, or update items at any point before the booking is in progress.",   num: "03" },
                { title: "Simple to use",          desc: "No complicated forms. Book in two steps, manage everything from one screen.",    num: "04" },
              ].map((f, i) => (
                <div className="d-feat" key={i} style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="d-feat-num">{f.num}</div>
                  <div className="d-feat-title">{f.title}</div>
                  <div className="d-feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section className="d-cta-section">
          <div className="d-container">
            <div className="d-cta">
              <div className="d-cta-left">
                <p className="d-label d-label-light">Get started</p>
                <h2 className="d-cta-h2">Ready to book your move?</h2>
                <p className="d-cta-p">Set up your first booking in under two minutes.</p>
                <button className="d-btn-primary" onClick={() => navigate("/bookings/new")}>
                  Create a booking
                </button>
              </div>
              <div className="d-cta-right">
                <div className="d-cta-stat-big">
                  <div className="d-cta-stat-val">{total}</div>
                  <div className="d-cta-stat-label">Bookings created</div>
                </div>
                <div className="d-cta-stat-big">
                  <div className="d-cta-stat-val" style={{ color: "#34D399" }}>{completed}</div>
                  <div className="d-cta-stat-label">Successfully completed</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer className="d-footer">
          <div className="d-container">
            <div className="d-footer-row">
              <div className="d-footer-logo">LiftNShift</div>
              <div className="d-footer-copy">
                Home Relocation Services &nbsp;·&nbsp; Built by Om &amp; Shreyash
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --dark: #0d0d0d;
  --surface: #141414;
  --card: #181818;
  --card2: #1e1e1e;
  --b: rgba(255,255,255,0.06);
  --b2: rgba(255,255,255,0.1);
  --light: #ede9e3;
  --muted: #555;
  --muted2: #3a3a3a;
  --o: #F47B20;
  --od: #D4601A;
}

body { background: var(--dark); font-family: 'DM Sans', sans-serif; color: var(--light); }
a    { text-decoration: none; color: inherit; }
.d-page { min-height: 100vh; }

/* CONTAINER */
.d-container { max-width: 1160px; margin: 0 auto; padding: 0 44px; }

/* LABELS */
.d-label {
  font-size: .7rem;
  text-transform: uppercase;
  letter-spacing: .22em;
  color: var(--o);
  margin-bottom: 12px;
}
.d-label-light { color: rgba(244,123,32,.7); }

/* ── HERO ── */
.d-hero {
  padding: 96px 0 104px;
  border-bottom: 1px solid var(--b);
  position: relative;
  overflow: hidden;
}

/* Barely visible texture lines */
.d-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 79px,
      rgba(255,255,255,.018) 79px,
      rgba(255,255,255,.018) 80px
    );
  pointer-events: none;
}

.d-hero-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 64px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.d-h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(3.2rem, 6vw, 5.6rem);
  letter-spacing: .02em;
  line-height: .98;
  color: var(--light);
  margin-bottom: 22px;
  animation: rise .6s ease both;
}

.d-h1-name {
  color: var(--o);
  display: block;
}

.d-hero-p {
  font-size: .97rem;
  color: var(--muted);
  line-height: 1.8;
  max-width: 420px;
  margin-bottom: 38px;
  font-weight: 300;
  animation: rise .6s ease .07s both;
}

.d-hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  animation: rise .6s ease .12s both;
}

@keyframes rise {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* BUTTONS */
.d-btn-primary {
  background: var(--o);
  color: #fff;
  border: none;
  padding: 13px 26px;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: .88rem;
  font-weight: 500;
  letter-spacing: .01em;
  cursor: pointer;
  transition: background .2s, transform .15s, box-shadow .2s;
  box-shadow: 0 4px 20px rgba(244,123,32,.28);
}
.d-btn-primary:hover {
  background: var(--od);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(244,123,32,.38);
}

.d-btn-ghost {
  background: none;
  color: var(--muted);
  border: 1px solid var(--b2);
  padding: 13px 22px;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: .88rem;
  cursor: pointer;
  transition: color .2s, border-color .2s, background .2s;
}
.d-btn-ghost:hover {
  color: var(--light);
  border-color: rgba(255,255,255,.2);
  background: rgba(255,255,255,.03);
}

/* STATS CARD */
.d-stats-card {
  background: var(--card);
  border: 1px solid var(--b);
  border-radius: 16px;
  padding: 28px 26px;
  animation: rise .6s ease .18s both;
  position: relative;
}

.d-stats-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, var(--o), transparent 60%);
  border-radius: 16px 16px 0 0;
}

.d-stats-eyebrow {
  font-size: .65rem;
  text-transform: uppercase;
  letter-spacing: .2em;
  color: var(--muted);
  margin-bottom: 22px;
}

.d-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 22px;
}

.d-stat {
  padding: 14px;
  background: rgba(255,255,255,.025);
  border: 1px solid var(--b);
  border-radius: 10px;
  text-align: center;
}

.d-stat-val {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2.2rem;
  letter-spacing: .04em;
  line-height: 1;
  margin-bottom: 5px;
}

.d-stat-key {
  font-size: .62rem;
  text-transform: uppercase;
  letter-spacing: .14em;
  color: var(--muted);
}

.d-stats-sep {
  height: 1px;
  background: var(--b);
  margin-bottom: 18px;
}

.d-stats-link {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: none;
  border: 1px solid var(--b2);
  color: var(--muted);
  padding: 10px;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: .82rem;
  cursor: pointer;
  transition: color .2s, border-color .2s, background .2s;
}
.d-stats-link:hover {
  color: var(--o);
  border-color: rgba(244,123,32,.3);
  background: rgba(244,123,32,.05);
}

/* ── SECTIONS ── */
.d-section {
  padding: 88px 0;
  border-bottom: 1px solid var(--b);
}

.d-section-alt {
  background: var(--surface);
}

.d-sec-header {
  margin-bottom: 56px;
  animation: rise .5s ease both;
}

.d-h2 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2rem, 3.5vw, 3rem);
  letter-spacing: .04em;
  color: var(--light);
  line-height: 1;
}

/* ── STEPS ── */
.d-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--b);
  border: 1px solid var(--b);
  border-radius: 14px;
  overflow: hidden;
}

.d-step {
  background: var(--card);
  padding: 36px 32px;
  animation: rise .5s ease both;
  transition: background .2s;
}

.d-step:hover { background: var(--card2); }

.d-step-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  letter-spacing: .08em;
  line-height: 1;
  margin-bottom: 16px;
}

.d-step-divider {
  width: 28px;
  height: 1.5px;
  border-radius: 2px;
  margin-bottom: 16px;
  opacity: .7;
}

.d-step-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--light);
  margin-bottom: 10px;
  letter-spacing: -.01em;
}

.d-step-desc {
  font-size: .84rem;
  color: var(--muted);
  line-height: 1.75;
  font-weight: 300;
}

/* ── FEATURES ── */
.d-features {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--b2);
  border: 1px solid var(--b2);
  border-radius: 14px;
  overflow: hidden;
}

.d-feat {
  background: var(--surface);
  padding: 32px 26px;
  animation: rise .5s ease both;
  transition: background .2s;
}
.d-feat:hover { background: var(--card); }

.d-feat-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: .9rem;
  letter-spacing: .12em;
  color: var(--muted2);
  margin-bottom: 14px;
}

.d-feat-title {
  font-size: .95rem;
  font-weight: 600;
  color: var(--light);
  margin-bottom: 10px;
  letter-spacing: -.01em;
  line-height: 1.3;
}

.d-feat-desc {
  font-size: .8rem;
  color: var(--muted);
  line-height: 1.75;
  font-weight: 300;
}

/* ── CTA ── */
.d-cta-section {
  padding: 88px 0;
  border-bottom: 1px solid var(--b);
}

.d-cta {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 80px;
  align-items: center;
  padding: 56px 60px;
  background: var(--card);
  border: 1px solid var(--b);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  animation: rise .5s ease both;
}

/* Subtle left-side accent */
.d-cta::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--o), transparent);
}

.d-cta-h2 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  letter-spacing: .04em;
  color: var(--light);
  margin-bottom: 8px;
  line-height: 1;
}

.d-cta-p {
  font-size: .88rem;
  color: var(--muted);
  margin-bottom: 28px;
  font-weight: 300;
}

.d-cta-right {
  display: flex;
  flex-direction: column;
  gap: 28px;
  text-align: right;
}

.d-cta-stat-val {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3.2rem;
  letter-spacing: .04em;
  color: var(--o);
  line-height: 1;
  margin-bottom: 4px;
}

.d-cta-stat-label {
  font-size: .68rem;
  text-transform: uppercase;
  letter-spacing: .16em;
  color: var(--muted);
}

/* ── FOOTER ── */
.d-footer {
  padding: 30px 0;
  border-top: 1px solid var(--b);
}

.d-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.d-footer-logo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.3rem;
  letter-spacing: .08em;
  color: rgba(255,255,255,.18);
}

.d-footer-copy {
  font-size: .72rem;
  color: var(--muted);
  letter-spacing: .02em;
}

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .d-features { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 860px) {
  .d-hero-grid { grid-template-columns: 1fr; gap: 40px; }
  .d-stats-card { max-width: 400px; }
  .d-steps { grid-template-columns: 1fr; }
  .d-cta { grid-template-columns: 1fr; gap: 40px; padding: 40px; }
  .d-cta-right { flex-direction: row; text-align: left; }
}

@media (max-width: 640px) {
  .d-container { padding: 0 20px; }
  .d-features { grid-template-columns: 1fr; }
  .d-hero { padding: 60px 0 72px; }
  .d-footer-row { flex-direction: column; gap: 8px; text-align: center; }
  .d-cta-right { flex-direction: column; }
}
`;