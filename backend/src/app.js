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

const allowedOrigins = [
  "http://localhost:5173",
  "https://college-placement-porrtal.vercel.app", // Match your current Vercel URL
  "https://college-placement-porrtal.vercel.app/login", // Match your current Vercel URL
  "https://college-placement-portal.vercel.app",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  }),
);

// Ensure preflight requests respond with correct CORS headers
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// API handler
app.use("/api", apiRouter);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
