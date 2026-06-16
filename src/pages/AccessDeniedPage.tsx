import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const FRAGMENTS = Array.from({ length: 38 }, (_, i) => ({
  id: i,
  x: 30 + Math.random() * 40,
  y: 20 + Math.random() * 60,
  size: Math.random() * 3.5 + 0.8,
  opacity: Math.random() * 0.35 + 0.05,
  delay: Math.random() * 18,
  duration: Math.random() * 22 + 16,
  dx: (Math.random() - 0.5) * 8,
  dy: -(Math.random() * 10 + 4),
  rot: Math.random() * 360,
  shape: Math.random() > 0.6 ? "square" : "dot",
}));

const SPARKS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  angle: (i / 20) * 360,
  r: 160 + Math.random() * 60,
  delay: Math.random() * 5,
  duration: Math.random() * 4 + 3,
  size: Math.random() * 1.5 + 0.5,
}));

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#060008",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      <style>{`
        @keyframes ad-fragment {
          0% { transform: translate(0,0) rotate(var(--rot)); opacity: var(--op); }
          60% { opacity: calc(var(--op) * 0.5); }
          100% { transform: translate(var(--dx), var(--dy)) rotate(calc(var(--rot) + 120deg)); opacity: 0; }
        }
        @keyframes ad-text-reveal {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ad-line-expand {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes shield-pulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          30% { opacity: 0.7; }
          100% { opacity: 0; transform: scale(1.7); }
        }
        @keyframes shield-inner-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes core-breathe {
          0%, 100% { opacity: 0.75; filter: drop-shadow(0 0 12px rgba(220,38,38,0.5)); }
          50% { opacity: 1; filter: drop-shadow(0 0 28px rgba(220,38,38,0.85)); }
        }
        @keyframes scan-line {
          0% { transform: translateY(-100%) scaleX(1); opacity: 0; }
          5% { opacity: 0.6; }
          90% { opacity: 0.15; }
          100% { transform: translateY(240px) scaleX(1); opacity: 0; }
        }
        @keyframes hex-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes hex-counter {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes ad-btn-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
          50% { box-shadow: 0 0 20px 3px rgba(220,38,38,0.18); }
        }
        @keyframes ripple-out {
          0% { transform: scale(0.6); opacity: 0.7; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes energy-wave {
          0% { stroke-dashoffset: 0; opacity: 0.7; }
          100% { stroke-dashoffset: -300; opacity: 0; }
        }
      `}</style>

      {/* ── Background nebula — deep crimson voids ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse 55% 60% at 62% 48%, rgba(60,5,10,0.98) 0%, transparent 65%),
            radial-gradient(ellipse 35% 50% at 58% 52%, rgba(100,8,18,0.4) 0%, transparent 60%),
            radial-gradient(ellipse 80% 35% at 50% 100%, rgba(6,0,8,1) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 5% 50%, rgba(25,5,10,0.35) 0%, transparent 70%)
          `,
        }}
      />

      {/* Volumetric crimson halo from shield */}
      <div
        style={{
          position: "absolute",
          right: "8%",
          top: "50%",
          transform: "translateY(-50%)",
          width: "52vw",
          height: "52vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(220,38,38,0.07) 0%, rgba(120,10,20,0.04) 35%, transparent 68%)",
          pointerEvents: "none",
          animation: "shield-inner-pulse 5s ease-in-out infinite",
        }}
      />

      {/* ── Floating debris fragments ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {FRAGMENTS.map((f) => (
          <div
            key={f.id}
            style={{
              position: "absolute",
              left: `${f.x}%`,
              top: `${f.y}%`,
              width: f.size,
              height: f.shape === "square" ? f.size : f.size,
              borderRadius: f.shape === "dot" ? "50%" : "1px",
              background: f.shape === "dot" ? "#ef4444" : "transparent",
              border: f.shape === "square" ? "1px solid rgba(220,38,38,0.4)" : "none",
              // @ts-ignore
              "--op": f.opacity,
              "--dx": `${f.dx}vw`,
              "--dy": `${f.dy}vh`,
              "--rot": `${f.rot}deg`,
              animation: `ad-fragment ${f.duration}s ${f.delay}s ease-in-out infinite`,
              opacity: f.opacity,
            }}
          />
        ))}
      </div>

      {/* ════════════ LEFT — TEXT COLUMN ════════════ */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 6vw 0 8vw",
        }}
      >
        {/* Error code */}
        <div
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: "0.72rem",
            letterSpacing: "0.22em",
            color: "#dc2626",
            opacity: 0,
            animation: "ad-text-reveal 0.9s 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
            marginBottom: "2.2rem",
          }}
        >
          SECURITY · 403
        </div>

        {/* Horizontal rule — crimson */}
        <div
          style={{
            height: 1,
            background: "linear-gradient(90deg, #dc2626 0%, transparent 100%)",
            width: "60px",
            marginBottom: "1.8rem",
            transformOrigin: "left",
            transform: "scaleX(0)",
            animation: "ad-line-expand 0.8s 0.55s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        />

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "clamp(3.2rem, 6vw, 5.5rem)",
            fontWeight: 700,
            lineHeight: 1.02,
            color: "#fff0f0",
            letterSpacing: "-0.01em",
            margin: 0,
            marginBottom: "1.6rem",
            opacity: 0,
            animation: "ad-text-reveal 1s 0.65s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          Access<br />Denied.
        </h1>

        {/* Body */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.9rem, 1.2vw, 1.05rem)",
            fontWeight: 300,
            lineHeight: 1.75,
            color: "#a06060",
            margin: 0,
            marginBottom: "3rem",
            maxWidth: "340px",
            opacity: 0,
            animation: "ad-text-reveal 1s 0.85s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          This invitation is invalid, expired, or no longer available. Access to this resource is restricted.
        </p>

        {/* CTA */}
        <div
          style={{
            opacity: 0,
            animation: "ad-text-reveal 1s 1.1s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          <AccessCTAButton onClick={() => navigate("/")} label="Return to Dashboard" />
        </div>

        {/* Status label */}
        <div
          style={{
            marginTop: "4rem",
            fontFamily: "'Geist Mono', monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            color: "#3a1010",
            opacity: 0,
            animation: "ad-text-reveal 1s 1.4s ease forwards",
          }}
        >
          AUTH_FAILED · INV_TOKEN · ACCESS_REVOKED
        </div>
      </div>

      {/* ════════════ RIGHT — SHIELD SCENE ════════════ */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ShieldScene />
      </div>
    </div>
  );
}

function ShieldScene() {
  const SIZE = 420;
  const CX = SIZE / 2;
  const CY = SIZE / 2;

  return (
    <div
      style={{
        position: "relative",
        width: "min(42vw, 500px)",
        aspectRatio: "1",
      }}
    >
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ width: "100%", height: "100%", overflow: "visible" }}
      >
        <defs>
          {/* Shield core gradient */}
          <radialGradient id="shield-core" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#4a0010" />
            <stop offset="40%" stopColor="#2a000a" />
            <stop offset="100%" stopColor="#100004" />
          </radialGradient>

          {/* Outer pulse ring gradient */}
          <radialGradient id="pulse-ring" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="85%" stopColor="rgba(220,38,38,0.15)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Inner glow */}
          <radialGradient id="inner-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(220,38,38,0.25)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Lock icon gradient */}
          <linearGradient id="lock-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          {/* Hex ring gradient */}
          <linearGradient id="hex-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(220,38,38,0.6)" />
            <stop offset="50%" stopColor="rgba(220,38,38,0.15)" />
            <stop offset="100%" stopColor="rgba(220,38,38,0.6)" />
          </linearGradient>

          {/* Scan line */}
          <linearGradient id="scan-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(220,38,38,0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* ── Expanding ripple rings ── */}
        {[0, 1.4, 2.8].map((delay, i) => (
          <circle
            key={i}
            cx={CX}
            cy={CY}
            r={SIZE * 0.28}
            fill="none"
            stroke="rgba(220,38,38,0.35)"
            strokeWidth="1.2"
            style={{
              animation: `ripple-out 3.5s ${delay}s cubic-bezier(0.2,0,0.8,1) infinite`,
              transformOrigin: `${CX}px ${CY}px`,
            }}
          />
        ))}

        {/* Outer energy haze */}
        <circle cx={CX} cy={CY} r={SIZE * 0.4} fill="url(#pulse-ring)" />

        {/* ── Rotating outer hex ring ── */}
        <g
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            animation: "hex-rotate 40s linear infinite",
          }}
        >
          <polygon
            points={hexPoints(CX, CY, SIZE * 0.34)}
            fill="none"
            stroke="url(#hex-stroke)"
            strokeWidth="1"
            opacity={0.5}
          />
          {/* Hex corner dots */}
          {hexVertices(CX, CY, SIZE * 0.34).map((v, i) => (
            <circle key={i} cx={v.x} cy={v.y} r={2.5} fill="#dc2626" opacity={0.6} />
          ))}
        </g>

        {/* ── Counter-rotating inner hex ── */}
        <g
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            animation: "hex-counter 28s linear infinite",
          }}
        >
          <polygon
            points={hexPoints(CX, CY, SIZE * 0.26)}
            fill="none"
            stroke="rgba(220,38,38,0.25)"
            strokeWidth="1"
          />
        </g>

        {/* Shield core body */}
        <ShieldPath cx={CX} cy={CY} size={SIZE * 0.42} />

        {/* Inner glow overlay */}
        <circle cx={CX} cy={CY} r={SIZE * 0.2} fill="url(#inner-glow)" opacity={0.8} />

        {/* ── Scan line moving through shield ── */}
        <clipPath id="shield-clip">
          <ShieldPathClip cx={CX} cy={CY} size={SIZE * 0.42} />
        </clipPath>
        <rect
          x={CX - SIZE * 0.21}
          y={CY - SIZE * 0.22}
          width={SIZE * 0.42}
          height="8"
          fill="url(#scan-grad)"
          clipPath="url(#shield-clip)"
          style={{ animation: "scan-line 4s 1s ease-in-out infinite" }}
        />

        {/* ── Lock icon ── */}
        <LockIcon cx={CX} cy={CY} />
      </svg>
    </div>
  );
}

function hexPoints(cx: number, cy: number, r: number): string {
  return hexVertices(cx, cy, r).map((v) => `${v.x},${v.y}`).join(" ");
}

function hexVertices(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 30) * (Math.PI / 180);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
}

function ShieldPath({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const w = size * 0.5;
  const h = size * 0.58;
  const d = `M ${cx} ${cy - h / 2}
    C ${cx + w / 2} ${cy - h / 2}, ${cx + w / 2} ${cy - h * 0.1}, ${cx + w / 2} ${cy + h * 0.05}
    C ${cx + w / 2} ${cy + h * 0.32}, ${cx} ${cy + h / 2}, ${cx} ${cy + h / 2}
    C ${cx} ${cy + h / 2}, ${cx - w / 2} ${cy + h * 0.32}, ${cx - w / 2} ${cy + h * 0.05}
    C ${cx - w / 2} ${cy - h * 0.1}, ${cx - w / 2} ${cy - h / 2}, ${cx} ${cy - h / 2}
    Z`;
  return (
    <path
      d={d}
      fill="url(#shield-core)"
      stroke="rgba(220,38,38,0.5)"
      strokeWidth="1.2"
      style={{ animation: "core-breathe 4s ease-in-out infinite" }}
    />
  );
}

function ShieldPathClip({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const w = size * 0.5;
  const h = size * 0.58;
  const d = `M ${cx} ${cy - h / 2}
    C ${cx + w / 2} ${cy - h / 2}, ${cx + w / 2} ${cy - h * 0.1}, ${cx + w / 2} ${cy + h * 0.05}
    C ${cx + w / 2} ${cy + h * 0.32}, ${cx} ${cy + h / 2}, ${cx} ${cy + h / 2}
    C ${cx} ${cy + h / 2}, ${cx - w / 2} ${cy + h * 0.32}, ${cx - w / 2} ${cy + h * 0.05}
    C ${cx - w / 2} ${cy - h * 0.1}, ${cx - w / 2} ${cy - h / 2}, ${cx} ${cy - h / 2}
    Z`;
  return <path d={d} />;
}

function LockIcon({ cx, cy }: { cx: number; cy: number }) {
  const w = 32, h = 28, arc = 13;
  return (
    <g
      transform={`translate(${cx - w / 2}, ${cy - h / 2 - 8})`}
      style={{ animation: "core-breathe 4s ease-in-out infinite" }}
    >
      {/* Shackle */}
      <path
        d={`M ${w * 0.25} ${h * 0.42} L ${w * 0.25} ${h * 0.28} A ${arc} ${arc} 0 0 1 ${w * 0.75} ${h * 0.28} L ${w * 0.75} ${h * 0.42}`}
        fill="none"
        stroke="url(#lock-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Body */}
      <rect
        x={w * 0.08}
        y={h * 0.42}
        width={w * 0.84}
        height={h * 0.55}
        rx="4"
        fill="url(#lock-grad)"
        opacity={0.9}
      />
      {/* Keyhole */}
      <circle cx={w / 2} cy={h * 0.67} r={4} fill="#060008" />
      <rect x={w / 2 - 2} y={h * 0.67} width="4" height="7" rx="1" fill="#060008" />
    </g>
  );
}

function AccessCTAButton({ onClick, label }: { onClick?: () => void; label: string }) {
  const accent = "#dc2626";
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.85rem 1.8rem",
        background: "transparent",
        border: `1px solid ${accent}40`,
        borderRadius: "2px",
        color: accent,
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: "0.9rem",
        fontWeight: 600,
        letterSpacing: "0.12em",
        cursor: "pointer",
        transition: "all 300ms cubic-bezier(0.16,1,0.3,1)",
        animation: "ad-btn-glow 5s ease-in-out infinite",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.background = `${accent}12`;
        el.style.borderColor = `${accent}80`;
        el.style.boxShadow = `0 0 26px 4px ${accent}20, inset 0 0 20px ${accent}08`;
        el.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.background = "transparent";
        el.style.borderColor = `${accent}40`;
        el.style.boxShadow = "";
        el.style.transform = "translateY(0)";
      }}
    >
      <span>{label}</span>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7h10M8 3l4 4-4 4" stroke={accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
