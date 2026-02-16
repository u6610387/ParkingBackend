import mongoose from "mongoose";

const ParkingSlotSchema = new mongoose.Schema(
  {
    slotCode: { type: String, required: true, unique: true, trim: true },
    zone: { type: String, required: true, trim: true },
    type: { type: String, enum: ["car", "motorcycle", "ev", "disabled", "other"], default: "car" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.ParkingSlot || mongoose.model("ParkingSlot", ParkingSlotSchema);