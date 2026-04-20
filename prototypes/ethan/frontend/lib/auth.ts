import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

/**
 * NextAuth config.
 *
 * Current: mock Credentials provider so the UI can be built before backend auth exists.
 * Backend plan: swap/extend providers (e.g. Google/Microsoft/GitHub, or your own Credentials
 * that validates against your DB) and return a real user id.
 */
export const authOptions: NextAuthOptions = {
    session: { strategy: "jwt" },
    pages: {
        signIn: "/auth/signin",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "demo@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = credentials?.email?.trim()
                const password = credentials?.password

                // Mock login: any non-empty email + password "demo" gets in.
                if (!email || password !== "demo") return null

                return {
                    id: "demo-user",
                    name: "Demo User",
                    email,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.sub = (user as any).id ?? token.sub
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                ;(session.user as any).id = token.sub
            }
            return session
        },
    },
}

