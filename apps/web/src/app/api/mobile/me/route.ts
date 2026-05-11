import { NextResponse } from "next/server";
import { requireMobileAuth, handleMobileAuthError } from "@/lib/mobile-auth";

export async function GET(req: Request) {
  try {
    const user = await requireMobileAuth(req);
    return NextResponse.json({ user });
  } catch (e) {
    const r = handleMobileAuthError(e);
    if (r) return r;
    console.error("mobile/me error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
