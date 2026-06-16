import type { NextAuthConfig, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { AdapterUser } from "next-auth/adapters";

export type UserRole = "admin" | "teacher" | "student";

/**
 * Edge-safe auth config — no Node.js APIs, no providers.
 * Used by middleware. The full config (with Credentials provider) is in auth.ts.
 */
export const authConfig = {
  secret: process.env.AUTH_SECRET,

  pages: {
    signIn: "/signin",
  },

  session: { strategy: "jwt" as const },

  callbacks: {
    jwt({ token, user }: { token: JWT; user?: User | AdapterUser }) {
      if (user) {
        token.role   = (user as User & { role: UserRole }).role;
        token.userId = (user as User & { userId: string }).userId;
      }
      return token;
    },

    session({ session, token }: { session: Session; token: JWT }) {
      const s = session as Session & { user: { role: UserRole; userId: string } };
      s.user.role   = token.role as UserRole;
      s.user.userId = token.userId as string;
      return s;
    },
  },

  providers: [],
} satisfies NextAuthConfig;
