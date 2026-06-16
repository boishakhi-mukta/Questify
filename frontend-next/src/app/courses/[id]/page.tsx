import CourseDetail from "@/components/CourseDetail";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CourseDetail id={id} />;
}
