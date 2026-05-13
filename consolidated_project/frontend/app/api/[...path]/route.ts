import { NextRequest } from "next/server";
import { auth } from "@/auth";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

// Hop-by-hop / browser-only headers that should not be forwarded upstream.
const STRIP_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "accept-encoding",
  "transfer-encoding",
  "cookie",
]);

async function proxy(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await ctx.params;
  const session = await auth();

  const target = new URL(`${BACKEND_URL}/api/${path.join("/")}`);
  const incoming = new URL(req.url);
  incoming.searchParams.forEach((v, k) => target.searchParams.append(k, v));

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!STRIP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  if (session?.accessToken) {
    headers.set("authorization", `Bearer ${session.accessToken}`);
  }

  const init: RequestInit & { duplex?: "half" } = {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
    duplex: "half",
    redirect: "manual",
    cache: "no-store",
  };

  const upstream = await fetch(target, init);

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
