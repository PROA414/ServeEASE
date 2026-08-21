import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth";

export const getSession = cache(async () => {
  const ctx = await headers();
  return auth.api.getSession({ headers: ctx });
});

export type Session = Awaited<ReturnType<typeof getSession>>;
