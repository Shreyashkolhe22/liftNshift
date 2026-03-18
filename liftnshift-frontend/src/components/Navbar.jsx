import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { logout } from "../store/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useSelector((s) => s.auth);

  let userName = "U";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    userName = payload.sub || "U";
  } catch (_) { }

  const initials = userName[0]?.toUpperCase() || "U";

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{NAV_CSS}</style>
      <nav className="lns-navbar">
        <div className="lns-nav-inner">

          <Link to="/dashboard" className="lns-logo">
            Lift<span>N</span>Shift
          </Link>

          <div className="lns-nav-links">
            <Link to="/dashboard" className={`lns-navlink ${isActive("/dashboard") ? "active" : ""}`}>Home</Link>
            <Link to="/my-bookings" className={`lns-navlink ${isActive("/my-bookings") ? "active" : ""}`}>My Bookings</Link>
          </div>

          <div className="lns-nav-right">
            <div className="lns-avatar" title={userName}>{initials}</div>
            <button className="lns-logout-btn" onClick={handleLogout}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>

        </div>
      </nav>
    </>
  );
}

const NAV_CSS = `
  .lns-navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(13,13,13,0.88);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .lns-nav-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 40px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
  }

  .lns-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.8rem;
    letter-spacing: 0.06em;
    color: #fff;
    text-decoration: none;
    line-height: 1;
    flex-shrink: 0;
  }

  .lns-logo span { color: #F47B20; }

  .lns-nav-links {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .lns-navlink {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    color: #666;
    text-decoration: none;
    padding: 6px 16px;
    border-radius: 8px;
    transition: color 0.2s, background 0.2s;
    letter-spacing: 0.01em;
  }

  .lns-navlink:hover { color: #f0ede8; background: rgba(255,255,255,0.06); }
  .lns-navlink.active { color: #F47B20; background: rgba(244,123,32,0.1); }

  .lns-nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .lns-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #F47B20, #D4601A);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    flex-shrink: 0;
  }

  .lns-logout-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    color: #666;
    background: none;
    border: 1px solid rgba(255,255,255,0.08);
    padding: 7px 14px;
    border-radius: 8px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s;
  }

  .lns-logout-btn:hover {
    color: #F87171;
    border-color: rgba(248,113,113,0.25);
    background: rgba(248,113,113,0.06);
  }

  @media (max-width: 640px) {
    .lns-nav-inner { padding: 0 16px; }
    .lns-nav-links { display: none; }
  }
`;