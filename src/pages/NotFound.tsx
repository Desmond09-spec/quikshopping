import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#020605",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── BACKGROUND FULL-BLEED BARCODE ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <BarcodeScene />
      </div>

      {/* ── TARGETING BRACKETS ── */}
      <div style={{ position: "absolute", inset: "28px", pointerEvents: "none", zIndex: 10 }}>
        {[
          { top: 0, left: 0, borderTop: "2px solid #10b981", borderLeft: "2px solid #10b981" },
          { top: 0, right: 0, borderTop: "2px solid #10b981", borderRight: "2px solid #10b981" },
          { bottom: 0, left: 0, borderBottom: "2px solid #10b981", borderLeft: "2px solid #10b981" },
          { bottom: 0, right: 0, borderBottom: "2px solid #10b981", borderRight: "2px solid #10b981" },
        ].map((style, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "36px",
              height: "36px",
              opacity: 0.8,
              ...style,
            }}
          />
        ))}
      </div>

      {/* ── PROTECTIVE SCRIM FOR TEXT ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "80vh",
          background: "radial-gradient(ellipse 110% 100% at 0% 100%, #020605 15%, rgba(2,6,5,0.7) 45%, transparent 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* ── TYPOGRAPHY BLOCK (BOTTOM LEFT) ── */}
      <div
        style={{
          position: "absolute",
          bottom: "clamp(3rem, 10vh, 8rem)",
          left: "clamp(2.5rem, 8vw, 6rem)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "460px",
        }}
      >
        <div
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: "0.75rem",
            letterSpacing: "0.22em",
            color: "#10b981",
            textTransform: "uppercase",
            opacity: 0,
            animation: "fade-in 0.8s 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          SKU NOT FOUND
        </div>

        <h1
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "clamp(3rem, 5vw, 4.5rem)",
            fontWeight: 700,
            lineHeight: 1.02,
            color: "#f8fafc",
            letterSpacing: "-0.01em",
            margin: 0,
            opacity: 0,
            animation: "fade-in 1s 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          This page<br />doesn&apos;t exist.
        </h1>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
            fontWeight: 300,
            lineHeight: 1.7,
            color: "#94a3b8",
            margin: 0,
            marginBottom: "0.5rem",
            opacity: 0,
            animation: "fade-in 1s 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          The URL might be broken, or the item was removed from inventory.
        </p>

        <div
          style={{
            opacity: 0,
            animation: "fade-in 1s 0.9s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          <CTAButton onClick={() => navigate("/")} accent="#10b981" label="Return to Dashboard" />
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes barcode-appear {
          from { opacity: 0; filter: blur(8px); transform: scale(1.02); }
          to { opacity: 1; filter: blur(0px); transform: scale(1); }
        }
        .nf-massive-text {
          font-size: 750px;
          letter-spacing: 24px;
          stroke-width: 32px;
        }
        @media (max-width: 768px) {
          .nf-massive-text {
            font-size: 280px;
            letter-spacing: 0px;
            stroke-width: 12px;
          }
        }
      `}</style>
    </div>
  );
}

function BarcodeScene() {
  // Use a highly dense pattern for the background
  const lines = useMemo(() => {
    let currentX = 0;
    const items = [];
    // Organic, varying widths
    const pattern = [3, 1, 2, 5, 1, 4, 2, 1, 3, 1, 2, 6, 1, 2, 3];
    let i = 0;
    // Max width 3000px to cover ultra-wide monitors when preserving slice
    while (currentX < 3000) {
      const width = pattern[i % pattern.length];
      items.push({ id: i, x: currentX, width: width * 3 });
      currentX += (width * 3) + 7; // Gap
      i++;
    }
    return items;
  }, []);

  return (
    <svg
      viewBox="0 0 3000 1200"
      preserveAspectRatio="xMidYMid slice"
      style={{
        width: "100%",
        height: "100%",
        opacity: 0,
        animation: "barcode-appear 1.8s cubic-bezier(0.16,1,0.3,1) forwards",
      }}
    >
      <defs>
        <linearGradient id="bar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="15%" stopColor="rgba(255,255,255,0.01)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.16)" />
          <stop offset="85%" stopColor="rgba(255,255,255,0.01)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>

        <mask id="massive-404-mask">
          {/* Black background hides the bars by default */}
          <rect x="0" y="0" width="3000" height="1200" fill="#000" />
          {/* Massive 404 text reveals the bars only within its shape */}
          <text
            x="1500"
            y="600"
            textAnchor="middle"
            dominantBaseline="central"
            className="nf-massive-text"
            fontWeight="900"
            fontFamily="'Arial Black', 'Impact', sans-serif"
            fill="#fff"
            stroke="#fff"
            paintOrder="stroke fill"
          >
            404
          </text>
        </mask>
      </defs>

      <g mask="url(#massive-404-mask)">
        {lines.map((l) => (
          <rect
            key={l.id}
            x={l.x}
            y="0"
            width={l.width}
            height="1200"
            fill="url(#bar-grad)"
          />
        ))}
      </g>
    </svg>
  );
}

function CTAButton({ onClick, accent, label }: { onClick?: () => void; accent: string; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.9rem 2rem",
        background: accent,
        border: "none",
        borderRadius: "4px",
        color: "#020605",
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: "1.05rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        cursor: "pointer",
        transition: "all 300ms cubic-bezier(0.16,1,0.3,1)",
        marginTop: "1.5rem",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.opacity = "0.9";
        el.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }}
    >
      <span>{label}</span>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7h10M8 3l4 4-4 4" stroke="#020605" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
