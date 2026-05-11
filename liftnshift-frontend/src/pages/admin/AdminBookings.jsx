import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllBookings, updateBookingStatus, deleteBooking } from "../../store/adminSlice";
import Navbar from "../../components/Navbar";

const API = "http://localhost:8080";
const STATUSES = ["PENDING","CONFIRMED","IN_PROGRESS","COMPLETED","CANCELLED"];

function fmt(p) {
  return "₹" + Number(p||0).toLocaleString("en-IN",{minimumFractionDigits:2});
}

function StatusBadge({ status }) {
  const map = {
    PENDING:"#FBBF24", CONFIRMED:"#34D399",
    IN_PROGRESS:"#60A5FA", COMPLETED:"#A78BFA", CANCELLED:"#F87171"
  };
  const color = map[status] || "#666";
  return (
    <span style={{
      display:"inline-block", padding:"3px 10px", borderRadius:20,
      fontSize:".7rem", fontWeight:600, textTransform:"uppercase",
      letterSpacing:".08em", background:`${color}18`, color
    }}>
      {status?.replace("_"," ")}
    </span>
  );
}

// ── ASSIGN MODAL ──────────────────────────────────────────────────────────────
function AssignModal({ booking, onClose, onAssigned }) {
  const token = localStorage.getItem("token");

  const [trucks,     setTrucks]     = useState([]);
  const [drivers,    setDrivers]    = useState([]);
  const [selTruck,   setSelTruck]   = useState("");
  const [selDriver,  setSelDriver]  = useState("");
  const [aiRec,      setAiRec]      = useState(null);
  const [aiLoading,  setAiLoading]  = useState(false);
  const [assigning,  setAssigning]  = useState(false);
  const [error,      setError]      = useState("");
  const [loadingData,setLoadingData]= useState(true);

  // Load available trucks + drivers for this booking's date+slot
  useEffect(() => {
    async function load() {
      setLoadingData(true);
      try {
        const [tr, dr] = await Promise.all([
          fetch(`${API}/api/admin/bookings/${booking.id}/available-trucks`,
            { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch(`${API}/api/admin/bookings/${booking.id}/available-drivers`,
            { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ]);
        setTrucks(tr);
        setDrivers(dr);
      } catch (_) {
        setError("Failed to load available trucks/drivers.");
      }
      setLoadingData(false);
    }
    load();
  }, [booking.id]);

  // Auto-select truck matching AI recommendation
  useEffect(() => {
    if (!aiRec || trucks.length === 0) return;
    const match = trucks.find(t => t.size === aiRec.recommendedTruckSize);
    if (match) setSelTruck(String(match.id));
  }, [aiRec, trucks]);

  async function handleAssign() {
    if (!selTruck || !selDriver) {
      setError("Please select both a truck and a driver."); return;
    }
    setAssigning(true); setError("");
    try {
      const res = await fetch(`${API}/api/admin/bookings/${booking.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ truckId: Number(selTruck), driverId: Number(selDriver) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Assignment failed");
      }
      await res.json();
      onAssigned();
    } catch (e) {
      setError(e.message || "Failed to assign.");
    }
    setAssigning(false);
  }

  const timing = booking.timeSlot === "MORNING" ? "8 AM – 1 PM" : "2 PM – 7 PM";
  const slotLabel = booking.timeSlot === "MORNING" ? "🌅 Morning" : "🌆 Evening";
  const confColor = aiRec?.confidence === "HIGH" ? "#34D399" : aiRec?.confidence === "MEDIUM" ? "#FBBF24" : "#F87171";

  return (
    <div className="overlay" onClick={onClose}>
      <div className="assign-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="am-header">
          <div>
            <p className="am-eyebrow">Assign Truck & Driver</p>
            <p className="am-title">Booking #{booking.id}</p>
          </div>
          <button className="am-close" onClick={onClose}>✕</button>
        </div>

        {/* Booking summary */}
        <div className="am-summary">
          <div className="am-summary-row">
            <span className="am-summary-label">User</span>
            <span className="am-summary-val">{booking.userName}</span>
          </div>
          <div className="am-summary-row">
            <span className="am-summary-label">Route</span>
            <span className="am-summary-val">
              {booking.pickupAddress?.split(",")[0]} → {booking.dropAddress?.split(",")[0]}
            </span>
          </div>
          <div className="am-summary-row">
            <span className="am-summary-label">Date</span>
            <span className="am-summary-val">{booking.scheduledDate || "—"}</span>
          </div>
          <div className="am-summary-row">
            <span className="am-summary-label">Slot</span>
            <span className="am-summary-val">{slotLabel} · {timing}</span>
          </div>
          <div className="am-summary-row">
            <span className="am-summary-label">Amount</span>
            <span className="am-summary-val" style={{color:"#F47B20",fontWeight:600}}>{fmt(booking.totalAmount)}</span>
          </div>
        </div>

        {/* Items */}
        {booking.items?.length > 0 && (
          <div className="am-items">
            <p className="am-section-label">Items ({booking.items.length})</p>
            <div className="am-items-list">
              {booking.items.map(i => (
                <span key={i.id} className="am-item-pill">
                  {i.predefinedItemName || i.customName}
                  {i.size && <span style={{opacity:.6}}> · {i.size}</span>}
                  <span style={{opacity:.6}}> ×{i.quantity}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {error && <div className="am-error">{error}</div>}

        {loadingData ? (
          <div className="am-loading">Loading available trucks & drivers…</div>
        ) : (
          <>
            {/* Truck selector */}
            <div className="am-section">
              <p className="am-section-label">
                Select Truck
                {aiRec && (
                  <span className="am-rec-badge" style={{background:`${confColor}18`,color:confColor}}>
                    AI recommends: {aiRec.recommendedTruckSize}
                  </span>
                )}
              </p>
              {trucks.length === 0 ? (
                <div className="am-none">No trucks available for this slot.</div>
              ) : (
                <div className="am-options">
                  {trucks.map(t => (
                    <label key={t.id}
                      className={`am-option ${selTruck === String(t.id) ? "am-option-sel" : ""}
                        ${aiRec?.recommendedTruckSize === t.size ? "am-option-ai" : ""}`}>
                      <input type="radio" name="truck" value={t.id}
                        checked={selTruck === String(t.id)}
                        onChange={() => setSelTruck(String(t.id))} />
                      <div className="am-option-body">
                        <div className="am-option-title">{t.regNumber}</div>
                        <div className="am-option-sub">
                          {t.size} · {t.capacityKg} kg
                          {aiRec?.recommendedTruckSize === t.size && (
                            <span className="am-ai-tag">✨ AI Pick</span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Driver selector */}
            <div className="am-section">
              <p className="am-section-label">Select Driver</p>
              {drivers.length === 0 ? (
                <div className="am-none">No drivers available for this slot.</div>
              ) : (
                <div className="am-options">
                  {drivers.map(d => (
                    <label key={d.id}
                      className={`am-option ${selDriver === String(d.id) ? "am-option-sel" : ""}`}>
                      <input type="radio" name="driver" value={d.id}
                        checked={selDriver === String(d.id)}
                        onChange={() => setSelDriver(String(d.id))} />
                      <div className="am-option-body">
                        <div className="am-option-title">{d.name}</div>
                        <div className="am-option-sub">{d.phone} · {d.licenseNo}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* AI Recommendation section */}
            {aiRec && (
              <div className="am-ai-result">
                <div className="am-ai-header">
                  <span className="am-ai-icon">🤖</span>
                  <span className="am-ai-title">AI Recommendation</span>
                  <span className="am-ai-conf" style={{color:confColor}}>
                    {aiRec.confidence} confidence
                  </span>
                </div>
                <div className="am-ai-truck">
                  Recommended truck size:
                  <strong style={{color:"#F47B20",marginLeft:6}}>{aiRec.recommendedTruckSize}</strong>
                  <span style={{color:"#606060",marginLeft:8}}>~{aiRec.estimatedLoadPercent}% load</span>
                </div>
                <div className="am-ai-reason">{aiRec.reason}</div>
                {aiRec.warning && (
                  <div className="am-ai-warning">⚠️ {aiRec.warning}</div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="am-actions">
              <button className="am-btn-ghost" onClick={onClose}>Cancel</button>
              <button
                className="am-btn-assign"
                disabled={assigning || !selTruck || !selDriver}
                onClick={handleAssign}
              >
                {assigning ? "Assigning…" : "✓ Confirm Assignment"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AdminBookings() {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector(s => s.admin);

  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("ALL");
  const [confirm, setConfirm] = useState(null);
  const [expand,  setExpand]  = useState(null);
  const [assign,  setAssign]  = useState(null); // booking to assign
  const [busy,    setBusy]    = useState(false);

  useEffect(() => { dispatch(fetchAllBookings()); }, [dispatch]);

  const filtered = bookings
    .filter(b => filter === "ALL" || b.status === filter)
    .filter(b =>
      String(b.id).includes(search) ||
      b.userName?.toLowerCase().includes(search.toLowerCase()) ||
      b.userEmail?.toLowerCase().includes(search.toLowerCase())
    );

  async function handleStatus(bookingId, status) {
    setBusy(true);
    await dispatch(updateBookingStatus({ bookingId, status }));
    setBusy(false); setConfirm(null);
  }

  async function handleDelete(id) {
    setBusy(true);
    await dispatch(deleteBooking(id));
    setBusy(false); setConfirm(null);
  }

  async function handleAssigned() {
    setAssign(null);
    dispatch(fetchAllBookings());
  }

  const counts = STATUSES.reduce((a, s) => ({
    ...a, [s]: bookings.filter(b => b.status === s).length
  }), {});

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <Navbar />
        <div className="wrap">
          <a href="/admin/dashboard" className="back">← Dashboard</a>

          <div className="page-header">
            <p className="eyebrow">Admin Panel</p>
            <h1 className="title">Bookings</h1>
            <p className="subtitle">Manage bookings, assign trucks & drivers, update status</p>
          </div>

          {/* Stats */}
          <div className="stat-row">
            {[
              {label:"Total",       value:bookings.length,    color:"#F47B20"},
              {label:"Pending",     value:counts.PENDING,     color:"#FBBF24"},
              {label:"Confirmed",   value:counts.CONFIRMED,   color:"#34D399"},
              {label:"In Progress", value:counts.IN_PROGRESS, color:"#60A5FA"},
              {label:"Completed",   value:counts.COMPLETED,   color:"#A78BFA"},
              {label:"Cancelled",   value:counts.CANCELLED,   color:"#F87171"},
            ].map(s => (
              <div className="chip" key={s.label}>
                <span className="chip-val" style={{color:s.color}}>{s.value}</span>
                <span className="chip-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="filters">
              <input className="search" placeholder="Search by ID, name or email…"
                value={search} onChange={e => setSearch(e.target.value)} />
              <select className="sel" value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="ALL">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            </div>

            {loading ? <p className="empty">Loading…</p>
            : filtered.length === 0 ? <p className="empty">No bookings found.</p>
            : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th><th>User</th><th>Route</th>
                      <th>Slot</th><th>Amount</th>
                      <th>Truck / Driver</th>
                      <th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(b => (
                      <>
                        <tr key={b.id}>
                          <td className="muted">#{b.id}</td>
                          <td>
                            <p className="bold">{b.userName}</p>
                            <p className="muted" style={{fontSize:".78rem"}}>{b.userEmail}</p>
                          </td>
                          <td style={{maxWidth:180}}>
                            <p className="truncate">{b.pickupAddress?.split(",")[0]}</p>
                            <p className="muted truncate" style={{fontSize:".78rem"}}>
                              → {b.dropAddress?.split(",")[0]}
                            </p>
                          </td>
                          <td>
                            {b.scheduledDate ? (
                              <>
                                <p style={{fontSize:".82rem",color:"#f0ede8"}}>{b.scheduledDate}</p>
                                <p style={{fontSize:".76rem",color:"#606060"}}>
                                  {b.timeSlot === "MORNING" ? "🌅 Morning" : "🌆 Evening"}
                                </p>
                              </>
                            ) : <span className="muted">—</span>}
                          </td>
                          <td className="orange bold">{fmt(b.totalAmount)}</td>
                          <td>
                            {b.assigned ? (
                              <div>
                                <p style={{fontSize:".8rem",color:"#34D399",fontWeight:500}}>
                                  🚛 {b.truckRegNumber}
                                </p>
                                <p style={{fontSize:".76rem",color:"#606060"}}>
                                  👤 {b.driverName}
                                </p>
                              </div>
                            ) : (
                              b.status === "PENDING" || b.status === "CONFIRMED" ? (
                                <button className="btn btn-assign"
                                  onClick={() => setAssign(b)}>
                                  + Assign
                                </button>
                              ) : <span className="muted" style={{fontSize:".8rem"}}>—</span>
                            )}
                          </td>
                          <td><StatusBadge status={b.status}/></td>
                          <td>
                            <div className="actions">
                              <select className="sel-sm" value={b.status}
                                onChange={e => setConfirm({
                                  type:"status", bookingId:b.id,
                                  newStatus:e.target.value, label:`#${b.id}`
                                })}>
                                {STATUSES.map(s => (
                                  <option key={s} value={s}>{s.replace("_"," ")}</option>
                                ))}
                              </select>
                              <button className="btn btn-ghost"
                                onClick={() => setExpand(expand === b.id ? null : b.id)}>
                                {expand === b.id ? "Hide" : "Items"}
                              </button>
                              <button className="btn btn-danger"
                                onClick={() => setConfirm({type:"delete",bookingId:b.id,label:`#${b.id}`})}>
                                Del
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded items */}
                        {expand === b.id && b.items?.length > 0 && (
                          <tr key={`${b.id}-items`}>
                            <td colSpan={8} style={{background:"#202020",padding:"12px 18px"}}>
                              <p style={{fontSize:".72rem",textTransform:"uppercase",letterSpacing:".12em",color:"#606060",marginBottom:8}}>
                                Items in this booking
                              </p>
                              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                                {b.items.map(i => (
                                  <div key={i.id} style={{
                                    background:"#191919",border:"1px solid rgba(255,255,255,.07)",
                                    borderRadius:8,padding:"8px 14px",fontSize:".82rem"
                                  }}>
                                    <span style={{color:"#f0ede8",fontWeight:500}}>
                                      {i.predefinedItemName || i.customName}
                                    </span>
                                    {i.size && <span style={{color:"#606060",marginLeft:6}}>· {i.size}</span>}
                                    <span style={{color:"#606060",marginLeft:6}}>×{i.quantity}</span>
                                    <span style={{color:"#F47B20",marginLeft:8,fontWeight:600}}>
                                      {fmt(i.price)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status / Delete confirm modal */}
      {confirm && (
        <div className="overlay" onClick={() => setConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">
              {confirm.type === "delete" ? "Delete Booking?" : "Update Status?"}
            </p>
            <p className="modal-sub">
              {confirm.type === "delete"
                ? `Permanently delete Booking ${confirm.label}?`
                : `Change Booking ${confirm.label} status to "${confirm.newStatus?.replace("_"," ")}"?`}
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button
                className={`btn ${confirm.type === "delete" ? "btn-danger" : "btn-primary"}`}
                disabled={busy}
                onClick={() => confirm.type === "delete"
                  ? handleDelete(confirm.bookingId)
                  : handleStatus(confirm.bookingId, confirm.newStatus)
                }>
                {busy ? "Processing…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign truck + driver modal */}
      {assign && (
        <AssignModal
          booking={assign}
          onClose={() => setAssign(null)}
          onAssigned={handleAssigned}
        />
      )}
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--dark:#0d0d0d;--card:#191919;--card2:#202020;--b:rgba(255,255,255,0.07);--b2:rgba(255,255,255,0.11);--light:#f0ede8;--muted:#606060;--o:#F47B20;--od:#D4601A}
body{background:var(--dark);font-family:'DM Sans',sans-serif;color:var(--light)}
.page{min-height:100vh;background:var(--dark)}
.wrap{max-width:1300px;margin:0 auto;padding:44px 32px 80px}
.back{display:inline-block;color:var(--muted);font-size:.84rem;margin-bottom:20px;text-decoration:none;transition:color .2s}
.back:hover{color:var(--light)}
.page-header{margin-bottom:28px}
.eyebrow{font-size:.68rem;text-transform:uppercase;letter-spacing:.22em;color:var(--o);margin-bottom:6px}
.title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2rem,4vw,3rem);letter-spacing:.04em;color:var(--light);line-height:1}
.subtitle{font-size:.9rem;color:var(--muted);margin-top:6px}

.stat-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px}
.chip{background:var(--card);border:1px solid var(--b);border-radius:10px;padding:13px 18px;display:flex;flex-direction:column;gap:4px}
.chip-val{font-family:'Bebas Neue',sans-serif;font-size:1.7rem;letter-spacing:.04em;line-height:1}
.chip-label{font-size:.65rem;text-transform:uppercase;letter-spacing:.12em;color:var(--muted)}

.card{background:var(--card);border:1px solid var(--b);border-radius:16px;padding:24px}
.filters{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}
.search{flex:1;min-width:200px;padding:10px 14px;background:var(--card2);border:1.5px solid var(--b);border-radius:9px;color:var(--light);font-family:'DM Sans',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s}
.search::placeholder{color:var(--muted)}
.search:focus{border-color:var(--o)}
.sel{padding:9px 12px;background:var(--card2);border:1.5px solid var(--b);border-radius:9px;color:var(--light);font-family:'DM Sans',sans-serif;font-size:.86rem;outline:none}
.sel-sm{padding:5px 8px;background:var(--card2);border:1px solid var(--b);border-radius:7px;color:var(--light);font-family:'DM Sans',sans-serif;font-size:.76rem;outline:none}
.empty{color:var(--muted);text-align:center;padding:40px 0;font-size:.9rem}

.table-wrap{overflow-x:auto}
.table{width:100%;border-collapse:collapse;font-size:.86rem}
.table th{text-align:left;padding:10px 12px;font-size:.62rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);border-bottom:1px solid rgba(255,255,255,.1)}
.table td{padding:12px 12px;border-bottom:1px solid var(--b);vertical-align:middle}
.table tr:last-child td{border-bottom:none}
.table tr:hover td{background:rgba(255,255,255,.018)}
.muted{color:var(--muted)}
.bold{font-weight:500;color:var(--light)}
.orange{color:var(--o);font-family:'Bebas Neue',sans-serif;font-size:1rem;letter-spacing:.04em}
.truncate{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px}

.actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;padding:5px 12px;border-radius:7px;font-family:'DM Sans',sans-serif;font-size:.78rem;font-weight:500;cursor:pointer;border:none;transition:all .18s;white-space:nowrap}
.btn-primary{background:var(--o);color:#fff}
.btn-primary:hover{background:var(--od)}
.btn-ghost{background:var(--card2);color:var(--muted);border:1px solid var(--b)}
.btn-ghost:hover{color:var(--light)}
.btn-danger{background:rgba(248,113,113,.1);color:#F87171;border:1px solid rgba(248,113,113,.2)}
.btn-danger:hover{background:rgba(248,113,113,.2)}
.btn-assign{background:rgba(244,123,32,.12);color:var(--o);border:1px solid rgba(244,123,32,.25);font-size:.78rem;padding:5px 12px;border-radius:7px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;transition:all .18s}
.btn-assign:hover{background:rgba(244,123,32,.22);border-color:var(--o)}
.btn:disabled{opacity:.45;cursor:not-allowed}

/* STATUS/DELETE MODAL */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:var(--card);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:32px;width:100%;max-width:420px}
.modal-title{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:.04em;margin-bottom:12px}
.modal-sub{color:var(--muted);font-size:.9rem;line-height:1.6}
.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:22px}

/* ASSIGN MODAL */
.assign-modal{background:var(--card);border:1px solid rgba(255,255,255,.12);border-radius:18px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;padding:28px}
.am-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}
.am-eyebrow{font-size:.65rem;text-transform:uppercase;letter-spacing:.18em;color:var(--o);margin-bottom:4px}
.am-title{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:.04em;color:var(--light)}
.am-close{background:var(--card2);border:1px solid var(--b);color:var(--muted);width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
.am-close:hover{color:var(--light);border-color:var(--b2)}

.am-summary{background:var(--card2);border:1px solid var(--b);border-radius:12px;padding:16px;margin-bottom:16px}
.am-summary-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04)}
.am-summary-row:last-child{border-bottom:none}
.am-summary-label{font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)}
.am-summary-val{font-size:.86rem;color:var(--light);font-weight:500;text-align:right;max-width:60%}

.am-items{margin-bottom:16px}
.am-items-list{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.am-item-pill{background:var(--card2);border:1px solid var(--b);border-radius:20px;padding:4px 12px;font-size:.78rem;color:var(--light)}

.am-error{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);color:#F87171;padding:9px 13px;border-radius:8px;font-size:.84rem;margin-bottom:16px}
.am-loading{color:var(--muted);font-size:.88rem;text-align:center;padding:24px 0}
.am-none{color:var(--muted);font-size:.84rem;padding:12px 0}

.am-section{margin-bottom:20px}
.am-section-label{font-size:.68rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin-bottom:10px;display:flex;align-items:center;gap:8px}
.am-rec-badge{padding:2px 8px;border-radius:12px;font-size:.65rem;font-weight:600;letter-spacing:.06em}

.am-options{display:flex;flex-direction:column;gap:8px}
.am-option{display:flex;align-items:center;gap:12px;background:var(--card2);border:1.5px solid var(--b);border-radius:10px;padding:12px 14px;cursor:pointer;transition:all .18s}
.am-option:hover{border-color:var(--b2)}
.am-option-sel{border-color:var(--o) !important;background:rgba(244,123,32,.06) !important}
.am-option-ai{border-color:rgba(52,211,153,.3) !important}
.am-option input{accent-color:var(--o);width:15px;height:15px;flex-shrink:0}
.am-option-body{flex:1}
.am-option-title{font-size:.9rem;font-weight:500;color:var(--light);margin-bottom:2px}
.am-option-sub{font-size:.78rem;color:var(--muted);display:flex;align-items:center;gap:8px}
.am-ai-tag{background:rgba(52,211,153,.12);color:#34D399;padding:1px 6px;border-radius:10px;font-size:.65rem;font-weight:600}

/* AI RESULT */
.am-ai-result{background:rgba(244,123,32,.04);border:1px solid rgba(244,123,32,.15);border-radius:12px;padding:16px;margin-bottom:20px}
.am-ai-header{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.am-ai-icon{font-size:1.1rem}
.am-ai-title{font-size:.9rem;font-weight:600;color:var(--light);flex:1}
.am-ai-conf{font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em}
.am-ai-truck{font-size:.88rem;color:var(--muted);margin-bottom:8px}
.am-ai-reason{font-size:.84rem;color:var(--muted);line-height:1.6;margin-bottom:6px}
.am-ai-warning{font-size:.82rem;color:#FBBF24;margin-top:6px}

/* ACTION BUTTONS */
.am-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:4px}
.am-btn-ghost{background:var(--card2);color:var(--muted);border:1px solid var(--b);padding:10px 20px;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.88rem;cursor:pointer;transition:all .2s}
.am-btn-ghost:hover{color:var(--light)}
.am-btn-assign{background:var(--o);color:#fff;border:none;padding:10px 24px;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .2s;box-shadow:0 4px 14px rgba(244,123,32,.3)}
.am-btn-assign:hover:not(:disabled){background:var(--od);transform:translateY(-1px)}
.am-btn-assign:disabled{opacity:.45;cursor:not-allowed}

@media(max-width:640px){.wrap{padding:24px 16px 60px}.assign-modal{padding:20px}}
`;