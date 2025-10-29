import dotenv from "dotenv";
dotenv.config();

import { connectMongo } from "./config/db.js";
import app from "./app.js";
const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`server is listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

start();
