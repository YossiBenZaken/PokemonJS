import { query } from "../config/database.js";

export const System = async (socket) => {
  socket.on("getOnline", async (callback) => {
    try {
      const { acc_id } = socket.user;
      const result = await query(
        `SELECT user_id, username, premiumaccount, admin, rang, dv 
                 FROM gebruikers 
                 WHERE (online + 900) >= UNIX_TIMESTAMP() AND banned = 'N'
                 ORDER BY admin DESC, points DESC, rang ASC, user_id ASC`
      );
      if (acc_id) {
        await query(
          `UPDATE gebruikers SET online = UNIX_TIMESTAMP() WHERE acc_id = ?`,
          [acc_id]
        );
      }
      callback({ success: true, users: result, total: result.length });
    } catch (error) {
      callback({
        success: false,
        message: "שגיאה פנימית בשרת",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });
};
