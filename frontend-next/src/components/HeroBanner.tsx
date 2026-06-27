"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Button } from "@/components/ui/button";
import { easeOut } from "@/lib/animation-presets";

export default function HeroBanner() {
  const { t }   = useTranslation();
  const reduced = useReducedMotion();

  const item = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { ...easeOut, delay },
  });

  return (
    <section className="w-full bg-brand-bg py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-4">

        {/* Left — text + CTAs */}
        <div className="flex flex-col gap-5 flex-1">
          <motion.p className="text-sm font-semibold text-brand-blue uppercase tracking-widest" {...item(0)}>
            {t("home.badge")}
          </motion.p>
          <motion.h1 className="text-5xl font-bold text-brand-dark leading-[1.15]" {...item(0.12)}>
            {t("home.title")}
          </motion.h1>
          <motion.p className="text-base text-brand-body leading-relaxed max-w-[520px]" {...item(0.24)}>
            {t("home.subtitle")}
          </motion.p>
          <motion.div className="flex items-center gap-4 flex-wrap" {...item(0.36)}>
            <Button asChild size="lg">
              <Link href="/courses">{t("home.exploreCourses")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#how-it-works">{t("home.learnMore")}</Link>
            </Button>
          </motion.div>
        </div>

        {/* Right — Lottie animation */}
        <motion.div
          className="flex-1 flex justify-center"
          initial={reduced ? false : { opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...easeOut, delay: 0.2 }}
        >
          <DotLottieReact
            src="/Online Learning Platform.lottie"
            loop
            autoplay
            className="w-full max-w-[420px]"
          />
        </motion.div>

      </div>
    </section>
  );
}
