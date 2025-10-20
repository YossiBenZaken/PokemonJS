import { query } from "../config/database.js";

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
          map_lastseen = ?
      WHERE user_id = ?
    `,
      [mapNumber, posX, posY, currentTime, userId]
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

// Export functions
export default {
  handleMove,
};
