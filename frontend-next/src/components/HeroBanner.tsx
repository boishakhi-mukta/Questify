"use client";

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
    width: "clamp(150px, 22%, 230px)",
    aspect: "4/3",
    rotate: -14,
    left: "10%",
    z: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=700&q=80",
    alt: "Students in a university lecture hall",
    width: "clamp(150px, 22%, 230px)",
    aspect: "4/3",
    rotate: -7,
    left: "25%",
    z: 2,
  },
  {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
    alt: "Students collaborating on a group project",
    width: "clamp(240px, 44%, 480px)",
    aspect: "3/2",
    rotate: 0,
    left: "50%",
    z: 3,
  },
  {
    src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700&q=80",
    alt: "Student studying at university desk",
    width: "clamp(150px, 22%, 230px)",
    aspect: "4/3",
    rotate: 7,
    left: "75%",
    z: 2,
  },
  {
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80",
    alt: "Student working on a laptop",
    width: "clamp(150px, 22%, 230px)",
    aspect: "4/3",
    rotate: 14,
    left: "90%",
    z: 1,
  },
];

export default function HeroBanner() {
  const { t }   = useTranslation();
  const reduced = useReducedMotion();

  const item = (delay: number) => ({
    initial:    reduced ? false : { opacity: 0, y: 18 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  });

  return (
    <section
      id="main-content"
      className="flex flex-col items-center w-full px-5 sm:px-6 pt-8 sm:pt-10 md:pt-12 lg:pt-14 pb-5 sm:pb-6 flex-1"
    >
      {/* Heading */}
      <motion.h1
        {...item(0.04)}
        className="text-[clamp(2.2rem,5vw,4.25rem)] font-extrabold leading-[1.15] text-brand-dark text-center mb-4 sm:mb-5 md:mb-6 max-w-5xl"
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
        className="text-[15px] text-brand-body/80 leading-relaxed text-center max-w-[580px] mb-8 sm:mb-9 md:mb-10 lg:mb-11"
      >
        {t("home.subtitle")}
      </motion.p>

      {/* CTA */}
      <motion.div {...item(0.16)} className="mb-11 sm:mb-12 md:mb-14 lg:mb-16">
        <Button
          asChild
          size="lg"
          className="rounded-full px-8 h-12 gap-2 shadow-md shadow-brand-blue/25 hover:shadow-brand-blue/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          <Link href="/courses">
            {t("home.exploreCourses")}
            <HiArrowRight size={17} />
          </Link>
        </Button>
      </motion.div>

      {/* ── Image composition — cascading fan of 5 photos ── */}
      <motion.div
        {...item(0.22)}
        className="relative w-full max-w-[980px] aspect-[49/16] flex-none lg:aspect-auto lg:flex-1"
      >
        {FAN_IMAGES.map((img) => (
          <div
            key={img.src}
            className="absolute rounded-[20px] overflow-hidden"
            style={{
              width: img.width,
              aspectRatio: img.aspect,
              bottom: 0,
              left: img.left,
              zIndex: img.z,
              transformOrigin: "bottom center",
              transform: `translateX(-50%) rotate(${img.rotate}deg)`,
              boxShadow:
                img.rotate === 0
                  ? "0 20px 60px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)"
                  : "0 12px 32px rgba(0,0,0,0.14)",
            }}
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
        ))}
      </motion.div>
    </section>
  );
}
