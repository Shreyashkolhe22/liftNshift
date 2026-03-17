import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchBookingById, updateBookingStatus } from "../store/bookingSlice";
import {
    fetchItemsByBooking,
    addItemToBooking,
    deleteItem,
    updateItemQuantity,
    fetchPredefinedItems,
    clearItems,
} from "../store/itemSlice";
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

const STATUS_CFG = {
    // next = what the USER can do (only cancel while pending or confirmed)
    PENDING: { label: "Pending", color: "#FBBF24", bg: "rgba(251,191,36,.12)", next: ["CANCELLED"] },
    CONFIRMED: { label: "Confirmed", color: "#3B9EFF", bg: "rgba(59,158,255,.12)", next: ["CANCELLED"] },
    IN_PROGRESS: { label: "In Progress", color: "#A78BFA", bg: "rgba(167,139,250,.12)", next: [] },
    COMPLETED: { label: "Completed", color: "#34D399", bg: "rgba(52,211,153,.12)", next: [] },
    CANCELLED: { label: "Cancelled", color: "#F87171", bg: "rgba(248,113,113,.12)", next: [] },
};

const SIZES = [
    { value: "SMALL", label: "Small", price: 1000 },
    { value: "MEDIUM", label: "Medium", price: 2000 },
    { value: "LARGE", label: "Large", price: 3000 },
];
const canAddItems = (status) => status === "PENDING";

// ─── ADD ITEM PANEL ───────────────────────────────────────────────────────────
function AddItemPanel({ bookingId, onDone }) {
    const dispatch = useDispatch();
    const { catalog } = useSelector((s) => s.item);
    const [tab, setTab] = useState("predefined");
    const [addingId, setAddingId] = useState(null);
    const [customName, setCustomName] = useState("");
    const [customQty, setCustomQty] = useState(1);
    const [customSize, setCustomSize] = useState("MEDIUM");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => { dispatch(fetchPredefinedItems()); }, [dispatch]);

    async function handleAddPredefined(item) {
        setAddingId(item.id);
        try {
            await dispatch(addItemToBooking({ bookingId, predefinedItemId: item.id, quantity: 1 })).unwrap();
            await dispatch(fetchItemsByBooking(bookingId));
            onDone();
        } catch (err) { setError(err?.message || "Failed to add item."); }
        setAddingId(null);
    }

    async function handleAddCustom() {
        if (!customName.trim()) { setError("Item name is required."); return; }
        setLoading(true); setError("");
        try {
            await dispatch(addItemToBooking({ bookingId, customName: customName.trim(), quantity: customQty, size: customSize })).unwrap();
            await dispatch(fetchItemsByBooking(bookingId));
            setCustomName(""); setCustomQty(1); setCustomSize("MEDIUM");
            onDone();
        } catch (err) { setError(err?.message || "Failed to add item."); }
        setLoading(false);
    }

    return (
        <div className="bd-add-panel">
            <div className="bd-add-tabs">
                <button className={`bd-tab ${tab === "predefined" ? "bd-tab-active" : ""}`} onClick={() => setTab("predefined")}>From Catalog</button>
                <button className={`bd-tab ${tab === "custom" ? "bd-tab-active" : ""}`} onClick={() => setTab("custom")}>Custom Item</button>
            </div>

            {error && <div className="bd-error">{error}</div>}

            {tab === "predefined" && (
                <div className="bd-catalog-grid">
                    {catalog.map((item) => (
                        <div key={item.id} className="bd-cat-card">
                            <div className="bd-cat-name">{item.name}</div>
                            <div className="bd-cat-price">{formatPrice(item.price)}</div>
                            <button className="bd-cat-btn" onClick={() => handleAddPredefined(item)} disabled={addingId === item.id}>
                                {addingId === item.id ? "…" : "+ Add"}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {tab === "custom" && (
                <div className="bd-custom-form">
                    <div className="bd-field">
                        <label className="bd-label">Item Name</label>
                        <input className="bd-input" type="text" placeholder="e.g. Wooden almirah" value={customName} onChange={(e) => setCustomName(e.target.value)} />
                    </div>
                    <div className="bd-field" style={{ marginTop: 14 }}>
                        <label className="bd-label">Quantity</label>
                        <div className="bd-qty-row">
                            <button className="bd-qty-btn" onClick={() => setCustomQty(q => Math.max(1, q - 1))}>−</button>
                            <span className="bd-qty-num">{customQty}</span>
                            <button className="bd-qty-btn" onClick={() => setCustomQty(q => q + 1)}>+</button>
                        </div>
                    </div>
                    <div className="bd-field" style={{ marginTop: 14 }}>
                        <label className="bd-label">Size</label>
                        <div className="bd-size-row">
                            {SIZES.map((s) => (
                                <button
                                    key={s.value}
                                    className={`bd-size-btn ${customSize === s.value ? "bd-size-active" : ""}`}
                                    onClick={() => setCustomSize(s.value)}
                                >
                                    <span className="bd-size-name">{s.label}</span>
                                    <span className="bd-size-price">₹{s.price.toLocaleString("en-IN")}</span>
                                </button>
                            ))}
                        </div>
                        <div className="bd-price-preview">
                            Estimated price &nbsp;·&nbsp;
                            <span className="bd-price-val">
                                ₹{(SIZES.find(s => s.value === customSize)?.price * customQty).toLocaleString("en-IN")}
                            </span>
                            <span className="bd-price-note">
                                &nbsp;({SIZES.find(s => s.value === customSize)?.price.toLocaleString("en-IN")} × {customQty})
                            </span>
                        </div>
                    </div>
                    <button className="bd-btn-primary" style={{ marginTop: 18 }} onClick={handleAddCustom} disabled={loading}>
                        {loading ? "Adding…" : "Add Item"}
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── BOOKING DETAIL PAGE ──────────────────────────────────────────────────────
export default function BookingDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { selected: booking, loading: bLoading } = useSelector((s) => s.booking);
    const { bookingItems, loading: iLoading } = useSelector((s) => s.item);

    const [showAddPanel, setShowAddPanel] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        dispatch(fetchBookingById(id));
        dispatch(fetchItemsByBooking(id));
        return () => dispatch(clearItems());
    }, [dispatch, id]);

    const status = booking?.status || "PENDING";
    const st = STATUS_CFG[status] || STATUS_CFG.PENDING;
    const addable = canAddItems(status);   // only PENDING
    const subtotal = bookingItems.reduce((s, i) => s + Number(i.price || 0), 0);

    async function handleStatusChange(newStatus) {
        setStatusUpdating(true); setError("");
        try {
            await dispatch(updateBookingStatus({ bookingId: id, status: newStatus })).unwrap();
            await dispatch(fetchBookingById(id));
        } catch (err) { setError(err?.message || "Failed to update status."); }
        setStatusUpdating(false);
    }

    async function handleRemoveItem(itemId) {
        await dispatch(deleteItem({ bookingId: id, itemId }));
        await dispatch(fetchItemsByBooking(id));
        await dispatch(fetchBookingById(id));
    }

    async function handleQtyChange(itemId, quantity) {
        await dispatch(updateItemQuantity({ bookingId: id, itemId, quantity }));
        await dispatch(fetchItemsByBooking(id));
        await dispatch(fetchBookingById(id));
    }

    const loading = bLoading || iLoading;

    return (
        <>
            <style>{CSS}</style>
            <div className="bd-page">
                <Navbar />
                <div className="bd-wrap">

                    {/* BREADCRUMB */}
                    <div className="bd-breadcrumb">
                        <button className="bd-bc-btn" onClick={() => navigate("/my-bookings")}>← My Bookings</button>
                        <span className="bd-bc-sep">/</span>
                        <span className="bd-bc-cur">Booking #{String(id).padStart(4, "0")}</span>
                    </div>

                    {loading && !booking ? (
                        <div className="bd-loading">
                            {[0, 1, 2].map(i => <div key={i} className="bd-skeleton" style={{ animationDelay: `${i * 80}ms` }} />)}
                        </div>
                    ) : (
                        <div className="bd-grid">

                            {/* ── LEFT ── */}
                            <div className="bd-left">

                                {/* Header card */}
                                <div className="bd-card" style={{ animationDelay: "0ms" }}>
                                    <div className="bd-card-top">
                                        <div>
                                            <h1 className="bd-booking-id">Booking #{String(id).padStart(4, "0")}</h1>
                                            <div className="bd-booking-date">{formatDate(booking?.createdAt)}</div>
                                        </div>
                                        <div className="bd-status-badge" style={{ color: st.color, background: st.bg }}>
                                            {st.label}
                                        </div>
                                    </div>

                                    {/* Route */}
                                    <div className="bd-route">
                                        <div className="bd-route-row">
                                            <div className="bd-rdot" style={{ background: "#F47B20" }} />
                                            <div>
                                                <div className="bd-rlabel">Pickup</div>
                                                <div className="bd-raddr">{booking?.pickupAddress || "—"}</div>
                                            </div>
                                        </div>
                                        <div className="bd-rconnect"><div className="bd-rline" /></div>
                                        <div className="bd-route-row">
                                            <div className="bd-rdot" style={{ background: "#34D399" }} />
                                            <div>
                                                <div className="bd-rlabel">Drop</div>
                                                <div className="bd-raddr">{booking?.dropAddress || "—"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions — Add items only when PENDING */}
                                    <div className="bd-action-row">
                                        {addable && (
                                            <button
                                                className="bd-btn-add"
                                                onClick={() => setShowAddPanel(v => !v)}
                                            >
                                                {showAddPanel ? "− Close" : "+ Add Item"}
                                            </button>
                                        )}
                                        {/* Review & Confirm — only when PENDING */}
                                        {status === "PENDING" && (
                                            <button
                                                className="bd-btn-confirm"
                                                onClick={() => navigate(`/bookings/${id}/confirm`)}
                                            >
                                                Review &amp; Confirm →
                                            </button>
                                        )}
                                    </div>

                                    {error && <div className="bd-error" style={{ marginTop: 14 }}>{error}</div>}
                                </div>

                                {/* Add item panel — only when PENDING */}
                                {showAddPanel && addable && (
                                    <AddItemPanel
                                        bookingId={Number(id)}
                                        onDone={() => setShowAddPanel(false)}
                                    />
                                )}

                                {/* Items list */}
                                <div className="bd-card" style={{ animationDelay: "60ms" }}>
                                    <div className="bd-section-label">
                                        Items ({bookingItems.length})
                                    </div>

                                    {bookingItems.length === 0 ? (
                                        <div className="bd-no-items">No items added to this booking yet.</div>
                                    ) : (
                                        <div className="bd-items-list">
                                            {bookingItems.map((item, i) => (
                                                <ItemRow
                                                    key={item.id}
                                                    item={item}
                                                    editable={addable}
                                                    bookingId={id}
                                                    onRemove={handleRemoveItem}
                                                    onQtyChange={handleQtyChange}
                                                    delay={i * 40}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Items subtotal */}
                                    {bookingItems.length > 0 && (
                                        <div className="bd-subtotal-row">
                                            <span>Items total</span>
                                            <span className="bd-subtotal-val">{formatPrice(subtotal)}</span>
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* ── RIGHT ── */}
                            <div className="bd-right">

                                {/* Order total */}
                                <div className="bd-card bd-total-card" style={{ animationDelay: "40ms" }}>
                                    <div className="bd-section-label">Booking Total</div>
                                    <div className="bd-total-big">{formatPrice(booking?.totalAmount || subtotal)}</div>
                                    <div className="bd-total-note">Includes all items · Tax extra</div>
                                </div>

                                {/* Status timeline */}
                                <div className="bd-card" style={{ animationDelay: "80ms" }}>
                                    <div className="bd-section-label">Status Timeline</div>
                                    <StatusTimeline current={status} />

                                    {/* Cancel option — shown only for PENDING and CONFIRMED */}
                                    {st.next.length > 0 && (
                                        <div className="bd-status-actions">
                                            <div className="bd-section-label" style={{ marginBottom: 10 }}>
                                                Cancel Booking
                                            </div>
                                            <p className="bd-cancel-note">
                                                You can cancel this booking while it is {st.label.toLowerCase()}.
                                                Once in progress, cancellation is not available.
                                            </p>
                                            <button
                                                className="bd-cancel-btn"
                                                onClick={() => handleStatusChange("CANCELLED")}
                                                disabled={statusUpdating}
                                            >
                                                {statusUpdating ? "Cancelling…" : "Cancel this booking"}
                                            </button>
                                        </div>
                                    )}

                                    {/* Status managed by service team note */}
                                    {status !== "CANCELLED" && st.next.length === 0 && (
                                        <div className="bd-managed-note">
                                            Status is managed by the LiftNShift team.
                                        </div>
                                    )}
                                </div>

                            </div>

                        </div>
                    )}

                </div>
            </div>
        </>
    );
}

// ─── ITEM ROW ─────────────────────────────────────────────────────────────────
function ItemRow({ item, editable, onRemove, onQtyChange, delay }) {
    const [qty, setQty] = useState(item.quantity);
    const [busy, setBusy] = useState(false);

    async function changeQty(newQty) {
        if (newQty < 1 || busy) return;
        setBusy(true); setQty(newQty);
        await onQtyChange(item.id, newQty);
        setBusy(false);
    }

    return (
        <div className="bd-item-row" style={{ animationDelay: `${delay}ms` }}>
            <div className="bd-item-info">
                <div className="bd-item-name">
                    {item.predefinedItemName || item.customName || "Custom item"}
                    {item.size && <span className="bd-item-tag">{item.size}</span>}
                </div>
                <div className="bd-item-price">{formatPrice(item.price)}</div>
            </div>
            <div className="bd-item-controls">
                {editable ? (
                    <>
                        <button className="bd-qty-btn" onClick={() => changeQty(qty - 1)} disabled={busy || qty <= 1}>−</button>
                        <span className="bd-qty-num">{qty}</span>
                        <button className="bd-qty-btn" onClick={() => changeQty(qty + 1)} disabled={busy}>+</button>
                        <button className="bd-remove-btn" onClick={() => onRemove(item.id)} title="Remove">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </>
                ) : (
                    <span className="bd-qty-static">× {item.quantity}</span>
                )}
            </div>
        </div>
    );
}

// ─── STATUS TIMELINE ──────────────────────────────────────────────────────────
const TIMELINE = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"];

function StatusTimeline({ current }) {
    const idx = TIMELINE.indexOf(current);
    const cancelled = current === "CANCELLED";

    return (
        <div className="bd-timeline">
            {TIMELINE.map((s, i) => {
                const st = STATUS_CFG[s];
                const done = !cancelled && i <= idx;
                const active = !cancelled && i === idx;
                return (
                    <div key={s} className="bd-tl-step">
                        <div className="bd-tl-left">
                            <div className={`bd-tl-dot ${done ? "bd-tl-done" : ""} ${active ? "bd-tl-active" : ""}`}
                                style={done ? { background: st.color, borderColor: st.color } : {}}>
                                {done && !active && (
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                            {i < TIMELINE.length - 1 && (
                                <div className={`bd-tl-line ${i < idx && !cancelled ? "bd-tl-line-done" : ""}`}
                                    style={i < idx && !cancelled ? { background: STATUS_CFG[TIMELINE[i + 1]].color, opacity: .4 } : {}} />
                            )}
                        </div>
                        <div className="bd-tl-text" style={done ? { color: "#f0ede8" } : {}}>
                            {st.label}
                        </div>
                    </div>
                );
            })}
            {cancelled && (
                <div className="bd-tl-step">
                    <div className="bd-tl-left">
                        <div className="bd-tl-dot bd-tl-done" style={{ background: "#F87171", borderColor: "#F87171" }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </div>
                    </div>
                    <div className="bd-tl-text" style={{ color: "#F87171" }}>Cancelled</div>
                </div>
            )}
        </div>
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
.bd-page{min-height:100vh}
.bd-wrap{max-width:1100px;margin:0 auto;padding:40px 40px 100px}

/* BREADCRUMB */
.bd-breadcrumb{display:flex;align-items:center;gap:10px;margin-bottom:32px;animation:fup .4s ease both}
.bd-bc-btn{background:none;border:none;color:var(--muted);font-family:'DM Sans',sans-serif;font-size:.84rem;cursor:pointer;transition:color .2s;padding:0}
.bd-bc-btn:hover{color:var(--light)}
.bd-bc-sep{color:var(--b2);font-size:.84rem}
.bd-bc-cur{font-size:.84rem;color:var(--muted)}
@keyframes fup{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

/* LOADING */
.bd-loading{display:flex;flex-direction:column;gap:14px}
.bd-skeleton{height:160px;background:var(--card);border-radius:16px;animation:pulse 1.4s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

/* GRID */
.bd-grid{display:grid;grid-template-columns:1fr 320px;gap:20px;align-items:start}
.bd-left{display:flex;flex-direction:column;gap:16px}
.bd-right{position:sticky;top:84px;display:flex;flex-direction:column;gap:16px}

/* CARD */
.bd-card{background:var(--card);border:1px solid var(--b);border-radius:16px;padding:26px;animation:fup .45s ease both}
.bd-section-label{font-size:.63rem;text-transform:uppercase;letter-spacing:.2em;color:var(--muted);margin-bottom:18px}
.bd-error{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);color:#F87171;padding:10px 14px;border-radius:8px;font-size:.84rem}

/* HEADER CARD */
.bd-card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px}
.bd-booking-id{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:.05em;color:var(--light);line-height:1}
.bd-booking-date{font-size:.78rem;color:var(--muted);margin-top:4px}
.bd-status-badge{font-size:.72rem;text-transform:uppercase;letter-spacing:.13em;font-weight:600;padding:5px 12px;border-radius:20px}

/* ROUTE */
.bd-route{display:flex;flex-direction:column;gap:0;margin-bottom:22px}
.bd-route-row{display:flex;align-items:flex-start;gap:13px}
.bd-rdot{width:11px;height:11px;border-radius:50%;flex-shrink:0;margin-top:3px}
.bd-rlabel{font-size:.62rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin-bottom:3px}
.bd-raddr{font-size:.95rem;font-weight:500;color:var(--light)}
.bd-rconnect{padding:6px 0 6px 4px}
.bd-rline{width:1px;height:16px;background:var(--b2)}

/* ACTIONS */
.bd-action-row{display:flex;gap:10px;flex-wrap:wrap}
.bd-btn-add{background:rgba(244,123,32,.1);border:1px solid rgba(244,123,32,.25);color:var(--o);padding:10px 18px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:500;cursor:pointer;transition:background .2s,border-color .2s}
.bd-btn-add:hover{background:rgba(244,123,32,.18)}
.bd-btn-confirm{
  background:var(--o);color:#fff;border:none;
  padding:10px 20px;border-radius:8px;
  font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:500;
  cursor:pointer;
  transition:background .2s,transform .15s,box-shadow .2s;
  box-shadow:0 4px 16px rgba(244,123,32,.3);
}
.bd-btn-confirm:hover{background:var(--od);transform:translateY(-1px);box-shadow:0 8px 24px rgba(244,123,32,.4)}

/* ADD ITEM PANEL */
.bd-add-panel{background:var(--card);border:1px solid rgba(244,123,32,.2);border-radius:16px;padding:24px;animation:fup .3s ease both}
.bd-add-tabs{display:flex;gap:8px;margin-bottom:20px}
.bd-tab{background:none;border:1px solid var(--b);color:var(--muted);padding:8px 16px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.82rem;cursor:pointer;transition:all .2s}
.bd-tab:hover{color:var(--light);border-color:var(--b2)}
.bd-tab-active{background:rgba(244,123,32,.1) !important;border-color:rgba(244,123,32,.3) !important;color:var(--o) !important;font-weight:500}
.bd-catalog-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px}
.bd-cat-card{background:var(--card2);border:1px solid var(--b);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:6px}
.bd-cat-name{font-size:.84rem;font-weight:500;color:var(--light);line-height:1.3}
.bd-cat-price{font-family:'Bebas Neue',sans-serif;font-size:1rem;letter-spacing:.04em;color:var(--o)}
.bd-cat-btn{background:rgba(244,123,32,.1);border:1px solid rgba(244,123,32,.2);color:var(--o);padding:6px;border-radius:6px;font-family:'DM Sans',sans-serif;font-size:.76rem;cursor:pointer;transition:background .2s;margin-top:auto}
.bd-cat-btn:hover:not(:disabled){background:rgba(244,123,32,.2)}
.bd-cat-btn:disabled{opacity:.5;cursor:not-allowed}
.bd-custom-form{}
.bd-field{display:flex;flex-direction:column;gap:7px}
.bd-label{font-size:.65rem;text-transform:uppercase;letter-spacing:.16em;color:var(--muted)}
.bd-input{width:100%;padding:12px 14px;background:var(--card2);border:1.5px solid var(--b);border-radius:9px;color:var(--light);font-family:'DM Sans',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s,box-shadow .2s}
.bd-input:focus{border-color:var(--o);box-shadow:0 0 0 3px rgba(244,123,32,.1)}
.bd-input::placeholder{color:var(--muted)}
.bd-qty-row{display:flex;align-items:center;gap:12px}
.bd-qty-btn{width:28px;height:28px;border-radius:7px;background:var(--card2);border:1px solid var(--b2);color:var(--light);font-size:.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}
.bd-qty-btn:hover{background:rgba(244,123,32,.15)}
.bd-qty-num{font-size:.9rem;font-weight:600;min-width:20px;text-align:center;color:var(--light)}
.bd-size-row{display:flex;gap:8px}
.bd-size-btn{flex:1;padding:10px 8px;border-radius:8px;background:var(--card2);border:1.5px solid var(--b);font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:3px}
.bd-size-btn:hover{border-color:var(--b2);background:var(--card)}
.bd-size-name{font-size:.8rem;color:var(--muted);font-weight:500;transition:color .2s}
.bd-size-price{font-family:'Bebas Neue',sans-serif;font-size:.95rem;letter-spacing:.04em;color:var(--muted);transition:color .2s}
.bd-size-active{background:rgba(244,123,32,.08) !important;border-color:rgba(244,123,32,.4) !important}
.bd-size-active .bd-size-name{color:var(--o) !important}
.bd-size-active .bd-size-price{color:var(--o) !important}
.bd-price-preview{margin-top:10px;padding:9px 12px;background:rgba(244,123,32,.05);border:1px solid rgba(244,123,32,.12);border-radius:8px;font-size:.8rem;color:var(--muted);display:flex;align-items:center;flex-wrap:wrap}
.bd-price-val{font-family:'Bebas Neue',sans-serif;font-size:1.05rem;letter-spacing:.04em;color:var(--o);margin:0 2px}
.bd-price-note{font-size:.72rem;color:var(--muted);opacity:.7}
.bd-btn-primary{background:var(--o);color:#fff;border:none;padding:12px 22px;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:500;cursor:pointer;transition:background .2s,transform .15s;box-shadow:0 4px 16px rgba(244,123,32,.3)}
.bd-btn-primary:hover:not(:disabled){background:var(--od);transform:translateY(-1px)}
.bd-btn-primary:disabled{opacity:.55;cursor:not-allowed}

/* ITEMS */
.bd-no-items{font-size:.84rem;color:var(--muted);padding:12px 0}
.bd-items-list{display:flex;flex-direction:column;gap:0}
.bd-item-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--b);animation:fup .35s ease both}
.bd-item-row:last-child{border-bottom:none}
.bd-item-info{flex:1;min-width:0;margin-right:12px}
.bd-item-name{font-size:.88rem;font-weight:500;color:var(--light);display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.bd-item-tag{font-size:.6rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);background:var(--card2);padding:2px 7px;border-radius:10px;border:1px solid var(--b)}
.bd-item-price{font-size:.76rem;color:var(--muted);margin-top:2px}
.bd-item-controls{display:flex;align-items:center;gap:6px;flex-shrink:0}
.bd-qty-static{font-size:.84rem;color:var(--muted)}
.bd-remove-btn{width:26px;height:26px;border-radius:6px;background:none;border:1px solid var(--b);color:var(--muted);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s}
.bd-remove-btn:hover{background:rgba(248,113,113,.12);border-color:rgba(248,113,113,.3);color:#F87171}
.bd-subtotal-row{display:flex;justify-content:space-between;padding-top:14px;border-top:1px solid var(--b);margin-top:4px;font-size:.84rem;color:var(--muted)}
.bd-subtotal-val{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:.04em;color:var(--o)}

/* TOTAL CARD */
.bd-total-card{position:relative;overflow:hidden}
.bd-total-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--o),transparent)}
.bd-total-big{font-family:'Bebas Neue',sans-serif;font-size:3rem;letter-spacing:.04em;color:var(--o);line-height:1}
.bd-total-note{font-size:.72rem;color:var(--muted);margin-top:6px}

/* STATUS TIMELINE */
.bd-timeline{display:flex;flex-direction:column;gap:0;margin-bottom:20px}
.bd-tl-step{display:flex;align-items:flex-start;gap:12px}
.bd-tl-left{display:flex;flex-direction:column;align-items:center}
.bd-tl-dot{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--b2);background:var(--card2);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .3s;color:#fff}
.bd-tl-done{border-width:1.5px}
.bd-tl-active{box-shadow:0 0 0 3px rgba(255,255,255,.06)}
.bd-tl-line{width:1.5px;height:24px;background:var(--b2);margin:3px 0;transition:background .3s}
.bd-tl-line-done{opacity:.4}
.bd-tl-text{font-size:.82rem;color:var(--muted);padding:2px 0 24px;transition:color .3s}

/* STATUS ACTIONS */
.bd-status-actions{padding-top:16px;border-top:1px solid var(--b);display:flex;flex-direction:column;gap:10px}
.bd-cancel-note{font-size:.78rem;color:var(--muted);line-height:1.6;padding:10px 12px;background:rgba(248,113,113,.05);border:1px solid rgba(248,113,113,.1);border-radius:8px}
.bd-cancel-btn{background:none;border:1.5px solid rgba(248,113,113,.35);color:#F87171;padding:11px 16px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.86rem;font-weight:500;cursor:pointer;transition:background .2s,border-color .2s;text-align:left}
.bd-cancel-btn:hover:not(:disabled){background:rgba(248,113,113,.1);border-color:rgba(248,113,113,.6)}
.bd-cancel-btn:disabled{opacity:.5;cursor:not-allowed}
.bd-managed-note{font-size:.74rem;color:var(--muted);padding:10px 12px;background:rgba(255,255,255,.02);border:1px solid var(--b);border-radius:8px;line-height:1.6;margin-top:16px}
.bd-locked-note{font-size:.76rem;color:var(--muted);padding:8px 12px;background:rgba(255,255,255,.02);border:1px solid var(--b);border-radius:8px}

/* RESPONSIVE */
@media(max-width:860px){.bd-grid{grid-template-columns:1fr}.bd-right{position:static}}
@media(max-width:640px){.bd-wrap{padding:28px 16px 60px}}
`;