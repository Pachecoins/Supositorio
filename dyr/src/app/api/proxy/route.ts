import { NextRequest, NextResponse } from "next/server";

const BLOCKED_HEADERS = new Set([
  "x-frame-options",
  "content-security-policy",
  "content-security-policy-report-only",
]);

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("url");

  if (!target) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const origin = parsed.origin;

  let response: Response;
  try {
    response = await fetch(target, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
      // 10 second timeout
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }

  const contentType = response.headers.get("content-type") ?? "text/html";

  // For non-HTML resources just pipe them through
  if (!contentType.includes("text/html")) {
    const body = await response.arrayBuffer();
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    return new NextResponse(body, { status: response.status, headers });
  }

  let html = await response.text();

  // 1. Inject <base> so relative URLs resolve to the newspaper origin
  const baseTag = `<base href="${origin}/">`;
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/(<head[^>]*>)/i, `$1${baseTag}`);
  } else {
    html = baseTag + html;
  }

  // 2. Rewrite absolute links that would navigate away — keep them inside the proxy
  //    (optional: skip for now, pure <base> is enough for rendering)

  // Build clean response headers — drop all frame-blocking ones
  const outHeaders = new Headers();
  outHeaders.set("Content-Type", "text/html; charset=utf-8");
  outHeaders.set("X-Content-Type-Options", "nosniff");

  // Copy safe headers from upstream
  for (const [key, value] of response.headers.entries()) {
    const lower = key.toLowerCase();
    if (BLOCKED_HEADERS.has(lower)) continue;
    if (lower === "content-encoding") continue; // already decoded by fetch
    if (lower === "transfer-encoding") continue;
    if (lower === "content-length") continue; // length changed after injection
    outHeaders.set(key, value);
  }

  return new NextResponse(html, { status: 200, headers: outHeaders });
}
