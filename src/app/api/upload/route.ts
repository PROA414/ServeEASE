import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `bookings/${session.user.id}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

  const blob = await put(filename, buffer, {
    contentType: file.type,
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}
