import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Claim from "./models/Claim.js";
import Customer from "./models/Customer.js";
import Payment from "./models/Payment.js";
import Policy from "./models/Policy.js";
import User from "./models/User.js";
import Vehicle from "./models/Vehicle.js";

dotenv.config();

const seed = async () => {
  await connectDB();

  await Promise.all([
    Claim.deleteMany(),
    Payment.deleteMany(),
    Policy.deleteMany(),
    Vehicle.deleteMany(),
    Customer.deleteMany(),
    User.deleteMany()
  ]);

  const admin = await User.create({
    name: "Admin User",
    email: "admin@autosure.com",
    password: "password123",
    role: "admin"
  });

  const customer = await Customer.create({
    firstName: "Aarav",
    lastName: "Mehta",
    email: "aarav.mehta@example.com",
    phone: "+91 98765 43210",
    dateOfBirth: "1990-08-12",
    address: {
      street: "14 MG Road",
      city: "Bengaluru",
      state: "Karnataka",
      zipCode: "560001"
    },
    createdBy: admin._id
  });

  const vehicle = await Vehicle.create({
    customer: customer._id,
    registrationNumber: "KA01AB1234",
    make: "Hyundai",
    model: "Creta",
    year: 2022,
    vehicleType: "suv",
    fuelType: "petrol",
    chassisNumber: "CHS123456789",
    engineNumber: "ENG987654321",
    value: 1250000
  });

  const policy = await Policy.create({
    policyNumber: "POL-10000001",
    customer: customer._id,
    vehicle: vehicle._id,
    type: "comprehensive",
    coverageAmount: 1000000,
    premiumAmount: 28500,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "active",
    notes: "Annual comprehensive coverage"
  });

  await Claim.create({
    claimNumber: "CLM-10000001",
    policy: policy._id,
    customer: customer._id,
    incidentDate: "2026-03-10",
    claimAmount: 42000,
    approvedAmount: 35000,
    status: "under-review",
    description: "Front bumper damage after minor collision"
  });

  await Payment.create({
    paymentNumber: "PAY-10000001",
    policy: policy._id,
    customer: customer._id,
    amount: 28500,
    method: "upi",
    status: "paid",
    transactionId: "UPI123456789"
  });

  console.log("Seed data inserted");
  console.log("Login: admin@autosure.com / password123");
  await mongoose.connection.close();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
