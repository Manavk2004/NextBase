import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    // Test that auth is configured correctly
    const config = {
      hasDatabase: !!auth,
      socialProviders: Object.keys((auth as any).options?.socialProviders || {}),
      plugins: ((auth as any).options?.plugins || []).map((p: any) => p?.id || "unknown"),
      betterAuthVersion: require("better-auth/package.json").version,
    };
    return NextResponse.json({ status: "ok", config });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
