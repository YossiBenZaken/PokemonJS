import { Auth } from "./auth.js";
import { System } from "./system.js";
import jwt from "jsonwebtoken";

export function initializeSocket(io) {
  io.use((socket, next) => {
    // 🔒 נבדוק את ה-Token שמגיע מה-client
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_secret"
      );
      socket.user = { ...decoded }; // נצרף את המידע למופע ה-socket
      next();
    } catch (err) {
      console.log("❌ טוקן לא תקין:", err.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    // 1️⃣ ניצור טיימר לניתוק אחרי 10 דקות
    const disconnectTimer = setTimeout(() => {
      console.log(
        `⏰ ${socket.user.username} מחובר מעל 10 דקות — ניתוק אוטומטי`
      );
      socket.emit("sessionExpired", { reason: "timeout" });
      socket.disconnect(true);
    }, 10 * 60 * 1000); // 10 דקות

    // 2️⃣ אם יש פעילות – נאפס את הטיימר
    socket.onAny(() => {
      clearTimeout(disconnectTimer);
      // מתחילים טיימר חדש
      socket.disconnectTimer = setTimeout(() => {
        console.log(`⏰ ${socket.user.username} נותק מחוסר פעילות`);
        socket.emit("sessionExpired", { reason: "inactivity" });
        socket.disconnect(true);
      }, 10 * 60 * 1000);
    });
    // 3️⃣ כשמתנתק
    socket.on("disconnect", (reason) => {
      clearTimeout(disconnectTimer);
      console.log(`🔴 ${socket.user.username} נותק (${reason})`);
    });
    Auth(socket);
    System(socket);
  });
}
