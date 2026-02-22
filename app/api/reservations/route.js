import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Reservation from "@/models/Reservation";
import ParkingSlot from "@/models/ParkingSlot";
import { requireUser } from "@/lib/auth";
import { assertTimeRange } from "@/lib/validators";

export async function GET(req) {
  const u = requireUser();
  await dbConnect();

  const now = new Date();
  await Reservation.updateMany(
    { status: "active", endTime: { $lt: now } },
    { $set: { status: "expired" } }
  );

  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine");
  const status = searchParams.get("status");

  const q = {};
  if (mine === "1") q.userId = u.id;
  if (status) q.status = status;

  const list = await Reservation.find(q).populate("slotId").sort({ startTime: -1 });
  return NextResponse.json(list);
}

export async function POST(req) {
  const u = requireUser();
  await dbConnect();

  const { slotId, startTime, endTime } = await req.json();
  if (!slotId) return NextResponse.json({ message: "slotId required" }, { status: 400 });

  const { s, e } = assertTimeRange(startTime, endTime);

  const slot = await ParkingSlot.findById(slotId);
  if (!slot || slot.status !== "active") {
    return NextResponse.json({ message: "Slot not available" }, { status: 400 });
  }

  const conflict = await Reservation.findOne({
    slotId,
    status: "active",
    startTime: { $lt: e },
    endTime: { $gt: s },
  });

  if (conflict) {
    return NextResponse.json({ message: "Time slot already booked" }, { status: 409 });
  }

  const created = await Reservation.create({
    userId: u.id,
    slotId,
    startTime: s,
    endTime: e,
    status: "active",
  });

  return NextResponse.json(created, { status: 201 });
}