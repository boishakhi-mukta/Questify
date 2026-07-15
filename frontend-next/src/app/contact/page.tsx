"use client";

/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Contact Page
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The public page where visitors fill out support forms.
 * 
 * WHY IT EXISTS:
 * Allows anonymous guests to contact administrators.
 * 
 * HOW IT WORKS (Technical Overview):
 * Static client layout with input elements submitting data.
 * ============================================================================
 */

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, Phone, MapPin, Send, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

// ── Form ───────────────────────────────────────────────────────────────────────

type FormStatus = "idle" | "loading" | "success" | "error";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function ContactForm() {
  const { t } = useTranslation();

  const SUBJECTS = [
    { key: "contact.subjectAccountAccess",  value: "Account Access Problem" },
    { key: "contact.subjectTechnicalIssue", value: "Technical Issue / Bug Report" },
    { key: "contact.subjectCourseQuery",    value: "Course or Enrollment Query" },
    { key: "contact.subjectAttendanceIssue",value: "Attendance Record Issue" },
    { key: "contact.subjectXpDiscrepancy",  value: "XP or Grade Discrepancy" },
    { key: "contact.subjectFeedback",       value: "Feedback & Suggestions" },
    { key: "contact.subjectOther",          value: "Other" },
  ];

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
    if (!form.name.trim()) next.name = t("contact.nameRequired");
    if (!form.email.trim()) {
      next.email = t("contact.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = t("contact.emailInvalid");
    }
    if (!form.subject) next.subject = t("contact.subjectRequired");
    if (!form.message.trim()) {
      next.message = t("contact.messageRequired");
    } else if (form.message.trim().length < 20) {
      next.message = t("contact.messageTooShort");
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
    await new Promise<void>((r) => setTimeout(r, 800));
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-brand-dark dark:text-white">{t("contact.successTitle")}</h3>
        <p className="text-brand-body dark:text-white/60 max-w-sm">
          {t("contact.successBody")}
        </p>
        <button
          type="button"
          onClick={() => { setStatus("idle"); setForm({ name: "", email: "", subject: "", message: "" }); }}
          className="text-sm font-semibold text-brand-blue hover:underline underline-offset-2 mt-2"
        >
          {t("contact.sendAnother")}
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
            {t("contact.fullName")} <span className="text-red-400">*</span>
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
            {t("contact.universityEmail")} <span className="text-red-400">*</span>
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
          {t("contact.subject")} <span className="text-red-400">*</span>
        </label>
        <select
          id="subject"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          disabled={status === "loading"}
          className={fieldClass(!!errors.subject)}
        >
          <option value="">{t("contact.selectSubject")}</option>
          {SUBJECTS.map(({ key, value }) => (
            <option key={value} value={value}>{t(key)}</option>
          ))}
        </select>
        {errors.subject && <p className="mt-1 text-xs text-red-400">{errors.subject}</p>}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-brand-dark dark:text-white mb-1.5">
          {t("contact.message")} <span className="text-red-400">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder={t("contact.messagePlaceholder")}
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
            {form.message.length} {t("contact.chars")}
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
            {t("contact.sending")}
          </>
        ) : (
          <>
            <Send size={15} />
            {t("contact.submitBtn")}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-brand-body/50 dark:text-white/30">
        {t("contact.responseNote")}
      </p>
    </form>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const { t } = useTranslation();

  const contactInfo = [
    { icon: Mail,   labelKey: "contact.contactInfoEmail",    value: "it.support@questify.edu",                    href: "mailto:it.support@questify.edu" },
    { icon: Phone,  labelKey: "contact.contactInfoPhone",    value: "+47 22 85 50 00",                            href: "tel:+4722855000" },
    { icon: MapPin, labelKey: "contact.contactInfoLocation", value: "IT Services Building, Main Campus — Room 201", href: undefined },
    { icon: Clock,  labelKey: "contact.contactInfoHours",    value: "Monday–Friday, 08:00–16:00 CET",              href: undefined },
  ];

  return (
    <>
      <div style={{ background: "radial-gradient(120% 90% at 50% 78%, rgba(238,250,244,0.9) 0%, rgba(238,250,244,0) 60%), linear-gradient(180deg, #b7d3c5 0%, #c4dcd0 30%, #cfe4d7 62%, #d9eee0 100%)" }}>
        <Navbar />
      </div>

      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* Hero */}
        <section
          className="pt-[90px] pb-14 px-6 text-center"
          style={{ background: "linear-gradient(180deg, #c4dcd0 0%, #d4ede3 22%, #eef8f4 52%, #eef8f4 78%, #F2FAF7 100%)" }}
        >
          <div className="max-w-2xl mx-auto">
            <span className="inline-block mb-4 px-3.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-widest">
              {t("contact.badge")}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-dark dark:text-white mb-4 leading-tight">
              {t("contact.title")}
            </h1>
            <p className="text-brand-body dark:text-white/60 text-lg leading-relaxed">
              {t("contact.subtitle")}
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
                  {t("contact.itHelpdeskTitle")}
                </h2>
                <p className="text-brand-body dark:text-white/60 text-sm leading-relaxed">
                  {t("contact.itHelpdeskDesc")}
                </p>
              </div>

              <ul className="space-y-5 list-none m-0 p-0">
                {contactInfo.map(({ icon: Icon, labelKey, value, href }) => (
                  <li key={labelKey} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={18} className="text-brand-blue" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-brand-body dark:text-white/40 uppercase tracking-widest mb-0.5">
                        {t(labelKey)}
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
                  {t("contact.typicalResponseTime")}
                </p>
                <p className="text-2xl font-extrabold text-brand-blue mb-1">
                  {t("contact.lessThanOneDay")}
                </p>
                <p className="text-xs text-brand-body dark:text-white/50">
                  {t("contact.officeHoursNote")}{" "}
                  <a href="/help" className="text-brand-blue hover:underline underline-offset-2">
                    {t("contact.helpCenter")}
                  </a>{" "}
                  {t("contact.beforeTicket")}
                </p>
              </div>
            </div>

            {/* Right — form */}
            <div className="bg-white dark:bg-slate-800/60 border border-brand-border dark:border-white/10 rounded-2xl p-8 shadow-sm">
              <h2 className="text-lg font-bold text-brand-dark dark:text-white mb-6">
                {t("contact.submitRequestTitle")}
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
