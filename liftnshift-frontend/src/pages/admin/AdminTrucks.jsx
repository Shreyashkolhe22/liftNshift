import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllTrucks, addTruck, updateTruck, deleteTruck
} from "../../store/adminSlice";
import Navbar from "../../components/Navbar";

const SIZES   = ["SMALL", "MEDIUM", "LARGE"];
const EMPTY   = { regNumber: "", size: "MEDIUM", capacityKg: "", isActive: true };
const SIZE_CAP = { SMALL: 600, MEDIUM: 1200, LARGE: 2000 };
const SIZE_DESC= { SMALL: "1BHK · up to 600 kg", MEDIUM: "2BHK · up to 1200 kg", LARGE: "3BHK · up to 2000 kg" };

function SizeBadge({ size }) {
  const map = { SMALL:"#60A5FA", MEDIUM:"#F47B20", LARGE:"#34D399" };
  const c   = map[size] || "#666";
  return (
    <span style={{
      display:"inline-block", padding:"3px 10px", borderRadius:20,
      fontSize:".7rem", fontWeight:600, textTransform:"uppercase",
      letterSpacing:".08em", background:`${c}18`, color:c
    }}>{size}</span>
  );
}

export default function AdminTrucks() {
  const dispatch = useDispatch();
  const { trucks, loading } = useSelector(s => s.admin);

  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("ALL");
  const [modal,   setModal]   = useState(null); // {type:"add"|"edit"|"delete", truck?}
  const [form,    setForm]    = useState(EMPTY);
  const [error,   setError]   = useState("");
  const [busy,    setBusy]    = useState(false);

  useEffect(() => { dispatch(fetchAllTrucks()); }, [dispatch]);

  const filtered = (trucks || [])
    .filter(t => filter === "ALL" || t.size === filter)
    .filter(t =>
      t.regNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.size?.toLowerCase().includes(search.toLowerCase())
    );

  // Auto fill capacity when size changes
  function handleSizeChange(size) {
    setForm(f => ({ ...f, size, capacityKg: SIZE_CAP[size] }));
  }

  function openAdd() {
    setForm(EMPTY); setError("");
    setModal({ type: "add" });
  }

  function openEdit(truck) {
    setForm({
      regNumber:  truck.regNumber,
      size:       truck.size,
      capacityKg: truck.capacityKg,
      isActive:   truck.isActive,
    });
    setError("");
    setModal({ type: "edit", truck });
  }

  function openDelete(truck) {
    setModal({ type: "delete", truck });
  }

  async function handleSave() {
    setError("");
    if (!form.regNumber.trim()) { setError("Registration number is required."); return; }
    if (!form.capacityKg || Number(form.capacityKg) <= 0) { setError("Enter valid capacity."); return; }

    setBusy(true);
    try {
      const payload = {
        regNumber:  form.regNumber.trim().toUpperCase(),
        size:       form.size,
        capacityKg: Number(form.capacityKg),
        isActive:   form.isActive,
      };
      if (modal.type === "add") {
        await dispatch(addTruck(payload)).unwrap();
      } else {
        await dispatch(updateTruck({ id: modal.truck.id, data: payload })).unwrap();
      }
      setModal(null);
    } catch (e) {
      setError(typeof e === "string" ? e : "Failed. Try again.");
    }
    setBusy(false);
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await dispatch(deleteTruck(modal.truck.id)).unwrap();
      setModal(null);
    } catch (e) {
      setError(typeof e === "string" ? e : "Failed to delete.");
    }
    setBusy(false);
  }

  const counts = {
    total:  (trucks||[]).length,
    active: (trucks||[]).filter(t => t.isActive).length,
    small:  (trucks||[]).filter(t => t.size === "SMALL").length,
    medium: (trucks||[]).filter(t => t.size === "MEDIUM").length,
    large:  (trucks||[]).filter(t => t.size === "LARGE").length,
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <Navbar />
        <div className="wrap">
          <a href="/admin/dashboard" className="back">← Dashboard</a>

          <div className="page-header">
            <p className="eyebrow">Admin Panel</p>
            <h1 className="title">Trucks</h1>
            <p className="subtitle">Manage your fleet — add, edit or deactivate trucks</p>
          </div>

          {/* Stats */}
          <div className="stat-row">
            {[
              { label:"Total",   value:counts.total,  color:"#F47B20" },
              { label:"Active",  value:counts.active, color:"#34D399" },
              { label:"Small",   value:counts.small,  color:"#60A5FA" },
              { label:"Medium",  value:counts.medium, color:"#F47B20" },
              { label:"Large",   value:counts.large,  color:"#A78BFA" },
            ].map(s => (
              <div className="chip" key={s.label}>
                <span className="chip-val" style={{color:s.color}}>{s.value}</span>
                <span className="chip-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="toolbar">
              <input className="search" placeholder="Search by reg number or size…"
                value={search} onChange={e => setSearch(e.target.value)} />
              <select className="sel" value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="ALL">All Sizes</option>
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="btn btn-primary" onClick={openAdd}>+ Add Truck</button>
            </div>

            {loading ? <p className="empty">Loading…</p>
            : filtered.length === 0 ? <p className="empty">No trucks found.</p>
            : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Reg Number</th>
                      <th>Size</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(t => (
                      <tr key={t.id}>
                        <td className="muted">#{t.id}</td>
                        <td>
                          <span className="truck-reg">🚛 {t.regNumber}</span>
                        </td>
                        <td><SizeBadge size={t.size} /></td>
                        <td className="muted">{t.capacityKg} kg</td>
                        <td>
                          <span style={{
                            display:"inline-block", padding:"3px 10px", borderRadius:20,
                            fontSize:".7rem", fontWeight:600, textTransform:"uppercase",
                            letterSpacing:".08em",
                            background: t.isActive ? "rgba(52,211,153,.12)" : "rgba(248,113,113,.12)",
                            color: t.isActive ? "#34D399" : "#F87171"
                          }}>
                            {t.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button className="btn btn-ghost"
                              onClick={() => openEdit(t)}>Edit</button>
                            <button className="btn btn-danger"
                              onClick={() => openDelete(t)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(modal?.type === "add" || modal?.type === "edit") && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">
              {modal.type === "add" ? "Add New Truck" : "Edit Truck"}
            </p>

            {error && <div className="err">{error}</div>}

            <div className="field">
              <label className="label">Registration Number</label>
              <input className="input" placeholder="e.g. MH-20-AB-1234"
                value={form.regNumber}
                onChange={e => setForm(f => ({ ...f, regNumber: e.target.value }))} />
            </div>

            <div className="field">
              <label className="label">Truck Size</label>
              <div className="size-grid">
                {SIZES.map(s => (
                  <button key={s}
                    className={`size-card ${form.size === s ? "size-card-sel" : ""}`}
                    onClick={() => handleSizeChange(s)}>
                    <span className="size-name">{s}</span>
                    <span className="size-desc">{SIZE_DESC[s]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="label">Capacity (kg)</label>
              <input className="input" type="number" placeholder="e.g. 2000"
                value={form.capacityKg}
                onChange={e => setForm(f => ({ ...f, capacityKg: e.target.value }))} />
            </div>

            {modal.type === "edit" && (
              <div className="field">
                <label className="label">Status</label>
                <div className="toggle-row">
                  <span className="toggle-label">
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    className={`toggle ${form.isActive ? "toggle-on" : "toggle-off"}`}
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                    <span className="toggle-knob" />
                  </button>
                </div>
              </div>
            )}

            {/* Preview card */}
            {form.regNumber && (
              <div className="preview">
                <span className="preview-reg">🚛 {form.regNumber.toUpperCase()}</span>
                <span className="preview-info">{form.size} · {form.capacityKg} kg</span>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={busy} onClick={handleSave}>
                {busy ? "Saving…" : modal.type === "add" ? "Add Truck" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal?.type === "delete" && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">Delete Truck?</p>
            {error && <div className="err">{error}</div>}
            <p className="modal-sub">
              Permanently delete truck <strong style={{color:"#f0ede8"}}>
              {modal.truck.regNumber}</strong>?
              This cannot be undone.
            </p>
            <p className="modal-warn">
              ⚠️ Make sure this truck has no upcoming bookings before deleting.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={busy} onClick={handleDelete}>
                {busy ? "Deleting…" : "Yes, Delete"}
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
:root{--dark:#0d0d0d;--card:#191919;--card2:#202020;--b:rgba(255,255,255,0.07);--b2:rgba(255,255,255,0.11);--light:#f0ede8;--muted:#606060;--o:#F47B20;--od:#D4601A}
body{background:var(--dark);font-family:'DM Sans',sans-serif;color:var(--light)}
.page{min-height:100vh;background:var(--dark)}
.wrap{max-width:1100px;margin:0 auto;padding:44px 32px 80px}
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
.toolbar{display:flex;gap:12px;margin-bottom:20px;align-items:center;flex-wrap:wrap}
.search{flex:1;min-width:200px;padding:10px 14px;background:var(--card2);border:1.5px solid var(--b);border-radius:9px;color:var(--light);font-family:'DM Sans',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s}
.search::placeholder{color:var(--muted)}
.search:focus{border-color:var(--o)}
.sel{padding:9px 12px;background:var(--card2);border:1.5px solid var(--b);border-radius:9px;color:var(--light);font-family:'DM Sans',sans-serif;font-size:.86rem;outline:none}
.empty{color:var(--muted);text-align:center;padding:40px 0;font-size:.9rem}
.table-wrap{overflow-x:auto}
.table{width:100%;border-collapse:collapse;font-size:.875rem}
.table th{text-align:left;padding:10px 14px;font-size:.62rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);border-bottom:1px solid rgba(255,255,255,.1)}
.table td{padding:13px 14px;border-bottom:1px solid var(--b);vertical-align:middle}
.table tr:last-child td{border-bottom:none}
.table tr:hover td{background:rgba(255,255,255,.02)}
.muted{color:var(--muted)}
.truck-reg{font-weight:600;color:var(--light);letter-spacing:.02em}
.actions{display:flex;gap:8px}
.btn{display:inline-flex;align-items:center;padding:6px 16px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:500;cursor:pointer;border:none;transition:all .18s}
.btn-primary{background:var(--o);color:#fff;box-shadow:0 4px 14px rgba(244,123,32,.3)}
.btn-primary:hover:not(:disabled){background:var(--od);transform:translateY(-1px)}
.btn-ghost{background:var(--card2);color:var(--muted);border:1px solid var(--b)}
.btn-ghost:hover{color:var(--light)}
.btn-danger{background:rgba(248,113,113,.1);color:#F87171;border:1px solid rgba(248,113,113,.2)}
.btn-danger:hover{background:rgba(248,113,113,.2)}
.btn:disabled{opacity:.45;cursor:not-allowed}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:var(--card);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:32px;width:100%;max-width:460px}
.modal-title{font-family:'Bebas Neue',sans-serif;font-size:1.7rem;letter-spacing:.04em;margin-bottom:16px}
.modal-sub{color:var(--muted);font-size:.9rem;line-height:1.6;margin-bottom:8px}
.modal-warn{font-size:.82rem;color:#FBBF24;margin-top:8px}
.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:24px}
.err{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);color:#F87171;padding:9px 13px;border-radius:8px;font-size:.84rem;margin-bottom:16px}
.field{margin-bottom:18px}
.label{font-size:.68rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);display:block;margin-bottom:8px}
.input{width:100%;padding:12px 14px;background:var(--card2);border:1.5px solid var(--b);border-radius:9px;color:var(--light);font-family:'DM Sans',sans-serif;font-size:.92rem;outline:none;transition:border-color .2s}
.input::placeholder{color:var(--muted)}
.input:focus{border-color:var(--o);box-shadow:0 0 0 3px rgba(244,123,32,.1)}
.size-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.size-card{background:var(--card2);border:1.5px solid var(--b);border-radius:10px;padding:12px 8px;cursor:pointer;transition:all .18s;display:flex;flex-direction:column;align-items:center;gap:4px;font-family:'DM Sans',sans-serif}
.size-card:hover{border-color:var(--b2)}
.size-card-sel{border-color:var(--o) !important;background:rgba(244,123,32,.08) !important}
.size-name{font-size:.9rem;font-weight:600;color:var(--light)}
.size-desc{font-size:.72rem;color:var(--muted);text-align:center;line-height:1.4}
.size-card-sel .size-name{color:var(--o)}
.toggle-row{display:flex;align-items:center;justify-content:space-between;background:var(--card2);border:1px solid var(--b);border-radius:9px;padding:12px 14px}
.toggle-label{font-size:.9rem;color:var(--light)}
.toggle{width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;position:relative;transition:background .2s;padding:0}
.toggle-on{background:var(--o)}
.toggle-off{background:#333}
.toggle-knob{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .2s}
.toggle-on .toggle-knob{left:23px}
.toggle-off .toggle-knob{left:3px}
.preview{display:flex;justify-content:space-between;align-items:center;background:rgba(244,123,32,.05);border:1px solid rgba(244,123,32,.15);border-radius:9px;padding:12px 14px;margin-bottom:4px}
.preview-reg{font-size:.95rem;font-weight:600;color:var(--light)}
.preview-info{font-size:.82rem;color:var(--muted)}
@media(max-width:640px){.wrap{padding:24px 16px 60px}.size-grid{grid-template-columns:1fr}}
`;