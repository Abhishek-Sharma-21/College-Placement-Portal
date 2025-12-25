import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import apiRouter from "./routes/apiRouter.js";
import { notFound } from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandle.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(helmet());
const FRONTEND_ORIGIN = " http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// ensure preflight requests respond with correct CORS headers
app.options("*", cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

//api handler
app.use("/api", apiRouter);

// 404 handler
app.use(notFound);

// error handler
app.use(errorHandler);

export default app;
