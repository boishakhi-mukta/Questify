"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, Phone, MapPin, Send, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Contact info items ─────────────────────────────────────────────────────────

const contactInfo = [
  {
    icon: Mail,
    label: "IT Helpdesk Email",
    value: "it.support@questify.edu",
    href: "mailto:it.support@questify.edu",
  },
  {
    icon: Phone,
    label: "Support Line",
    value: "+47 22 85 50 00",
    href: "tel:+4722855000",
  },
  {
    icon: MapPin,
    label: "Office Location",
    value: "IT Services Building, Main Campus — Room 201",
    href: undefined,
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "Monday–Friday, 08:00–16:00 CET",
    href: undefined,
  },
];

// ── Form ───────────────────────────────────────────────────────────────────────

type FormStatus = "idle" | "loading" | "success" | "error";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const SUBJECTS = [
  "Account Access Problem",
  "Technical Issue / Bug Report",
  "Course or Enrollment Query",
  "Attendance Record Issue",
  "XP or Grade Discrepancy",
  "Feedback & Suggestions",
  "Other",
];

function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<Partial<FormState>>({});

  function validate(): boolean {
    const next: Partial<FormState> = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Please enter a valid email.";
    }
    if (!form.subject) next.subject = "Please select a subject.";
    if (!form.message.trim()) {
      next.message = "Message is required.";
    } else if (form.message.trim().length < 20) {
      next.message = "Message must be at least 20 characters.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    // Stub — replace with real API call
    await new Promise<void>((r) => setTimeout(r, 800));
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-brand-dark dark:text-white">Request Submitted</h3>
        <p className="text-brand-body dark:text-white/60 max-w-sm">
          Your message has been sent to the IT helpdesk. We aim to respond
          within one working day during office hours.
        </p>
        <button
          type="button"
          onClick={() => { setStatus("idle"); setForm({ name: "", email: "", subject: "", message: "" }); }}
          className="text-sm font-semibold text-brand-blue hover:underline underline-offset-2 mt-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  const fieldClass = (hasError: boolean) =>
    `w-full bg-white dark:bg-slate-800 border rounded-lg px-3.5 py-2.5 text-sm text-brand-dark dark:text-white placeholder:text-brand-body/50 dark:placeholder:text-white/30 outline-none transition-all ${
      hasError
        ? "border-red-400 focus:ring-2 focus:ring-red-400/30"
        : "border-brand-border dark:border-white/10 focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Name + Email */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-brand-dark dark:text-white mb-1.5">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            value={form.name}
            onChange={handleChange}
            disabled={status === "loading"}
            className={fieldClass(!!errors.name)}
          />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-brand-dark dark:text-white mb-1.5">
            University Email <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="jane@university.edu"
            value={form.email}
            onChange={handleChange}
            disabled={status === "loading"}
            className={fieldClass(!!errors.email)}
          />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-semibold text-brand-dark dark:text-white mb-1.5">
          Subject <span className="text-red-400">*</span>
        </label>
        <select
          id="subject"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          disabled={status === "loading"}
          className={fieldClass(!!errors.subject)}
        >
          <option value="">Select a subject…</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {errors.subject && <p className="mt-1 text-xs text-red-400">{errors.subject}</p>}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-brand-dark dark:text-white mb-1.5">
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Describe your issue or question in detail…"
          value={form.message}
          onChange={handleChange}
          disabled={status === "loading"}
          className={`${fieldClass(!!errors.message)} resize-none`}
        />
        <div className="flex justify-between mt-1">
          {errors.message ? (
            <p className="text-xs text-red-400">{errors.message}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-brand-body/50 dark:text-white/30">
            {form.message.length} chars
          </span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full flex items-center justify-center gap-2 h-11"
      >
        {status === "loading" ? (
          <>
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send size={15} />
            Submit Request
          </>
        )}
      </Button>

      <p className="text-xs text-center text-brand-body/50 dark:text-white/30">
        We aim to respond within one working day (Mon–Fri, 08:00–16:00 CET).
      </p>
    </form>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* Hero */}
        <section className="bg-gradient-to-b from-brand-bg to-white dark:from-slate-950 dark:to-slate-900 pt-16 pb-14 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <span className="inline-block mb-4 px-3.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-widest">
              IT Support
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-dark dark:text-white mb-4 leading-tight">
              Contact the Helpdesk
            </h1>
            <p className="text-brand-body dark:text-white/60 text-lg leading-relaxed">
              Having trouble logging in, a missing enrollment, or a platform issue?
              Submit a request and the IT support team will get back to you.
            </p>
          </div>
        </section>

        {/* Content grid */}
        <section className="max-w-6xl mx-auto px-6 md:px-12 py-16">
          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-12 lg:gap-16">

            {/* Left — contact info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-2">
                  IT Helpdesk
                </h2>
                <p className="text-brand-body dark:text-white/60 text-sm leading-relaxed">
                  The helpdesk handles all Questify platform issues for students, faculty,
                  and staff. For urgent account problems (locked out, wrong role), email
                  directly and include your student or employee ID.
                </p>
              </div>

              <ul className="space-y-5 list-none m-0 p-0">
                {contactInfo.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={18} className="text-brand-blue" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-brand-body dark:text-white/40 uppercase tracking-widest mb-0.5">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="text-sm font-medium text-brand-dark dark:text-white hover:text-brand-blue dark:hover:text-brand-blue transition-colors"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-brand-dark dark:text-white">{value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Response time badge */}
              <div className="rounded-xl border border-brand-border dark:border-white/10 p-5 bg-brand-bg dark:bg-slate-800/50">
                <p className="text-[13px] font-semibold text-brand-dark dark:text-white mb-1">
                  Typical Response Time
                </p>
                <p className="text-2xl font-extrabold text-brand-blue mb-1">
                  &lt; 1 working day
                </p>
                <p className="text-xs text-brand-body dark:text-white/50">
                  During office hours only. Check our{" "}
                  <a href="/help" className="text-brand-blue hover:underline underline-offset-2">
                    Help Center
                  </a>{" "}
                  for quick answers before submitting a ticket.
                </p>
              </div>
            </div>

            {/* Right — form */}
            <div className="bg-white dark:bg-slate-800/60 border border-brand-border dark:border-white/10 rounded-2xl p-8 shadow-sm">
              <h2 className="text-lg font-bold text-brand-dark dark:text-white mb-6">
                Submit a Support Request
              </h2>
              <ContactForm />
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
