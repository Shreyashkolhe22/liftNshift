import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { logout } from "../store/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, role } = useSelector(s => s.auth);

  // role comes from Redux — "ADMIN" or "USER"
  const isAdmin = role === "ADMIN";

  let initials = "U";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    initials = (payload.sub || "U")[0].toUpperCase();
  } catch (_) {}

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      <style>{CSS}</style>
      <nav className="nav">
        <div className="nav-inner">

          <Link
            to={isAdmin ? "/admin/dashboard" : "/dashboard"}
            className="nav-logo"
          >
            Lift<span>N</span>Shift
            {isAdmin && <span className="nav-admin-badge">ADMIN</span>}
          </Link>

          <div className="nav-links">
            {/* ── ADMIN sees these links ── */}
            {isAdmin && (
              <>
                <Link to="/admin/dashboard" className={`nav-link ${isActive("/admin/dashboard") ? "active" : ""}`}>Dashboard</Link>
                <Link to="/admin/users"     className={`nav-link ${isActive("/admin/users")     ? "active" : ""}`}>Users</Link>
                <Link to="/admin/bookings"  className={`nav-link ${isActive("/admin/bookings")  ? "active" : ""}`}>Bookings</Link>
                <Link to="/admin/trucks"    className={`nav-link ${isActive("/admin/trucks")    ? "active" : ""}`}>Trucks</Link>
                <Link to="/admin/drivers"   className={`nav-link ${isActive("/admin/drivers")   ? "active" : ""}`}>Drivers</Link>
                <Link to="/admin/items"     className={`nav-link ${isActive("/admin/items")     ? "active" : ""}`}>Items</Link>
              </>
            )}

            {/* ── REGULAR USER sees these links ── */}
            {!isAdmin && (
              <>
                <Link to="/dashboard"
                  className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}>
                  Home
                </Link>
                <Link to="/my-bookings"
                  className={`nav-link ${isActive("/my-bookings") ? "active" : ""}`}>
                  My Bookings
                </Link>
              </>
            )}
          </div>

          <div className="nav-right">
            <Link to="/profile" className="nav-avatar-wrap" title="Profile">
              <div className="nav-avatar">{initials}</div>
            </Link>
            <button
              className="nav-logout"
              onClick={() => { dispatch(logout()); navigate("/login"); }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor"
                strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>

        </div>
      </nav>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
.nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(13,13,13,0.95);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.nav-inner {
  max-width: 1280px; margin: 0 auto; padding: 0 32px;
  height: 64px; display: flex; align-items: center;
  justify-content: space-between; gap: 24px;
}
.nav-logo {
  font-family: 'Bebas Neue', sans-serif; font-size: 1.75rem;
  letter-spacing: .06em; color: #fff; text-decoration: none;
  display: flex; align-items: center; gap: 10px; flex-shrink: 0;
}
.nav-logo span:first-of-type { color: #F47B20; }
.nav-admin-badge {
  font-size: .52rem; background: rgba(244,123,32,.15);
  border: 1px solid rgba(244,123,32,.3); color: #F47B20;
  padding: 2px 8px; border-radius: 4px; letter-spacing: .12em;
  font-family: 'DM Sans', sans-serif; font-weight: 600; line-height: 1.6;
}
.nav-links { display: flex; align-items: center; gap: 2px; }
.nav-link {
  font-family: 'DM Sans', sans-serif; font-size: .875rem; color: #666;
  text-decoration: none; padding: 6px 14px; border-radius: 8px;
  transition: color .2s, background .2s;
}
.nav-link:hover { color: #f0ede8; background: rgba(255,255,255,.06); }
.nav-link.active { color: #F47B20; background: rgba(244,123,32,.1); }
.nav-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.nav-avatar-wrap { text-decoration: none; border-radius: 50%; display: flex; }
.nav-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg,#F47B20,#D4601A);
  color: #fff; font-family: 'DM Sans', sans-serif;
  font-size: .85rem; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.nav-logout {
  display: flex; align-items: center; gap: 6px;
  font-family: 'DM Sans', sans-serif; font-size: .82rem; color: #666;
  background: none; border: 1px solid rgba(255,255,255,.08);
  padding: 7px 14px; border-radius: 8px; cursor: pointer; transition: all .2s;
}
.nav-logout:hover {
  color: #F87171; border-color: rgba(248,113,113,.25);
  background: rgba(248,113,113,.06);
}
@media(max-width:640px) {
  .nav-inner { padding: 0 16px; }
  .nav-links { display: none; }
}
`;