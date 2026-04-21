import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

/**
 * JWT cookies are encrypted with this secret. No hardcoded fallback — set `NEXTAUTH_SECRET`
 * in `frontend/.env.local` (never commit that file). If the secret changes, clear `localhost`
 * cookies once to avoid `JWT_SESSION_ERROR` / decryption failed.
 */
function resolveNextAuthSecret(): string {
    const fromEnv = process.env.NEXTAUTH_SECRET?.trim()
    if (fromEnv) return fromEnv
    throw new Error(
        "NEXTAUTH_SECRET is required. Copy `prototypes/ethan/frontend/.env.example` to `.env.local`, set NEXTAUTH_SECRET (e.g. openssl rand -base64 32), restart `npm run dev`.",
    )
}

/**
 * NextAuth config.
 *
 * Current: mock Credentials provider so the UI can be built before backend auth exists.
 * Backend plan: swap/extend providers (e.g. Google/Microsoft/GitHub, or your own Credentials
 * that validates against your DB) and return a real user id.
 */
export const authOptions: NextAuthOptions = {
    secret: resolveNextAuthSecret(),
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

