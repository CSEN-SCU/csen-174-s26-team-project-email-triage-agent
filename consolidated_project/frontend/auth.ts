import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const GMAIL_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
].join(" ");

interface RefreshedTokens {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

async function refreshGoogleAccessToken(refreshToken: string): Promise<RefreshedTokens> {
  const params = new URLSearchParams({
    client_id: process.env.AUTH_GOOGLE_ID ?? "",
    client_secret: process.env.AUTH_GOOGLE_SECRET ?? "",
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const json = (await res.json()) as RefreshedTokens & { error?: string };
  if (!res.ok) {
    throw new Error(json.error ?? `refresh failed: ${res.status}`);
  }
  return json;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope: GMAIL_SCOPES,
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        return token;
      }

      const expiresAt = typeof token.expiresAt === "number" ? token.expiresAt : 0;
      const stillValid = Date.now() / 1000 < expiresAt - 60;
      if (stillValid) {
        return token;
      }

      if (!token.refreshToken) {
        token.error = "MissingRefreshToken";
        return token;
      }

      try {
        const refreshed = await refreshGoogleAccessToken(token.refreshToken as string);
        token.accessToken = refreshed.access_token;
        token.expiresAt = Math.floor(Date.now() / 1000) + refreshed.expires_in;
        if (refreshed.refresh_token) {
          token.refreshToken = refreshed.refresh_token;
        }
        token.error = undefined;
      } catch (err) {
        token.error = err instanceof Error ? err.message : "RefreshAccessTokenError";
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
