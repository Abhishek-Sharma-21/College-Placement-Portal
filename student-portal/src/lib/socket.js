import { io } from "socket.io-client";
import { API_BASE_URL } from "./api";

let socket = null;

export const initiateSocketConnection = (userId) => {
  if (socket) return socket;

  socket = io(API_BASE_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  console.log("Connecting WebSocket client...");

  socket.on("connect", () => {
    console.log("WebSocket connection established with server!");
    if (userId) {
      socket.emit("register", userId);
    }
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("Disconnecting WebSocket client...");
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
