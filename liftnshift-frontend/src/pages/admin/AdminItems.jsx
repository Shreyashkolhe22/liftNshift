import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllItems, addItem, updateItem, deleteItem
} from "../../store/adminSlice";
import Navbar from "../../components/Navbar";

function fmt(p) {
  return "₹" + Number(p||0).toLocaleString("en-IN",{minimumFractionDigits:2});
}

const EMPTY = { name:"", price:"" };

export default function AdminItems() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s => s.admin);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [error,   setError]   = useState("");
  const [busy,    setBusy]    = useState(false);

  useEffect(() => { dispatch(fetchAllItems()); }, [dispatch]);

  const filtered = items.filter(i =>
    i.name?.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd()       { setForm(EMPTY); setError(""); setModal({type:"add"}); }
  function openEdit(item)  { setForm({name:item.name, price:String(item.price)}); setError(""); setModal({type:"edit",item}); }
  function openDel(item)   { setModal({type:"delete",item}); }

  async function handleSave() {
    setError("");
    if (!form.name.trim())             { setError("Item name is required."); return; }
    if (!form.price || Number(form.price)<=0) { setError("Enter a valid price."); return; }

    setBusy(true);
    try {
      if (modal.type==="add") {
        await dispatch(addItem({ name:form.name.trim(), price:Number(form.price) })).unwrap();
      } else {
        await dispatch(updateItem({ id:modal.item.id, data:{ name:form.name.trim(), price:Number(form.price) } })).unwrap();
      }
      setModal(null);
    } catch(e) { setError(e || "Failed. Try again."); }
    setBusy(false);
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await dispatch(deleteItem(modal.item.id)).unwrap();
      setModal(null);
    } catch(_) {}
    setBusy(false);
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
            <h1 className="title">Item Catalog</h1>
            <p className="subtitle">Add, edit or remove predefined items</p>
          </div>

          {/* Stats */}
          <div className="stat-row">
            {[
              {label:"Total Items", value:items.length, color:"#F47B20"},
              {label:"Highest",     value: items.length ? fmt(Math.max(...items.map(i=>Number(i.price)))) : "—", color:"#34D399"},
              {label:"Lowest",      value: items.length ? fmt(Math.min(...items.map(i=>Number(i.price)))) : "—", color:"#60A5FA"},
            ].map(s=>(
              <div className="chip" key={s.label}>
                <span className="chip-val" style={{color:s.color}}>{s.value}</span>
                <span className="chip-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="toolbar">
              <input className="search" placeholder="Search items…"
                value={search} onChange={e=>setSearch(e.target.value)} />
              <button className="btn btn-primary" onClick={openAdd}>+ Add Item</button>
            </div>

            {loading ? <p className="empty">Loading…</p>
            : filtered.length===0 ? <p className="empty">No items found.</p>
            : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>ID</th><th>Item Name</th><th>Price</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(item=>(
                      <tr key={item.id}>
                        <td className="muted">#{item.id}</td>
                        <td className="bold">{item.name}</td>
                        <td className="orange">{fmt(item.price)}</td>
                        <td>
                          <div className="actions">
                            <button className="btn btn-ghost" onClick={()=>openEdit(item)}>Edit</button>
                            <button className="btn btn-danger" onClick={()=>openDel(item)}>Delete</button>
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
      {(modal?.type==="add" || modal?.type==="edit") && (
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <p className="modal-title">
              {modal.type==="add" ? "Add New Item" : "Edit Item"}
            </p>

            {error && <div className="err">{error}</div>}

            <div className="field">
              <label className="label">Item Name</label>
              <input className="input" placeholder="e.g. Double Bed, Refrigerator"
                value={form.name}
                onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
            </div>
            <div className="field">
              <label className="label">Price (₹)</label>
              <input className="input" type="number" placeholder="e.g. 3500"
                value={form.price}
                onChange={e=>setForm(f=>({...f,price:e.target.value}))} />
            </div>

            {form.name && form.price && (
              <div className="preview">
                <span>{form.name}</span>
                <span className="orange">{fmt(form.price)}</span>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={()=>setModal(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={busy} onClick={handleSave}>
                {busy ? "Saving…" : modal.type==="add" ? "Add Item" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal?.type==="delete" && (
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <p className="modal-title">Delete Item?</p>
            <p className="modal-sub">
              Permanently delete <strong style={{color:"#f0ede8"}}>
              "{modal.item.name}"</strong> from the catalog?
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={()=>setModal(null)}>Cancel</button>
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
:root{--dark:#0d0d0d;--card:#191919;--card2:#202020;--b:rgba(255,255,255,0.07);--light:#f0ede8;--muted:#606060;--o:#F47B20}
body{background:var(--dark);font-family:'DM Sans',sans-serif;color:var(--light)}
.page{min-height:100vh;background:var(--dark)}
.wrap{max-width:1000px;margin:0 auto;padding:44px 32px 80px}
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
.toolbar{display:flex;gap:12px;margin-bottom:20px;align-items:center}
.search{flex:1;padding:10px 14px;background:var(--card2);border:1.5px solid var(--b);border-radius:9px;color:var(--light);font-family:'DM Sans',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s}
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
.orange{color:var(--o);font-family:'Bebas Neue',sans-serif;font-size:1rem;letter-spacing:.04em}
.actions{display:flex;gap:8px}
.btn{display:inline-flex;align-items:center;padding:6px 14px;border-radius:7px;font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:500;cursor:pointer;border:none;transition:all .18s}
.btn-primary{background:var(--o);color:#fff;box-shadow:0 4px 14px rgba(244,123,32,.3)}
.btn-primary:hover{background:#D4601A}
.btn-ghost{background:var(--card2);color:var(--muted);border:1px solid var(--b)}
.btn-ghost:hover{color:var(--light)}
.btn-danger{background:rgba(248,113,113,.1);color:#F87171;border:1px solid rgba(248,113,113,.2)}
.btn-danger:hover{background:rgba(248,113,113,.2)}
.btn:disabled{opacity:.45;cursor:not-allowed}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:var(--card);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:32px;width:100%;max-width:420px}
.modal-title{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:.04em;margin-bottom:16px}
.modal-sub{color:var(--muted);font-size:.9rem;line-height:1.6}
.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:22px}
.err{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);color:#F87171;padding:9px 13px;border-radius:8px;font-size:.84rem;margin-bottom:16px}
.field{margin-bottom:16px}
.label{font-size:.68rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);display:block;margin-bottom:6px}
.input{width:100%;padding:11px 14px;background:var(--card2);border:1.5px solid var(--b);border-radius:9px;color:var(--light);font-family:'DM Sans',sans-serif;font-size:.92rem;outline:none;transition:border-color .2s}
.input::placeholder{color:var(--muted)}
.input:focus{border-color:var(--o);box-shadow:0 0 0 3px rgba(244,123,32,.1)}
.preview{display:flex;justify-content:space-between;align-items:center;background:rgba(244,123,32,.05);border:1px solid rgba(244,123,32,.15);border-radius:9px;padding:11px 14px;margin-bottom:4px;font-size:.9rem}
@media(max-width:640px){.wrap{padding:24px 16px 60px}}
`;