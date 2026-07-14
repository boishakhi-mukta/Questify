/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useTestimonials
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Custom query hook fetching landing page review quotes.
 * 
 * WHY IT EXISTS:
 * Loads review strings.
 * 
 * HOW IT WORKS (Technical Overview):
 * Fetches static reviews.
 * ============================================================================
 */

export interface Testimonial {
  id: string;
  name: string;
  quoteKey: string;
  roleKey: string;
  initials: string;
  avatarColor: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  { id: "1", name: "Emily Chen",        quoteKey: "testimonials.quote1", roleKey: "testimonials.role1", initials: "EC", avatarColor: "#2563EB", rating: 5 },
  { id: "2", name: "Marcus Williams",   quoteKey: "testimonials.quote2", roleKey: "testimonials.role2", initials: "MW", avatarColor: "#7C3AED", rating: 5 },
  { id: "3", name: "Dr. Sarah Johnson", quoteKey: "testimonials.quote3", roleKey: "testimonials.role3", initials: "SJ", avatarColor: "#059669", rating: 5 },
  { id: "4", name: "Prof. David Kim",   quoteKey: "testimonials.quote4", roleKey: "testimonials.role4", initials: "DK", avatarColor: "#D97706", rating: 5 },
  { id: "5", name: "Aisha Patel",       quoteKey: "testimonials.quote5", roleKey: "testimonials.role5", initials: "AP", avatarColor: "#DC2626", rating: 5 },
  { id: "6", name: "Lena Müller",       quoteKey: "testimonials.quote6", roleKey: "testimonials.role6", initials: "LM", avatarColor: "#0891B2", rating: 5 },
];

export function useTestimonials() {
  return { testimonials: TESTIMONIALS };
}
