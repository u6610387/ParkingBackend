import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingSlot", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ["active", "cancelled"], default: "active" },
  },
  { timestamps: true }
);

ReservationSchema.index({ slotId: 1, startTime: 1, endTime: 1, status: 1 });

export default mongoose.models.Reservation || mongoose.model("Reservation", ReservationSchema);