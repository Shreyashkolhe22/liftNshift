import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import Navbar from "../components/Navbar";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function formatAmount(a) {
  if (!a && a !== 0) return "₹0.00";
  return "₹" + Number(a).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}
function padId(id) { return "#" + String(id).padStart(4, "0"); }

const STATUS_CFG = {
  PENDING:     { label: "Pending",     color: "#FBBF24", bg: "rgba(251,191,36,.13)",  icon: "⏳" },
  CONFIRMED:   { label: "Confirmed",   color: "#3B9EFF", bg: "rgba(59,158,255,.13)",  icon: "✅" },
  IN_PROGRESS: { label: "In Progress", color: "#A78BFA", bg: "rgba(167,139,250,.13)", icon: "🚛" },
  COMPLETED:   { label: "Completed",   color: "#34D399", bg: "rgba(52,211,153,.13)",  icon: "🏠" },
  CANCELLED:   { label: "Cancelled",   color: "#F87171", bg: "rgba(248,113,113,.13)", icon: "✕" },
};

const PAY_CFG = {
  CREATED: { label: "Initiated", color: "#FBBF24", bg: "rgba(251,191,36,.12)" },
  SUCCESS: { label: "Paid",      color: "#34D399", bg: "rgba(52,211,153,.12)" },
  FAILED:  { label: "Failed",    color: "#F87171", bg: "rgba(248,113,113,.12)" },
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }) {
  return (
    <div className="pf-stat">
      <div className="pf-stat-val" style={{ color: accent }}>{value}</div>
      <div className="pf-stat-key">{label}</div>
    </div>
  );
}

// ─── BOOKING ROW ─────────────────────────────────────────────────────────────
function BookingRow({ booking, delay }) {
  const navigate = useNavigate();
  const st = STATUS_CFG[booking.status] || STATUS_CFG.PENDING;
  return (
    <div
      className="pf-row pf-row-booking"
      style={{ animationDelay: delay }}
      onClick={() => navigate(`/bookings/${booking.id}/detail`)}
    >
      <div className="pf-row-id">{padId(booking.id)}</div>

      <div className="pf-row-addrs">
        <div className="pf-addr">
          <span className="pf-dot pf-dot-pickup" />
          <span className="pf-addr-text">{booking.pickupAddress || "—"}</span>
        </div>
        <div className="pf-addr">
          <span className="pf-dot pf-dot-drop" />
          <span className="pf-addr-text">{booking.dropAddress || "—"}</span>
        </div>
      </div>

      <div
        className="pf-status-pill"
        style={{ color: st.color, background: st.bg }}
      >
        <span className="pf-status-icon">{st.icon}</span>
        {st.label}
      </div>

      <div className="pf-row-amount">{formatAmount(booking.totalAmount)}</div>

      <div className="pf-row-date">{formatDate(booking.createdAt)}</div>

      <div className="pf-row-action">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </div>
  );
}

// ─── PAYMENT ROW ─────────────────────────────────────────────────────────────
function PaymentRow({ payment, delay }) {
  const cfg = PAY_CFG[payment.status] || PAY_CFG.CREATED;
  return (
    <div className="pf-row pf-row-payment" style={{ animationDelay: delay }}>
      <div className="pf-row-id">{padId(payment.id)}</div>

      <div className="pf-pay-order">
        <div className="pf-pay-rzp">{payment.razorpayOrderId || "—"}</div>
        {payment.razorpayPaymentId && (
          <div className="pf-pay-pid">{payment.razorpayPaymentId}</div>
        )}
      </div>

      <div
        className="pf-status-pill"
        style={{ color: cfg.color, background: cfg.bg }}
      >
        {cfg.label}
      </div>

      <div className="pf-pay-method">
        {payment.paymentMethod || "—"}
      </div>

      <div className="pf-row-amount">{formatAmount(payment.amount)}</div>

      <div className="pf-row-date">{formatDate(payment.createdAt)}</div>
    </div>
  );
}

// ─── SECTION TABS ─────────────────────────────────────────────────────────────
const TABS = [
  { id: "bookings", label: "Bookings", icon: "🚛" },
  { id: "payments", label: "Payments", icon: "💳" },
];

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  // Decode user info from JWT
  let emailFromToken = "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    emailFromToken = payload.sub || "";
  } catch (_) {}

  const [profile, setProfile]   = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [activeTab, setActiveTab] = useState("bookings");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // 1. Fetch profile
        const { data: user } = await axiosInstance.get("/api/user/profile");
        setProfile(user);

        // 2. Fetch bookings
        const { data: bkList } = await axiosInstance.get("/api/bookings");
        setBookings(bkList);

        // 3. Fetch payments for each booking (parallel)
        const payResults = await Promise.allSettled(
          bkList.map((b) =>
            axiosInstance.get(`/api/payment/booking/${b.id}`)
          )
        );
        const allPayments = payResults
          .filter((r) => r.status === "fulfilled")
          .flatMap((r) => r.value.data);
        setPayments(allPayments);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Stats
  const totalBookings  = bookings.length;
  const completed      = bookings.filter((b) => b.status === "COMPLETED").length;
  const totalPaid      = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const inProgress     = bookings.filter((b) => b.status === "IN_PROGRESS").length;

  // ── Display name
  const displayName = profile?.name || emailFromToken.split("@")[0] || "User";
  const initials    = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <style>{CSS}</style>
      <div className="pf-page">
        <Navbar />

        {loading && (
          <div className="pf-loading">
            <div className="pf-spinner" />
            <p>Loading your profile…</p>
          </div>
        )}

        {!loading && error && (
          <div className="pf-wrap">
            <div className="pf-error">⚠ {error}</div>
          </div>
        )}

        {!loading && !error && (
          <div className="pf-wrap">

            {/* ── HERO BANNER ─────────────────────────────────────── */}
            <div className="pf-hero">
              <div className="pf-hero-grid">

                {/* Avatar + identity */}
                <div className="pf-identity">
                  <div className="pf-avatar-ring">
                    <div className="pf-avatar">{initials}</div>
                  </div>
                  <div className="pf-identity-text">
                    <p className="pf-eyebrow">Account profile</p>
                    <h1 className="pf-name">{displayName}</h1>
                    <p className="pf-email">{profile?.email || emailFromToken}</p>
                    {profile?.phone && (
                      <p className="pf-phone">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        {profile.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats strip */}
                <div className="pf-stats-strip">
                  <StatCard label="Total bookings"   value={totalBookings}         accent="#F47B20" />
                  <div className="pf-stat-div" />
                  <StatCard label="Completed"         value={completed}             accent="#34D399" />
                  <div className="pf-stat-div" />
                  <StatCard label="In progress"       value={inProgress}            accent="#A78BFA" />
                  <div className="pf-stat-div" />
                  <StatCard label="Total paid"        value={formatAmount(totalPaid)} accent="#3B9EFF" />
                </div>

              </div>

              {/* Quick actions */}
              <div className="pf-hero-actions">
                <button className="pf-btn-primary" onClick={() => navigate("/bookings/new")}>
                  + New booking
                </button>
                <button className="pf-btn-ghost" onClick={() => navigate("/my-bookings")}>
                  All bookings
                </button>
              </div>
            </div>

            {/* ── INFO CARDS ──────────────────────────────────────── */}
            <div className="pf-info-row">
              <div className="pf-info-card">
                <div className="pf-info-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <div className="pf-info-label">Full name</div>
                  <div className="pf-info-val">{profile?.name || "—"}</div>
                </div>
              </div>

              <div className="pf-info-card">
                <div className="pf-info-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <div className="pf-info-label">Email</div>
                  <div className="pf-info-val">{profile?.email || emailFromToken || "—"}</div>
                </div>
              </div>

              <div className="pf-info-card">
                <div className="pf-info-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <div className="pf-info-label">Phone</div>
                  <div className="pf-info-val">{profile?.phone || "—"}</div>
                </div>
              </div>

              <div className="pf-info-card">
                <div className="pf-info-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div>
                  <div className="pf-info-label">Member since</div>
                  <div className="pf-info-val">
                    {bookings.length > 0
                      ? formatDate(bookings.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]?.createdAt)
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* ── TABS ────────────────────────────────────────────── */}
            <div className="pf-tabs-bar">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`pf-tab ${activeTab === t.id ? "pf-tab-active" : ""}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  <span>{t.icon}</span>
                  {t.label}
                  <span className="pf-tab-count">
                    {t.id === "bookings" ? bookings.length : payments.length}
                  </span>
                </button>
              ))}
            </div>

            {/* ── BOOKINGS TABLE ───────────────────────────────────── */}
            {activeTab === "bookings" && (
              <div className="pf-section">
                {bookings.length === 0 ? (
                  <div className="pf-empty">
                    <div className="pf-empty-icon">🚛</div>
                    <div className="pf-empty-title">No bookings yet</div>
                    <div className="pf-empty-desc">Create your first home shifting booking.</div>
                    <button className="pf-btn-primary" onClick={() => navigate("/bookings/new")}>
                      + Create booking
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Table header */}
                    <div className="pf-table-head pf-table-head-booking">
                      <div>ID</div>
                      <div>Route</div>
                      <div>Status</div>
                      <div>Amount</div>
                      <div>Date</div>
                      <div></div>
                    </div>
                    {/* Rows */}
                    {bookings.map((b, i) => (
                      <BookingRow
                        key={b.id}
                        booking={b}
                        delay={`${i * 45}ms`}
                      />
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ── PAYMENTS TABLE ───────────────────────────────────── */}
            {activeTab === "payments" && (
              <div className="pf-section">
                {payments.length === 0 ? (
                  <div className="pf-empty">
                    <div className="pf-empty-icon">💳</div>
                    <div className="pf-empty-title">No payment history</div>
                    <div className="pf-empty-desc">Payments will appear here once you complete a booking.</div>
                  </div>
                ) : (
                  <>
                    {/* Table header */}
                    <div className="pf-table-head pf-table-head-payment">
                      <div>ID</div>
                      <div>Order / Payment ID</div>
                      <div>Status</div>
                      <div>Method</div>
                      <div>Amount</div>
                      <div>Date</div>
                    </div>
                    {/* Rows */}
                    {payments.map((p, i) => (
                      <PaymentRow
                        key={p.id}
                        payment={p}
                        delay={`${i * 45}ms`}
                      />
                    ))}

                    {/* Totals row */}
                    <div className="pf-pay-total-row">
                      <span className="pf-pay-total-label">Total paid</span>
                      <span className="pf-pay-total-val">{formatAmount(totalPaid)}</span>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        )}

        {/* Footer */}
        <footer className="pf-footer">
          <div className="pf-footer-inner">
            <div className="pf-footer-logo">LiftNShift</div>
            <div className="pf-footer-copy">
              Home Relocation Services &nbsp;·&nbsp; Built by Om &amp; Shreyash
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --dark:#0d0d0d;
  --surface:#141414;
  --card:#181818;
  --card2:#1e1e1e;
  --b:rgba(255,255,255,0.06);
  --b2:rgba(255,255,255,0.10);
  --light:#ede9e3;
  --muted:#555;
  --muted2:#3a3a3a;
  --o:#F47B20;
  --od:#D4601A;
}

body{background:var(--dark);font-family:'DM Sans',sans-serif;color:var(--light)}
a{text-decoration:none;color:inherit}

.pf-page{min-height:100vh;display:flex;flex-direction:column}

/* ── LOADING ── */
.pf-loading{
  flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
  color:var(--muted);font-size:.9rem;
}
.pf-spinner{
  width:36px;height:36px;
  border:2px solid var(--b2);
  border-top-color:var(--o);
  border-radius:50%;
  animation:spin .7s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── WRAP ── */
.pf-wrap{
  max-width:1160px;margin:0 auto;
  padding:48px 44px 80px;
  flex:1;width:100%;
}

.pf-error{
  background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);
  color:#F87171;padding:14px 20px;border-radius:10px;font-size:.88rem;
  margin-bottom:24px;
}

/* ── HERO ── */
.pf-hero{
  background:var(--card);
  border:1px solid var(--b);
  border-radius:20px;
  padding:40px 44px 32px;
  margin-bottom:24px;
  position:relative;
  overflow:hidden;
  animation:rise .55s ease both;
}
.pf-hero::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--o),transparent 60%);
  border-radius:20px 20px 0 0;
}
@keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

.pf-hero-grid{
  display:grid;
  grid-template-columns:auto 1fr;
  gap:48px;
  align-items:center;
  margin-bottom:32px;
}

/* Avatar */
.pf-avatar-ring{
  width:88px;height:88px;
  border-radius:50%;
  padding:2px;
  background:linear-gradient(135deg,var(--o),#D4601A);
  flex-shrink:0;
}
.pf-avatar{
  width:100%;height:100%;
  border-radius:50%;
  background:var(--card);
  border:2px solid var(--dark);
  display:flex;align-items:center;justify-content:center;
  font-family:'Bebas Neue',sans-serif;
  font-size:2rem;letter-spacing:.08em;
  color:var(--o);
}

.pf-identity{display:flex;align-items:center;gap:28px}
.pf-identity-text{display:flex;flex-direction:column;gap:4px}

.pf-eyebrow{
  font-size:.65rem;text-transform:uppercase;letter-spacing:.22em;
  color:var(--o);margin-bottom:4px;
}
.pf-name{
  font-family:'Bebas Neue',sans-serif;
  font-size:clamp(2rem,4vw,3.2rem);
  letter-spacing:.03em;line-height:1;color:var(--light);
}
.pf-email{font-size:.88rem;color:var(--muted);font-weight:300;margin-top:4px}
.pf-phone{
  display:flex;align-items:center;gap:6px;
  font-size:.82rem;color:var(--muted);margin-top:2px;
}

/* Stats strip */
.pf-stats-strip{
  display:flex;align-items:center;gap:0;
  background:rgba(255,255,255,.03);
  border:1px solid var(--b);
  border-radius:14px;
  padding:0 8px;
  height:90px;
}
.pf-stat{
  flex:1;text-align:center;padding:0 16px;
}
.pf-stat-val{
  font-family:'Bebas Neue',sans-serif;
  font-size:2rem;letter-spacing:.04em;line-height:1;
  margin-bottom:5px;
}
.pf-stat-key{
  font-size:.62rem;text-transform:uppercase;
  letter-spacing:.14em;color:var(--muted);
}
.pf-stat-div{
  width:1px;height:40px;
  background:var(--b2);flex-shrink:0;
}

/* Actions */
.pf-hero-actions{display:flex;gap:12px;flex-wrap:wrap}

.pf-btn-primary{
  background:var(--o);color:#fff;border:none;
  padding:12px 24px;border-radius:8px;
  font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:500;
  cursor:pointer;
  transition:background .2s,transform .15s,box-shadow .2s;
  box-shadow:0 4px 18px rgba(244,123,32,.28);
}
.pf-btn-primary:hover{background:var(--od);transform:translateY(-2px);box-shadow:0 10px 28px rgba(244,123,32,.36)}

.pf-btn-ghost{
  background:none;color:var(--muted);
  border:1px solid var(--b2);
  padding:12px 20px;border-radius:8px;
  font-family:'DM Sans',sans-serif;font-size:.88rem;
  cursor:pointer;
  transition:color .2s,border-color .2s,background .2s;
}
.pf-btn-ghost:hover{color:var(--light);border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.03)}

/* ── INFO CARDS ── */
.pf-info-row{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:12px;
  margin-bottom:24px;
  animation:rise .55s ease .07s both;
}
.pf-info-card{
  background:var(--card);
  border:1px solid var(--b);
  border-radius:14px;
  padding:20px 22px;
  display:flex;align-items:flex-start;gap:14px;
  transition:border-color .2s,background .2s;
}
.pf-info-card:hover{border-color:var(--b2);background:var(--card2)}

.pf-info-icon{
  width:36px;height:36px;flex-shrink:0;
  border-radius:9px;
  background:rgba(244,123,32,.1);
  border:1px solid rgba(244,123,32,.15);
  display:flex;align-items:center;justify-content:center;
  color:var(--o);
}
.pf-info-label{
  font-size:.62rem;text-transform:uppercase;
  letter-spacing:.14em;color:var(--muted);margin-bottom:5px;
}
.pf-info-val{font-size:.92rem;font-weight:500;color:var(--light);line-height:1.3}

/* ── TABS ── */
.pf-tabs-bar{
  display:flex;gap:4px;
  margin-bottom:16px;
  animation:rise .55s ease .12s both;
}
.pf-tab{
  display:flex;align-items:center;gap:8px;
  font-family:'DM Sans',sans-serif;font-size:.85rem;
  color:var(--muted);
  background:none;border:1px solid transparent;
  padding:10px 20px;border-radius:10px;
  cursor:pointer;
  transition:color .2s,border-color .2s,background .2s;
}
.pf-tab:hover{color:var(--light);background:rgba(255,255,255,.04)}
.pf-tab-active{
  color:var(--o);border-color:rgba(244,123,32,.25);
  background:rgba(244,123,32,.07);font-weight:500;
}
.pf-tab-count{
  font-size:.68rem;
  background:rgba(255,255,255,.08);
  border-radius:10px;padding:2px 8px;
  min-width:22px;text-align:center;
  color:var(--muted);
}
.pf-tab-active .pf-tab-count{background:rgba(244,123,32,.18);color:var(--o)}

/* ── SECTION / TABLE ── */
.pf-section{
  background:var(--card);
  border:1px solid var(--b);
  border-radius:18px;
  overflow:hidden;
  animation:rise .55s ease .15s both;
}

/* Table headers */
.pf-table-head{
  display:grid;
  padding:12px 22px;
  border-bottom:1px solid var(--b);
  font-size:.62rem;text-transform:uppercase;
  letter-spacing:.14em;color:var(--muted);
}
.pf-table-head-booking{
  grid-template-columns:60px 1fr 130px 110px 110px 36px;
  gap:12px;
}
.pf-table-head-payment{
  grid-template-columns:60px 1fr 110px 110px 110px 100px;
  gap:12px;
}

/* Rows */
.pf-row{
  display:grid;
  gap:12px;
  padding:16px 22px;
  border-bottom:1px solid var(--b);
  align-items:center;
  animation:rise .4s ease both;
  transition:background .2s;
}
.pf-row:last-of-type{border-bottom:none}

.pf-row-booking{
  grid-template-columns:60px 1fr 130px 110px 110px 36px;
  cursor:pointer;
}
.pf-row-booking:hover{background:rgba(255,255,255,.025)}

.pf-row-payment{
  grid-template-columns:60px 1fr 110px 110px 110px 100px;
}

.pf-row-id{
  font-family:'Bebas Neue',sans-serif;
  font-size:1rem;letter-spacing:.1em;
  color:var(--muted);
}

/* Booking row — address column */
.pf-row-addrs{display:flex;flex-direction:column;gap:5px;min-width:0}
.pf-addr{display:flex;align-items:center;gap:8px;min-width:0}
.pf-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.pf-dot-pickup{background:#F47B20}
.pf-dot-drop{background:#34D399}
.pf-addr-text{
  font-size:.85rem;color:var(--light);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}

/* Status pill */
.pf-status-pill{
  display:inline-flex;align-items:center;gap:6px;
  font-size:.72rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
  padding:5px 12px;border-radius:20px;
  white-space:nowrap;
}
.pf-status-icon{font-size:.8rem}

/* Payment row */
.pf-pay-order{min-width:0}
.pf-pay-rzp{
  font-size:.78rem;color:var(--light);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.pf-pay-pid{
  font-size:.7rem;color:var(--muted);margin-top:2px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.pf-pay-method{
  font-size:.82rem;color:var(--muted);
  text-transform:capitalize;
}

/* Amount */
.pf-row-amount{
  font-family:'Bebas Neue',sans-serif;
  font-size:1.2rem;letter-spacing:.04em;
  color:var(--light);
}

/* Date */
.pf-row-date{font-size:.8rem;color:var(--muted)}

/* Arrow action */
.pf-row-action{
  color:var(--muted);
  display:flex;align-items:center;justify-content:flex-end;
  transition:color .2s,transform .2s;
}
.pf-row-booking:hover .pf-row-action{color:var(--o);transform:translateX(3px)}

/* Payments total row */
.pf-pay-total-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:16px 22px;
  border-top:1px solid var(--b2);
  background:rgba(255,255,255,.02);
}
.pf-pay-total-label{
  font-size:.72rem;text-transform:uppercase;
  letter-spacing:.14em;color:var(--muted);
}
.pf-pay-total-val{
  font-family:'Bebas Neue',sans-serif;
  font-size:1.5rem;letter-spacing:.04em;
  color:#34D399;
}

/* ── EMPTY ── */
.pf-empty{
  text-align:center;padding:72px 24px;
}
.pf-empty-icon{font-size:3.5rem;margin-bottom:16px}
.pf-empty-title{
  font-family:'Bebas Neue',sans-serif;
  font-size:1.8rem;letter-spacing:.04em;color:var(--light);margin-bottom:8px;
}
.pf-empty-desc{font-size:.85rem;color:var(--muted);margin-bottom:24px;line-height:1.7}

/* ── FOOTER ── */
.pf-footer{border-top:1px solid var(--b);padding:28px 0;margin-top:auto}
.pf-footer-inner{
  max-width:1160px;margin:0 auto;padding:0 44px;
  display:flex;align-items:center;justify-content:space-between;
}
.pf-footer-logo{
  font-family:'Bebas Neue',sans-serif;
  font-size:1.2rem;letter-spacing:.08em;
  color:rgba(255,255,255,.15);
}
.pf-footer-copy{font-size:.72rem;color:var(--muted);letter-spacing:.02em}

/* ── RESPONSIVE ── */
@media(max-width:1024px){
  .pf-info-row{grid-template-columns:repeat(2,1fr)}
  .pf-hero-grid{grid-template-columns:1fr;gap:28px}
  .pf-stats-strip{height:auto;flex-wrap:wrap;padding:16px}
  .pf-stat-div{display:none}
  .pf-stat{flex:1 1 40%;padding:12px 8px}
}
@media(max-width:860px){
  .pf-table-head-booking,.pf-row-booking{
    grid-template-columns:60px 1fr 110px 90px;
  }
  .pf-table-head-booking div:nth-child(5),
  .pf-row-booking .pf-row-date{ display:none }
  .pf-table-head-payment,.pf-row-payment{
    grid-template-columns:60px 1fr 90px 90px;
  }
  .pf-table-head-payment div:nth-child(4),
  .pf-row-payment .pf-pay-method,
  .pf-table-head-payment div:nth-child(6),
  .pf-row-payment .pf-row-date{ display:none }
}
@media(max-width:640px){
  .pf-wrap{padding:28px 16px 60px}
  .pf-hero{padding:28px 22px 24px}
  .pf-info-row{grid-template-columns:1fr}
  .pf-identity{flex-direction:column;align-items:flex-start;gap:16px}
  .pf-table-head{display:none}
  .pf-row-booking,.pf-row-payment{
    grid-template-columns:1fr auto;
    grid-template-rows:auto auto;
    gap:8px;
  }
  .pf-row-id{display:none}
  .pf-footer-inner{flex-direction:column;gap:8px;text-align:center}
}
`;