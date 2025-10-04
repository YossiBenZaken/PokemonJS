import { query } from "../config/database.js";

// 1. Get Map Data
export const getMapData = async (req, res) => {
  try {
    const { mapId } = req.params;
    const userId = req.user?.user_id;

    if (!mapId || isNaN(parseInt(mapId))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid map ID" });
    }

    const mapNumber = parseInt(mapId);

    // Validate map range (1-7)
    if (mapNumber < 1 || mapNumber > 7) {
      return res
        .status(400)
        .json({ success: false, message: "Map must be between 1-7" });
    }

    // Get map information
    const [mapInfo] = await query("SELECT * FROM maps WHERE id = ?", [
      mapNumber,
    ]);

    if (!mapInfo) {
      return res.status(404).json({ success: false, message: "Map not found" });
    }

    // Parse tile array (stored as string in database)
    let tileArray;
    try {
      // The tile array is stored as JavaScript array in the database
      // We need to safely parse it
      tileArray = JSON.parse(
        mapInfo.tile
        .replace(/\\r\\n/g, "") // מסיר newlines
        .replace(/\\/g, "")     // מסיר backslashes
        .replace(/^var\s+\w+\s*=\s*/, "") // מסיר "var map ="
        .replace(/;$/, "")     // מסיר נקודה פסיק בסוף
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

    res.json({
      success: true,
      mapId: mapInfo.id,
      name: mapInfo.name,
      start_x: startX,
      start_y: startY,
      tileArray: tileArray,
    });
  } catch (error) {
    console.error("Get map data error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load map data" });
  }
};

// 2. Get Users on Map
export const getUsersOnMap = async (req, res) => {
  try {
    const { mapId } = req.params;
    const userId = req.user?.user_id;

    if (!mapId || isNaN(parseInt(mapId))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid map ID" });
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

    res.json({
      success: true,
      users: users || [],
      count: (users?.length || 0) + 1, // +1 for the current user
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Failed to load users" });
  }
};

// 3. Handle Movement and Encounters
export const handleMove = async (req, res) => {
  try {
    const { map, x, y, li } = req.body;
    const userId = req.user?.user_id;

    if (!map || x === undefined || y === undefined) {
      return res.status(400).json({
        success: false,
        message: "Invalid movement data",
      });
    }

    const [user] = await query("SELECT * FROM `gebruikers` WHERE `user_id` = ?", [
      userId,
    ]);

    const mapNumber = parseInt(map);
    const posX = parseInt(x);
    const posY = parseInt(y);
    const currentTime = Math.floor(Date.now() / 1000);

    // Update user position
    await query(
      `
      UPDATE gebruikers 
      SET map_num = ?, 
          map_x = ?, 
          map_y = ?, 
          map_lastseen = ?,
          captcha_time = ?
      WHERE user_id = ?
    `,
      [mapNumber, posX, posY, currentTime, currentTime, userId]
    );

    // Check if user is admin and apply li bonus
    let rarityBonus = 6; // Default li value
    if (user?.admin >= 3 && li && !isNaN(parseInt(li))) {
      rarityBonus += parseInt(li);
    }

    // Determine area type based on map
    const areaTypes = {
      1: "Gras",
      2: "Water",
      3: "Grot",
      4: "Spookhuis",
      5: "Lavagrot",
      6: "Strand",
      7: "Vechtschool",
    };

    const area = areaTypes[mapNumber] || "Gras";

    // Random encounter chance (80% chance for encounter like in original)
    const encounterChance = Math.random() * 10;
    
    if (encounterChance <= 8) {
      // Safari zone check (you'll need to implement this based on your logic)
      const isSafariOpen = true; // Replace with your actual Safari zone check logic

      if (isSafariOpen) {
        // Determine rarity based on original logic
        const rarityRoll = Math.floor(Math.random() * (10000 + rarityBonus));
        let rarity;
        
        if (rarityRoll <= 8500) rarity = 1;
        else if (rarityRoll <= 9800) rarity = 2;
        else if (rarityRoll <= 9998) rarity = 3;
        else if (rarityRoll <= 9999) rarity = 4;
        else rarity = 5;

        // Get random Pokemon for this area with specific rarity
        const [wildPokemon] = await query(
          `
          SELECT wild_id as id, naam as name, zeldzaamheid as rarity
          FROM pokemon_wild 
          WHERE gebied = ? 
            AND zeldzaamheid = ? 
            AND aparece = 'sim'
          ORDER BY RAND() 
          LIMIT 1
        `,
          [area, rarity]
        );

        if (wildPokemon) {
          // Generate level based on user rank
          let level;
          if (user?.rank > 15 && user?.lvl_choose) {
            const levelRange = user.lvl_choose.split("-");
            const minLevel = parseInt(levelRange[0]);
            const maxLevel = parseInt(levelRange[1]);
            level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
          } else {
            // Use your rankpokemon function logic here
            level = await calculatePokemonLevel(user.rank);
          }

          // Check for evolution
          const evolvedPokemon = await checkEvolution(wildPokemon.id, level);
          
          // Log legendary encounter
          if (rarity === 3) {
            await query(
              `
              INSERT INTO legendary_logs (acc_id, username, msg) 
              VALUES (?, ?, ?)
            `,
              [user.acc_id, user.username, 
               `O jogador ${user.username} encontrou um(a) ${evolvedPokemon.name}(${evolvedPokemon.id}).`]
            );
          }

          // Store encounter in user session
          await query(
            `
            UPDATE gebruikers 
            SET map_wild = ?, 
                pokemon_level = ?
            WHERE user_id = ?
          `,
            [evolvedPokemon.id, level, userId]
          );

          // Format name based on rarity
          let displayName = evolvedPokemon.name;
          if (rarity >= 4) {
            displayName = `<font style="text-shadow: 0 0 0.4em #000, 0 0 0.4em #000;color: #560202;">${evolvedPokemon.name}</font>`;
          }

          return res.json({
            success: true,
            wildEncounter: {
              id: evolvedPokemon.id,
              name: displayName,
              level: level,
              originalName: evolvedPokemon.name
            },
            message: `You encountered a wild ${displayName}!`,
          });
        }
      } else {
        // Safari zone closed
        return res.json({
          success: true,
          wildEncounter: null,
          message: "A Zona do Safari está fechada!",
        });
      }
    }

    // No encounter - random message like in original
    const messages = [
      "Não há nada aqui!",
      "Quase achei uma lenda, mas ele sumiu!",
      "Não irei desistir!",
      "Tenho certeza que encontrei um Pokémon por aqui...",
      "Achei! Ah não, é apenas uma pedra!",
      "Aaa... não consigo encontrar nada!",
      "Vamos lá, apareçam!",
      "Tem algum Pokémon aqui!?",
      "O que está atrás de mim?! Ufa, é apenas minha sombra!",
      "Tem um Pokémon no céu?! Ah, é só uma núvem.",
      "Acho que esses Pokémon tem medo de mim.",
      "Encontrei algumas pegadas! Poxa, são minhas..."
    ];

    // Clear any previous wild encounter
    await query(
      `UPDATE gebruikers SET map_wild = '0' WHERE user_id = ?`,
      [userId]
    );

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    res.json({
      success: true,
      wildEncounter: null,
      message: randomMessage,
    });
  } catch (error) {
    console.error("Handle move error:", error);
    res.status(500).json({
      success: false,
      message: "Movement failed",
    });
  }
};

// Helper function to check evolution
async function checkEvolution(wildId, level) {
  // Check if this Pokemon evolves at this level
  const [evolution] = await query(
    `
    SELECT * FROM levelen 
    WHERE wild_id = ? AND level <= ? AND wat = 'evo' 
    ORDER BY level DESC 
    LIMIT 1
  `,
    [wildId, level]
  );

  if (evolution) {
    // Get evolved Pokemon data
    const [evolvedPokemon] = await query(
      `SELECT wild_id as id, naam as name FROM pokemon_wild WHERE wild_id = ?`,
      [evolution.nieuw_id]
    );

    if (evolvedPokemon) {
      // Check for further evolution (second stage)
      const [secondEvolution] = await query(
        `
        SELECT * FROM levelen 
        WHERE wild_id = ? AND level <= ? AND wat = 'evo' 
        ORDER BY level DESC 
        LIMIT 1
      `,
        [evolvedPokemon.id, level]
      );

      if (secondEvolution) {
        const [finalPokemon] = await query(
          `SELECT wild_id as id, naam as name FROM pokemon_wild WHERE wild_id = ?`,
          [secondEvolution.nieuw_id]
        );
        return finalPokemon || evolvedPokemon;
      }
      return evolvedPokemon;
    }
  }

  // Return original Pokemon if no evolution
  const [originalPokemon] = await query(
    `SELECT wild_id as id, naam as name FROM pokemon_wild WHERE wild_id = ?`,
    [wildId]
  );
  
  return originalPokemon || { id: wildId, name: "Unknown" };
}

// Helper function to calculate Pokemon level based on rank
export async function calculatePokemonLevel(rank) {
  // Implement your rankpokemon logic here
  // This is a simplified version - replace with your actual logic
  const baseLevel = 5;
  const levelIncrease = Math.floor(rank / 2);
  const randomVariation = Math.floor(Math.random() * 6) - 2; // -2 to +3
  
  return Math.max(1, baseLevel + levelIncrease + randomVariation);
}

// Helper function to check if user has alive Pokemon
const hasAlivePokemon = async (userId) => {
  const [result] = await query(
    `
    SELECT COUNT(*) as count
    FROM pokemon_speler
    WHERE user_id = ? 
      AND leven > 0 
      AND opzak = 'ja'
  `,
    [userId]
  );

  return result && result.count > 0;
};

// Export functions
export default {
  getMapData,
  getUsersOnMap,
  handleMove,
};
