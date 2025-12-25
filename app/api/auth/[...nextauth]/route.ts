import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";
import type { JWT } from "next-auth/jwt";
import type { Account, Profile, User } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            email: credentials.email,
            password: credentials.password,
          }
        );

        const { token, user } = res.data;

        // ✅ MUST return User
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          accessToken: token,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: User;
      account: Account | null;
      profile?: Profile;
    }) {
      if (account?.provider === "google") {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/google-sync`,
          {
            email: profile?.email,
            name: profile?.name,
            image: profile?.image,
          }
        );

        user.accessToken = res.data.token;
        user.id = res.data.user.id;
      }

      return true;
    },

    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: User;
    }) {
      // Runs on first login
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
      }

      return token;
    },

    async session({
      session,
      token,
    }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.id as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
