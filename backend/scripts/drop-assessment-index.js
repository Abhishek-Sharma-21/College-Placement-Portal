/**
 * Script to drop the unique index on the 'job' field in the assessments collection
 *
 * This script removes the unique constraint that prevents multiple assessments
 * from having the same job ID or null value.
 *
 * Run this script once to fix the duplicate key error:
 * node scripts/drop-assessment-index.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Assessment from "../src/model/assessment.model.js";

dotenv.config();

async function dropIndex() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error("MONGODB_URI is not set in environment");
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const collection = mongoose.connection.db.collection("assessments");

    // Get all indexes
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes);

    // Drop the unique index on 'job' field if it exists
    try {
      await collection.dropIndex("job_1");
      console.log("✓ Successfully dropped unique index on 'job' field");
    } catch (err) {
      if (err.code === 27 || err.message.includes("index not found")) {
        console.log(
          "ℹ Index 'job_1' does not exist (may have already been dropped)"
        );
      } else {
        throw err;
      }
    }

    // Verify indexes after dropping
    const indexesAfter = await collection.indexes();
    console.log("Indexes after operation:", indexesAfter);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    console.log(
      "\n✓ Index removal complete! You can now create multiple assessments with the same job ID."
    );
  } catch (error) {
    console.error("Error dropping index:", error);
    process.exit(1);
  }
}

dropIndex();
