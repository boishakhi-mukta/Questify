"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Send, CheckCircle } from "lucide-react";
import { FaXTwitter, FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa6";
import type { IconType } from "react-icons";

// ── Data ──────────────────────────────────────────────────────────────────────
interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const platformLinks: FooterLink[] = [
  { label: "Home",    href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About",   href: "/about" },
];

const supportLinks: FooterLink[] = [
  { label: "Help Center", href: "/help" },
  { label: "Contact Us",  href: "/contact" },
];

interface SocialItem {
  label: string;
  href: string;
  icon: IconType;
}

const socialLinks: SocialItem[] = [
  { label: "Twitter / X",  href: "https://twitter.com/questify",           icon: FaXTwitter  },
  { label: "LinkedIn",     href: "https://linkedin.com/company/questify",  icon: FaLinkedin  },
  { label: "Facebook",     href: "https://facebook.com/questify",          icon: FaFacebook  },
  { label: "Instagram",    href: "https://instagram.com/questify",         icon: FaInstagram },
];

const techStack = ["Next.js 15", "TypeScript", "Node.js", "MongoDB"];

// ── Shared primitives ──────────────────────────────────────────────────────────
function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-white uppercase tracking-[0.12em] mb-5">
      {children}
    </h3>
  );
}

function LinkList({ links }: { links: FooterLink[] }) {
  return (
    <ul className="flex flex-col gap-3.5" role="list">
      {links.map(({ label, href, external }) => (
        <li key={label}>
          <Link
            href={href}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="text-[#9EA3A8] text-sm leading-none hover:text-white transition-colors duration-150 hover:underline underline-offset-2"
          >
            {label}
            {external && (
              <span className="sr-only"> (opens in new tab)</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ── Social icon button ─────────────────────────────────────────────────────────
function SocialButton({ label, href, icon: Icon }: SocialItem) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in new tab)`}
      className="w-9 h-9 rounded-full bg-[#2A2F33] border border-[#3D4448] flex items-center justify-center text-[#9EA3A8] hover:bg-brand-blue hover:border-brand-blue hover:text-white transition-all duration-200"
    >
      <Icon size={15} aria-hidden="true" />
    </a>
  );
}

// ── Newsletter form ────────────────────────────────────────────────────────────
function NewsletterForm() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || status !== "idle") return;
    setStatus("loading");
    // Stub — swap for real API call once newsletter endpoint exists
    await new Promise<void>((r) => setTimeout(r, 600));
    setStatus("success");
    setEmail("");
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2.5 text-sm text-[#34D399]" role="status">
        <CheckCircle size={16} aria-hidden="true" />
        <span>You&apos;re subscribed! Welcome to the Questify community.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Newsletter signup">
      <div className="flex items-stretch h-10">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={status === "loading"}
          className="
            flex-1 min-w-0 bg-[#2A2F33] border border-[#3D4448] border-r-0
            text-white placeholder:text-[#6B7280] text-sm
            rounded-l-lg px-3.5
            outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-inset
            disabled:opacity-50 transition-all
          "
        />
        <button
          type="submit"
          disabled={status === "loading"}
          aria-label="Subscribe"
          className="
            bg-brand-blue hover:bg-[#004182] active:scale-95
            text-white px-4
            rounded-r-lg border border-brand-blue
            flex items-center justify-center
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {status === "loading" ? (
            <span
              className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
              aria-label="Sending…"
            />
          ) : (
            <Send size={14} aria-hidden="true" />
          )}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-[#6B7280]">
        No spam, ever. Unsubscribe any time.
      </p>
    </form>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
export default function Footer() {
  return (
    <footer className="w-full bg-brand-dark" aria-label="Site footer">

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-16 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">

          {/* Column 1 — About (spans 2 on sm so description breathes) */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-5" aria-label="Questify — go to homepage">
              <Image
                src="/logo.svg"
                alt="Questify"
                width={120}
                height={32}
                className="h-8 w-auto object-contain brightness-0 invert"
              />
            </Link>

            <p className="text-[#9EA3A8] text-sm leading-relaxed mb-6">
              A gamified learning management system that makes education
              measurable, rewarding, and fun. Earn XP, climb leaderboards,
              and watch your skills grow.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2.5" aria-label="Questify on social media">
              {socialLinks.map((s) => (
                <SocialButton key={s.label} {...s} />
              ))}
            </div>
          </div>

          {/* Column 2 — Platform */}
          <div>
            <ColHeading>Platform</ColHeading>
            <LinkList links={platformLinks} />
          </div>

          {/* Column 3 — Support */}
          <div>
            <ColHeading>Support</ColHeading>
            <LinkList links={supportLinks} />
          </div>

          {/* Column 5 — Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <ColHeading>Stay Updated</ColHeading>
            <p className="text-[#9EA3A8] text-sm leading-relaxed mb-4">
              Product news, learning tips, and community spotlights — delivered
              straight to your inbox.
            </p>
            <NewsletterForm />
          </div>

        </div>
      </div>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className="border-t border-[#2A2F33]" />

      {/* ── Bottom bar ────────────────────────────────────────────────────── */}
      <div className="bg-[#141719]">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
          <p className="text-[#6B7280] text-xs">
            © 2026 Questify. All rights reserved.
          </p>
          <p className="text-[#6B7280] text-xs">
            Built with{" "}
            {techStack.map((name, i) => (
              <span key={name}>
                <span className="text-[#9EA3A8]">{name}</span>
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
