/**
 * ============================================================================
 * QUESTIFY PAGE ROUTE: Courses Directory Search Engine
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Page where users search, sort, and filter available courses.
 * 
 * WHY IT EXISTS:
 * Prompts interactive search configurations.
 * 
 * HOW IT WORKS (Technical Overview):
 * Renders CoursesPageClient, managing course filters state.
 * ============================================================================
 */

import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import CoursesPageClient from "@/components/courses/CoursesPageClient";
import { CourseSkeletonGrid } from "@/components/courses/CourseSkeleton";

function CoursesPageFallback() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="w-48 h-8 bg-brand-bg rounded animate-pulse mb-1" />
          <div className="w-72 h-5 bg-brand-bg rounded animate-pulse mb-6" />
          <div className="w-full h-14 bg-brand-bg rounded-xl animate-pulse" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <CourseSkeletonGrid />
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <>
      <div style={{ background: "radial-gradient(120% 90% at 50% 78%, rgba(238,250,244,0.9) 0%, rgba(238,250,244,0) 60%), linear-gradient(180deg, #b7d3c5 0%, #c4dcd0 30%, #cfe4d7 62%, #d9eee0 100%)" }}>
        <Navbar />
      </div>
      <Suspense fallback={<CoursesPageFallback />}>
        <CoursesPageClient />
      </Suspense>
      <Footer />
    </>
  );
}
