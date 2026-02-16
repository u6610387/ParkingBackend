import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import ParkingSlot from "@/models/ParkingSlot";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req, { params }) {
  requireAdmin();
  await dbConnect();

  const body = await req.json();
  const updated = await ParkingSlot.findByIdAndUpdate(params.id, { $set: body }, { new: true });

  if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req, { params }) {
  requireAdmin();
  await dbConnect();

  const deleted = await ParkingSlot.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}