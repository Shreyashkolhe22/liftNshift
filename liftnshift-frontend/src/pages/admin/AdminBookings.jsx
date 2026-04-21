import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllBookings, updateBookingStatus, deleteBooking } from "../../store/adminSlice";
import Navbar from "../../components/Navbar";

const STATUSES = ["PENDING","CONFIRMED","IN_PROGRESS","COMPLETED","CANCELLED"];

function fmt(p) {
  return "₹" + Number(p||0).toLocaleString("en-IN",{minimumFractionDigits:2});
}

function StatusBadge({status}) {
  const map = {
    PENDING:"#FBBF24", CONFIRMED:"#34D399",
    IN_PROGRESS:"#60A5FA", COMPLETED:"#A78BFA", CANCELLED:"#F87171"
  };
  const color = map[status] || "#666";
  return (
    <span style={{
      display:"inline-block", padding:"3px 10px", borderRadius:20,
      fontSize:".7rem", fontWeight:600, textTransform:"uppercase", letterSpacing:".08em",
      background:`${color}18`, color
    }}>
      {status?.replace("_"," ")}
    </span>
  );
}

export default function AdminBookings() {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector(s => s.admin);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("ALL");
  const [confirm, setConfirm] = useState(null);
  const [expand,  setExpand]  = useState(null);
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

  const counts = STATUSES.reduce((a,s) => ({
    ...a, [s]: bookings.filter(b=>b.status===s).length
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
            <p className="subtitle">View all bookings, update status or remove records</p>
          </div>

          {/* Status chips */}
          <div className="stat-row">
            {[
              {label:"Total",       value:bookings.length,   color:"#F47B20"},
              {label:"Pending",     value:counts.PENDING,    color:"#FBBF24"},
              {label:"Confirmed",   value:counts.CONFIRMED,  color:"#34D399"},
              {label:"In Progress", value:counts.IN_PROGRESS,color:"#60A5FA"},
              {label:"Completed",   value:counts.COMPLETED,  color:"#A78BFA"},
              {label:"Cancelled",   value:counts.CANCELLED,  color:"#F87171"},
            ].map(s => (
              <div className="chip" key={s.label}>
                <span className="chip-val" style={{color:s.color}}>{s.value}</span>
                <span className="chip-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="card">
            {/* Filters */}
            <div className="filters">
              <input className="search" placeholder="Search by ID, name or email…"
                value={search} onChange={e=>setSearch(e.target.value)} />
              <select className="sel" value={filter} onChange={e=>setFilter(e.target.value)}>
                <option value="ALL">All Statuses</option>
                {STATUSES.map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            </div>

            {loading ? <p className="empty">Loading…</p>
            : filtered.length===0 ? <p className="empty">No bookings found.</p>
            : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th><th>User</th><th>Route</th>
                      <th>Distance</th><th>Amount</th>
                      <th>Status</th><th>Date</th><th>Actions</th>
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
                          <td style={{maxWidth:200}}>
                            <p className="truncate">{b.pickupAddress?.split(",")[0]}</p>
                            <p className="muted truncate" style={{fontSize:".78rem"}}>
                              → {b.dropAddress?.split(",")[0]}
                            </p>
                          </td>
                          <td className="muted">
                            {b.distanceKm ? `${Number(b.distanceKm).toFixed(1)} km` : "—"}
                          </td>
                          <td className="orange bold">{fmt(b.totalAmount)}</td>
                          <td><StatusBadge status={b.status}/></td>
                          <td className="muted" style={{fontSize:".8rem"}}>
                            {b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN") : "—"}
                          </td>
                          <td>
                            <div className="actions">
                              <select className="sel-sm"
                                value={b.status}
                                onChange={e => setConfirm({
                                  type:"status", bookingId:b.id,
                                  newStatus:e.target.value, label:`#${b.id}`
                                })}>
                                {STATUSES.map(s=>(
                                  <option key={s} value={s}>{s.replace("_"," ")}</option>
                                ))}
                              </select>
                              <button className="btn btn-ghost"
                                onClick={()=>setExpand(expand===b.id ? null : b.id)}>
                                {expand===b.id ? "Hide" : "Items"}
                              </button>
                              <button className="btn btn-danger"
                                onClick={()=>setConfirm({type:"delete",bookingId:b.id,label:`#${b.id}`})}>
                                Del
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded items row */}
                        {expand===b.id && b.items?.length > 0 && (
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
                                    <span style={{color:"#606060",marginLeft:6}}>× {i.quantity}</span>
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

      {/* Confirm Modal */}
      {confirm && (
        <div className="overlay" onClick={()=>setConfirm(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <p className="modal-title">
              {confirm.type==="delete" ? "Delete Booking?" : "Update Status?"}
            </p>
            <p className="modal-sub">
              {confirm.type==="delete"
                ? `Permanently delete Booking ${confirm.label}? This cannot be undone.`
                : `Change Booking ${confirm.label} status to "${confirm.newStatus?.replace("_"," ")}"?`}
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={()=>setConfirm(null)}>Cancel</button>
              <button
                className={`btn ${confirm.type==="delete" ? "btn-danger" : "btn-primary"}`}
                disabled={busy}
                onClick={()=>confirm.type==="delete"
                  ? handleDelete(confirm.bookingId)
                  : handleStatus(confirm.bookingId, confirm.newStatus)
                }>
                {busy ? "Processing…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--dark:#0d0d0d;--card:#191919;--card2:#202020;--b:rgba(255,255,255,0.07);--light:#f0ede8;--muted:#606060;--o:#F47B20}
body{background:var(--dark);font-family:'DM Sans',sans-serif;color:var(--light)}
.page{min-height:100vh;background:var(--dark)}
.wrap{max-width:1200px;margin:0 auto;padding:44px 32px 80px}
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
.truncate{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px}
.actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;padding:5px 12px;border-radius:7px;font-family:'DM Sans',sans-serif;font-size:.78rem;font-weight:500;cursor:pointer;border:none;transition:all .18s;white-space:nowrap}
.btn-primary{background:var(--o);color:#fff}
.btn-ghost{background:var(--card2);color:var(--muted);border:1px solid var(--b)}
.btn-ghost:hover{color:var(--light)}
.btn-danger{background:rgba(248,113,113,.1);color:#F87171;border:1px solid rgba(248,113,113,.2)}
.btn-danger:hover{background:rgba(248,113,113,.2)}
.btn:disabled{opacity:.45;cursor:not-allowed}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:var(--card);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:32px;width:100%;max-width:420px}
.modal-title{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:.04em;margin-bottom:12px}
.modal-sub{color:var(--muted);font-size:.9rem;line-height:1.6}
.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:22px}
@media(max-width:640px){.wrap{padding:24px 16px 60px}}
`;