import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HowItWorks from "@/components/HowItWorks";
import CoursesSection from "@/components/CoursesSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroBanner />
      <FeaturesSection />
      <HowItWorks />
      <CoursesSection />
    </>
  );
}
