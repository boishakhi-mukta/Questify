import Navbar from "@/components/Navbar";
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
      <TestimonialsSection />
      <HowItWorks />
      <CoursesSection />
    </>
  );
}
