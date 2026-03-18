import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchBookingById } from "../store/bookingSlice";
import { fetchItemsByBooking } from "../store/itemSlice";
import axiosInstance from "../utils/axiosInstance";
import Navbar from "../components/Navbar";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function formatPrice(p) {
    if (!p && p !== 0) return "₹0.00";
    return "₹" + Number(p).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}
function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit", month: "long", year: "numeric",
    });
}

// ─── Load Razorpay checkout script dynamically ────────────────────────────────
function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (document.getElementById("razorpay-script")) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.id = "razorpay-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

// ─── BOOKING CONFIRMATION PAGE ────────────────────────────────────────────────
export default function BookingConfirmation() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { selected: booking, loading: bLoading } = useSelector((s) => s.booking);
    const { bookingItems, loading: iLoading } = useSelector((s) => s.item);
    const { token } = useSelector((s) => s.auth);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);
    const [paymentId, setPaymentId] = useState("");

    useEffect(() => {
        dispatch(fetchBookingById(id));
        dispatch(fetchItemsByBooking(id));
        // Pre-load Razorpay script in background
        loadRazorpayScript();
    }, [dispatch, id]);

    // ── Derive user name from JWT for Razorpay prefill ───────────────────────
    let userName = "";
    let userEmail = "";
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userEmail = payload.sub || "";
        userName = userEmail.split("@")[0] || "";
    } catch (_) { }

    const subtotal = bookingItems.reduce((s, i) => s + Number(i.price || 0), 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    // ── MAIN PAYMENT HANDLER ──────────────────────────────────────────────────
    async function handlePayNow() {
        setError("");

        if (bookingItems.length === 0) {
            setError("Add at least one item before paying.");
            return;
        }

        setPaying(true);

        try {
            // Step 1 — Load Razorpay script
            const loaded = await loadRazorpayScript();
            if (!loaded || !window.Razorpay) {
                throw new Error("Failed to load Razorpay. Check your internet connection.");
            }

            // Step 2 — Create order on backend
            const { data: orderData } = await axiosInstance.post("/api/payment/create-order", {
                amount: total,       // in rupees — backend converts to paise
                bookingId: id,
            });

            // Step 3 — Open Razorpay popup
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,       // in paise
                currency: orderData.currency,
                name: "LiftNShift",
                description: `Home Shifting - Booking #${String(id).padStart(4, "0")}`,
                order_id: orderData.orderId,

                // Prefill user details
                prefill: {
                    name: userName,
                    email: userEmail,
                },

                // Theme matching our app
                theme: { color: "#F47B20" },

                // ── Success callback ─────────────────────────────────────────────
                handler: async function (response) {
                    try {
                        // Step 4 — Verify payment signature on backend
                        // Backend will: verify HMAC → save payment → confirm booking
                        // All in one atomic call — no separate status update needed
                        await axiosInstance.post("/api/payment/verify", {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            paymentMethod: response.razorpay_payment_method || "unknown",
                        });

                        setPaymentId(response.razorpay_payment_id);
                        setDone(true);
                        setPaying(false);

                        // Auto redirect to detail after 3s
                        setTimeout(() => navigate(`/bookings/${id}/detail`), 3000);

                    } catch (err) {
                        setError(err?.response?.data?.message ||
                            "Payment verified but booking update failed. Contact support with Payment ID: " +
                            response.razorpay_payment_id);
                        setPaying(false);
                    }
                },

                // ── Modal close / failure ────────────────────────────────────────
                modal: {
                    ondismiss: () => {
                        setPaying(false);
                        setError("Payment was cancelled. You can try again.");
                    },
                },
            };

            const rzp = new window.Razorpay(options);

            rzp.on("payment.failed", (response) => {
                setPaying(false);
                setError(`Payment failed: ${response.error.description}`);
            });

            rzp.open();

        } catch (err) {
            setPaying(false);
            setError(err?.response?.data?.message || err?.message || "Something went wrong. Please try again.");
        }
    }

    const loading = bLoading || iLoading;

    // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
    if (done) {
        return (
            <>
                <style>{CSS}</style>
                <div className="bc-page">
                    <Navbar />
                    <div className="bc-success">
                        <div className="bc-success-circle">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h2 className="bc-success-title">Payment Successful!</h2>
                        <p className="bc-success-sub">
                            Your booking has been confirmed.<br />
                            Redirecting to your booking details…
                        </p>
                        <div className="bc-success-meta">
                            <div className="bc-success-row">
                                <span>Booking</span>
                                <span>#{String(id).padStart(4, "0")}</span>
                            </div>
                            <div className="bc-success-row">
                                <span>Amount paid</span>
                                <span style={{ color: "#34D399" }}>{formatPrice(total)}</span>
                            </div>
                            <div className="bc-success-row">
                                <span>Payment ID</span>
                                <span className="bc-pid">{paymentId}</span>
                            </div>
                        </div>
                        <button
                            className="bc-go-btn"
                            onClick={() => navigate(`/bookings/${id}/detail`)}
                        >
                            Go to Booking →
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{CSS}</style>
            <div className="bc-page">
                <Navbar />
                <div className="bc-wrap">

                    {/* HEADER */}
                    <div className="bc-header">
                        <p className="bc-eyebrow">Almost there</p>
                        <h1 className="bc-title">Review &amp; Pay</h1>
                        <p className="bc-sub">Confirm your booking details and complete payment.</p>
                    </div>

                    {loading ? (
                        <div className="bc-loading">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="bc-skeleton"
                                    style={{ animationDelay: `${i * 80}ms` }} />
                            ))}
                        </div>
                    ) : (
                        <div className="bc-grid">

                            {/* ── LEFT ── */}
                            <div className="bc-left">

                                {/* Booking summary */}
                                <div className="bc-card" style={{ animationDelay: "0ms" }}>
                                    <div className="bc-card-label">Booking Summary</div>
                                    <div className="bc-summary-top">
                                        <div>
                                            <div className="bc-booking-id">
                                                Booking #{String(id).padStart(4, "0")}
                                            </div>
                                            <div className="bc-booking-date">
                                                {formatDate(booking?.createdAt)}
                                            </div>
                                        </div>
                                        <div className="bc-status-chip">Pending</div>
                                    </div>
                                    <div className="bc-route">
                                        <div className="bc-route-row">
                                            <div className="bc-rdot pickup" />
                                            <div>
                                                <div className="bc-rlabel">Pickup</div>
                                                <div className="bc-raddr">{booking?.pickupAddress || "—"}</div>
                                            </div>
                                        </div>
                                        <div className="bc-rconnect"><div className="bc-rline" /></div>
                                        <div className="bc-route-row">
                                            <div className="bc-rdot drop" />
                                            <div>
                                                <div className="bc-rlabel">Drop</div>
                                                <div className="bc-raddr">{booking?.dropAddress || "—"}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="bc-card" style={{ animationDelay: "60ms" }}>
                                    <div className="bc-card-label">
                                        Items ({bookingItems.length})
                                    </div>
                                    {bookingItems.length === 0 ? (
                                        <div className="bc-no-items">
                                            No items added.{" "}
                                            <button className="bc-link"
                                                onClick={() => navigate(`/bookings/${id}/detail`)}>
                                                Add items first
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bc-items-list">
                                            {bookingItems.map((item, i) => (
                                                <div key={item.id} className="bc-item-row"
                                                    style={{ animationDelay: `${i * 40}ms` }}>
                                                    <div className="bc-item-left">
                                                        <div className="bc-item-name">
                                                            {item.predefinedItemName || item.customName || "Custom item"}
                                                        </div>
                                                        {item.size && (
                                                            <span className="bc-item-tag">{item.size}</span>
                                                        )}
                                                    </div>
                                                    <div className="bc-item-right">
                                                        <span className="bc-item-qty">× {item.quantity}</span>
                                                        <span className="bc-item-price">
                                                            {formatPrice(item.price)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* ── RIGHT — payment ── */}
                            <div className="bc-right">
                                <div className="bc-total-card" style={{ animationDelay: "80ms" }}>
                                    <div className="bc-card-label">Order Total</div>

                                    {/* Price breakdown */}
                                    <div className="bc-total-rows">
                                        <div className="bc-total-row">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="bc-total-row">
                                            <span>Service charge (5%)</span>
                                            <span>{formatPrice(tax)}</span>
                                        </div>
                                        <div className="bc-total-row">
                                            <span>Delivery</span>
                                            <span className="bc-free">Free</span>
                                        </div>
                                    </div>

                                    <div className="bc-total-divider" />

                                    <div className="bc-grand-total">
                                        <span className="bc-grand-label">Total</span>
                                        <span className="bc-grand-val">{formatPrice(total)}</span>
                                    </div>

                                    {/* Razorpay notice */}
                                    <div className="bc-rzp-notice">
                                        <svg width="16" height="16" fill="none" stroke="currentColor"
                                            strokeWidth="2" viewBox="0 0 24 24">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                            <line x1="1" y1="10" x2="23" y2="10" />
                                        </svg>
                                        Secured by Razorpay · UPI, Cards, Net Banking accepted
                                    </div>

                                    {error && <div className="bc-error">{error}</div>}

                                    {/* PAY NOW button */}
                                    <button
                                        className="bc-pay-btn"
                                        onClick={handlePayNow}
                                        disabled={paying || bookingItems.length === 0}
                                    >
                                        {paying ? (
                                            <span className="bc-pay-loading">
                                                <span className="bc-spinner" />
                                                Opening payment…
                                            </span>
                                        ) : (
                                            `Pay ${formatPrice(total)}`
                                        )}
                                    </button>

                                    {bookingItems.length === 0 && (
                                        <p className="bc-warn">Add at least one item to pay.</p>
                                    )}

                                    <button
                                        className="bc-back-btn"
                                        onClick={() => navigate(`/bookings/${id}/detail`)}
                                    >
                                        ← Go back &amp; edit items
                                    </button>

                                    {/* Trust badges */}
                                    <div className="bc-trust">
                                        <div className="bc-trust-item">
                                            <svg width="13" height="13" fill="none" stroke="currentColor"
                                                strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            </svg>
                                            256-bit SSL secured
                                        </div>
                                        <div className="bc-trust-item">
                                            <svg width="13" height="13" fill="none" stroke="currentColor"
                                                strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                <polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                            Free cancellation
                                        </div>
                                    </div>

                                </div>
                            </div>

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
  --dark:#0d0d0d;--surface:#141414;--card:#191919;--card2:#202020;
  --b:rgba(255,255,255,0.07);--b2:rgba(255,255,255,0.11);
  --light:#f0ede8;--muted:#606060;--o:#F47B20;--od:#D4601A;
}
body{background:var(--dark);font-family:'DM Sans',sans-serif;color:var(--light)}
a{text-decoration:none;color:inherit}
.bc-page{min-height:100vh}
.bc-wrap{max-width:1100px;margin:0 auto;padding:52px 40px 100px}

.bc-header{margin-bottom:40px;animation:fup .45s ease both}
.bc-eyebrow{font-size:.7rem;text-transform:uppercase;letter-spacing:.22em;color:var(--o);margin-bottom:8px}
.bc-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.2rem,4vw,3.2rem);letter-spacing:.04em;color:var(--light);line-height:1;margin-bottom:8px}
.bc-sub{font-size:.9rem;color:var(--muted)}
@keyframes fup{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

.bc-loading{display:flex;flex-direction:column;gap:14px}
.bc-skeleton{height:160px;background:var(--card);border-radius:16px;animation:pulse 1.4s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

.bc-grid{display:grid;grid-template-columns:1fr 360px;gap:20px;align-items:start}
.bc-left{display:flex;flex-direction:column;gap:16px}
.bc-right{position:sticky;top:84px}

.bc-card{background:var(--card);border:1px solid var(--b);border-radius:16px;padding:28px;animation:fup .45s ease both}
.bc-card-label{font-size:.65rem;text-transform:uppercase;letter-spacing:.2em;color:var(--muted);margin-bottom:20px}

.bc-summary-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px}
.bc-booking-id{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:.06em;color:var(--light)}
.bc-booking-date{font-size:.78rem;color:var(--muted);margin-top:3px}
.bc-status-chip{font-size:.68rem;text-transform:uppercase;letter-spacing:.12em;font-weight:600;color:#FBBF24;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.2);padding:5px 12px;border-radius:20px}

.bc-route{display:flex;flex-direction:column;gap:0}
.bc-route-row{display:flex;align-items:flex-start;gap:14px}
.bc-rdot{width:12px;height:12px;border-radius:50%;flex-shrink:0;margin-top:3px}
.bc-rdot.pickup{background:#F47B20}
.bc-rdot.drop{background:#34D399}
.bc-rlabel{font-size:.62rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin-bottom:3px}
.bc-raddr{font-size:.95rem;font-weight:500;color:var(--light)}
.bc-rconnect{padding:6px 0 6px 5px}
.bc-rline{width:1px;height:18px;background:var(--b2)}

.bc-no-items{font-size:.86rem;color:var(--muted);padding:12px 0}
.bc-link{background:none;border:none;color:var(--o);font-size:.86rem;cursor:pointer;text-decoration:underline}
.bc-items-list{display:flex;flex-direction:column;gap:0}
.bc-item-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--b);animation:fup .35s ease both}
.bc-item-row:last-child{border-bottom:none}
.bc-item-left{display:flex;align-items:center;gap:10px;flex:1;min-width:0}
.bc-item-name{font-size:.9rem;font-weight:500;color:var(--light);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bc-item-tag{font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);background:var(--card2);padding:2px 8px;border-radius:10px;border:1px solid var(--b);flex-shrink:0}
.bc-item-right{display:flex;align-items:center;gap:14px;flex-shrink:0}
.bc-item-qty{font-size:.82rem;color:var(--muted)}
.bc-item-price{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:.04em;color:var(--o)}

/* TOTAL CARD */
.bc-total-card{background:var(--card);border:1px solid var(--b);border-radius:16px;padding:28px;animation:fup .45s ease .08s both;position:relative;overflow:hidden}
.bc-total-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--o),transparent)}
.bc-total-rows{display:flex;flex-direction:column;gap:12px;margin-bottom:18px}
.bc-total-row{display:flex;justify-content:space-between;font-size:.86rem;color:var(--muted)}
.bc-free{color:#34D399;font-weight:500}
.bc-total-divider{height:1px;background:var(--b);margin-bottom:18px}
.bc-grand-total{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:20px}
.bc-grand-label{font-size:.78rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted)}
.bc-grand-val{font-family:'Bebas Neue',sans-serif;font-size:2.4rem;letter-spacing:.04em;color:var(--o)}

/* Razorpay notice */
.bc-rzp-notice{
  display:flex;align-items:center;gap:8px;
  font-size:.76rem;color:var(--muted);
  background:rgba(255,255,255,.02);
  border:1px solid var(--b);
  padding:10px 12px;border-radius:8px;
  margin-bottom:16px;line-height:1.5;
}

.bc-error{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);color:#F87171;padding:10px 14px;border-radius:8px;font-size:.84rem;margin-bottom:14px}

/* PAY NOW BUTTON */
.bc-pay-btn{
  width:100%;padding:16px;
  background:var(--o);color:#fff;border:none;
  border-radius:10px;
  font-family:'DM Sans',sans-serif;font-size:1rem;font-weight:600;
  cursor:pointer;
  transition:background .2s,transform .15s,box-shadow .2s;
  box-shadow:0 6px 24px rgba(244,123,32,.38);
  letter-spacing:.01em;
}
.bc-pay-btn:hover:not(:disabled){background:var(--od);transform:translateY(-2px);box-shadow:0 12px 36px rgba(244,123,32,.48)}
.bc-pay-btn:disabled{opacity:.5;cursor:not-allowed}
.bc-pay-loading{display:flex;align-items:center;justify-content:center;gap:10px}
.bc-spinner{
  width:16px;height:16px;border-radius:50%;
  border:2px solid rgba(255,255,255,.3);
  border-top-color:#fff;
  animation:spin .7s linear infinite;
  display:inline-block;
}
@keyframes spin{to{transform:rotate(360deg)}}

.bc-warn{font-size:.76rem;color:var(--muted);text-align:center;margin-top:8px}
.bc-back-btn{width:100%;margin-top:10px;background:none;border:1px solid var(--b);color:var(--muted);padding:11px;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.84rem;cursor:pointer;transition:color .2s,border-color .2s}
.bc-back-btn:hover{color:var(--light);border-color:var(--b2)}

.bc-trust{display:flex;gap:16px;margin-top:18px;padding-top:16px;border-top:1px solid var(--b)}
.bc-trust-item{display:flex;align-items:center;gap:6px;font-size:.74rem;color:var(--muted)}

/* SUCCESS */
.bc-success{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:70vh;text-align:center;padding:40px;animation:fup .5s ease both}
.bc-success-circle{width:80px;height:80px;border-radius:50%;background:rgba(52,211,153,.12);border:2px solid #34D399;display:flex;align-items:center;justify-content:center;color:#34D399;margin-bottom:24px;animation:popIn .5s cubic-bezier(0.34,1.56,0.64,1) both}
@keyframes popIn{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
.bc-success-title{font-family:'Bebas Neue',sans-serif;font-size:2.8rem;letter-spacing:.04em;color:var(--light);margin-bottom:10px}
.bc-success-sub{font-size:.9rem;color:var(--muted);line-height:1.7;margin-bottom:28px}
.bc-success-meta{background:var(--card);border:1px solid var(--b);border-radius:14px;padding:20px 28px;min-width:320px;margin-bottom:24px}
.bc-success-row{display:flex;justify-content:space-between;font-size:.86rem;padding:8px 0;border-bottom:1px solid var(--b);color:var(--muted)}
.bc-success-row:last-child{border-bottom:none}
.bc-success-row span:last-child{color:var(--light);font-weight:500}
.bc-pid{font-family:'DM Mono',monospace;font-size:.78rem;color:var(--muted)}
.bc-go-btn{background:var(--o);color:#fff;border:none;padding:13px 28px;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.92rem;font-weight:500;cursor:pointer;transition:background .2s,transform .15s;box-shadow:0 6px 24px rgba(244,123,32,.35)}
.bc-go-btn:hover{background:var(--od);transform:translateY(-2px)}

@media(max-width:860px){.bc-grid{grid-template-columns:1fr}.bc-right{position:static}}
@media(max-width:640px){.bc-wrap{padding:28px 16px 60px}}
`;