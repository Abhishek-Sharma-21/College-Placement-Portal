import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRouter from "./routes/apiRouter.js";
import { notFound } from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandle.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://college-placement-porrtal.vercel.app",
  "https://college-placement-porrtal.vercel.app/login",
  "https://college-placement-portal.vercel.app",
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(helmet());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin)) {
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

app.options("*", cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("<h1>👋 Hi! This is the backend of College Placement Portal.</h1><p>API is running successfully.</p>");
});

app.use("/uploads", express.static("uploads"));
app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
