import {
  setupManualCronRoutes,
  startAllCronJobs,
  stopAllCronJobs,
} from "./crons/cron-setup.js";

import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { initializeSocket } from "./socket/socket-handler.js";
import { router } from "./routes/index.js";
import { testConnection } from "./config/database.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // הכתובת של React
    credentials: true, // <--- חייב!
  },
});

initializeSocket(io);

app.use(
  cors({
    origin: "http://localhost:3000", // הכתובת של React
    credentials: true, // <--- חייב!
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(router);

app.get("/", (req, res) => {
  res.send("Pokemon Kanto API is running!");
});

// בדיקת חיבור למסד הנתונים
app.get("/health", async (req, res) => {
  try {
    const dbStatus = await testConnection();
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: dbStatus ? "Connected" : "Disconnected",
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

setupManualCronRoutes(app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`🚀 השרת פועל על פורט ${PORT}`);

  // בדיקת חיבור למסד הנתונים בעת הפעלת השרת
  console.log("🔍 בודק חיבור למסד הנתונים...");
  await testConnection();
  startAllCronJobs();
});

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  stopAllCronJobs();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  stopAllCronJobs();
  process.exit(0);
});
