import mongoose from "mongoose";

export async function connectMongo() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    const msg = "MONGODB_URI is not set in environment";
    console.error(msg);
    throw new Error(msg);
  }
  const err = "Error during Setting MongoDB";

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB Connected");

    mongoose.connection.on("error", (err) =>
      console.error("MongoDB connection error:", err)
    );
  } catch {
    console.log("MongoDB Connection Error");
    throw err;
  }
}

export async function disconnectMongo() {
  try {
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
  } catch (err) {
    console.error("Error while disconnecting MongoDB:", err);
  }
}
