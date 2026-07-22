"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { HiArrowRight } from "react-icons/hi2";

const FAN_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=600&q=80",
    alt: "Students studying together outdoors",
    width: "clamp(160px, 30%, 280px)",
    aspect: "4/3",
    rotate: -25,
    left: "25%",
    bottom: "-50px",
    z: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=700&q=80",
    alt: "Students in a university lecture hall",
    width: "clamp(200px, 38%, 350px)",
    aspect: "4/3",
    rotate: -12,
    left: "40%",
    bottom: "-10px",
    z: 2,
  },
  {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
    alt: "Students collaborating on a group project",
    width: "clamp(255px, 42%, 460px)",
    aspect: "4/3",
    rotate: 0,
    left: "50%",
    bottom: "0px",
    z: 4,
  },
  {
    src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700&q=80",
    alt: "Student studying at university desk",
    width: "clamp(200px, 38%, 350px)",
    aspect: "4/3",
    rotate: 12,
    left: "60%",
    bottom: "10px",
    z: 2,
  },
  {
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80",
    alt: "Student working on a laptop",
    width: "clamp(160px, 30%, 280px)",
    aspect: "4/3",
    rotate: 25,
    left: "74%",
    bottom: "20px",
    z: 1,
  },
];


// The big homepage banner: headline, subtitle, "Explore Courses" button,
// and the fanned-out stack of photos underneath.
export default function HeroBanner() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // A shared "fade up and settle in" animation, with an optional delay so
  // each piece (heading, subtitle, button, photos) appears one after another.
  const item = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.55,
      delay,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  });

  return (
    <section
      id="main-content"
      className="flex flex-col items-center w-full px-3 sm:px-4 pt-6 sm:pt-8 md:pt-12 lg:pt-14 pb-8 sm:pb-10 flex-none lg:flex-1 gap-3"
    >
      {/* Heading */}
      <motion.h1
        {...item(0.04)}
        className="text-[clamp(1.75rem,4vw,3.25rem)] font-bold leading-[1.15] text-brand-dark text-center max-w-5xl"
      >
        {t("home.titleLine1")}{" "}
        <em className="not-italic text-brand-blue">{t("home.titleAccent")}</em>
        <br />
        <span className="block whitespace-normal sm:whitespace-nowrap">
          {t("home.titleLine2")}
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        {...item(0.1)}
        className="text-[16px] text-brand-body/80 leading-relaxed text-center max-w-[580px]"
      >
        {t("home.subtitle")}
      </motion.p>

      {/* CTA */}
      <motion.div {...item(0.16)}>
        <Button
          asChild
          size="lg"
          className="rounded-full px-8 h-12 gap-2 shadow-md shadow-brand-blue/25 hover:shadow-brand-blue/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          <Link href="/courses">
            {t("home.exploreCourses")}
            <HiArrowRight size={15} />
          </Link>
        </Button>
      </motion.div>

      {/* ── Image composition — cascading fan of 5 photos ── */}
      <motion.div
        {...item(0.22)}
        className="relative w-full max-w-[980px] h-48 sm:h-56 md:h-72 flex-none lg:h-auto lg:aspect-auto lg:flex-1"
      >
        {FAN_IMAGES.map((img, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <div
              key={img.src}
              className="absolute rounded-[20px] overflow-hidden cursor-pointer"
              style={{
                width: img.width,
                aspectRatio: img.aspect,
                bottom: 0,
                left: img.left,
                zIndex: isHovered ? 20 : img.z,
                transformOrigin: "bottom center",
                transform: `translateX(-50%) translateY(${isHovered ? "-14px" : "0px"}) rotate(${img.rotate}deg)`,
                transition:
                  "transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease, z-index 0s",
                boxShadow: isHovered
                  ? "0 28px 64px rgba(0,0,0,0.26), 0 8px 20px rgba(0,0,0,0.12)"
                  : img.rotate === 0
                    ? "0 20px 60px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)"
                    : "0 12px 32px rgba(0,0,0,0.14)",
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="25vw"
                priority={img.rotate === 0}
              />
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}
