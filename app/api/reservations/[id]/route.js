import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Reservation from "@/models/Reservation";
import { requireUser } from "@/lib/auth";
import { assertTimeRange } from "@/lib/validators";

export async function PUT(req, { params }) {
  const u = requireUser();
  await dbConnect();

  const body = await req.json();
  const resv = await Reservation.findById(params.id);
  if (!resv) return NextResponse.json({ message: "Not found" }, { status: 404 });

  if (resv.userId.toString() !== u.id && u.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  if (resv.status !== "active") {
    return NextResponse.json({ message: "Cannot edit cancelled reservation" }, { status: 400 });
  }

  const { s, e } = assertTimeRange(body.startTime, body.endTime);

  const conflict = await Reservation.findOne({
    _id: { $ne: resv._id },
    slotId: resv.slotId,
    status: "active",
    startTime: { $lt: e },
    endTime: { $gt: s },
  });

  if (conflict) return NextResponse.json({ message: "Time slot already booked" }, { status: 409 });

  resv.startTime = s;
  resv.endTime = e;
  await resv.save();

  return NextResponse.json(resv);
}

export async function DELETE(req, { params }) {
  const u = requireUser();
  await dbConnect();

  const resv = await Reservation.findById(params.id);
  if (!resv) return NextResponse.json({ message: "Not found" }, { status: 404 });

  if (resv.userId.toString() !== u.id && u.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  resv.status = "cancelled";
  await resv.save();

  return NextResponse.json({ ok: true });
}