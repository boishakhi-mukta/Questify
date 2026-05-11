import { HiCalendar, HiDocumentCheck, HiBookOpen, HiTrophy } from "react-icons/hi2";

const cards = [
  {
    icon: HiCalendar,
    iconColor: "#3B62D9",
    bg: "#EBF1FB",
    title: "+10 pts — Attendance",
    desc: "Get marked present in a class to earn attendance points for that course.",
  },
  {
    icon: HiDocumentCheck,
    iconColor: "#2A9D6E",
    bg: "#E6F4EE",
    title: "+25 pts — Assignment",
    desc: "Submit your assignments on time and earn bonus points toward your course rank.",
  },
  {
    icon: HiBookOpen,
    iconColor: "#D97706",
    bg: "#FEF6E4",
    title: "+15 pts — Reading PDF",
    desc: "Read course PDF materials on the platform to accumulate reading points.",
  },
  {
    icon: HiTrophy,
    iconColor: "#7C3AED",
    bg: "#EDE9FB",
    title: "Leaderboard Ranking",
    desc: "Each course has its own leaderboard. Compete with peers and top the rankings.",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full bg-linkedin-white">
      <div
        className="max-w-6xl mx-auto"
        style={{ padding: "64px 48px" }}
      >
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
          Learn. Earn Points. Climb the Leaderboard.
        </h2>

        {/* Subtext */}
        <p
          style={{
            fontSize: "15px",
            color: "#434649",
            margin: "0 auto 40px",
            maxWidth: "680px",
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          Every action you take earns you points — attend classes, submit
          assignments, and read course materials to rise through the rankings.
        </p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map(({ icon: Icon, iconColor, bg, title, desc }) => (
            <div
              key={title}
              style={{
                background: bg,
                borderRadius: "10px",
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {/* Icon */}
              <Icon size={44} color={iconColor} />

              {/* Title */}
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#1D2226",
                  margin: 0,
                }}
              >
                {title}
              </p>

              {/* Description */}
              <p
                style={{
                  fontSize: "14px",
                  color: "#434649",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
