import { useEffect, useRef, useMemo } from "react";

const STARS = Array.from({ length: 180 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: Math.random() * 1.4 + 0.3,
  opacity: Math.random() * 0.7 + 0.15,
  delay: Math.random() * 8,
  duration: Math.random() * 6 + 5,
}));

const DUST = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.8,
  opacity: Math.random() * 0.25 + 0.05,
  delay: Math.random() * 20,
  duration: Math.random() * 30 + 25,
  dx: (Math.random() - 0.5) * 6,
  dy: (Math.random() - 0.5) * 6,
}));

export default function NotFoundPage({ onNavigate }: { onNavigate?: () => void }) {
  const ringRef = useRef<SVGEllipseElement>(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#020817",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      <style>{`
        @keyframes star-twinkle {
          0%, 100% { opacity: var(--op); }
          50% { opacity: calc(var(--op) * 0.2); }
        }
        @keyframes dust-drift {
          0% { transform: translate(0, 0); opacity: var(--op); }
          50% { opacity: calc(var(--op) * 0.4); }
          100% { transform: translate(var(--dx), var(--dy)); opacity: var(--op); }
        }
        @keyframes planet-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes planet-drift {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-10px) translateX(4px); }
          66% { transform: translateY(6px) translateX(-6px); }
        }
        @keyframes ring-drift {
          0%, 100% { transform: rotateX(75deg) rotateZ(0deg); }
          50% { transform: rotateX(75deg) rotateZ(1.5deg); }
        }
        @keyframes glow-breathe {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.7; }
        }
        @keyframes limb-breathe {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.8; }
        }
        @keyframes text-reveal {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes line-expand {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes orbit-dot {
          from { transform: rotateX(75deg) rotateZ(0deg) translateX(180px) rotateX(-75deg) rotateZ(0deg); }
          to { transform: rotateX(75deg) rotateZ(360deg) translateX(180px) rotateX(-75deg) rotateZ(-360deg); }
        }
        @keyframes btn-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(56,189,248,0); }
          50% { box-shadow: 0 0 22px 4px rgba(56,189,248,0.18); }
        }
      `}</style>

      {/* ── Star field ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {STARS.map((s) => (
          <div
            key={s.id}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.r * 2,
              height: s.r * 2,
              borderRadius: "50%",
              background: "#c7deff",
              // @ts-ignore
              "--op": s.opacity,
              animation: `star-twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      {/* ── Cosmic dust ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {DUST.map((d) => (
          <div
            key={d.id}
            style={{
              position: "absolute",
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.size,
              height: d.size,
              borderRadius: "50%",
              background: "#93c5fd",
              // @ts-ignore
              "--op": d.opacity,
              "--dx": `${d.dx}vw`,
              "--dy": `${d.dy}vh`,
              animation: `dust-drift ${d.duration}s ${d.delay}s ease-in-out infinite alternate`,
              opacity: d.opacity,
              filter: "blur(0.6px)",
            }}
          />
        ))}
      </div>

      {/* ── Background nebula gradients ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse 70% 50% at 68% 45%, rgba(14,30,80,0.95) 0%, transparent 70%),
            radial-gradient(ellipse 45% 55% at 62% 48%, rgba(7,23,60,0.6) 0%, transparent 60%),
            radial-gradient(ellipse 80% 40% at 50% 100%, rgba(2,8,23,1) 0%, transparent 60%),
            radial-gradient(ellipse 60% 30% at 10% 50%, rgba(15,42,80,0.3) 0%, transparent 70%)
          `,
        }}
      />

      {/* ── Volumetric rim light from planet ── */}
      <div
        style={{
          position: "absolute",
          right: "5%",
          top: "50%",
          transform: "translateY(-50%)",
          width: "55vw",
          height: "55vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56,189,248,0.06) 0%, rgba(30,64,175,0.04) 35%, transparent 70%)",
          pointerEvents: "none",
          animation: "glow-breathe 7s ease-in-out infinite",
        }}
      />

      {/* ════════════ LEFT — TEXT COLUMN ════════════ */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 6vw 0 8vw",
          gap: 0,
        }}
      >
        {/* Error code */}
        <div
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: "0.72rem",
            letterSpacing: "0.22em",
            color: "#38bdf8",
            opacity: 0,
            animation: "text-reveal 0.9s 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
            marginBottom: "2.2rem",
          }}
        >
          ERROR · 404
        </div>

        {/* Horizontal rule */}
        <div
          style={{
            height: 1,
            background: "linear-gradient(90deg, #38bdf8 0%, transparent 100%)",
            width: "60px",
            marginBottom: "1.8rem",
            transformOrigin: "left",
            transform: "scaleX(0)",
            animation: "line-expand 0.8s 0.55s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        />

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "clamp(3.2rem, 6vw, 5.5rem)",
            fontWeight: 700,
            lineHeight: 1.02,
            color: "#f0f6ff",
            letterSpacing: "-0.01em",
            margin: 0,
            marginBottom: "1.6rem",
            opacity: 0,
            animation: "text-reveal 1s 0.65s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          Lost<br />in Space.
        </h1>

        {/* Body */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.9rem, 1.2vw, 1.05rem)",
            fontWeight: 300,
            lineHeight: 1.75,
            color: "#7da4c0",
            margin: 0,
            marginBottom: "3rem",
            maxWidth: "340px",
            opacity: 0,
            animation: "text-reveal 1s 0.85s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          The page you're looking for has drifted out of orbit. It may have been moved, deleted, or never existed.
        </p>

        {/* CTA */}
        <div
          style={{
            opacity: 0,
            animation: "text-reveal 1s 1.1s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          <CTAButton onClick={onNavigate} accent="#38bdf8" label="Return to Dashboard" />
        </div>

        {/* Coordinates label */}
        <div
          style={{
            marginTop: "4rem",
            fontFamily: "'Geist Mono', monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            color: "#1e4060",
            opacity: 0,
            animation: "text-reveal 1s 1.4s ease forwards",
          }}
        >
          COORD · 0x404 · SECTOR NULL
        </div>
      </div>

      {/* ════════════ RIGHT — PLANET SCENE ════════════ */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PlanetScene />
      </div>
    </div>
  );
}

function PlanetScene() {
  const SIZE = 420; // SVG viewport

  return (
    <div
      style={{
        position: "relative",
        width: "min(42vw, 520px)",
        aspectRatio: "1",
        animation: "planet-drift 28s ease-in-out infinite",
      }}
    >
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ width: "100%", height: "100%", overflow: "visible" }}
      >
        <defs>
          {/* Planet body gradient */}
          <radialGradient id="planet-grad" cx="38%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#1e4080" />
            <stop offset="30%" stopColor="#0f2454" />
            <stop offset="65%" stopColor="#071630" />
            <stop offset="100%" stopColor="#020817" />
          </radialGradient>

          {/* Atmospheric limb glow */}
          <radialGradient id="limb-grad" cx="50%" cy="50%" r="50%">
            <stop offset="78%" stopColor="transparent" />
            <stop offset="88%" stopColor="rgba(56,189,248,0.18)" />
            <stop offset="95%" stopColor="rgba(56,189,248,0.35)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.05)" />
          </radialGradient>

          {/* Outer volumetric haze */}
          <radialGradient id="haze-grad" cx="50%" cy="50%" r="50%">
            <stop offset="82%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(30,64,175,0.12)" />
          </radialGradient>

          {/* Highlight */}
          <radialGradient id="highlight-grad" cx="32%" cy="30%" r="28%">
            <stop offset="0%" stopColor="rgba(148,210,255,0.22)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Surface texture streaks */}
          <linearGradient id="streak-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor="rgba(100,160,240,0.06)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Ring gradient */}
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(56,189,248,0.0)" />
            <stop offset="15%" stopColor="rgba(56,189,248,0.25)" />
            <stop offset="50%" stopColor="rgba(148,210,255,0.4)" />
            <stop offset="85%" stopColor="rgba(56,189,248,0.22)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.0)" />
          </linearGradient>

          <linearGradient id="ring-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(30,64,175,0.0)" />
            <stop offset="20%" stopColor="rgba(30,64,175,0.15)" />
            <stop offset="50%" stopColor="rgba(56,189,248,0.22)" />
            <stop offset="80%" stopColor="rgba(30,64,175,0.12)" />
            <stop offset="100%" stopColor="rgba(30,64,175,0.0)" />
          </linearGradient>

          {/* Clip to hide back half of ring */}
          <clipPath id="front-ring">
            <rect x="0" y={SIZE / 2} width={SIZE} height={SIZE / 2} />
          </clipPath>
          <clipPath id="back-ring">
            <rect x="0" y="0" width={SIZE} height={SIZE / 2} />
          </clipPath>
        </defs>

        {/* Outer haze */}
        <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE * 0.44} fill="url(#haze-grad)" />

        {/* ── Back ring (behind planet) ── */}
        <g clipPath="url(#back-ring)" opacity={0.7}>
          <ellipse
            cx={SIZE / 2}
            cy={SIZE / 2}
            rx={SIZE * 0.43}
            ry={SIZE * 0.08}
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth="14"
            style={{ animation: "glow-breathe 9s ease-in-out infinite" }}
          />
          <ellipse
            cx={SIZE / 2}
            cy={SIZE / 2}
            rx={SIZE * 0.49}
            ry={SIZE * 0.09}
            fill="none"
            stroke="url(#ring-grad-2)"
            strokeWidth="8"
          />
        </g>

        {/* ── Planet body ── */}
        <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE * 0.34} fill="url(#planet-grad)" />

        {/* Surface bands — subtle horizontal streaks */}
        {[0.35, 0.45, 0.52, 0.6, 0.68].map((t, i) => (
          <ellipse
            key={i}
            cx={SIZE / 2}
            cy={SIZE / 2 + (t - 0.5) * SIZE * 0.34 * 2}
            rx={SIZE * 0.34 * Math.sqrt(1 - Math.pow((t - 0.5) * 2, 2)) * 0.98}
            ry={SIZE * 0.012}
            fill="url(#streak-1)"
            opacity={0.4 + i * 0.06}
          />
        ))}

        {/* Highlight specular */}
        <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE * 0.34} fill="url(#highlight-grad)" />

        {/* Atmospheric limb */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={SIZE * 0.34}
          fill="url(#limb-grad)"
          style={{ animation: "limb-breathe 6s ease-in-out infinite" }}
        />

        {/* ── Front ring (in front of planet) ── */}
        <g clipPath="url(#front-ring)" opacity={0.85}>
          <ellipse
            cx={SIZE / 2}
            cy={SIZE / 2}
            rx={SIZE * 0.43}
            ry={SIZE * 0.08}
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth="14"
          />
          <ellipse
            cx={SIZE / 2}
            cy={SIZE / 2}
            rx={SIZE * 0.49}
            ry={SIZE * 0.09}
            fill="none"
            stroke="url(#ring-grad-2)"
            strokeWidth="8"
          />
        </g>

        {/* Faint outer ring */}
        <ellipse
          cx={SIZE / 2}
          cy={SIZE / 2}
          rx={SIZE * 0.455}
          ry={SIZE * 0.074}
          fill="none"
          stroke="rgba(56,189,248,0.07)"
          strokeWidth="22"
        />
      </svg>
    </div>
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
        animation: "btn-glow 5s ease-in-out infinite",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.background = `${accent}12`;
        el.style.borderColor = `${accent}80`;
        el.style.boxShadow = `0 0 28px 4px ${accent}22, inset 0 0 20px ${accent}08`;
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
      <span style={{ letterSpacing: "0.1em" }}>{label}</span>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7h10M8 3l4 4-4 4" stroke={accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
