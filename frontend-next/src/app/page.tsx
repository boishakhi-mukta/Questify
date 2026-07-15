/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Marketing Landing Page
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * The public home page showing features, statistics, and call-to-action buttons.
 * 
 * WHY IT EXISTS:
 * Gateway introduction to new users.
 * 
 * HOW IT WORKS (Technical Overview):
 * Implements HeroBanner, Features, Stats, and HowItWorks components.
 * ============================================================================
 */

import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/HeroBanner";
import FeaturesSection from "@/components/sections/FeaturesSection";
import StatisticsSection from "@/components/sections/StatisticsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import AdmissionSection from "@/components/sections/AdmissionSection";
import HowItWorks from "@/components/HowItWorks";
import CoursesSection from "@/components/CoursesSection";

const HERO_BG =
  "radial-gradient(120% 90% at 50% 78%, rgba(238,250,244,0.9) 0%, rgba(238,250,244,0) 60%), " +
  "linear-gradient(180deg, #b7d3c5 0%, #c4dcd0 30%, #cfe4d7 62%, #d9eee0 100%)";

export default function Home() {
  return (
    <>
      <Navbar />
      {/* Full-width hero — gradient edge to edge, no horizontal padding */}
      <div style={{ background: HERO_BG, minHeight: "85vh", display: "flex", flexDirection: "column" }}>
        <HeroBanner />
      </div>

      <FeaturesSection />
      <StatisticsSection />
      <HowItWorks />
      <CoursesSection />
      <AdmissionSection />
      <TestimonialsSection />
      <Footer />
    </>
  );
}
