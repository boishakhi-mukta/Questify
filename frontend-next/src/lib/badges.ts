/**
 * ============================================================================
 * QUESTIFY LIBRARY: Badges Metadata
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Connects badge name identifiers to asset icons and descriptions.
 * 
 * WHY IT EXISTS:
 * Keeps badge specifications structured in a single location.
 * 
 * HOW IT WORKS (Technical Overview):
 * Exports lookup tables mapping names to badge properties.
 * ============================================================================
 */

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";
export type BadgeColor = "success" | "warning" | "accent" | "danger" | "default";

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: BadgeColor;
  description: string;
  condition: string;
  rarity: BadgeRarity;
}

export const BADGES: Badge[] = [
  // ── Common ─────────────────────────────────────────────────────────────────
  {
    id: "first-login",
    name: "Welcome!",
    icon: "🎉",
    color: "default",
    description: "Joined the Questify platform",
    condition: "Create an account",
    rarity: "common",
  },
  {
    id: "first-course",
    name: "First Course",
    icon: "📚",
    color: "success",
    description: "Enrolled in your first course",
    condition: "Enroll in 1 course",
    rarity: "common",
  },
  {
    id: "rising-star",
    name: "Rising Star",
    icon: "⭐",
    color: "warning",
    description: "Earned your first 100 XP",
    condition: "Earn 100 XP",
    rarity: "common",
  },
  {
    id: "scholar",
    name: "Scholar",
    icon: "🔬",
    color: "accent",
    description: "Enrolled in 3 or more courses",
    condition: "Enroll in 3 courses",
    rarity: "common",
  },
  // ── Rare ───────────────────────────────────────────────────────────────────
  {
    id: "graduate",
    name: "Graduate",
    icon: "🎓",
    color: "success",
    description: "Completed your first course",
    condition: "Complete 1 course",
    rarity: "rare",
  },
  {
    id: "consistent-learner",
    name: "Consistent Learner",
    icon: "🔥",
    color: "warning",
    description: "Earned 500 XP — true dedication",
    condition: "Earn 500 XP",
    rarity: "rare",
  },
  {
    id: "multi-achiever",
    name: "Multi-Achiever",
    icon: "🏅",
    color: "accent",
    description: "Completed 3 or more courses",
    condition: "Complete 3 courses",
    rarity: "rare",
  },
  {
    id: "speed-learner",
    name: "Speed Learner",
    icon: "⚡",
    color: "warning",
    description: "Enrolled in 5 or more courses",
    condition: "Enroll in 5 courses",
    rarity: "rare",
  },
  // ── Epic ───────────────────────────────────────────────────────────────────
  {
    id: "xp-master",
    name: "XP Master",
    icon: "💫",
    color: "accent",
    description: "Earned an impressive 1,000 XP",
    condition: "Earn 1000 XP",
    rarity: "epic",
  },
  {
    id: "top-performer",
    name: "Top Performer",
    icon: "🏆",
    color: "warning",
    description: "Reached the top 10 on the leaderboard",
    condition: "Rank #1–10 on leaderboard",
    rarity: "epic",
  },
  {
    id: "knowledge-seeker",
    name: "Knowledge Seeker",
    icon: "🧠",
    color: "accent",
    description: "Completed 5 or more courses",
    condition: "Complete 5 courses",
    rarity: "epic",
  },
  // ── Legendary ──────────────────────────────────────────────────────────────
  {
    id: "elite",
    name: "Elite",
    icon: "👑",
    color: "danger",
    description: "Mastered the platform with 5,000 XP",
    condition: "Earn 5000 XP",
    rarity: "legendary",
  },
  {
    id: "perfect-attendance",
    name: "Perfect Attendance",
    icon: "✅",
    color: "success",
    description: "100% attendance across all courses",
    condition: "Never miss a class",
    rarity: "legendary",
  },
  {
    id: "leaderboard-king",
    name: "Leaderboard King",
    icon: "💎",
    color: "accent",
    description: "Reached #1 on the global leaderboard",
    condition: "Rank #1 on leaderboard",
    rarity: "legendary",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export const RARITY_CHIP_COLOR: Record<
  BadgeRarity,
  "default" | "accent" | "warning" | "danger" | "success"
> = {
  common: "default",
  rare: "accent",
  epic: "warning",
  legendary: "danger",
};

export const RARITY_LABEL: Record<BadgeRarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export const RARITY_BORDER: Record<BadgeRarity, string> = {
  common: "border-brand-border dark:border-white/10",
  rare: "border-blue-300 dark:border-blue-600/40 shadow-sm shadow-blue-100 dark:shadow-blue-950/40",
  epic: "border-purple-300 dark:border-purple-600/40 shadow-sm shadow-purple-100 dark:shadow-purple-950/40",
  legendary:
    "border-yellow-400 dark:border-yellow-500/50 shadow-md shadow-yellow-100 dark:shadow-yellow-950/40",
};

export const RARITY_BG: Record<BadgeRarity, string> = {
  common: "bg-white dark:bg-slate-800/50",
  rare: "bg-blue-50/50 dark:bg-blue-950/20",
  epic: "bg-purple-50/50 dark:bg-purple-950/20",
  legendary: "bg-yellow-50/50 dark:bg-yellow-950/20",
};

export const RARITY_TEXT: Record<BadgeRarity, string> = {
  common: "text-slate-500 dark:text-slate-400",
  rare: "text-blue-600 dark:text-blue-400",
  epic: "text-purple-600 dark:text-purple-400",
  legendary: "text-yellow-600 dark:text-yellow-400",
};
