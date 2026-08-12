import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PillNav from "../components/PillNav";

// ─────────────────────────────────────────────────────────────────────────────
// Midnight Confidential Voting — Full-bleed video landing page
// Design: BubbledotICG retro dot-matrix headline, CloudFront video bg,
//         trust row, animated stats, nav pill — adapted for Midnight.
// ─────────────────────────────────────────────────────────────────────────────

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4";

// Stats data
const STATS = [
  { icon: "🛡", target: 20, suffix: "+", decimals: 0, label: "ZK Tests Passing" },
  { icon: "◈", target: 99.99, suffix: "%", decimals: 2, label: "Privacy Guarantee" },
  { icon: "⧫", target: 4, suffix: "", decimals: 0, label: "ZK Circuits" },
  { icon: "⬡", target: 1.03, suffix: "s", decimals: 2, label: "Proof Generation" },
];

// Ease out cubic
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Count-up hook
function useCountUp(target: number, decimals: number, duration: number, delay: number, trigger: boolean) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!trigger || started.current) return;
    started.current = true;
    const startTime = performance.now() + delay;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed < 0) {
        requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      setValue(Number((target * easeOutCubic(progress)).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [trigger, target, decimals, duration, delay]);

  return value;
}

// Stat item component
const StatItem: React.FC<{ stat: (typeof STATS)[number]; index: number; visible: boolean }> = ({
  stat,
  index,
  visible,
}) => {
  const value = useCountUp(stat.target, stat.decimals, 1500 + index * 80, 480 + index * 90, visible);
  const delay = `${0.5 + index * 0.08}s`;

  return (
    <div className={`stat anim${visible ? " in" : ""}`} style={{ "--d": delay } as React.CSSProperties}>
      <span className="stat-icon">{stat.icon}</span>
      <span className="stat-value">
        {stat.decimals > 0 ? value.toFixed(stat.decimals) : Math.round(value)}
        {stat.suffix}
      </span>
      <span className="stat-label">{stat.label}</span>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Inject fonts + styles */}
      <style>{landingStyles}</style>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://db.onlinewebfonts.com/c/8cb707a9b8a73f8a7403336b861c3074?family=BubbledotICG-FinePos"
      />

      <div className="landing-root" ref={pageRef}>
        {/* Video background */}
        <div className="bg">
          <video className="bg-video" autoPlay muted loop playsInline>
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
          <div className="bg-overlay" />
        </div>

        {/* Page content */}
        <div className="page">
          {/* Header — use shared PillNav */}
          <div style={{ height: 60, flexShrink: 0 }}>
            <PillNav />
          </div>

          {/* Hero */}
          <main className="hero">
            {/* Trust row */}
            <div className={`trust anim${visible ? " in" : ""}`} style={{ "--d": "0.05s" } as React.CSSProperties}>
              <div className="trust-avatars">
                <div className="avatar">
                  <span className="avatar-inner">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  </span>
                </div>
                <div className="avatar">
                  <span className="avatar-inner">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </span>
                </div>
                <div className="avatar">
                  <span className="avatar-inner">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  </span>
                </div>
              </div>
              <div className="trust-pill">
                <span>Powered by Zero-Knowledge Proofs</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="headline">
              <span className={`headline-line${visible ? " in" : ""}`} style={{ animationDelay: "0.12s" }}>
                Confidential
              </span>
              <span className={`headline-line${visible ? " in" : ""}`} style={{ animationDelay: "0.3s" }}>
                Voting
              </span>
            </h1>

            {/* Subhead */}
            <p className={`subhead anim${visible ? " in" : ""}`} style={{ "--d": "0.28s" } as React.CSSProperties}>
              Cast private ballots proven off-chain via ZK circuits. Tallies are
              publicly verifiable on-chain. No one sees your vote — everyone
              verifies the count.
            </p>

            {/* CTA */}
            <button
              className={`cta anim pulse${visible ? " in" : ""}`}
              style={{ "--d": "0.4s" } as React.CSSProperties}
              onClick={() => navigate("/app")}
            >
              Launch App
            </button>
          </main>

          {/* Stats footer */}
          <footer className="stats">
            {STATS.map((stat, i) => (
              <StatItem key={stat.label} stat={stat} index={i} visible={visible} />
            ))}
          </footer>
        </div>
      </div>
    </>
  );
};

export default LandingPage;

// ─────────────────────────────────────────────────────────────────────────────
// Styles (embedded — matches the CSS spec exactly)
// ─────────────────────────────────────────────────────────────────────────────

const landingStyles = `
.landing-root {
  --bg: #000000;
  --text: #ffffff;
  --muted: #8e8e8e;
  --nav-text: #2e2e2e;
  --pill-dark: #28282a;
  --sign-in-text: #c8c8c8;
  --nav-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
  --trust-bg: #28282a;
  --trust-border: rgba(255, 255, 255, 0.4);
  --trust-text: #c4c2c3;
  --font-sans: "Inter", "Segoe UI", system-ui, sans-serif;
  --font-display: "BubbledotICG-FinePos", monospace;

  position: fixed;
  inset: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}

/* Video background */
.bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #000;
}
.bg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  z-index: 0;
}
.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
}

/* Page layout */
.page {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  height: 100dvh;
  padding: clamp(16px, 2.4vh, 28px) clamp(14px, 3vw, 32px);
  overflow: hidden;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(18px, 2.8vw, 28px);
  max-width: 720px;
  width: 100%;
  flex-shrink: 0;
  opacity: 0;
  transform: translateY(-18px);
  transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.header.in {
  opacity: 1;
  transform: translateY(0);
}

.logo-btn {
  width: clamp(40px, 4.4vw, 46px);
  height: clamp(40px, 4.4vw, 46px);
  border-radius: 50%;
  background: #fff;
  box-shadow: var(--nav-shadow);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 0.2s;
  flex-shrink: 0;
}
.logo-btn:hover { transform: scale(1.04); }
.logo-icon { font-size: clamp(18px, 2vw, 22px); }

.nav-pill {
  background: #fff;
  height: clamp(44px, 5.2vw, 48px);
  max-width: 430px;
  flex: 1;
  padding: 4px 8px;
  border-radius: 999px;
  box-shadow: var(--nav-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(4px, 1vw, 12px);
}
.nav-link {
  font-size: clamp(13px, 1.4vw, 15px);
  font-weight: 500;
  color: var(--nav-text);
  letter-spacing: -0.01em;
  opacity: 0.5;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 999px;
  transition: opacity 0.2s;
  position: relative;
  text-decoration: none;
  white-space: nowrap;
}
.nav-link:hover { opacity: 0.75; }
.nav-link.active { opacity: 1; }
.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 3px;
  background: #111;
  border-radius: 50%;
  box-shadow: -5px 0 0 #111, 5px 0 0 #111;
}

.sign-in-btn {
  background: var(--pill-dark);
  color: var(--sign-in-text);
  height: clamp(44px, 5.2vw, 48px);
  padding: 0 clamp(16px, 2vw, 24px);
  border-radius: 999px;
  border: none;
  font-family: var(--font-sans);
  font-size: clamp(13px, 1.4vw, 15px);
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--nav-shadow);
  transition: background 0.2s, color 0.2s, transform 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
}
.sign-in-btn:hover {
  background: #323234;
  color: #fff;
  transform: translateY(-1px);
}

/* Hero */
.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 900px;
  gap: clamp(12px, 2vh, 20px);
}

/* Trust row */
.trust {
  display: inline-flex;
  align-items: center;
  margin-bottom: clamp(8px, 1.5vh, 16px);
}
.trust-avatars {
  display: flex;
  align-items: center;
}
.avatar {
  --trust-size: clamp(36px, 4.5vw, 42px);
  width: var(--trust-size);
  height: var(--trust-size);
  border-radius: 50%;
  background: var(--trust-bg);
  border: 1px solid var(--trust-border);
  padding: 5px;
  display: grid;
  place-items: center;
  position: relative;
  transition: transform 0.35s;
}
.avatar + .avatar {
  margin-left: -12px;
}
.avatar:nth-child(1) { z-index: 3; }
.avatar:nth-child(2) { z-index: 4; }
.avatar:nth-child(3) { z-index: 5; }
.avatar:hover { transform: translateY(-3px); }
.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #fff;
  display: grid;
  place-items: center;
  line-height: 0;
}
.trust-pill {
  --trust-size: clamp(36px, 4.5vw, 42px);
  height: var(--trust-size);
  background: var(--trust-bg);
  border: 1px solid var(--trust-border);
  border-radius: 999px;
  display: flex;
  align-items: center;
  padding: 0 18px 0 24px;
  margin-left: -12px;
  z-index: 6;
}
.trust-pill span {
  font-family: var(--font-sans);
  font-weight: 500;
  color: var(--trust-text);
  font-size: clamp(12px, 1.4vw, 13.5px);
  white-space: nowrap;
}

/* Headline */
.headline {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(28px, 6.2vw, 80px);
  font-weight: 400;
  letter-spacing: -0.04em;
  line-height: 1.12;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
}
.headline-line {
  display: block;
  opacity: 0;
  transform: translateY(14px);
  transition: none;
}
.headline-line.in {
  animation: headlineFade 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes headlineFade {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Subhead */
.subhead {
  max-width: min(500px, 92%);
  font-size: clamp(14px, 1.55vw, 17px);
  color: #d0d0d0;
  opacity: 0.8;
  line-height: 1.55;
  font-weight: 400;
  margin: 0;
}

/* CTA */
.cta {
  background: #fff;
  color: #000;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: clamp(13.5px, 1.5vw, 14.5px);
  padding: clamp(11px, 1.6vh, 13px) clamp(22px, 3vw, 28px);
  border-radius: 999px;
  border: none;
  cursor: pointer;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.15),
    0 0 22px rgba(255,255,255,0.32),
    0 0 44px rgba(255,255,255,0.12);
  transition: transform 0.25s, box-shadow 0.25s;
  margin-top: 8px;
}
.cta:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.25),
    0 0 32px rgba(255,255,255,0.45),
    0 0 60px rgba(255,255,255,0.18);
}

/* Stats footer */
.stats {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(12px, 2vw, 24px);
  max-width: 920px;
  width: 100%;
}
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stat-icon {
  font-family: var(--font-display);
  font-size: clamp(22px, 3vw, 33px);
  color: #fff;
}
.stat-value {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: clamp(18px, 2.2vw, 26px);
  color: #fff;
  letter-spacing: -0.025em;
  font-variant-numeric: tabular-nums;
}
.stat-label {
  font-size: clamp(11px, 1.2vw, 12.5px);
  color: var(--muted);
}

/* Shared entrance animation */
.anim {
  opacity: 0;
  transform: translateY(22px) scale(0.98);
  filter: blur(6px);
  transition: none;
}
.anim.in {
  animation: reveal 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--d, 0s);
}
@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(22px) scale(0.98);
    filter: blur(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .anim, .anim.in, .headline-line, .headline-line.in, .header, .header.in {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    transition: none !important;
  }
}

/* Mobile */
@media (max-width: 720px) {
  .nav-pill { display: none; }
  .sign-in-btn { display: none; }
  .header { justify-content: center; }
  .stats { grid-template-columns: repeat(2, 1fr); }
  .headline {
    letter-spacing: -0.08em;
    line-height: 1.05;
  }
}
@media (max-width: 420px) {
  .headline {
    letter-spacing: -0.09em;
    line-height: 1.04;
  }
  .avatar { --trust-size: 34px; }
  .trust-pill { --trust-size: 34px; }
  .trust-pill span { font-size: 12px; }
}
`;
