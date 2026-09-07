import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { connectMongo } from "./config/db.js";
import app from "./app.js";
import { initSocket } from "./config/socket.js";

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectMongo();
    
    // Wrap app with HTTP server for Socket.io integration
    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`server is listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

start();
