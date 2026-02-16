import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const u = requireUser();
  return NextResponse.json(u);
}