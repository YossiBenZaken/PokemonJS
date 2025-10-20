import { query } from "../config/database.js";

export const Safari = async (socket) => {
  socket.on("getMapData", async (mapId, callback) => {
    try {
      const userId = socket.user?.user_id;

      if (!mapId || isNaN(parseInt(mapId))) {
        return callback({ success: false, message: "Invalid map ID" });
      }

      const mapNumber = parseInt(mapId);

      // Validate map range (1-7)
      if (mapNumber < 1 || mapNumber > 7) {
        return callback({ success: false, message: "Map must be between 1-7" });
      }

      // Get map information
      const [mapInfo] = await query("SELECT * FROM maps WHERE id = ?", [
        mapNumber,
      ]);

      if (!mapInfo) {
        return callback({ success: false, message: "Map not found" });
      }

      // Parse tile array (stored as string in database)
      let tileArray;
      try {
        // The tile array is stored as JavaScript array in the database
        // We need to safely parse it
        tileArray = JSON.parse(
          mapInfo.tile
            .replace(/\\r\\n/g, "") // מסיר newlines
            .replace(/\\/g, "") // מסיר backslashes
            .replace(/^var\s+\w+\s*=\s*/, "") // מסיר "var map ="
            .replace(/;$/, "") // מסיר נקודה פסיק בסוף
        );
      } catch (error) {
        console.error("Failed to parse tile array:", error);
        tileArray = [];
      }

      // Get user's last position on this map or use map defaults
      const [userPosition] = await query(
        "SELECT map_x, map_y FROM gebruikers WHERE user_id = ?",
        [userId]
      );

      const startX = userPosition?.map_x || mapInfo.start_x;
      const startY = userPosition?.map_y || mapInfo.start_y;

      callback({
        success: true,
        mapId: mapInfo.id,
        name: mapInfo.name,
        start_x: startX,
        start_y: startY,
        tileArray: tileArray,
      });
    } catch (error) {
      console.error("Get map data error:", error);
      callback({ success: false, message: "Failed to load map data" });
    }
  });

  socket.on("getUserOnMap", async(mapId, callback) => {
    try {
        const userId = socket.user?.user_id;
    
        if (!mapId || isNaN(parseInt(mapId))) {
          return callback({ success: false, message: "Invalid map ID" });
        }
    
        const mapNumber = parseInt(mapId);
        const time = Math.floor(Date.now() / 1000);
        const tenMinutesAgo = time - 60 * 10;
    
        // Get all users on the map who were seen in the last 10 minutes
        const users = await query(
          `
          SELECT 
            user_id as id,
            username,
            map_x as x,
            map_y as y,
            map_sprite as sprite,
            in_battle,
            map_wild
          FROM gebruikers
          WHERE map_num = ? 
            AND map_lastseen >= ?
            AND user_id != ?
          LIMIT 10
        `,
          [mapNumber, tenMinutesAgo, userId]
        );
    
        callback({
          success: true,
          users: users || [],
          count: (users?.length || 0) + 1, // +1 for the current user
        });
      } catch (error) {
        console.error("Get users error:", error);
        callback({ success: false, message: "Failed to load users" });
      }
  })
};
