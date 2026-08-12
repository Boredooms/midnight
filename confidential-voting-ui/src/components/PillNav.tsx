import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";

/**
 * PillNav — animated floating pill navigation.
 * Ported from React Bits PillNav for MUI project (no Tailwind needed).
 * Uses GSAP for hover circle expansion + mobile menu animations.
 */

interface NavItem {
  label: string;
  href: string;
}

interface PillNavProps {
  baseColor?: string;
  pillColor?: string;
  pillTextColor?: string;
  hoverTextColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Architecture", href: "/architecture" },
  { label: "Demo", href: "/demo" },
];

const PillNav: React.FC<PillNavProps> = ({
  baseColor = "#ffffff",
  pillColor = "#0a0a0c",
  pillTextColor = "#e4e4e7",
  hoverTextColor = "#ffffff",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const mobileRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // Layout circles for hover animation
  useEffect(() => {
    const layout = () => {
      pillRefs.current.forEach((pill, i) => {
        const circle = circleRefs.current[i];
        if (!pill || !circle) return;

        const rect = pill.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const R = (w * w / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - w * w / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

        tlRefs.current[i]?.kill();
        const tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease: "power3.easeOut", overwrite: "auto" }, 0);
        tlRefs.current[i] = tl;
      });
    };

    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, []);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (tl) tl.tweenTo(tl.duration(), { duration: 0.3, ease: "power3.easeOut", overwrite: "auto" });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (tl) tl.tweenTo(0, { duration: 0.2, ease: "power3.easeOut", overwrite: "auto" });
  };

  const toggleMobile = () => {
    const next = !mobileOpen;
    setMobileOpen(next);
    const menu = mobileRef.current;
    const btn = hamburgerRef.current;

    if (btn) {
      const lines = btn.querySelectorAll<HTMLSpanElement>(".h-line");
      if (next) {
        gsap.to(lines[0], { rotation: 45, y: 4, duration: 0.3, ease: "power3.easeOut" });
        gsap.to(lines[1], { rotation: -45, y: -4, duration: 0.3, ease: "power3.easeOut" });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease: "power3.easeOut" });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease: "power3.easeOut" });
      }
    }

    if (menu) {
      if (next) {
        gsap.set(menu, { visibility: "visible" });
        gsap.fromTo(menu, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.easeOut" });
      } else {
        gsap.to(menu, { opacity: 0, y: 10, duration: 0.2, ease: "power3.easeOut", onComplete: () => gsap.set(menu, { visibility: "hidden" }) });
      }
    }
  };

  const navTo = (href: string) => {
    navigate(href);
    setMobileOpen(false);
  };

  return (
    <div style={{ position: "fixed", top: "1em", left: "50%", transform: "translateX(-50%)", zIndex: 1000, width: "auto" }}>
      {/* Desktop nav */}
      <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Logo */}
        <button
          onClick={() => navTo("/")}
          style={{
            width: 42, height: 42, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(10,10,12,0.7)", backdropFilter: "blur(12px)",
            cursor: "pointer", display: "grid", placeItems: "center",
            boxShadow: "0 4px 14px rgba(0,0,0,0.3)", flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 18 }}>🌙</span>
        </button>

        {/* Pill container (desktop) */}
        <div
          style={{
            display: "flex", alignItems: "center", height: 42,
            background: "rgba(10, 10, 12, 0.7)",
            backdropFilter: "blur(12px)",
            borderRadius: 999, padding: "3px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          className="desktop-nav"
        >
          {NAV_ITEMS.map((item, i) => {
            const isActive = location.pathname === item.href;
            return (
              <button
                key={item.href}
                ref={(el) => { pillRefs.current[i] = el; }}
                onClick={() => navTo(item.href)}
                onMouseEnter={() => handleEnter(i)}
                onMouseLeave={() => handleLeave(i)}
                style={{
                  position: "relative", overflow: "hidden",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  height: "100%", padding: "0 16px", borderRadius: 999,
                  border: "none", cursor: "pointer",
                  background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.6)",
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontWeight: 500, fontSize: 13, letterSpacing: "-0.01em",
                  whiteSpace: "nowrap", transition: "color 0.2s",
                }}
              >
                {/* Hover circle */}
                <span
                  ref={(el) => { circleRefs.current[i] = el; }}
                  style={{
                    position: "absolute", left: "50%", borderRadius: "50%",
                    background: "rgba(255,255,255,0.12)", pointerEvents: "none", zIndex: 1,
                  }}
                />
                {/* Label */}
                <span style={{ position: "relative", zIndex: 2 }}>{item.label}</span>
                {/* Active dot */}
                {isActive && (
                  <span style={{
                    position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)",
                    width: 3, height: 3, borderRadius: "50%", background: "#ffffff", zIndex: 3,
                    boxShadow: "-5px 0 0 #ffffff, 5px 0 0 #ffffff",
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Launch App button */}
        <button
          onClick={() => navTo("/app")}
          style={{
            height: 42, padding: "0 20px", borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.08)", color: "#d4d4d8", cursor: "pointer",
            fontFamily: '"Inter", system-ui, sans-serif',
            fontWeight: 500, fontSize: 13,
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
            transition: "background 0.2s, transform 0.2s, color 0.2s",
          } as React.CSSProperties}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#ffffff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#d4d4d8"; }}
        >
          Launch App
        </button>

        {/* Mobile hamburger */}
        <button
          ref={hamburgerRef}
          onClick={toggleMobile}
          className="mobile-burger"
          style={{
            display: "none", width: 42, height: 42, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.1)", background: "rgba(10,10,12,0.7)",
            backdropFilter: "blur(12px)", cursor: "pointer",
            flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
          }}
        >
          <span className="h-line" style={{ width: 16, height: 2, background: "#ffffff", borderRadius: 2, display: "block", transformOrigin: "center" }} />
          <span className="h-line" style={{ width: 16, height: 2, background: "#ffffff", borderRadius: 2, display: "block", transformOrigin: "center" }} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        ref={mobileRef}
        className="mobile-menu"
        style={{
          visibility: "hidden", position: "absolute", top: 56, left: 0, right: 0,
          background: "rgba(10,10,12,0.9)", backdropFilter: "blur(16px)",
          borderRadius: 24, padding: 4,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {NAV_ITEMS.map((item) => (
          <button
            key={item.href}
            onClick={() => navTo(item.href)}
            style={{
              display: "block", width: "100%", padding: "12px 16px",
              borderRadius: 999, border: "none", cursor: "pointer",
              background: location.pathname === item.href ? "rgba(255,255,255,0.1)" : "transparent",
              color: location.pathname === item.href ? "#ffffff" : "#a1a1aa",
              fontFamily: '"Inter", system-ui, sans-serif',
              fontWeight: 500, fontSize: 14, textAlign: "left",
              transition: "background 0.2s",
            }}
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={() => navTo("/app")}
          style={{
            display: "block", width: "100%", padding: "12px 16px", marginTop: 4,
            borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer", background: "rgba(255,255,255,0.05)", color: "#ffffff",
            fontFamily: '"Inter", system-ui, sans-serif',
            fontWeight: 600, fontSize: 14, textAlign: "center",
          }}
        >
          Launch App
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-burger { display: flex !important; }
          nav > button:last-of-type:not(.mobile-burger) { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-burger { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default PillNav;
