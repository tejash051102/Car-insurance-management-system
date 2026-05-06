import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    make: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true
    },
    vehicleType: {
      type: String,
      enum: ["car", "suv", "truck", "van", "other"],
      default: "car"
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "hybrid", "cng"],
      default: "petrol"
    },
    chassisNumber: {
      type: String,
      trim: true
    },
    engineNumber: {
      type: String,
      trim: true
    },
    value: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
