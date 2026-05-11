import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllDrivers, addDriver, updateDriver, deleteDriver
} from "../../store/adminSlice";
import Navbar from "../../components/Navbar";

const EMPTY = { name: "", phone: "", licenseNo: "", isActive: true };

export default function AdminDrivers() {
  const dispatch = useDispatch();
  const { drivers, loading } = useSelector(s => s.admin);

  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [error,   setError]   = useState("");
  const [busy,    setBusy]    = useState(false);

  useEffect(() => { dispatch(fetchAllDrivers()); }, [dispatch]);

  const filtered = (drivers || []).filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.phone?.includes(search) ||
    d.licenseNo?.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setForm(EMPTY); setError("");
    setModal({ type: "add" });
  }

  function openEdit(driver) {
    setForm({
      name:      driver.name,
      phone:     driver.phone,
      licenseNo: driver.licenseNo,
      isActive:  driver.isActive,
    });
    setError("");
    setModal({ type: "edit", driver });
  }

  function openDelete(driver) {
    setError("");
    setModal({ type: "delete", driver });
  }

  async function handleSave() {
    setError("");
    if (!form.name.trim())      { setError("Driver name is required."); return; }
    if (!form.phone.trim())     { setError("Phone number is required."); return; }
    if (form.phone.length !== 10 || isNaN(form.phone)) {
      setError("Enter a valid 10-digit phone number."); return;
    }
    if (!form.licenseNo.trim()) { setError("License number is required."); return; }

    setBusy(true);
    try {
      const payload = {
        name:      form.name.trim(),
        phone:     form.phone.trim(),
        licenseNo: form.licenseNo.trim().toUpperCase(),
        isActive:  form.isActive,
      };
      if (modal.type === "add") {
        await dispatch(addDriver(payload)).unwrap();
      } else {
        await dispatch(updateDriver({ id: modal.driver.id, data: payload })).unwrap();
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
      await dispatch(deleteDriver(modal.driver.id)).unwrap();
      setModal(null);
    } catch (e) {
      setError(typeof e === "string" ? e : "Failed to delete.");
    }
    setBusy(false);
  }

  const counts = {
    total:    (drivers || []).length,
    active:   (drivers || []).filter(d => d.isActive).length,
    inactive: (drivers || []).filter(d => !d.isActive).length,
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
            <h1 className="title">Drivers</h1>
            <p className="subtitle">Manage your driver team — add, edit or deactivate drivers</p>
          </div>

          {/* Stats */}
          <div className="stat-row">
            {[
              { label:"Total",    value:counts.total,    color:"#F47B20" },
              { label:"Active",   value:counts.active,   color:"#34D399" },
              { label:"Inactive", value:counts.inactive, color:"#F87171" },
            ].map(s => (
              <div className="chip" key={s.label}>
                <span className="chip-val" style={{color:s.color}}>{s.value}</span>
                <span className="chip-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="toolbar">
              <input className="search"
                placeholder="Search by name, phone or license…"
                value={search} onChange={e => setSearch(e.target.value)} />
              <button className="btn btn-primary" onClick={openAdd}>
                + Add Driver
              </button>
            </div>

            {loading ? <p className="empty">Loading…</p>
            : filtered.length === 0 ? <p className="empty">No drivers found.</p>
            : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>License No.</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(d => (
                      <tr key={d.id}>
                        <td className="muted">#{d.id}</td>
                        <td>
                          <div className="driver-avatar-row">
                            <div className="driver-avatar">
                              {d.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="bold">{d.name}</span>
                          </div>
                        </td>
                        <td>
                          <a href={`tel:${d.phone}`} className="phone-link">
                            📞 {d.phone}
                          </a>
                        </td>
                        <td className="muted license">{d.licenseNo}</td>
                        <td>
                          <span style={{
                            display:"inline-block", padding:"3px 10px",
                            borderRadius:20, fontSize:".7rem", fontWeight:600,
                            textTransform:"uppercase", letterSpacing:".08em",
                            background: d.isActive
                              ? "rgba(52,211,153,.12)" : "rgba(248,113,113,.12)",
                            color: d.isActive ? "#34D399" : "#F87171"
                          }}>
                            {d.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button className="btn btn-ghost"
                              onClick={() => openEdit(d)}>Edit</button>
                            <button className="btn btn-danger"
                              onClick={() => openDelete(d)}>Delete</button>
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
              {modal.type === "add" ? "Add New Driver" : "Edit Driver"}
            </p>

            {error && <div className="err">{error}</div>}

            <div className="field">
              <label className="label">Full Name</label>
              <input className="input" placeholder="e.g. Ramesh Patil"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            <div className="field">
              <label className="label">Phone Number</label>
              <div className="phone-input-wrap">
                <span className="phone-prefix">+91</span>
                <input className="input phone-input"
                  type="tel" placeholder="9876543210" maxLength={10}
                  value={form.phone}
                  onChange={e => setForm(f => ({
                    ...f, phone: e.target.value.replace(/\D/,"")
                  }))} />
              </div>
            </div>

            <div className="field">
              <label className="label">License Number</label>
              <input className="input" placeholder="e.g. MH-DL-2021-001"
                value={form.licenseNo}
                onChange={e => setForm(f => ({
                  ...f, licenseNo: e.target.value.toUpperCase()
                }))} />
            </div>

            {modal.type === "edit" && (
              <div className="field">
                <label className="label">Status</label>
                <div className="toggle-row">
                  <span className="toggle-label">
                    {form.isActive ? "✅ Active — can be assigned to bookings" : "❌ Inactive — won't appear in assignments"}
                  </span>
                  <button
                    className={`toggle ${form.isActive ? "toggle-on" : "toggle-off"}`}
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                    <span className="toggle-knob" />
                  </button>
                </div>
              </div>
            )}

            {/* Preview */}
            {form.name && (
              <div className="preview">
                <div className="preview-avatar">
                  {form.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="preview-name">{form.name}</p>
                  <p className="preview-info">
                    {form.phone && `+91 ${form.phone}`}
                    {form.licenseNo && ` · ${form.licenseNo}`}
                  </p>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={busy} onClick={handleSave}>
                {busy ? "Saving…" : modal.type === "add" ? "Add Driver" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal?.type === "delete" && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">Delete Driver?</p>
            {error && <div className="err">{error}</div>}
            <p className="modal-sub">
              Permanently delete driver{" "}
              <strong style={{color:"#f0ede8"}}>{modal.driver.name}</strong>?
              This cannot be undone.
            </p>
            <p className="modal-warn">
              ⚠️ Make sure this driver has no upcoming bookings before deleting.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>
                Cancel
              </button>
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
.empty{color:var(--muted);text-align:center;padding:40px 0;font-size:.9rem}
.table-wrap{overflow-x:auto}
.table{width:100%;border-collapse:collapse;font-size:.875rem}
.table th{text-align:left;padding:10px 14px;font-size:.62rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);border-bottom:1px solid rgba(255,255,255,.1)}
.table td{padding:13px 14px;border-bottom:1px solid var(--b);vertical-align:middle}
.table tr:last-child td{border-bottom:none}
.table tr:hover td{background:rgba(255,255,255,.02)}
.muted{color:var(--muted)}
.bold{font-weight:500;color:var(--light)}
.license{font-size:.82rem;letter-spacing:.04em}
.driver-avatar-row{display:flex;align-items:center;gap:10px}
.driver-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#F47B20,#D4601A);color:#fff;font-size:.85rem;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.phone-link{color:#60A5FA;text-decoration:none;font-size:.86rem;transition:color .2s}
.phone-link:hover{color:#93C5FD}
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
.modal{background:var(--card);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:32px;width:100%;max-width:440px}
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
.phone-input-wrap{display:flex;align-items:center;background:var(--card2);border:1.5px solid var(--b);border-radius:9px;overflow:hidden;transition:border-color .2s}
.phone-input-wrap:focus-within{border-color:var(--o);box-shadow:0 0 0 3px rgba(244,123,32,.1)}
.phone-prefix{padding:12px 12px;font-size:.9rem;color:var(--muted);border-right:1px solid var(--b);background:var(--card);flex-shrink:0}
.phone-input{border:none !important;border-radius:0 !important;box-shadow:none !important;background:transparent !important}
.toggle-row{display:flex;align-items:center;justify-content:space-between;background:var(--card2);border:1px solid var(--b);border-radius:9px;padding:12px 14px;gap:12px}
.toggle-label{font-size:.84rem;color:var(--muted);flex:1;line-height:1.4}
.toggle{width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;position:relative;transition:background .2s;padding:0;flex-shrink:0}
.toggle-on{background:var(--o)}
.toggle-off{background:#333}
.toggle-knob{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .2s}
.toggle-on .toggle-knob{left:23px}
.toggle-off .toggle-knob{left:3px}
.preview{display:flex;align-items:center;gap:12px;background:rgba(244,123,32,.05);border:1px solid rgba(244,123,32,.15);border-radius:9px;padding:12px 14px;margin-bottom:4px}
.preview-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#F47B20,#D4601A);color:#fff;font-size:1rem;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.preview-name{font-size:.92rem;font-weight:600;color:var(--light);margin-bottom:2px}
.preview-info{font-size:.78rem;color:var(--muted)}
@media(max-width:640px){.wrap{padding:24px 16px 60px}}
`;