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

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Send, CheckCircle } from "lucide-react";
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
    <h3 className="text-xs font-bold text-white uppercase tracking-[0.12em] mb-5">
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
      className="w-9 h-9 rounded-full bg-[#1A2E25] border border-[#2A4035] flex items-center justify-center text-[#8AADA0] hover:bg-brand-blue hover:border-brand-blue hover:text-white transition-all duration-200"
    >
      <Icon size={15} aria-hidden="true" />
    </a>
  );
}

function NewsletterForm() {
  const { t } = useTranslation();
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || status !== "idle") return;
    setStatus("loading");
    await new Promise<void>((r) => setTimeout(r, 600));
    setStatus("success");
    setEmail("");
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2.5 text-sm text-[#2DCE9A]" role="status">
        <CheckCircle size={16} aria-hidden="true" />
        <span>{t("footer.subscribed")}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Newsletter signup">
      <div className="flex items-stretch h-10">
        <label htmlFor="newsletter-email" className="sr-only">
          {t("common.email")}
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("footer.emailPlaceholder")}
          required
          disabled={status === "loading"}
          className="
            flex-1 min-w-0 bg-[#1A2E25] border border-[#2A4035] border-r-0
            text-white placeholder:text-[#5A8070] text-sm
            rounded-l-lg px-3.5
            outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-inset
            disabled:opacity-50 transition-all
          "
        />
        <button
          type="submit"
          disabled={status === "loading"}
          aria-label={t("footer.subscribe")}
          className="
            bg-brand-blue hover:bg-brand-blue-dark active:scale-95
            text-white px-4
            rounded-r-lg border border-brand-blue
            flex items-center justify-center
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {status === "loading" ? (
            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-label="Sending…" />
          ) : (
            <Send size={14} aria-hidden="true" />
          )}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-[#5A8070]">{t("footer.noSpam")}</p>
    </form>
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
    <footer className="w-full bg-brand-dark" aria-label="Site footer">

      {/* Main grid */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-16 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">

          {/* Column 1 — About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-5" aria-label="Questify — go to homepage">
              <Image src="/logo.svg" alt="Questify" width={120} height={32} className="h-8 w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-[#8AADA0] text-sm leading-relaxed mb-6">
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
                  <Link href={href} className="text-[#8AADA0] text-sm leading-none hover:text-white transition-colors duration-150 hover:underline underline-offset-2">
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
                  <Link href={href} className="text-[#8AADA0] text-sm leading-none hover:text-white transition-colors duration-150 hover:underline underline-offset-2">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <ColHeading>{t("footer.stayUpdated")}</ColHeading>
            <p className="text-[#8AADA0] text-sm leading-relaxed mb-4">
              {t("footer.newsletterText")}
            </p>
            <NewsletterForm />
          </div>

        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#1A3028]" />

      {/* Bottom bar */}
      <div className="bg-[#0C1E15]">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
          <p className="text-[#5A8070] text-xs">
            © 2026 Questify. {t("footer.allRightsReserved")}
          </p>
          <p className="text-[#5A8070] text-xs">
            {t("footer.builtWith")}{" "}
            {techStack.map((name, i) => (
              <span key={name}>
                <span className="text-[#8AADA0]">{name}</span>
                {i < techStack.length - 1 && (
                  <span className="mx-1.5 text-[#3D4448]" aria-hidden="true">·</span>
                )}
              </span>
            ))}
          </p>
        </div>
      </div>

    </footer>
  );
}
