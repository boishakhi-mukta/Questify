"use client";

import { useState }  from "react";
import Link           from "next/link";
import Image          from "next/image";
import { HiArrowLeft, HiEnvelope } from "react-icons/hi2";

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">

      {/* Logo bar */}
      <div className="px-7 py-5">
        <Link href="/">
          <Image src="/logo.svg" alt="Questify" width={120} height={30} className="h-[30px] w-auto" />
        </Link>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px]">
          <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.09)] p-8 md:p-9">

            {!submitted ? (
              <>
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center mb-5">
                  <HiEnvelope size={22} className="text-brand-blue" />
                </div>

                <h1 className="text-2xl font-bold text-brand-dark mb-1.5">Forgot password?</h1>
                <p className="text-[15px] text-brand-body mb-7">
                  Enter your email and we will check if an account exists.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-brand-dark">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="w-full h-11 px-4 border border-brand-border rounded-lg text-[15px] text-brand-dark placeholder:text-brand-body/40 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!email.trim()}
                    className="w-full h-11 bg-brand-blue hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors duration-150"
                  >
                    Check account
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Confirmation state */}
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-brand-dark mb-2">Contact your administrator</h2>
                <p className="text-[15px] text-brand-body mb-4">
                  Password resets must be done by an administrator. Please reach out to your admin and ask them to reset the password for:
                </p>
                <div className="px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm font-semibold text-brand-dark mb-6 break-all">
                  {email}
                </div>
                <p className="text-[13px] text-brand-body/60">
                  Once reset, you will receive a new temporary password by email and be prompted to create a permanent one on your next login.
                </p>
              </>
            )}

            <Link
              href="/login"
              className="mt-6 flex items-center gap-1.5 text-[13px] font-semibold text-brand-blue hover:text-[#004182] transition-colors w-fit"
            >
              <HiArrowLeft size={14} />
              Back to login
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
