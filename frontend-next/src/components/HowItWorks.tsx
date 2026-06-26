import { HiCalendar, HiDocumentCheck, HiBookOpen, HiTrophy } from "react-icons/hi2";
import type { IconType } from "react-icons";

interface Card {
  icon: IconType;
  iconColorClass: string;
  bgClass: string;
  title: string;
  desc: string;
}

const cards: Card[] = [
  {
    icon: HiCalendar,
    iconColorClass: "text-[#3B62D9]",
    bgClass: "bg-[#EBF1FB]",
    title: "+10 pts — Attendance",
    desc: "Get marked present in a class to earn attendance points for that course.",
  },
  {
    icon: HiDocumentCheck,
    iconColorClass: "text-[#2A9D6E]",
    bgClass: "bg-[#E6F4EE]",
    title: "+25 pts — Assignment",
    desc: "Submit your assignments on time and earn bonus points toward your course rank.",
  },
  {
    icon: HiBookOpen,
    iconColorClass: "text-[#D97706]",
    bgClass: "bg-[#FEF6E4]",
    title: "+15 pts — Reading PDF",
    desc: "Read course PDF materials on the platform to accumulate reading points.",
  },
  {
    icon: HiTrophy,
    iconColorClass: "text-[#7C3AED]",
    bgClass: "bg-[#EDE9FB]",
    title: "Leaderboard Ranking",
    desc: "Each course has its own leaderboard. Compete with peers and top the rankings.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full bg-white">
      <div className="max-w-6xl mx-auto py-16 px-6 md:px-12">

        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-12">
          <p className="text-sm font-semibold text-brand-blue uppercase tracking-widest mb-3">
            The XP System
          </p>
          <h2 className="text-[32px] font-bold text-brand-dark mb-3.5 leading-tight">
            Learn. Earn Points. Climb the Leaderboard.
          </h2>
          <p className="text-[15px] text-brand-body leading-relaxed max-w-[680px]">
            Every action you take earns you points — attend classes, submit
            assignments, and read course materials to rise through the rankings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map(({ icon: Icon, iconColorClass, bgClass, title, desc }) => (
            <div
              key={title}
              className={`${bgClass} rounded-[10px] p-7 flex flex-col gap-3.5`}
            >
              <Icon size={44} className={iconColorClass} />
              <p className="text-base font-bold text-brand-dark">{title}</p>
              <p className="text-sm text-brand-body leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
