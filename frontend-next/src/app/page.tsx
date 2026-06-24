import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import HowItWorks from "@/components/HowItWorks";
import CoursesSection from "@/components/CoursesSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroBanner />
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <CoursesSection />
    </>
  );
}
