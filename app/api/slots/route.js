import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import ParkingSlot from "@/models/ParkingSlot";
import { requireAdmin } from "@/lib/auth";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const zone = searchParams.get("zone");
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  const q = {};
  if (zone) q.zone = zone;
  if (status) q.status = status;
  if (type) q.type = type;

  const slots = await ParkingSlot.find(q).sort({ zone: 1, slotCode: 1 });
  return NextResponse.json(slots);
}

export async function POST(req) {
  requireAdmin();
  await dbConnect();
  const body = await req.json();

  const created = await ParkingSlot.create({
    slotCode: body.slotCode,
    zone: body.zone,
    type: body.type || "car",
    status: body.status || "active",
  });

  return NextResponse.json(created, { status: 201 });
}