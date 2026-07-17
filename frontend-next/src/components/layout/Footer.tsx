"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FaXTwitter,
  FaLinkedin,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa6";
import type { IconType } from "react-icons";
import { useTranslation } from "react-i18next";

interface SocialItem {
  label: string;
  href: string;
  icon: IconType;
}

const socialLinks: SocialItem[] = [
  {
    label: "Twitter / X",
    href: "https://twitter.com/questify",
    icon: FaXTwitter,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/questify",
    icon: FaLinkedin,
  },
  {
    label: "Facebook",
    href: "https://facebook.com/questify",
    icon: FaFacebook,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/questify",
    icon: FaInstagram,
  },
];

// ─── Cube color themes: [top-face, left-face, right-face] ───────────────────
const CUBE_THEMES: [string, string, string][] = [
  ["#b2ccbf", "#8fb0a0", "#729484"],
  ["#c5ddd1", "#a4c4b6", "#86a89a"],
  ["#d4e9df", "#b8d4ca", "#9cbeb3"],
  ["#d0d0d0", "#b4b4b4", "#989898"],
  ["#e0e0e0", "#c6c6c6", "#ababab"],
  ["#bdd0c8", "#9eb8ae", "#82a096"],
];

function cubeTheme(row: number, col: number): [string, string, string] {
  const idx = Math.abs((row * 7 + col * 11) % CUBE_THEMES.length);
  return CUBE_THEMES[idx];
}

function IsometricPattern() {
  const W = 42;
  const H = 21;
  const VW = 1440;
  const VH = 160;

  const cubes: React.ReactNode[] = [];

  for (let row = -1; row <= Math.ceil(VH / H) + 2; row++) {
    const cy = row * H;
    const xOrigin = row % 2 === 0 ? W : 2 * W;

    for (let col = -2; col <= Math.ceil(VW / (2 * W)) + 2; col++) {
      const cx = xOrigin + col * 2 * W;
      const [topC, leftC, rightC] = cubeTheme(row, col);

      const t = `${cx},${cy - H}`;
      const r = `${cx + W},${cy}`;
      const b = `${cx},${cy + H}`;
      const l = `${cx - W},${cy}`;
      const rr = `${cx + W},${cy + 2 * H}`;
      const f = `${cx},${cy + 3 * H}`;
      const ll = `${cx - W},${cy + 2 * H}`;

      cubes.push(
        <g key={`${row}-${col}`}>
          <polygon
            points={`${t} ${r} ${b} ${l}`}
            fill={topC}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="0.8"
          />
          <polygon
            points={`${r} ${rr} ${f} ${b}`}
            fill={rightC}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="0.8"
          />
          <polygon
            points={`${l} ${b} ${f} ${ll}`}
            fill={leftC}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="0.8"
          />
        </g>,
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
        <linearGradient id="iso-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="black" />
          <stop offset="18%" stopColor="white" />
        </linearGradient>
        <mask id="iso-mask">
          <rect width="100%" height="100%" fill="url(#iso-fade)" />
        </mask>
      </defs>
      <g mask="url(#iso-mask)">{cubes}</g>
    </svg>
  );
}

const LINK_CLASS =
  "text-[14px] text-[#2e3e38] underline underline-offset-2 decoration-[#2e3e38]/40 hover:decoration-[#1B7A5A] hover:text-[#1B7A5A] transition-colors";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer
      className="w-full overflow-hidden"
      style={{ background: "#eff3f1" }}
      aria-label="Site footer"
    >
      {/* ── Content — w-11/12, columns spread justify-between ── */}
      <div className="w-10/12 mx-auto pb-10 mt-5">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Questify — homepage"
          className="inline-block mb-7"
        >
          <Image
            src="/logo.svg"
            alt="Questify"
            width={130}
            height={34}
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* 3 columns spread edge-to-edge like the reference */}
        <div className="flex flex-wrap justify-between gap-y-10">
          {/* Col 1 — Platform */}
          <div>
            <h3 className="font-bold text-[#1a2820] text-[15px] mb-6">
              {t("footer.platform")}
            </h3>
            <ul className="flex flex-col gap-2.5 mt-4" role="list">
              {[
                { label: t("footer.linkHome"), href: "/" },
                { label: t("footer.linkCourses"), href: "/courses" },
                { label: t("footer.linkAbout"), href: "/about" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className={LINK_CLASS}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2 — Contact */}
          <div>
            <h3 className="font-bold text-[#1a2820] text-[15px] mb-6">
              {t("footer.contact")}
            </h3>
            <ul className="flex flex-col gap-2.5 mt-4" role="list">
              <li className="text-[14px] text-[#2e3e38]">
                Email:{" "}
                <a href="mailto:bgmukta11@gmail.com" className={LINK_CLASS}>
                  bgmukta11@gmail.com
                </a>
              </li>
              {[
                { label: t("footer.linkContact"), href: "/contact" },
                { label: t("footer.linkHelp"), href: "/help" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className={LINK_CLASS}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Quick access */}
          <div>
            <h3 className="font-bold text-[#1a2820] text-[15px] mb-10">
              {t("footer.support")}
            </h3>
            <ul className="flex flex-col gap-2.5 mt-4" role="list">
              {[
                { label: "Sign in", href: "/sign-in" },
                { label: "Admin portal", href: "/admin" },
                { label: "FAQ", href: "/faq" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className={LINK_CLASS}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social buttons + copyright — always stacked in a column, centered */}
        <div className="mt-14 pt-6 border-t border-black/8 flex flex-col items-center gap-3">
          <div
            className="flex items-center gap-2.5"
            aria-label="Questify on social media"
          >
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} (opens in new tab)`}
                className="w-9 h-9 rounded-full bg-black/7 border border-black/10 flex items-center justify-center text-[#4a5e56] hover:bg-[#1B7A5A] hover:border-[#1B7A5A] hover:text-white transition-all duration-200"
              >
                <Icon size={14} aria-hidden="true" />
              </a>
            ))}
          </div>
          <p className="text-[13px] text-[#6a7c74]">
            © 2026 Questify. {t("footer.allRightsReserved")}
          </p>
        </div>
      </div>

      {/* Isometric cube pattern */}
      <IsometricPattern />
    </footer>
  );
}
