import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  await dbConnect();
  const { name, email, password } = await req.json();

  if (!name || !email || !password) return NextResponse.json({ message: "Missing fields" }, { status: 400 });

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return NextResponse.json({ message: "Email already used" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role: "user" });

  const token = signToken({ id: user._id.toString(), role: user.role, name: user.name, email: user.email });
  setAuthCookie(token);

  return NextResponse.json({ id: user._id, name: user.name, email: user.email, role: user.role }, { status: 201 });
}