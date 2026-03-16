import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyBookings, deleteBooking } from "../store/bookingSlice";
import Navbar from "../components/Navbar";

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS = {
  PENDING: { label: "PENDING", color: "#B97A2A", rgb: "185,122,42", bg: "#7C4F1A", icon: "⏳", textColor: "#E8A84A" },
  CONFIRMED: { label: "CONFIRMED", color: "#1E4E7A", rgb: "30,78,122", bg: "#1A3F6A", icon: "✅", textColor: "#4AADE8" },
  IN_PROGRESS: { label: "IN PROGRESS", color: "#5B3E9E", rgb: "91,62,158", bg: "#4A2E8A", icon: "🚛", textColor: "#A78BFA" },
  COMPLETED: { label: "COMPLETED", color: "#1A6A42", rgb: "26,106,66", bg: "#145A36", icon: "🏠", textColor: "#34D399" },
  CANCELLED: { label: "CANCELLED", color: "#7A1E1E", rgb: "122,30,30", bg: "#6A1515", icon: "✕", textColor: "#F87171" },
};

const FILTERS = ["ALL", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const FILTER_LABELS = {
  ALL: "All", PENDING: "Pending", CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress", COMPLETED: "Completed", CANCELLED: "Cancelled",
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function formatAmount(a) {
  if (!a || Number(a) === 0) return "₹0.00";
  return "₹" + Number(a).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}
function truncate(s, n = 20) {
  if (!s) return "—";
  return s.length > n ? s.slice(0, n) + "…" : s;
}
function padId(id) { return "#" + String(id).padStart(4, "0"); }

// ─── BOOKING CARD — matches screenshot exactly ───────────────────────────────
function BookingCard({ booking, onDelete, delay }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const overlayRef = useRef(null);
  const st = STATUS[booking.status] || STATUS.PENDING;

  // Spotlight pointer tracking
  useEffect(() => {
    const move = (e) => {
      if (!cardRef.current) return;
      cardRef.current.style.setProperty("--mx", e.clientX + "px");
      cardRef.current.style.setProperty("--my", e.clientY + "px");
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  // Reveal overlay on hover
  const clipStart = "circle(70px at 50% 0%)";
  const clipExpand = "circle(200% at 50% 0%)";

  function onEnter() {
    if (overlayRef.current) overlayRef.current.style.clipPath = clipExpand;
  }
  function onLeave() {
    if (overlayRef.current) overlayRef.current.style.clipPath = clipStart;
  }

  function handleDelete(e) {
    e.stopPropagation();
    if (window.confirm("Delete this booking?")) onDelete(booking.id);
  }

  // Card content — reused for both base and overlay
  function CardContent({ overlay }) {
    return (
      <>
        {/* ── TOP HEADER BAR with blob shape ── */}
        <div
          className="card-header-bar"
          style={{ background: st.bg }}
        >
          {/* Blob that extends downward */}
          <div className="card-header-blob" style={{ background: st.bg }} />

          <div className="card-header-inner">
            {/* Status pill — icon in small circle + label */}
            <div className="card-status-pill">
              <div
                className="card-status-circle"
                style={{ background: overlay ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.15)" }}
              >
                <span className="card-status-circle-icon">{st.icon}</span>
              </div>
              <span
                className="card-status-text"
                style={{ color: overlay ? "#fff" : st.textColor }}
              >
                {st.label}
              </span>
            </div>

            {/* Booking ID */}
            <div
              className="card-booking-id"
              style={{ color: overlay ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.35)" }}
            >
              {padId(booking.id)}
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="card-body">
          {/* Pickup */}
          <div className="card-location-row">
            <div className="card-dot pickup-dot" />
            <div>
              <div className="card-loc-label" style={{ color: overlay ? "rgba(255,255,255,0.45)" : "" }}>
                PICKUP LOCATION
              </div>
              <div className="card-loc-value" style={{ color: overlay ? "#fff" : "" }}>
                {truncate(booking.pickupAddress)}
              </div>
            </div>
          </div>

          {/* Truck divider */}
          <div className="card-truck-row">
            <span className="card-truck-icon">🚛</span>
          </div>

          {/* Drop */}
          <div className="card-location-row">
            <div className="card-dot drop-dot" />
            <div>
              <div className="card-loc-label" style={{ color: overlay ? "rgba(255,255,255,0.45)" : "" }}>
                DROP LOCATION
              </div>
              <div className="card-loc-value" style={{ color: overlay ? "#fff" : "" }}>
                {truncate(booking.dropAddress)}
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="card-footer"
          style={{ borderTopColor: overlay ? "rgba(255,255,255,0.1)" : "" }}
        >
          <div>
            <div className="card-footer-label" style={{ color: overlay ? "rgba(255,255,255,0.4)" : "" }}>
              BOOKED ON
            </div>
            <div className="card-footer-date" style={{ color: overlay ? "rgba(255,255,255,0.85)" : "" }}>
              {formatDate(booking.createdAt)}
            </div>
          </div>
          <div
            className="card-amount"
            style={{ color: overlay ? "#fff" : st.textColor }}
          >
            {formatAmount(booking.totalAmount)}
          </div>
        </div>

        {/* ── ACTIONS ── */}
        <div className="card-actions"
          style={{ borderTopColor: overlay ? "rgba(255,255,255,0.1)" : "" }}
        >
          <button
            className="card-btn-view"
            style={overlay ? {
              background: "rgba(255,255,255,0.12)",
              borderColor: "rgba(255,255,255,0.2)",
              color: "#fff",
            } : {}}
            onClick={(e) => { e.stopPropagation(); navigate(`/bookings/${booking.id}/detail`); }}
          >
            View Details →
          </button>
          <button
            className="card-btn-del"
            style={overlay ? { borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.4)" } : {}}
            onClick={handleDelete}
            title="Delete booking"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </>
    );
  }

  return (
    <div
      ref={cardRef}
      className="bk-card"
      style={{
        animationDelay: delay,
        "--accent-rgb": st.rgb,
        "--accent-bg": st.bg,
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={() => navigate(`/bookings/${booking.id}/detail`)}
    >
      {/* BASE */}
      <div className="bk-base">
        <CardContent overlay={false} />
      </div>

      {/* OVERLAY — clips in from top on hover */}
      <div
        ref={overlayRef}
        className="bk-overlay"
        style={{
          clipPath: clipStart,
          background: `linear-gradient(160deg, rgba(${st.rgb},0.28) 0%, rgba(${st.rgb},0.10) 100%)`,
        }}
      >
        <CardContent overlay={true} />
      </div>
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ filtered }) {
  const navigate = useNavigate();
  return (
    <div className="mb-empty">
      <div className="mb-empty-icon">{filtered ? "🔍" : "🚛"}</div>
      <h3 className="mb-empty-title">{filtered ? "No matching bookings" : "No bookings yet"}</h3>
      <p className="mb-empty-desc">
        {filtered ? "Try a different filter." : "Create your first home shifting booking."}
      </p>
      {!filtered && (
        <button className="mb-btn-primary" onClick={() => navigate("/bookings/new")}>
          + Create First Booking
        </button>
      )}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function MyBookings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookings, loading, error } = useSelector((s) => s.booking);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => { dispatch(fetchMyBookings()); }, [dispatch]);

  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);
  const counts = {};
  bookings.forEach((b) => { counts[b.status] = (counts[b.status] || 0) + 1; });

  return (
    <>
      <style>{CSS}</style>
      <div className="mb-page">
        <Navbar />
        <div className="mb-wrap">

          {/* HEADER */}
          <div className="mb-header">
            <div>
              <p className="mb-eyebrow">Track &amp; manage</p>
              <h1 className="mb-title">My Bookings</h1>
              <p className="mb-sub">{bookings.length} booking{bookings.length !== 1 ? "s" : ""} total</p>
            </div>
            <button className="mb-btn-new" onClick={() => navigate("/bookings/new")}>
              + New Booking
            </button>
          </div>

          {/* FILTER PILLS */}
          <div className="mb-filters">
            {FILTERS.map((f) => {
              const st = STATUS[f];
              const count = f === "ALL" ? bookings.length : (counts[f] || 0);
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  className={`mb-pill ${isActive ? "mb-pill-active" : ""}`}
                  style={isActive && st ? {
                    borderColor: st.textColor,
                    color: st.textColor,
                    background: `rgba(${st.rgb},0.12)`,
                  } : {}}
                  onClick={() => setFilter(f)}
                >
                  {FILTER_LABELS[f]}
                  <span className="mb-pill-count">{count}</span>
                </button>
              );
            })}
          </div>

          {error && <div className="mb-error">⚠ {error}</div>}

          {loading && (
            <div className="mb-grid">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="mb-skeleton" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && <EmptyState filtered={filter !== "ALL"} />}

          {!loading && filtered.length > 0 && (
            <div className="mb-grid">
              {filtered.map((b, i) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onDelete={(id) => dispatch(deleteBooking(id))}
                  delay={`${i * 55}ms`}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --dark:#0d0d0d;
  --card:#181818;
  --card2:#1f1f1f;
  --b:rgba(255,255,255,0.07);
  --b2:rgba(255,255,255,0.11);
  --light:#f0ede8;
  --muted:#606060;
  --o:#F47B20;
  --od:#D4601A;
}
body{background:var(--dark);font-family:'DM Sans',sans-serif;color:var(--light)}
a{text-decoration:none;color:inherit}
.mb-page{min-height:100vh}
.mb-wrap{max-width:1280px;margin:0 auto;padding:52px 40px 100px}

/* HEADER */
.mb-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:36px;animation:fup .5s ease both}
.mb-eyebrow{font-size:.72rem;text-transform:uppercase;letter-spacing:.22em;color:var(--o);margin-bottom:6px}
.mb-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,5vw,4rem);letter-spacing:.04em;color:var(--light);line-height:1}
.mb-sub{font-size:.78rem;color:var(--muted);margin-top:6px;letter-spacing:.04em}
.mb-btn-new{background:var(--o);color:#fff;border:none;padding:13px 26px;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:500;cursor:pointer;white-space:nowrap;transition:background .2s,transform .15s,box-shadow .2s;box-shadow:0 6px 22px rgba(244,123,32,.32)}
.mb-btn-new:hover{background:var(--od);transform:translateY(-2px);box-shadow:0 12px 32px rgba(244,123,32,.42)}
@keyframes fup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

/* FILTER PILLS */
.mb-filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:36px;animation:fup .5s ease .05s both}
.mb-pill{display:flex;align-items:center;gap:8px;font-family:'DM Sans',sans-serif;font-size:.8rem;color:var(--muted);background:none;border:1px solid var(--b);padding:8px 16px;border-radius:24px;cursor:pointer;transition:color .2s,border-color .2s,background .2s}
.mb-pill:hover{color:var(--light);border-color:var(--b2)}
.mb-pill-active{font-weight:500}
.mb-pill-count{font-size:.68rem;background:rgba(255,255,255,.07);border-radius:10px;padding:2px 8px;min-width:22px;text-align:center}
.mb-error{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);color:#F87171;padding:12px 18px;border-radius:10px;margin-bottom:24px;font-size:.86rem}

/* GRID */
.mb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px}
.mb-skeleton{height:300px;background:var(--card);border-radius:18px;animation:pulse 1.4s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

/* ══════════════════════════════════════════════════════════
   BOOKING CARD
   - Matches screenshot: colored blob header + dark body
   - Overlay layer reveals from top on hover (clip-path circle)
   - Spotlight glow follows cursor
══════════════════════════════════════════════════════════ */
.bk-card{
  position:relative;
  border-radius:18px;
  border:1px solid var(--b);
  overflow:hidden;
  cursor:pointer;
  animation:fup .5s ease both;
  transition:border-color .3s,transform .25s,box-shadow .3s;
  background:
    radial-gradient(
      300px 300px at var(--mx,-999px) var(--my,-999px),
      rgba(var(--accent-rgb),0.055),
      transparent
    ),
    var(--card);
  background-attachment:fixed,local;
}
.bk-card:hover{
  border-color:rgba(var(--accent-rgb),0.35);
  transform:translateY(-5px);
  box-shadow:0 24px 64px rgba(0,0,0,.55), 0 0 0 1px rgba(var(--accent-rgb),0.12);
}

/* BASE & OVERLAY */
.bk-base{position:relative;z-index:1}
.bk-overlay{
  position:absolute;
  inset:0;z-index:2;
  clip-path:circle(70px at 50% 0%);
  transition:clip-path 0.72s cubic-bezier(0.76,0,0.24,1);
  border-radius:18px;
}

/* ─── HEADER BAR (the colored blob at top) ─── */
.card-header-bar{
  position:relative;
  padding:14px 18px 36px;
  border-radius:0;
  overflow:visible;
  z-index:1;
}

/* The blob that drops down in a circle shape - exactly like screenshot */
.card-header-blob{
  position:absolute;
  bottom:-28px;
  left:-10%;
  width:120%;
  height:56px;
  border-radius:0 0 50% 50%;
  z-index:0;
}

.card-header-inner{
  position:relative;
  z-index:1;
  display:flex;
  align-items:center;
  justify-content:space-between;
}

/* STATUS PILL — small circle icon + text */
.card-status-pill{
  display:flex;
  align-items:center;
  gap:9px;
}

.card-status-circle{
  width:28px;height:28px;
  border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
}

.card-status-circle-icon{
  font-size:.85rem;
  line-height:1;
}

.card-status-text{
  font-size:.75rem;
  font-weight:700;
  letter-spacing:.14em;
  text-transform:uppercase;
}

.card-booking-id{
  font-family:'Bebas Neue',sans-serif;
  font-size:1.05rem;
  letter-spacing:.1em;
}

/* ─── BODY ─── */
.card-body{
  padding:32px 18px 18px;
  display:flex;
  flex-direction:column;
  gap:0;
}

.card-location-row{
  display:flex;
  align-items:flex-start;
  gap:12px;
}

.card-dot{
  width:11px;height:11px;
  border-radius:50%;
  flex-shrink:0;
  margin-top:4px;
}
.pickup-dot{background:#F47B20}
.drop-dot{background:#34D399}

.card-loc-label{
  font-size:.62rem;
  text-transform:uppercase;
  letter-spacing:.14em;
  color:var(--muted);
  margin-bottom:3px;
}

.card-loc-value{
  font-size:1.08rem;
  font-weight:600;
  color:var(--light);
  line-height:1.3;
}

.card-truck-row{
  padding:8px 0 8px 5px;
  display:flex;
  align-items:center;
}
.card-truck-icon{font-size:1rem}

/* ─── FOOTER ─── */
.card-footer{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:16px 18px;
  border-top:1px solid var(--b);
  margin-top:8px;
}

.card-footer-label{
  font-size:.6rem;
  text-transform:uppercase;
  letter-spacing:.14em;
  color:var(--muted);
  margin-bottom:3px;
}

.card-footer-date{
  font-size:.88rem;
  font-weight:500;
  color:var(--light);
}

.card-amount{
  font-family:'Bebas Neue',sans-serif;
  font-size:1.65rem;
  letter-spacing:.04em;
  line-height:1;
}

/* ─── ACTIONS ─── */
.card-actions{
  display:flex;
  align-items:center;
  gap:10px;
  padding:12px 18px 16px;
  border-top:1px solid var(--b);
}

.card-btn-view{
  flex:1;
  font-family:'DM Sans',sans-serif;
  font-size:.85rem;
  font-weight:500;
  color:var(--light);
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.1);
  padding:11px 16px;
  border-radius:9px;
  cursor:pointer;
  transition:background .2s,border-color .2s,color .2s;
  text-align:center;
}
.card-btn-view:hover{background:rgba(255,255,255,.09)}

.card-btn-del{
  background:none;
  border:1px solid var(--b);
  color:var(--muted);
  width:38px;height:38px;
  border-radius:9px;
  cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
  transition:background .2s,border-color .2s,color .2s;
}
.card-btn-del:hover{background:rgba(248,113,113,.12);border-color:rgba(248,113,113,.3);color:#F87171}

/* EMPTY */
.mb-empty{text-align:center;padding:90px 20px;animation:fup .5s ease both}
.mb-empty-icon{font-size:4rem;margin-bottom:18px}
.mb-empty-title{font-family:'Bebas Neue',sans-serif;font-size:2.2rem;letter-spacing:.04em;color:var(--light);margin-bottom:10px}
.mb-empty-desc{color:var(--muted);font-size:.9rem;max-width:320px;margin:0 auto 24px;line-height:1.75}
.mb-btn-primary{background:var(--o);color:#fff;border:none;padding:13px 28px;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.92rem;font-weight:500;cursor:pointer;transition:background .2s,transform .15s;box-shadow:0 6px 24px rgba(244,123,32,.35)}
.mb-btn-primary:hover{background:var(--od);transform:translateY(-2px)}

/* RESPONSIVE */
@media(max-width:860px){.mb-grid{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}}
@media(max-width:640px){
  .mb-wrap{padding:28px 16px 60px}
  .mb-header{flex-direction:column;align-items:flex-start;gap:14px}
  .mb-title{font-size:2.5rem}
  .mb-grid{grid-template-columns:1fr}
}
`;