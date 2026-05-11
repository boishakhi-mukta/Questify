const courses = [
  { id: 1, name: "Introduction to Web Development", level: "Bachelor", campus: "Halden", credit: 10, semester: "Spring 2025", category: "Technology" },
  { id: 2, name: "Data Structures and Algorithms", level: "Bachelor", campus: "Halden", credit: 10, semester: "Spring 2025", category: "CS" },
  { id: 3, name: "Human-Computer Interaction", level: "Master", campus: "Halden", credit: 10, semester: "Fall 2025", category: "Design" },
  { id: 4, name: "Machine Learning Fundamentals", level: "Master", campus: "Halden", credit: 10, semester: "Spring 2025", category: "AI" },
  { id: 5, name: "Cloud Computing with Azure", level: "Bachelor", campus: "Halden", credit: 10, semester: "Fall 2025", category: "Cloud" },
  { id: 6, name: "Software Quality Assurance", level: "Bachelor", campus: "Halden", credit: 10, semester: "Spring 2025", category: "Testing" },
];

function Pill({ label }) {
  return (
    <span
      style={{
        background: "#F3F2EE",
        color: "#434649",
        fontSize: "12px",
        borderRadius: "20px",
        padding: "3px 10px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function CourseCard({ course }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E0DFDC",
        borderRadius: "4px",
        padding: "20px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        transition: "box-shadow 200ms, transform 200ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
        e.currentTarget.style.transform = "scale(1.03)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {/* Course name */}
      <p
        style={{
          fontSize: "16px",
          fontWeight: 700,
          color: "#1D2226",
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {course.name}
      </p>

      {/* Pills row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        <Pill label={course.level} />
        <Pill label={course.campus} />
        <Pill label={`${course.credit} Credits`} />
        <Pill label={course.semester} />
      </div>
    </div>
  );
}

export default function CoursesSection() {
  return (
    <section className="w-full bg-linkedin-white">
      <div className="max-w-6xl mx-auto" style={{ padding: "64px 48px" }}>
        {/* Heading */}
        <h2
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#1D2226",
            margin: "0 0 14px",
            lineHeight: 1.2,
            textAlign: "center",
          }}
        >
          Explore Courses
        </h2>

        {/* Subtext */}
        <p
          style={{
            fontSize: "15px",
            color: "#434649",
            margin: "0 auto 40px",
            maxWidth: "600px",
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          Browse our catalogue and enroll in courses to start earning points and climbing the leaderboard.
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
