import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers, deleteUser, makeAdmin } from "../../store/adminSlice";
import Navbar from "../../components/Navbar";

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector(s => s.admin);
  const [search,  setSearch]  = useState("");
  const [confirm, setConfirm] = useState(null);
  const [busy,    setBusy]    = useState(false);

  useEffect(() => { dispatch(fetchAllUsers()); }, [dispatch]);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(user) {
    setBusy(true);
    await dispatch(deleteUser(user.id));
    setBusy(false); setConfirm(null);
  }

  async function handleMakeAdmin(user) {
    setBusy(true);
    await dispatch(makeAdmin(user.id));
    setBusy(false); setConfirm(null);
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <Navbar />
        <div className="wrap">
          <a href="/admin/dashboard" className="back">← Dashboard</a>

          <div className="page-header">
            <p className="eyebrow">Admin Panel</p>
            <h1 className="title">Users</h1>
            <p className="subtitle">Manage all registered users</p>
          </div>

          {/* Stats row */}
          <div className="stat-row">
            {[
              { label:"Total",  value: users.length,                                 color:"#F47B20" },
              { label:"Admins", value: users.filter(u=>u.role==="ADMIN").length,     color:"#F87171" },
              { label:"Users",  value: users.filter(u=>u.role==="USER").length,      color:"#60A5FA" },
            ].map(s => (
              <div className="chip" key={s.label}>
                <span className="chip-val" style={{color:s.color}}>{s.value}</span>
                <span className="chip-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <input className="search" placeholder="Search by name or email…"
              value={search} onChange={e => setSearch(e.target.value)} />

            {loading ? <p className="empty">Loading…</p>
            : filtered.length === 0 ? <p className="empty">No users found.</p>
            : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Name</th><th>Email</th>
                      <th>Phone</th><th>Role</th><th>Bookings</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u.id}>
                        <td className="muted">#{u.id}</td>
                        <td className="bold">{u.name}</td>
                        <td className="muted">{u.email}</td>
                        <td className="muted">{u.phone || "—"}</td>
                        <td>
                          <span className={`badge ${u.role === "ADMIN" ? "badge-admin" : "badge-user"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className="num">{u.totalBookings}</span>
                        </td>
                        <td>
                          <div className="actions">
                            {u.role !== "ADMIN" && (
                              <>
                                <button className="btn btn-ghost"
                                  onClick={() => setConfirm({type:"admin", user:u})}>
                                  Make Admin
                                </button>
                                <button className="btn btn-danger"
                                  onClick={() => setConfirm({type:"delete", user:u})}>
                                  Delete
                                </button>
                              </>
                            )}
                            {u.role === "ADMIN" && (
                              <span className="muted" style={{fontSize:".78rem"}}>Protected</span>
                            )}
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

      {confirm && (
        <div className="overlay" onClick={() => setConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">
              {confirm.type === "delete" ? "Delete User?" : "Promote to Admin?"}
            </p>
            <p className="modal-sub">
              {confirm.type === "delete"
                ? `This permanently deletes "${confirm.user.name}" and all their data.`
                : `"${confirm.user.name}" will get full admin access.`}
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button
                className={`btn ${confirm.type === "delete" ? "btn-danger" : "btn-primary"}`}
                disabled={busy}
                onClick={() => confirm.type === "delete"
                  ? handleDelete(confirm.user)
                  : handleMakeAdmin(confirm.user)
                }>
                {busy ? "Processing…" : confirm.type === "delete" ? "Yes, Delete" : "Yes, Promote"}
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
.wrap{max-width:1100px;margin:0 auto;padding:44px 32px 80px}
.back{display:inline-block;color:var(--muted);font-size:.84rem;margin-bottom:20px;text-decoration:none;transition:color .2s}
.back:hover{color:var(--light)}
.page-header{margin-bottom:28px}
.eyebrow{font-size:.68rem;text-transform:uppercase;letter-spacing:.22em;color:var(--o);margin-bottom:6px}
.title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2rem,4vw,3rem);letter-spacing:.04em;color:var(--light);line-height:1}
.subtitle{font-size:.9rem;color:var(--muted);margin-top:6px}
.stat-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:24px}
.chip{background:var(--card);border:1px solid var(--b);border-radius:10px;padding:14px 20px;display:flex;flex-direction:column;gap:4px}
.chip-val{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:.04em;line-height:1}
.chip-label{font-size:.68rem;text-transform:uppercase;letter-spacing:.12em;color:var(--muted)}
.card{background:var(--card);border:1px solid var(--b);border-radius:16px;padding:24px}
.search{width:100%;padding:11px 14px;background:var(--card2);border:1.5px solid var(--b);border-radius:9px;color:var(--light);font-family:'DM Sans',sans-serif;font-size:.9rem;outline:none;margin-bottom:20px;transition:border-color .2s}
.search::placeholder{color:var(--muted)}
.search:focus{border-color:var(--o)}
.empty{color:var(--muted);text-align:center;padding:40px 0;font-size:.9rem}
.table-wrap{overflow-x:auto}
.table{width:100%;border-collapse:collapse;font-size:.875rem}
.table th{text-align:left;padding:10px 14px;font-size:.65rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);border-bottom:1px solid rgba(255,255,255,.1)}
.table td{padding:13px 14px;border-bottom:1px solid var(--b);vertical-align:middle}
.table tr:last-child td{border-bottom:none}
.table tr:hover td{background:rgba(255,255,255,.02)}
.muted{color:var(--muted)}
.bold{font-weight:500;color:var(--light)}
.num{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;color:var(--o)}
.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em}
.badge-admin{background:rgba(244,123,32,.15);color:var(--o)}
.badge-user{background:rgba(255,255,255,.06);color:var(--muted)}
.actions{display:flex;gap:8px;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;padding:6px 14px;border-radius:7px;font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:500;cursor:pointer;border:none;transition:all .18s}
.btn-primary{background:var(--o);color:#fff}
.btn-primary:hover{background:#D4601A}
.btn-ghost{background:var(--card2);color:var(--muted);border:1px solid var(--b)}
.btn-ghost:hover{color:var(--light)}
.btn-danger{background:rgba(248,113,113,.1);color:#F87171;border:1px solid rgba(248,113,113,.2)}
.btn-danger:hover{background:rgba(248,113,113,.2)}
.btn:disabled{opacity:.45;cursor:not-allowed}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:var(--card);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:32px;width:100%;max-width:440px}
.modal-title{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:.04em;margin-bottom:12px}
.modal-sub{color:var(--muted);font-size:.9rem;line-height:1.6;margin-bottom:4px}
.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:22px}
@media(max-width:640px){.wrap{padding:24px 16px 60px}}
`;