import mongoose from "mongoose";
import dns from "node:dns";

const connectDB = async () => {
  try {
    // Optional DNS
    if (process.env.DNS_SERVERS) {
      dns.setServers(
        process.env.DNS_SERVERS
          .split(",")
          .map((server) => server.trim())
          .filter(Boolean)
      );
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
