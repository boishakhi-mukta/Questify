import { GraduationCap } from "lucide-react";

interface QuestifyLogoProps {
  /** "light" = dark text on light bg (default); "dark" = white text on dark bg */
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: { badge: 30, icon: 15, gap: "gap-2",   text: "text-[17px]" },
  md: { badge: 34, icon: 17, gap: "gap-2.5", text: "text-[19px]" },
  lg: { badge: 40, icon: 20, gap: "gap-3",   text: "text-[22px]" },
};

const OCTAGON = "polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)";

// Draws the Questify logo (the green octagon badge + "Questify" wordmark)
// at a chosen size, and in a color variant that suits either a light or dark background.
export function QuestifyLogo({ variant = "light", size = "md", className }: QuestifyLogoProps) {
  const s = SIZES[size];
  const glow =
    variant === "light"
      ? "drop-shadow(0 3px 10px rgba(37,181,133,0.52)) drop-shadow(0 1px 3px rgba(37,181,133,0.28))"
      : "drop-shadow(0 2px 8px rgba(0,0,0,0.38))";

  return (
    <div className={`flex items-center ${s.gap} ${className ?? ""}`}>
      {/* Octagon badge */}
      <div style={{ filter: glow }} className="shrink-0">
        <div
          className="flex items-center justify-center"
          style={{
            width:      s.badge,
            height:     s.badge,
            background: "#25B585",
            clipPath:   OCTAGON,
          }}
        >
          <GraduationCap size={s.icon} color="white" strokeWidth={2.1} />
        </div>
      </div>

      {/* Wordmark — "Quest" in brand-dark/white, "ify" in primary */}
      <span className={`${s.text} font-extrabold italic tracking-tight leading-none`}>
        <span style={{ color: variant === "dark" ? "#ffffff" : "#1B4332" }}>Quest</span>
        <span style={{ color: "#25B585" }}>ify</span>
      </span>
    </div>
  );
}
