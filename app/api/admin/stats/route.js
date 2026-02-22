import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Reservation from "@/models/Reservation";
import ParkingSlot from "@/models/ParkingSlot";

export async function GET() {
  requireAdmin();
  await dbConnect();

  const now = new Date();

  await Reservation.updateMany(
    { status: "active", endTime: { $lt: now } },
    { $set: { status: "expired" } }
  );

  const totalActiveSlots = await ParkingSlot.countDocuments({ status: "active" });

  const reservedNow = await Reservation.countDocuments({
    status: "active",
    startTime: { $lte: now },
    endTime: { $gte: now },
  });

  const availableNow = Math.max(totalActiveSlots - reservedNow, 0);

  const upcomingReservations = await Reservation.countDocuments({
    status: "active",
    startTime: { $gt: now },
  });

  const expiredReservations = await Reservation.countDocuments({
    status: "expired",
  });

  const cancelledReservations = await Reservation.countDocuments({
    status: "cancelled",
  });

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const bookingsToday = await Reservation.countDocuments({
    startTime: { $gte: startOfToday, $lte: endOfToday },
    status: { $in: ["active", "cancelled", "expired"] },
  });

  const peakHours = await Reservation.aggregate([
    {
      $match: {
        startTime: { $gte: startOfToday, $lte: endOfToday },
        status: { $in: ["active", "cancelled", "expired"] },
      },
    },
    { $project: { hour: { $hour: "$startTime" } } },
    { $group: { _id: "$hour", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $limit: 24 },
  ]);

  const topZones = await Reservation.aggregate([
    { $match: { status: { $in: ["active", "cancelled", "expired"] } } },
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
    { $match: { status: { $in: ["active", "cancelled", "expired"] } } },
    { $project: { dow: { $dayOfWeek: "$startTime" } } },
    { $group: { _id: "$dow", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  return NextResponse.json({
    summary: {
      totalActiveSlots,
      reservedNow,
      availableNow,
      upcomingReservations,
      expiredReservations,
      cancelledReservations,
      bookingsToday,
    },
    peakHours,
    topZones,
    byDayOfWeek: byDow,
  });
}