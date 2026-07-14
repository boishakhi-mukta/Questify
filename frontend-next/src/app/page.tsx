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
import HowItWorks from "@/components/HowItWorks";
import CoursesSection from "@/components/CoursesSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroBanner />
      <FeaturesSection />
      <StatisticsSection />
      <HowItWorks />
      <CoursesSection />
      <TestimonialsSection />
      <Footer />
    </>
  );
}
