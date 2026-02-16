import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  await dbConnect();
  const { email, password } = await req.json();

  const user = await User.findOne({ email: (email || "").toLowerCase() });
  if (!user) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

  const ok = await bcrypt.compare(password || "", user.passwordHash);
  if (!ok) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

  const token = signToken({ id: user._id.toString(), role: user.role, name: user.name, email: user.email });
  setAuthCookie(token);

  return NextResponse.json({ id: user._id, name: user.name, email: user.email, role: user.role });
}