import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Run on every route except API routes (the keepalive cron must not be
  // redirected to /login), static assets, and images.
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
