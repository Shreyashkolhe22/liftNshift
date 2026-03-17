import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../store/bookingSlice";
import {
    fetchPredefinedItems,
    fetchItemsByBooking,
    addItemToBooking,
    deleteItem,
    updateItemQuantity,
    clearItems,
} from "../store/itemSlice";
import Navbar from "../components/Navbar";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function formatPrice(p) {
    if (!p) return "₹0";
    return "₹" + Number(p).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

const SIZES = [
    { value: "SMALL", label: "Small", price: 1000 },
    { value: "MEDIUM", label: "Medium", price: 2000 },
    { value: "LARGE", label: "Large", price: 3000 },
];

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
function StepBar({ step }) {
    return (
        <div className="cb-stepbar">
            <div className={`cb-step ${step >= 1 ? "active" : ""} ${step > 1 ? "done" : ""}`}>
                <div className="cb-step-circle">
                    {step > 1 ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : "1"}
                </div>
                <span className="cb-step-label">Addresses</span>
            </div>
            <div className={`cb-step-line ${step > 1 ? "done" : ""}`} />
            <div className={`cb-step ${step >= 2 ? "active" : ""}`}>
                <div className="cb-step-circle">2</div>
                <span className="cb-step-label">Add Items</span>
            </div>
        </div>
    );
}

// ─── STEP 1 — ADDRESS FORM ────────────────────────────────────────────────────
function Step1({ onNext }) {
    const dispatch = useDispatch();
    const { loading } = useSelector((s) => s.booking);
    const [pickup, setPickup] = useState("");
    const [drop, setDrop] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (!pickup.trim() || !drop.trim()) {
            setError("Both addresses are required.");
            return;
        }
        try {
            const result = await dispatch(
                createBooking({ pickupAddress: pickup.trim(), dropAddress: drop.trim() })
            ).unwrap();
            onNext(result);
        } catch (err) {
            setError(err?.message || "Failed to create booking. Please try again.");
        }
    }

    return (
        <div className="cb-card" style={{ animationDelay: "0ms" }}>
            <div className="cb-card-header">
                <p className="cb-card-eyebrow">Step 1 of 2</p>
                <h2 className="cb-card-title">Where are you moving?</h2>
                <p className="cb-card-sub">Enter your current address and destination.</p>
            </div>

            {error && <div className="cb-error">{error}</div>}

            <form onSubmit={handleSubmit} className="cb-form" noValidate>
                <div className="cb-field">
                    <label className="cb-label">Pickup Address</label>
                    <div className="cb-input-wrap">
                        <div className="cb-input-dot" style={{ background: "#F47B20" }} />
                        <input
                            className="cb-input"
                            type="text"
                            placeholder="Your current home address"
                            value={pickup}
                            onChange={(e) => setPickup(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="cb-connector">
                    <div className="cb-connector-line" />
                </div>

                <div className="cb-field">
                    <label className="cb-label">Drop Address</label>
                    <div className="cb-input-wrap">
                        <div className="cb-input-dot" style={{ background: "#34D399" }} />
                        <input
                            className="cb-input"
                            type="text"
                            placeholder="Your new home address"
                            value={drop}
                            onChange={(e) => setDrop(e.target.value)}
                        />
                    </div>
                </div>

                <button className="cb-btn-primary" type="submit" disabled={loading}>
                    {loading ? "Creating booking…" : "Continue to Add Items →"}
                </button>
            </form>
        </div>
    );
}

// ─── PREDEFINED ITEM CARD ─────────────────────────────────────────────────────
function PredefinedCard({ item, onAdd, adding }) {
    return (
        <div className={`pi-card ${adding ? "pi-adding" : ""}`}>
            <div className="pi-name">{item.name}</div>
            <div className="pi-price">{formatPrice(item.price)}</div>
            <button
                className="pi-btn"
                onClick={() => onAdd(item)}
                disabled={adding}
            >
                {adding ? "Adding…" : "+ Add"}
            </button>
        </div>
    );
}

// ─── ADDED ITEM ROW ───────────────────────────────────────────────────────────
function AddedItemRow({ item, bookingId, onRemove, onQtyChange }) {
    const [qty, setQty] = useState(item.quantity);
    const [busy, setBusy] = useState(false);

    async function changeQty(newQty) {
        if (newQty < 1 || busy) return;
        setBusy(true);
        setQty(newQty);
        await onQtyChange(item.id, newQty);
        setBusy(false);
    }

    const label = item.predefinedItemName || item.customName || "Custom item";
    const sizeTag = item.size ? ` · ${item.size}` : "";

    return (
        <div className="ai-row">
            <div className="ai-info">
                <div className="ai-name">{label}{sizeTag && <span className="ai-sizetag">{sizeTag}</span>}</div>
                <div className="ai-price">{formatPrice(item.price)}</div>
            </div>
            <div className="ai-controls">
                <button
                    className="ai-qty-btn"
                    onClick={() => changeQty(qty - 1)}
                    disabled={busy || qty <= 1}
                >−</button>
                <span className="ai-qty-num">{qty}</span>
                <button
                    className="ai-qty-btn"
                    onClick={() => changeQty(qty + 1)}
                    disabled={busy}
                >+</button>
                <button
                    className="ai-remove-btn"
                    onClick={() => onRemove(item.id)}
                    title="Remove item"
                >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ─── CUSTOM ITEM CARD ─────────────────────────────────────────────────────────
function CustomItemCard({ bookingId, onAdded }) {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [qty, setQty] = useState(1);
    const [size, setSize] = useState("MEDIUM");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleAdd() {
        setError("");
        if (!name.trim()) { setError("Item name is required."); return; }
        if (qty < 1) { setError("Quantity must be at least 1."); return; }
        setLoading(true);
        try {
            await dispatch(addItemToBooking({
                bookingId,
                customName: name.trim(),
                quantity: qty,
                size,
            })).unwrap();
            // re-fetch items list
            await dispatch(fetchItemsByBooking(bookingId));
            setName(""); setQty(1); setSize("MEDIUM");
            setOpen(false);
            onAdded();
        } catch (err) {
            setError(err?.message || "Failed to add custom item.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={`ci-wrap ${open ? "ci-open" : ""}`}>
            <button className="ci-toggle" onClick={() => { setOpen(o => !o); setError(""); }}>
                <span className="ci-toggle-icon">{open ? "−" : "+"}</span>
                <span>{open ? "Cancel custom item" : "Add a custom item"}</span>
            </button>

            {open && (
                <div className="ci-body">
                    {error && <div className="cb-error" style={{ marginBottom: 14 }}>{error}</div>}

                    <div className="cb-field">
                        <label className="cb-label">Item Name</label>
                        <input
                            className="cb-input ci-input"
                            type="text"
                            placeholder="e.g. Wooden almirah, Piano"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="cb-field" style={{ marginTop: 16 }}>
                        <label className="cb-label">Quantity</label>
                        <div className="ci-qty-row">
                            <button className="ai-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                            <span className="ai-qty-num" style={{ minWidth: 32, textAlign: "center" }}>{qty}</span>
                            <button className="ai-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
                        </div>
                    </div>

                    <div className="cb-field" style={{ marginTop: 16 }}>
                        <label className="cb-label">Size</label>
                        <div className="ci-size-row">
                            {SIZES.map((s) => (
                                <button
                                    key={s.value}
                                    className={`ci-size-btn ${size === s.value ? "ci-size-active" : ""}`}
                                    onClick={() => setSize(s.value)}
                                >
                                    <span className="ci-size-name">{s.label}</span>
                                    <span className="ci-size-price">₹{s.price.toLocaleString("en-IN")}</span>
                                </button>
                            ))}
                        </div>
                        {/* Live price estimate */}
                        <div className="ci-price-preview">
                            Estimated price &nbsp;·&nbsp;
                            <span className="ci-price-val">
                                ₹{(SIZES.find(s => s.value === size)?.price * qty).toLocaleString("en-IN")}
                            </span>
                            <span className="ci-price-note">
                                &nbsp;({SIZES.find(s => s.value === size)?.price.toLocaleString("en-IN")} × {qty})
                            </span>
                        </div>
                    </div>

                    <button
                        className="cb-btn-primary"
                        style={{ marginTop: 20 }}
                        onClick={handleAdd}
                        disabled={loading}
                    >
                        {loading ? "Adding…" : "Add Custom Item"}
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── STEP 2 — ADD ITEMS ───────────────────────────────────────────────────────
function Step2({ booking, onFinish }) {
    const dispatch = useDispatch();
    const { catalog, bookingItems, loading: itemLoading } = useSelector((s) => s.item);
    const [addingId, setAddingId] = useState(null);
    const [catLoading, setCatLoading] = useState(false);

    useEffect(() => {
        setCatLoading(true);
        dispatch(fetchPredefinedItems()).finally(() => setCatLoading(false));
        dispatch(fetchItemsByBooking(booking.id));
        return () => dispatch(clearItems());
    }, [dispatch, booking.id]);

    async function handleAddPredefined(item) {
        setAddingId(item.id);
        try {
            await dispatch(addItemToBooking({
                bookingId: booking.id,
                predefinedItemId: item.id,
                quantity: 1,
            })).unwrap();
            await dispatch(fetchItemsByBooking(booking.id));
        } catch (_) { }
        setAddingId(null);
    }

    async function handleRemove(itemId) {
        await dispatch(deleteItem({ bookingId: booking.id, itemId }));
    }

    async function handleQtyChange(itemId, quantity) {
        await dispatch(updateItemQuantity({ bookingId: booking.id, itemId, quantity }));
        await dispatch(fetchItemsByBooking(booking.id));
    }

    const total = bookingItems.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

    return (
        <div className="cb-step2-wrap">

            {/* Left — catalog */}
            <div className="cb-step2-left">
                <div className="cb-card" style={{ animationDelay: "0ms" }}>
                    <div className="cb-card-header">
                        <p className="cb-card-eyebrow">Step 2 of 2</p>
                        <h2 className="cb-card-title">Add your items</h2>
                        <p className="cb-card-sub">
                            {booking.pickupAddress} → {booking.dropAddress}
                        </p>
                    </div>

                    {/* Predefined catalog */}
                    <div className="pi-section-label">Item Catalog</div>
                    {catLoading ? (
                        <div className="pi-grid">
                            {[0, 1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="pi-skeleton" style={{ animationDelay: `${i * 60}ms` }} />
                            ))}
                        </div>
                    ) : (
                        <div className="pi-grid">
                            {catalog.map((item) => (
                                <PredefinedCard
                                    key={item.id}
                                    item={item}
                                    onAdd={handleAddPredefined}
                                    adding={addingId === item.id}
                                />
                            ))}
                        </div>
                    )}

                    {/* Custom item */}
                    <div className="pi-section-label" style={{ marginTop: 28 }}>Custom Item</div>
                    <CustomItemCard
                        bookingId={booking.id}
                        onAdded={() => { }}
                    />
                </div>
            </div>

            {/* Right — added items + finish */}
            <div className="cb-step2-right">
                <div className="cb-card ai-card" style={{ animationDelay: "60ms" }}>
                    <div className="ai-header">
                        <div className="ai-title">Items Added</div>
                        <div className="ai-count">
                            {bookingItems.length} item{bookingItems.length !== 1 ? "s" : ""}
                        </div>
                    </div>

                    {bookingItems.length === 0 ? (
                        <div className="ai-empty">
                            No items yet. Add from the catalog or create a custom item.
                        </div>
                    ) : (
                        <div className="ai-list">
                            {bookingItems.map((item) => (
                                <AddedItemRow
                                    key={item.id}
                                    item={item}
                                    bookingId={booking.id}
                                    onRemove={handleRemove}
                                    onQtyChange={handleQtyChange}
                                />
                            ))}
                        </div>
                    )}

                    {/* Total */}
                    <div className="ai-total-row">
                        <span className="ai-total-label">Estimated Total</span>
                        <span className="ai-total-val">{formatPrice(total)}</span>
                    </div>

                    <button
                        className="cb-btn-primary"
                        style={{ width: "100%", marginTop: 20 }}
                        onClick={onFinish}
                    >
                        Finish &amp; View Booking →
                    </button>

                    <button
                        className="cb-btn-skip"
                        onClick={onFinish}
                    >
                        Skip — add items later
                    </button>
                </div>
            </div>

        </div>
    );
}

// ─── CREATE BOOKING PAGE ──────────────────────────────────────────────────────
export default function CreateBooking() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [booking, setBooking] = useState(null);

    function handleStep1Done(newBooking) {
        setBooking(newBooking);
        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleFinish() {
        navigate(`/bookings/${booking.id}/confirm`);
    }

    return (
        <>
            <style>{CSS}</style>
            <div className="cb-page">
                <Navbar />
                <div className="cb-wrap">

                    {/* Page header */}
                    <div className="cb-header">
                        <p className="cb-eyebrow">New booking</p>
                        <h1 className="cb-title">Create a Booking</h1>
                    </div>

                    {/* Step indicator */}
                    <StepBar step={step} />

                    {/* Steps */}
                    {step === 1 && <Step1 onNext={handleStep1Done} />}
                    {step === 2 && booking && (
                        <Step2 booking={booking} onFinish={handleFinish} />
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
  --surface:#141414;
  --card:#191919;
  --card2:#202020;
  --b:rgba(255,255,255,0.07);
  --b2:rgba(255,255,255,0.11);
  --light:#f0ede8;
  --muted:#606060;
  --o:#F47B20;
  --od:#D4601A;
}
body{background:var(--dark);font-family:'DM Sans',sans-serif;color:var(--light)}
a{text-decoration:none;color:inherit}

.cb-page{min-height:100vh}
.cb-wrap{max-width:1100px;margin:0 auto;padding:48px 40px 100px}

/* HEADER */
.cb-header{margin-bottom:32px;animation:fup .45s ease both}
.cb-eyebrow{font-size:.7rem;text-transform:uppercase;letter-spacing:.22em;color:var(--o);margin-bottom:8px}
.cb-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.2rem,4vw,3.2rem);letter-spacing:.04em;color:var(--light);line-height:1}
@keyframes fup{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

/* STEP BAR */
.cb-stepbar{
  display:flex;align-items:center;gap:0;
  margin-bottom:40px;
  animation:fup .45s ease .05s both;
}
.cb-step{display:flex;align-items:center;gap:10px}
.cb-step-circle{
  width:32px;height:32px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:.82rem;font-weight:600;
  background:var(--card);border:1.5px solid var(--b2);color:var(--muted);
  transition:background .3s,border-color .3s,color .3s;
  flex-shrink:0;
}
.cb-step.active .cb-step-circle{background:var(--o);border-color:var(--o);color:#fff}
.cb-step.done .cb-step-circle{background:rgba(52,211,153,.15);border-color:#34D399;color:#34D399}
.cb-step-label{font-size:.82rem;color:var(--muted);transition:color .3s}
.cb-step.active .cb-step-label{color:var(--light);font-weight:500}
.cb-step.done .cb-step-label{color:#34D399}
.cb-step-line{flex:1;height:1px;background:var(--b2);margin:0 16px;min-width:40px;transition:background .3s}
.cb-step-line.done{background:#34D399;opacity:.5}

/* CARD */
.cb-card{
  background:var(--card);border:1px solid var(--b);border-radius:18px;
  padding:36px;animation:fup .45s ease both;
}
.cb-card-header{margin-bottom:32px}
.cb-card-eyebrow{font-size:.68rem;text-transform:uppercase;letter-spacing:.2em;color:var(--o);margin-bottom:8px}
.cb-card-title{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:.04em;color:var(--light);line-height:1;margin-bottom:8px}
.cb-card-sub{font-size:.88rem;color:var(--muted);line-height:1.6}

/* ERROR */
.cb-error{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);color:#F87171;padding:10px 14px;border-radius:8px;font-size:.84rem;margin-bottom:20px}

/* FORM */
.cb-form{display:flex;flex-direction:column;gap:0}
.cb-field{display:flex;flex-direction:column;gap:8px}
.cb-label{font-size:.68rem;text-transform:uppercase;letter-spacing:.16em;color:var(--muted)}
.cb-input-wrap{position:relative;display:flex;align-items:center}
.cb-input-dot{width:10px;height:10px;border-radius:50%;position:absolute;left:16px;flex-shrink:0;z-index:1}
.cb-input{
  width:100%;padding:14px 16px 14px 36px;
  background:var(--card2);border:1.5px solid var(--b);border-radius:10px;
  color:var(--light);font-family:'DM Sans',sans-serif;font-size:.95rem;outline:none;
  transition:border-color .2s,background .2s,box-shadow .2s;
}
.cb-input::placeholder{color:var(--muted)}
.cb-input:focus{border-color:var(--o);background:#222;box-shadow:0 0 0 3px rgba(244,123,32,.1)}
.cb-connector{padding:10px 0 10px 20px}
.cb-connector-line{width:1px;height:20px;background:var(--b2)}

/* BUTTONS */
.cb-btn-primary{
  background:var(--o);color:#fff;border:none;
  padding:14px 28px;border-radius:10px;
  font-family:'DM Sans',sans-serif;font-size:.92rem;font-weight:500;
  cursor:pointer;margin-top:28px;
  transition:background .2s,transform .15s,box-shadow .2s;
  box-shadow:0 6px 22px rgba(244,123,32,.32);
}
.cb-btn-primary:hover:not(:disabled){background:var(--od);transform:translateY(-2px);box-shadow:0 12px 32px rgba(244,123,32,.42)}
.cb-btn-primary:disabled{opacity:.55;cursor:not-allowed}
.cb-btn-skip{
  width:100%;margin-top:10px;background:none;border:none;
  font-family:'DM Sans',sans-serif;font-size:.8rem;color:var(--muted);
  cursor:pointer;padding:8px;text-align:center;
  transition:color .2s;
}
.cb-btn-skip:hover{color:var(--light)}

/* ── STEP 2 LAYOUT ── */
.cb-step2-wrap{display:grid;grid-template-columns:1fr 340px;gap:20px;align-items:start}
.cb-step2-left{}
.cb-step2-right{position:sticky;top:84px}

/* PREDEFINED CATALOG */
.pi-section-label{font-size:.68rem;text-transform:uppercase;letter-spacing:.18em;color:var(--muted);margin-bottom:14px}
.pi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px}
.pi-skeleton{height:104px;background:var(--card2);border-radius:12px;animation:pulse 1.4s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}

.pi-card{
  background:var(--card2);border:1px solid var(--b);border-radius:12px;
  padding:16px;display:flex;flex-direction:column;gap:8px;
  transition:border-color .2s,transform .2s,background .2s;
  animation:fup .4s ease both;
}
.pi-card:hover{border-color:var(--b2);transform:translateY(-2px)}
.pi-card.pi-adding{opacity:.6}
.pi-name{font-size:.88rem;font-weight:500;color:var(--light);line-height:1.3}
.pi-price{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:.04em;color:var(--o)}
.pi-btn{
  background:rgba(244,123,32,.12);border:1px solid rgba(244,123,32,.25);
  color:var(--o);padding:7px 10px;border-radius:7px;
  font-family:'DM Sans',sans-serif;font-size:.78rem;font-weight:500;
  cursor:pointer;transition:background .2s,border-color .2s;margin-top:auto;
}
.pi-btn:hover:not(:disabled){background:rgba(244,123,32,.22);border-color:rgba(244,123,32,.5)}
.pi-btn:disabled{opacity:.5;cursor:not-allowed}

/* CUSTOM ITEM */
.ci-wrap{border:1px solid var(--b);border-radius:12px;overflow:hidden;transition:border-color .2s}
.ci-open{border-color:rgba(244,123,32,.25)}
.ci-toggle{
  width:100%;display:flex;align-items:center;gap:12px;
  background:var(--card2);border:none;
  padding:14px 18px;cursor:pointer;
  font-family:'DM Sans',sans-serif;font-size:.9rem;color:var(--muted);
  transition:color .2s,background .2s;text-align:left;
}
.ci-toggle:hover{color:var(--light);background:#222}
.ci-toggle-icon{
  width:26px;height:26px;border-radius:50%;
  background:rgba(244,123,32,.12);border:1px solid rgba(244,123,32,.25);
  color:var(--o);display:flex;align-items:center;justify-content:center;
  font-size:1rem;font-weight:500;flex-shrink:0;
}
.ci-body{padding:20px 18px;background:var(--card2);border-top:1px solid var(--b);animation:fup .3s ease both}
.ci-input{padding:12px 14px !important}
.ci-qty-row{display:flex;align-items:center;gap:12px}
.ci-size-row{display:flex;gap:10px}
.ci-size-btn{
  flex:1;padding:10px 8px;border-radius:8px;
  background:var(--card);border:1.5px solid var(--b);
  font-family:'DM Sans',sans-serif;cursor:pointer;
  transition:all .2s;
  display:flex;flex-direction:column;align-items:center;gap:3px;
}
.ci-size-btn:hover{border-color:var(--b2);background:var(--card2)}
.ci-size-name{font-size:.82rem;color:var(--muted);font-weight:500;transition:color .2s}
.ci-size-price{font-family:'Bebas Neue',sans-serif;font-size:.95rem;letter-spacing:.04em;color:var(--muted);transition:color .2s}
.ci-size-active{background:rgba(244,123,32,.08) !important;border-color:rgba(244,123,32,.5) !important}
.ci-size-active .ci-size-name{color:var(--o) !important}
.ci-size-active .ci-size-price{color:var(--o) !important}
.ci-price-preview{
  margin-top:10px;padding:10px 14px;
  background:rgba(244,123,32,.05);
  border:1px solid rgba(244,123,32,.12);
  border-radius:8px;font-size:.82rem;color:var(--muted);
  display:flex;align-items:center;flex-wrap:wrap;
}
.ci-price-val{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:.04em;color:var(--o);margin:0 2px}
.ci-price-note{font-size:.75rem;color:var(--muted);opacity:.7}

/* ADDED ITEMS */
.ai-card{padding:28px}
.ai-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.ai-title{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:.05em;color:var(--light)}
.ai-count{font-size:.72rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);background:var(--card2);padding:4px 10px;border-radius:20px;border:1px solid var(--b)}
.ai-empty{font-size:.84rem;color:var(--muted);text-align:center;padding:24px 0;line-height:1.7}
.ai-list{display:flex;flex-direction:column;gap:10px;margin-bottom:16px}

.ai-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 14px;background:var(--card2);
  border:1px solid var(--b);border-radius:10px;
  animation:fup .3s ease both;
}
.ai-info{flex:1;min-width:0;margin-right:12px}
.ai-name{font-size:.88rem;font-weight:500;color:var(--light);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ai-sizetag{font-size:.68rem;color:var(--muted);margin-left:6px;text-transform:uppercase;letter-spacing:.1em}
.ai-price{font-size:.78rem;color:var(--muted);margin-top:2px}
.ai-controls{display:flex;align-items:center;gap:6px;flex-shrink:0}
.ai-qty-btn{
  width:26px;height:26px;border-radius:6px;
  background:var(--card);border:1px solid var(--b2);
  color:var(--light);font-size:.95rem;font-weight:500;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:background .2s,border-color .2s;
}
.ai-qty-btn:hover:not(:disabled){background:rgba(244,123,32,.15);border-color:rgba(244,123,32,.3)}
.ai-qty-btn:disabled{opacity:.35;cursor:not-allowed}
.ai-qty-num{font-size:.9rem;font-weight:600;color:var(--light);min-width:18px;text-align:center}
.ai-remove-btn{
  width:26px;height:26px;border-radius:6px;
  background:none;border:1px solid var(--b);color:var(--muted);
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:background .2s,border-color .2s,color .2s;
}
.ai-remove-btn:hover{background:rgba(248,113,113,.12);border-color:rgba(248,113,113,.3);color:#F87171}

.ai-total-row{
  display:flex;align-items:center;justify-content:space-between;
  padding-top:16px;border-top:1px solid var(--b);
}
.ai-total-label{font-size:.72rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted)}
.ai-total-val{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:.04em;color:var(--o)}

/* RESPONSIVE */
@media(max-width:860px){
  .cb-step2-wrap{grid-template-columns:1fr}
  .cb-step2-right{position:static}
}
@media(max-width:640px){
  .cb-wrap{padding:28px 16px 60px}
  .pi-grid{grid-template-columns:repeat(auto-fill,minmax(110px,1fr))}
}
`;