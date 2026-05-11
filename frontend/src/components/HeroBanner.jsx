import { Link } from "react-router";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function HeroBanner() {
  return (
    <section
      style={{ background: "#F3F2EE", padding: "64px 48px" }}
      className="w-full"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">

        {/* ── Left column ── */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Heading */}
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#1D2226",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Learn the skills to <br /> shape your future
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontSize: "16px",
              color: "#434649",
              lineHeight: 1.7,
              fontStyle: "italic",
              margin: 0,
              maxWidth: "460px",
            }}
          >
            Access world-class courses, earn certifications, and track your
            progress with gamified learning. Taught by expert instructors.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-4 flex-wrap mt-1">
            {/* Primary */}
            <Link
              to="/courses"
              style={{
                borderRadius: "2px",
                padding: "12px 28px",
                fontWeight: 700,
                fontSize: "15px",
                background: "#0A66C2",
                color: "#FFFFFF",
                textDecoration: "none",
                transition: "background 150ms",
                display: "inline-block",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#004182")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#0A66C2")}
            >
              Explore Courses
            </Link>

            {/* Secondary */}
            <Link
              to="/how-it-works"
              style={{
                borderRadius: "2px",
                padding: "12px 28px",
                fontWeight: 700,
                fontSize: "15px",
                background: "transparent",
                color: "#1D2226",
                textDecoration: "none",
                border: "1.5px solid #1D2226",
                transition: "background 150ms, color 150ms",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1D2226";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#1D2226";
              }}
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* ── Right column — Lottie animation ── */}
        <div className="flex-1 flex justify-center w-full">
          <DotLottieReact
            src="/Online Learning Platform.lottie"
            loop
            autoplay
            style={{ width: "100%", maxWidth: "480px" }}
          />
        </div>

      </div>
    </section>
  );
}
