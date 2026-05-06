import asyncHandler from "express-async-handler";
import Vehicle from "../models/Vehicle.js";
import Policy from "../models/Policy.js";

export const getVehicles = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { registrationNumber: { $regex: req.query.search, $options: "i" } },
          { make: { $regex: req.query.search, $options: "i" } },
          { model: { $regex: req.query.search, $options: "i" } }
        ]
      }
    : {};

  const vehicles = await Vehicle.find(keyword).populate("customer").sort({ createdAt: -1 });
  res.json(vehicles);
});

export const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate("customer");

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  res.json(vehicle);
});

export const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.create(req.body);
  const populatedVehicle = await vehicle.populate("customer");
  res.status(201).json(populatedVehicle);
});

export const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate("customer");

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  res.json(vehicle);
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  const linkedPolicyCount = await Policy.countDocuments({ vehicle: req.params.id });

  if (linkedPolicyCount) {
    res.status(400);
    throw new Error("Cannot delete a vehicle with linked policies");
  }

  const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  res.json({ message: "Vehicle deleted successfully" });
});
