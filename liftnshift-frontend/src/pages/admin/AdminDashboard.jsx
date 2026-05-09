import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../../store/adminSlice";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function AdminDashboard() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { dashboard, loading } = useSelector(s => s.admin);

  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);

  function fmt(n) {
    return "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  }

  const cards = dashboard ? [
    { label: "Total Users",     value: dashboard.totalUsers,        color: "#F47B20" },
    { label: "Total Bookings",  value: dashboard.totalBookings,     color: "#60A5FA" },
    { label: "Pending",         value: dashboard.pendingBookings,   color: "#FBBF24" },
    { label: "Confirmed",       value: dashboard.confirmedBookings, color: "#34D399" },
    { label: "In Progress",     value: dashboard.inProgressBookings,color: "#A78BFA" },
    { label: "Completed",       value: dashboard.completedBookings, color: "#6EE7B7" },
    { label: "Cancelled",       value: dashboard.cancelledBookings, color: "#F87171" },
    { label: "Total Payments",  value: dashboard.totalPayments,     color: "#FCD34D" },
    { label: "Catalog Items",   value: dashboard.totalPredefinedItems, color: "#93C5FD" },
  ] : [];

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <Navbar />
        <div className="wrap">

          <div className="page-header">
            <p className="eyebrow">Admin Panel</p>
            <h1 className="title">Dashboard</h1>
            <p className="subtitle">Full overview of LiftNShift platform</p>
          </div>

          {loading ? <p className="loading">Loading stats…</p> : (
            <>
              {/* Revenue Card */}
              <div className="revenue-card">
                <div>
                  <p className="rev-label">Total Revenue</p>
                  <p className="rev-label" style={{fontSize:".8rem",color:"#555",marginTop:2}}>
                    from completed bookings only
                  </p>
                  <p className="rev-value">{fmt(dashboard?.totalRevenue)}</p>
                </div>
                <div style={{textAlign:"right"}}>
                  <p className="rev-label">Platform Health</p>
                  <p style={{color:"#34D399",fontSize:"1rem",marginTop:6,fontWeight:600}}>
                    ● Active
                  </p>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="cards-grid">
                {cards.map(c => (
                  <div className="stat-card" key={c.label}
                    style={{borderLeft:`3px solid ${c.color}`}}>
                    <p className="stat-label">{c.label}</p>
                    <p className="stat-value" style={{color:c.color}}>{c.value ?? 0}</p>
                  </div>
                ))}
              </div>

              {/* Quick Navigation */}
              <p className="section-title">Quick Actions</p>
              <div className="quick-grid">
                {[
                  { label:"Manage Users",    sub:"View, promote or delete users",          path:"/admin/users",    color:"#F47B20" },
                  { label:"All Bookings",    sub:"Update status, view items, delete",       path:"/admin/bookings", color:"#60A5FA" },
                  { label:"Item Catalog",    sub:"Add, edit or remove predefined items",    path:"/admin/items",    color:"#34D399" },
                ].map(q => (
                  <div className="quick-card" key={q.label}
                    onClick={() => navigate(q.path)}
                    style={{"--qc":q.color}}>
                    <p className="quick-title" style={{color:q.color}}>{q.label} →</p>
                    <p className="quick-sub">{q.sub}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
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
.page-header{margin-bottom:32px}
.eyebrow{font-size:.68rem;text-transform:uppercase;letter-spacing:.22em;color:var(--o);margin-bottom:6px}
.title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.2rem,4vw,3rem);letter-spacing:.04em;color:var(--light);line-height:1}
.subtitle{font-size:.9rem;color:var(--muted);margin-top:6px}
.loading{color:var(--muted);padding:40px 0}
.revenue-card{background:var(--card);border:1px solid rgba(52,211,153,.2);border-radius:16px;
  padding:28px 32px;margin-bottom:24px;display:flex;justify-content:space-between;
  align-items:center;flex-wrap:wrap;gap:16px}
.rev-label{font-size:.72rem;text-transform:uppercase;letter-spacing:.14em;color:var(--muted)}
.rev-value{font-family:'Bebas Neue',sans-serif;font-size:2.8rem;letter-spacing:.04em;color:#34D399;line-height:1.1;margin-top:6px}
.cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px;margin-bottom:32px}
.stat-card{background:var(--card);border:1px solid var(--b);border-radius:12px;padding:20px 22px}
.stat-label{font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-bottom:10px}
.stat-value{font-family:'Bebas Neue',sans-serif;font-size:2.2rem;letter-spacing:.04em;line-height:1}
.section-title{font-size:.72rem;text-transform:uppercase;letter-spacing:.18em;color:var(--muted);margin-bottom:14px}
.quick-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
.quick-card{background:var(--card);border:1px solid var(--b);border-radius:14px;padding:22px 24px;
  cursor:pointer;transition:border-color .2s,transform .15s}
.quick-card:hover{border-color:var(--qc);transform:translateY(-2px)}
.quick-title{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:.04em;margin-bottom:6px}
.quick-sub{font-size:.84rem;color:var(--muted);line-height:1.5}
@media(max-width:640px){.wrap{padding:24px 16px 60px}}
`;