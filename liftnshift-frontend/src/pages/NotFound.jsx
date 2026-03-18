import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        .nf-page {
          min-height: 100vh;
          background: #0d0d0d;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          padding: 40px;
          font-family: 'DM Sans', sans-serif;
        }
        .nf-code {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(6rem, 15vw, 10rem);
          letter-spacing: .06em;
          color: #1e1e1e;
          line-height: 1;
          margin-bottom: 0;
        }
        .nf-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          letter-spacing: .06em;
          color: #f0ede8;
          margin-bottom: 12px;
        }
        .nf-sub {
          font-size: .9rem;
          color: #555;
          max-width: 300px;
          line-height: 1.7;
          margin-bottom: 32px;
          font-weight: 300;
        }
        .nf-btn {
          background: #F47B20;
          color: #fff;
          border: none;
          padding: 13px 28px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: .9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background .2s, transform .15s;
          box-shadow: 0 6px 24px rgba(244,123,32,.3);
        }
        .nf-btn:hover {
          background: #D4601A;
          transform: translateY(-2px);
        }
      `}</style>
            <div className="nf-page">
                <div className="nf-code">404</div>
                <div className="nf-title">Page not found</div>
                <p className="nf-sub">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <button className="nf-btn" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>
            </div>
        </>
    );
}