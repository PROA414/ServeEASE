import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

export async function POST(request: Request) {
  const key = rateLimitKey(request, "email");
  const limit = rateLimit(key, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } },
    );
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { to, subject, html, from } = body as {
    to?: string;
    subject?: string;
    html?: string;
    from?: string;
  };

  if (!to || !subject || !html) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: from ?? process.env.RESEND_FROM_EMAIL ?? "SearveEASE <noreply@example.com>",
      to,
      subject,
      html,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
