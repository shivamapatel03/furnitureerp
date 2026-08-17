import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Secret Code",
      credentials: {
        code: { label: "Secret Code", type: "password" }
      },
      async authorize(credentials) {
        const enteredCode = credentials?.code?.trim();
        if (!enteredCode) {
          return null;
        }

        // 1. Check custom secret code from DB settings
        let dbSecretCode = "";
        try {
          const setting = await prisma.setting.findUnique({
            where: { key: "secretAccessCode" }
          });
          if (setting && setting.value) {
            dbSecretCode = setting.value.trim();
          }
        } catch (e) {
          console.warn("Could not read secretAccessCode from DB:", e);
        }

        // Valid default master codes: "2026", "7890", "admin123", "bhurjala"
        const validCodes = [
          dbSecretCode,
          "2026",
          "7890",
          "admin123",
          "bhurjala",
          "bhurjala2026"
        ].filter(Boolean);

        // 2. Also check if matches any user password in DB
        let isUserMatch = false;
        let matchedUser: any = null;
        try {
          const users = await prisma.user.findMany();
          for (const u of users) {
            if (await bcrypt.compare(enteredCode, u.password) || enteredCode === u.password) {
              isUserMatch = true;
              matchedUser = u;
              break;
            }
          }
        } catch (e) {
          // DB fallback
        }

        if (validCodes.includes(enteredCode) || isUserMatch) {
          return {
            id: matchedUser?.id || "admin-master",
            name: matchedUser?.name || "Administrator",
            email: matchedUser?.email || "admin@bhurjala.com",
            role: matchedUser?.role || "ADMIN",
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecret123"
}
