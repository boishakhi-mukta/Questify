"use client";

import Link from "next/link";
import Image from "next/image";
import { FaXTwitter, FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { useTranslation } from "react-i18next";

// ─── Types ──────────────────────────────────────────────────────────────────
interface SocialItem { label: string; href: string; icon: IconType }

// ─── Data ───────────────────────────────────────────────────────────────────
const socialLinks: SocialItem[] = [
  { label: "Twitter / X", href: "https://twitter.com/questify",          icon: FaXTwitter  },
  { label: "LinkedIn",    href: "https://linkedin.com/company/questify", icon: FaLinkedin  },
  { label: "Facebook",    href: "https://facebook.com/questify",         icon: FaFacebook  },
  { label: "Instagram",   href: "https://instagram.com/questify",        icon: FaInstagram },
];

const techStack = ["Next.js 15", "TypeScript", "Node.js", "MongoDB"];

// Cube face color themes: [top, left, right]
const CUBE_THEMES: [string, string, string][] = [
  ["#cfe4d7", "#b7d3c5", "#9bbfb1"],  // brand green mid
  ["#d9eee0", "#c4dcd0", "#aecbc4"],  // brand green light
  ["#e6f4ec", "#d0e5dc", "#bbd4ca"],  // brand green pale
  ["#e0e0e0", "#c8c8c8", "#b0b0b0"],  // gray medium
  ["#eaeaea", "#d4d4d4", "#bcbcbc"],  // gray light
  ["#e4ded6", "#cec8c0", "#b8b2aa"],  // warm beige neutral
];

function cubeTheme(row: number, col: number): [string, string, string] {
  const n = CUBE_THEMES.length;
  const idx = Math.abs((row * 7 + col * 11) % n);
  return CUBE_THEMES[idx];
}

// ─── Isometric pattern ──────────────────────────────────────────────────────
function IsometricPattern() {
  const W = 38;     // half-width of the top-face diamond
  const H = 19;     // half-height of the top-face diamond
  const VW = 1440;
  const VH = 280;

  const rows: React.ReactNode[] = [];

  for (let row = -1; row <= Math.ceil(VH / H) + 2; row++) {
    const cy = row * H;
    // Alternate offset so cubes interlock
    const xOrigin = row % 2 === 0 ? W : 2 * W;

    for (let col = -2; col <= Math.ceil(VW / (2 * W)) + 2; col++) {
      const cx = xOrigin + col * 2 * W;
      const [topC, leftC, rightC] = cubeTheme(row, col);

      // 7 key points
      const t  = `${cx},${cy - H}`;          // top
      const r  = `${cx + W},${cy}`;           // right of top-face
      const b  = `${cx},${cy + H}`;           // bottom of top-face / front
      const l  = `${cx - W},${cy}`;           // left of top-face
      const rr = `${cx + W},${cy + 2 * H}`;   // right-bottom
      const f  = `${cx},${cy + 3 * H}`;       // bottom-center
      const ll = `${cx - W},${cy + 2 * H}`;   // left-bottom

      rows.push(
        <g key={`${row}-${col}`}>
          <polygon points={`${t} ${r} ${b} ${l}`}    fill={topC}   stroke="rgba(255,255,255,0.55)" strokeWidth="0.7" />
          <polygon points={`${r} ${rr} ${f} ${b}`}   fill={rightC} stroke="rgba(255,255,255,0.55)" strokeWidth="0.7" />
          <polygon points={`${l} ${b} ${f} ${ll}`}   fill={leftC}  stroke="rgba(255,255,255,0.55)" strokeWidth="0.7" />
        </g>
      );
    }
  }

  return (
    <svg
      width="100%"
      height={VH}
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <defs>
        {/* Top-fade mask so cubes "emerge" from the bottom */}
        <linearGradient id="footer-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="black" />
          <stop offset="35%"  stopColor="white" />
        </linearGradient>
        <mask id="footer-mask">
          <rect width="100%" height="100%" fill="url(#footer-fade)" />
        </mask>
      </defs>
      <g mask="url(#footer-mask)">{rows}</g>
    </svg>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold text-[#2e3e38] uppercase tracking-[0.13em] mb-4">
      {children}
    </h3>
  );
}

function SocialButton({ label, href, icon: Icon }: SocialItem) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in new tab)`}
      className="w-9 h-9 rounded-full bg-black/7 border border-black/10 flex items-center justify-center text-[#4a5e56] hover:bg-[#1B7A5A] hover:border-[#1B7A5A] hover:text-white transition-all duration-200"
    >
      <Icon size={14} aria-hidden="true" />
    </a>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function Footer() {
  const { t } = useTranslation();

  const platformLinks = [
    { label: t("footer.linkHome"),    href: "/" },
    { label: t("footer.linkCourses"), href: "/courses" },
    { label: t("footer.linkAbout"),   href: "/about" },
  ];

  const supportLinks = [
    { label: t("footer.linkHelp"),    href: "/help" },
    { label: t("footer.linkContact"), href: "/contact" },
  ];

  return (
    <footer
      className="w-full overflow-hidden"
      style={{ background: "#edf2ef" }}
      aria-label="Site footer"
    >

      {/* ── Content grid ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">

          {/* Col 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4" aria-label="Questify — homepage">
              <Image src="/logo.svg" alt="Questify" width={120} height={32} className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-[#4a5e56] text-sm leading-relaxed mb-5">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-2.5" aria-label="Social media">
              {socialLinks.map((s) => <SocialButton key={s.label} {...s} />)}
            </div>
          </div>

          {/* Col 2 — Platform */}
          <div>
            <ColHeading>{t("footer.platform")}</ColHeading>
            <ul className="flex flex-col gap-3" role="list">
              {platformLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-[#4a5e56] text-sm hover:text-[#1B7A5A] transition-colors hover:underline underline-offset-2">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Support */}
          <div>
            <ColHeading>{t("footer.support")}</ColHeading>
            <ul className="flex flex-col gap-3" role="list">
              {supportLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-[#4a5e56] text-sm hover:text-[#1B7A5A] transition-colors hover:underline underline-offset-2">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <ColHeading>{t("footer.contact")}</ColHeading>
            <ul className="flex flex-col gap-3" role="list">
              <li>
                <Link href="/contact" className="text-[#4a5e56] text-sm hover:text-[#1B7A5A] transition-colors hover:underline underline-offset-2">
                  {t("footer.linkContact")}
                </Link>
              </li>
              <li>
                <a href="mailto:bgmukta11@gmail.com" className="text-[#4a5e56] text-sm hover:text-[#1B7A5A] transition-colors hover:underline underline-offset-2">
                  bgmukta11@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── Copyright bar ── */}
      <div className="border-t border-black/8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <p className="text-[#6a7c74] text-xs">
            © 2026 Questify. {t("footer.allRightsReserved")}
          </p>
          <p className="text-[#6a7c74] text-xs">
            {t("footer.builtWith")}{" "}
            {techStack.map((name, i) => (
              <span key={name}>
                <span className="text-[#2e3e38] font-medium">{name}</span>
                {i < techStack.length - 1 && (
                  <span className="mx-1.5 text-[#9ab0a8]" aria-hidden="true">·</span>
                )}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* ── Isometric cube decoration ── */}
      <IsometricPattern />

    </footer>
  );
}
