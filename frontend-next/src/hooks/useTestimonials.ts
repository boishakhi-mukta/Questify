export interface Testimonial {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarColor: string;
  quote: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Emily Chen",
    role: "Computer Science Student",
    initials: "EC",
    avatarColor: "#2563EB",
    quote:
      "Questify transformed how I approach learning. The XP system made me actually look forward to submitting assignments — I went from struggling to topping the leaderboard in six weeks.",
    rating: 5,
  },
  {
    id: "2",
    name: "Marcus Williams",
    role: "Software Engineering Student",
    initials: "MW",
    avatarColor: "#7C3AED",
    quote:
      "Seeing my progress bar fill up every time I attend class or read a PDF is oddly satisfying. It's the same dopamine hit as a video game, but I'm actually gaining real skills.",
    rating: 5,
  },
  {
    id: "3",
    name: "Dr. Sarah Johnson",
    role: "Associate Professor, Computer Science",
    initials: "SJ",
    avatarColor: "#059669",
    quote:
      "The attendance tracking and assignment management tools have cut my admin workload in half. I finally spend my time teaching instead of chasing down submission paperwork.",
    rating: 5,
  },
  {
    id: "4",
    name: "Prof. David Kim",
    role: "Senior Lecturer, Data Science",
    initials: "DK",
    avatarColor: "#D97706",
    quote:
      "My students now compete to read more course materials. The per-course leaderboard created a healthy academic rivalry I've never seen from traditional grading alone.",
    rating: 5,
  },
  {
    id: "5",
    name: "Aisha Patel",
    role: "Platform Administrator",
    initials: "AP",
    avatarColor: "#DC2626",
    quote:
      "Managing 50+ courses and 2 000+ students used to be a nightmare. Questify's admin dashboard gives me full visibility over every enrollment, grade, and performance metric in one place.",
    rating: 5,
  },
  {
    id: "6",
    name: "Lena Müller",
    role: "Master's Student, AI & Machine Learning",
    initials: "LM",
    avatarColor: "#0891B2",
    quote:
      "The personalised course recommendations are eerily accurate. Questify suggested a study path I wouldn't have found on my own — and it aligned perfectly with my thesis topic.",
    rating: 5,
  },
];

export function useTestimonials() {
  return { testimonials: TESTIMONIALS };
}
