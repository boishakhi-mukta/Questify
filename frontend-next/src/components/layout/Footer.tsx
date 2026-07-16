"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: Footer
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The bar at the absolute bottom of pages containing copyright info and legal terms.
 * 
 * WHY IT EXISTS:
 * A standard design anchor for visual page endings and basic information links.
 * 
 * HOW IT WORKS (Technical Overview):
 * Simple static footer styled using Tailwind layout definitions.
 * ============================================================================
 */

import Link from "next/link";
import Image from "next/image";
import { FaXTwitter, FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { useTranslation } from "react-i18next";

interface SocialItem {
  label: string;
  href:  string;
  icon:  IconType;
}

const socialLinks: SocialItem[] = [
  { label: "Twitter / X", href: "https://twitter.com/questify",          icon: FaXTwitter  },
  { label: "LinkedIn",    href: "https://linkedin.com/company/questify", icon: FaLinkedin  },
  { label: "Facebook",    href: "https://facebook.com/questify",         icon: FaFacebook  },
  { label: "Instagram",   href: "https://instagram.com/questify",        icon: FaInstagram },
];

const techStack = ["Next.js 15", "TypeScript", "Node.js", "MongoDB"];

function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-brand-dark uppercase tracking-[0.12em] mb-5">
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
      className="w-9 h-9 rounded-full bg-black/8 border border-black/10 flex items-center justify-center text-brand-body hover:bg-brand-blue hover:border-brand-blue hover:text-white transition-all duration-200"
    >
      <Icon size={15} aria-hidden="true" />
    </a>
  );
}


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
      className="w-full"
      style={{ background: "linear-gradient(180deg, #a3bfb1 0%, #b0c8bc 30%, #bbd0c3 62%, #c5dacc 100%)" }}
      aria-label="Site footer"
    >

      {/* Main grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">

          {/* Column 1 — About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-5" aria-label="Questify — go to homepage">
              <Image src="/logo.svg" alt="Questify" width={120} height={32} className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-brand-body text-sm leading-relaxed mb-6">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-2.5" aria-label="Questify on social media">
              {socialLinks.map((s) => <SocialButton key={s.label} {...s} />)}
            </div>
          </div>

          {/* Column 2 — Platform */}
          <div>
            <ColHeading>{t("footer.platform")}</ColHeading>
            <ul className="flex flex-col gap-3.5" role="list">
              {platformLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-brand-body text-sm leading-none hover:text-brand-dark transition-colors duration-150 hover:underline underline-offset-2">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Support */}
          <div>
            <ColHeading>{t("footer.support")}</ColHeading>
            <ul className="flex flex-col gap-3.5" role="list">
              {supportLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-brand-body text-sm leading-none hover:text-brand-dark transition-colors duration-150 hover:underline underline-offset-2">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Quick contact */}
          <div className="sm:col-span-2 lg:col-span-1">
            <ColHeading>{t("footer.contact")}</ColHeading>
            <ul className="flex flex-col gap-3.5" role="list">
              <li>
                <Link href="/contact" className="text-brand-body text-sm leading-none hover:text-brand-dark transition-colors duration-150 hover:underline underline-offset-2">
                  {t("footer.linkContact")}
                </Link>
              </li>
              <li>
                <a href="mailto:bgmukta11@gmail.com" className="text-brand-body text-sm leading-none hover:text-brand-dark transition-colors duration-150 hover:underline underline-offset-2">
                  bgmukta11@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-black/10" />

      {/* Bottom bar */}
      <div className="bg-black/8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
          <p className="text-brand-body/70 text-xs">
            © 2026 Questify. {t("footer.allRightsReserved")}
          </p>
          <p className="text-brand-body/70 text-xs">
            {t("footer.builtWith")}{" "}
            {techStack.map((name, i) => (
              <span key={name}>
                <span className="text-brand-dark font-medium">{name}</span>
                {i < techStack.length - 1 && (
                  <span className="mx-1.5 text-brand-body/30" aria-hidden="true">·</span>
                )}
              </span>
            ))}
          </p>
        </div>
      </div>

    </footer>
  );
}
