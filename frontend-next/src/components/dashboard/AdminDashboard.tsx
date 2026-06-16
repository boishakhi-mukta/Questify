import Link from "next/link";
import { HiUsers, HiAcademicCap, HiBookOpen, HiUserCircle } from "react-icons/hi2";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { seedUsers, seedCourses } from "@/lib/admin-store";

const teachers = seedUsers.filter((u) => u.role === "teacher").length;
const students = seedUsers.filter((u) => u.role === "student").length;
const totalUsers = seedUsers.length;
const totalCourses = seedCourses.length;

const stats = [
  { label: "Total Users",    value: totalUsers,   icon: HiUsers,       color: "text-violet-500",  bg: "bg-violet-500/10" },
  { label: "Teachers",       value: teachers,     icon: HiUserCircle,  color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Students",       value: students,     icon: HiAcademicCap, color: "text-brand-blue",  bg: "bg-brand-blue/10" },
  { label: "Courses",        value: totalCourses, icon: HiBookOpen,    color: "text-amber-500",   bg: "bg-amber-500/10" },
];

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Admin Overview</h1>
        <p className="text-sm text-brand-body mt-1">
          Manage your platform — users, teachers, students and courses.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="p-5">
            <CardContent className="p-0 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={24} className={color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-dark leading-none">{value}</p>
                <p className="text-sm text-brand-body mt-1">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-brand-dark">Users</h2>
              <p className="text-sm text-brand-body mt-0.5">
                Create and manage teacher and student accounts.
              </p>
            </div>
            <div className={`w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0`}>
              <HiUsers size={20} className="text-violet-500" />
            </div>
          </div>
          <Button asChild size="sm">
            <Link href="/admin/users">Manage Users</Link>
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-brand-dark">Courses</h2>
              <p className="text-sm text-brand-body mt-0.5">
                Add, update, or remove courses from the catalogue.
              </p>
            </div>
            <div className={`w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0`}>
              <HiBookOpen size={20} className="text-amber-500" />
            </div>
          </div>
          <Button asChild size="sm">
            <Link href="/admin/courses">Manage Courses</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
