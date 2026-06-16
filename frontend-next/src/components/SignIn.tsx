"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { HiAcademicCap, HiUser, HiShieldCheck, HiEye, HiEyeSlash } from "react-icons/hi2";
import type { IconType } from "react-icons";
import type { UserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface RoleOption {
  key: UserRole;
  label: string;
  icon: IconType;
}

const roles: RoleOption[] = [
  { key: "student", label: "Student", icon: HiAcademicCap },
  { key: "teacher", label: "Teacher", icon: HiUser },
  { key: "admin",   label: "Admin",   icon: HiShieldCheck },
];

const dashboardByRole: Record<UserRole, string> = {
  admin:   "/admin",
  teacher: "/teacher",
  student: "/student",
};

export default function SignIn() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // First verify credentials without redirecting
    const result = await signIn("credentials", {
      userId,
      password,
      role: selectedRole,
      redirect: false,
    });

    if (!result || result.error) {
      setError("Invalid credentials. Please check your User ID and password.");
      setLoading(false);
      return;
    }

    // Credentials verified — do a full page navigation so the browser
    // sends the newly set session cookie with the request.
    window.location.replace(dashboardByRole[selectedRole]);
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Top-left logo */}
      <div className="px-7 py-5">
        <Link href="/">
          <Image
            src="/logo.svg"
            alt="Questify"
            width={120}
            height={30}
            className="h-[30px] w-auto"
          />
        </Link>
      </div>

      {/* Centered two-column layout */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-10">

          {/* Left: Lottie animation */}
          <div className="flex-1 hidden md:flex items-center justify-center">
            <DotLottieReact
              src="/Educatin.lottie"
              loop
              autoplay
              className="w-full max-w-[460px]"
            />
          </div>

          {/* Right: Login card */}
          <div className="flex-1 w-full flex justify-center">
            <div className="w-full max-w-[420px] bg-white rounded-xl shadow-[0_4px_32px_rgba(0,0,0,0.10)] px-9 py-10">

              <h1 className="text-2xl font-bold text-brand-dark text-center mb-1.5">
                Welcome Back! 👋
              </h1>
              <p className="text-sm text-brand-body text-center mb-7">
                Login to continue to your account
              </p>

              <form onSubmit={handleSubmit} noValidate>

                {/* Role selector */}
                <p className="text-[13px] font-semibold text-brand-dark mb-2.5">
                  Select your role
                </p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {roles.map(({ key, label, icon: Icon }) => {
                    const active = selectedRole === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setSelectedRole(key)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-lg py-3.5 px-2 cursor-pointer transition-colors duration-150",
                          active
                            ? "border-2 border-brand-blue bg-brand-blue-light"
                            : "border border-brand-border bg-white hover:border-brand-blue/50"
                        )}
                      >
                        <Icon
                          size={26}
                          className={active ? "text-brand-blue" : "text-brand-body"}
                        />
                        <span className={cn(
                          "text-[13px] font-semibold",
                          active ? "text-brand-blue" : "text-brand-body"
                        )}>
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* User ID */}
                <div className="flex flex-col gap-1.5 mb-4">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    type="text"
                    placeholder="Enter your ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5 mb-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-body hover:text-brand-dark transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <p role="alert" className="text-[13px] text-red-600 text-center mt-2">
                    {error}
                  </p>
                )}

                {/* Forgot password */}
                <div className="text-right mt-3 mb-6">
                  <a
                    href="#"
                    className="text-[13px] font-semibold text-brand-blue hover:text-brand-blue-dark transition-colors no-underline"
                  >
                    Forgot Password?
                  </a>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading || !userId || !password}
                  className="w-full h-11 text-[15px]"
                >
                  {loading ? "Signing in…" : "Login"}
                </Button>

              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-brand-border" />
                <div className="flex-1 h-px bg-brand-border" />
              </div>

              <p className="text-center text-sm text-brand-body">
                New to Questify? Contact your administrator to create an account.
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
