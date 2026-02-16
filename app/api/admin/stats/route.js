import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Reservation from "@/models/Reservation";
import ParkingSlot from "@/models/ParkingSlot";

export async function GET() {
  requireAdmin();
  await dbConnect();

  const totalSlots = await ParkingSlot.countDocuments({ status: "active" });
  const now = new Date();

  const activeNow = await Reservation.countDocuments({
    status: "active",
    startTime: { $lte: now },
    endTime: { $gte: now },
  });

  const peakHours = await Reservation.aggregate([
    { $match: { status: "active" } },
    { $project: { hour: { $hour: "$startTime" } } },
    { $group: { _id: "$hour", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ]);

  const topZones = await Reservation.aggregate([
    { $match: { status: "active" } },
    {
      $lookup: {
        from: "parkingslots",
        localField: "slotId",
        foreignField: "_id",
        as: "slot",
      },
    },
    { $unwind: "$slot" },
    { $group: { _id: "$slot.zone", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ]);

  const byDow = await Reservation.aggregate([
    { $match: { status: "active" } },
    { $project: { dow: { $dayOfWeek: "$startTime" } } }, // 1=Sun..7=Sat
    { $group: { _id: "$dow", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  return NextResponse.json({
    summary: {
      totalActiveSlots: totalSlots,
      reservedNow: activeNow,
      availableNow: Math.max(totalSlots - activeNow, 0),
    },
    peakHours,
    topZones,
    byDayOfWeek: byDow,
  });
}