import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { mockUsers } from "./mock-users";

export type UserRole = "admin" | "teacher" | "student";

declare module "next-auth" {
  interface User {
    role: UserRole;
    userId: string;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      userId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    userId: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,

  pages: {
    signIn: "/signin",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role   = user.role;
        token.userId = user.userId;
      }
      return token;
    },

    session({ session, token }) {
      session.user.role   = token.role;
      session.user.userId = token.userId;
      return session;
    },
  },

  providers: [
    Credentials({
      credentials: {
        userId:   { label: "User ID",  type: "text"     },
        password: { label: "Password", type: "password" },
        role:     { label: "Role",     type: "text"     },
      },
      async authorize(credentials) {
        const userId   = credentials?.userId   as string | undefined;
        const password = credentials?.password as string | undefined;
        const role     = credentials?.role     as string | undefined;

        if (!userId || !password || !role) return null;

        const user = mockUsers.find(
          (u) => u.userId === userId && u.role === role && u.password === password
        );

        if (!user) return null;

        return {
          id:     user.id,
          name:   user.name,
          email:  user.email,
          role:   user.role as UserRole,
          userId: user.userId,
        };
      },
    }),
  ],
});
