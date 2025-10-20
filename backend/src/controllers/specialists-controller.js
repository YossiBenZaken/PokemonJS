import { query } from "../config/database.js";

// Helper function to calculate Pokemon stats
const calculateFullStats = (pokemon, character) => {
  const level = pokemon.level;
  
  const attackStat = Math.round((((pokemon.attack_iv + 2 * pokemon.attack_base + Math.floor(pokemon.attack_ev / 4)) * level / 100) + 5 + pokemon.attack_up) * character.attack_add);
  const defenceStat = Math.round((((pokemon.defence_iv + 2 * pokemon.defence_base + Math.floor(pokemon.defence_ev / 4)) * level / 100) + 5 + pokemon.defence_up) * character.defence_add);
  const speedStat = Math.round((((pokemon.speed_iv + 2 * pokemon.speed_base + Math.floor(pokemon.speed_ev / 4)) * level / 100) + 5 + pokemon.speed_up) * character.speed_add);
  const spcAttackStat = Math.round((((pokemon['spc.attack_iv'] + 2 * pokemon['spc.attack_base'] + Math.floor(pokemon['spc.attack_ev'] / 4)) * level / 100) + 5 + pokemon.spc_up) * character['spc.attack_add']);
  const spcDefenceStat = Math.round((((pokemon['spc.defence_iv'] + 2 * pokemon['spc.defence_base'] + Math.floor(pokemon['spc.defence_ev'] / 4)) * level / 100) + 5 + pokemon.spc_up) * character['spc.defence_add']);
  const hpStat = Math.round(((pokemon.hp_iv + 2 * pokemon.hp_base + Math.floor(pokemon.hp_ev / 4)) * level / 100) + 10 + level + pokemon.hp_up);

  return {
    attack: attackStat,
    defence: defenceStat,
    speed: speedStat,
    spcAttack: spcAttackStat,
    spcDefence: spcDefenceStat,
    hp: hpStat
  };
};

// Get user's Pokemon and specialist info
export const getSpecialistInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user info
    const [user] = await query(`
      SELECT g.username, g.rank, g.silver, COUNT(ps.wild_id) AS in_hand, g.premiumaccount, r.gold
      FROM gebruikers g
      INNER JOIN pokemon_speler AS ps ON g.user_id = ps.user_id
      LEFT JOIN accounts r ON g.acc_id = r.acc_id
      WHERE g.user_id = ?
    `, [userId]);

    if (!user) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }

    if (user.in_hand === 0) {
      return res.status(400).json({ success: false, message: "אין לך פוקימון בצוות" });
    }

    if (user.rank < 5) {
      return res.status(403).json({ 
        success: false, 
        message: "רנק מינימלי לשימוש במומחים: 5 - First Coach" 
      });
    }

    // Get user's team Pokemon with full details
    const teamPokemons = await query(`
      SELECT ps.*, pw.naam, pw.zeldzaamheid, pw.attack_base, pw.defence_base, 
             pw.speed_base, pw.hp_base, pw.\`spc.attack_base\`, pw.\`spc.defence_base\`
      FROM pokemon_speler ps
      INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id
      WHERE ps.user_id = ? AND ps.opzak = 'ja'
      ORDER BY ps.opzak_nummer ASC
    `, [userId]);

    // Get all available natures/characters
    const natures = await query("SELECT * FROM karakters ORDER BY karakter_naam");

    const isPremium = user.premiumaccount > Math.floor(Date.now() / 1000);

    return res.json({
      success: true,
      data: {
        user: {
          username: user.username,
          rank: user.rank,
          silver: user.silver,
          gold: user.gold || 0,
          isPremium
        },
        teamPokemons,
        natures
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בטעינת מידע המומחים",
      error: error.message
    });
  }
};

// Make Pokemon shiny
export const makeShiny = async (req, res) => {
  try {
    const { userId, pokemonIds } = req.body;

    if (!pokemonIds || !Array.isArray(pokemonIds) || pokemonIds.length === 0) {
      return res.status(400).json({ success: false, message: "לא נבחרו פוקימון" });
    }

    // Get user info
    const [user] = await query(`
      SELECT g.rank, r.gold, g.premiumaccount
      FROM gebruikers g
      LEFT JOIN accounts r ON g.acc_id = r.acc_id
      WHERE g.user_id = ?
    `, [userId]);

    if (!user || user.rank < 5) {
      return res.status(403).json({ success: false, message: "רנק לא מספיק" });
    }

    const isPremium = user.premiumaccount > Math.floor(Date.now() / 1000);
    let totalGoldNeeded = 0;

    // Validate Pokemon and calculate cost
    for (const pokemonId of pokemonIds) {
      const [pokemon] = await query(`
        SELECT ps.user_id, ps.opzak, ps.shiny, ps.ei, pw.zeldzaamheid
        FROM pokemon_speler ps
        INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id
        WHERE ps.id = ?
      `, [pokemonId]);

      if (!pokemon) {
        return res.status(404).json({ success: false, message: "פוקימון לא נמצא" });
      }

      if (pokemon.user_id !== userId) {
        return res.status(403).json({ success: false, message: "זה לא הפוקימון שלך" });
      }

      if (pokemon.ei === 1) {
        return res.status(400).json({ success: false, message: "לא ניתן לשנות ביצה לשיני" });
      }

      if (pokemon.shiny === 1) {
        return res.status(400).json({ success: false, message: "הפוקימון כבר שיני" });
      }

      if (pokemon.opzak !== 'ja') {
        return res.status(400).json({ success: false, message: "הפוקימון לא בצוות" });
      }

      // Calculate cost based on rarity
      let cost;
      switch (pokemon.zeldzaamheid) {
        case 1: cost = isPremium ? 15 : 20; break;
        case 2: cost = isPremium ? 27 : 35; break;
        case 3: cost = isPremium ? 38 : 50; break;
        default: cost = isPremium ? 90 : 120; break;
      }
      totalGoldNeeded += cost;
    }

    if (user.gold < totalGoldNeeded) {
      return res.status(400).json({ 
        success: false, 
        message: "אין מספיק זהב",
        needed: totalGoldNeeded,
        current: user.gold
      });
    }

    // Update Pokemon to shiny
    for (const pokemonId of pokemonIds) {
      await query(
        "UPDATE pokemon_speler SET shiny = '1' WHERE id = ? AND user_id = ?",
        [pokemonId, userId]
      );
    }

    // Deduct gold
    await query(
      "UPDATE accounts SET gold = gold - ? WHERE acc_id = (SELECT acc_id FROM gebruikers WHERE user_id = ?)",
      [totalGoldNeeded, userId]
    );

    return res.json({
      success: true,
      message: `הפוקימון הפכו לשיני! עלות: ${totalGoldNeeded} זהב`,
      goldSpent: totalGoldNeeded
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בהפיכה לשיני",
      error: error.message
    });
  }
};

// Change Pokemon nickname
export const changeNickname = async (req, res) => {
  try {
    const { userId, pokemonData, removeNames } = req.body;

    if (!pokemonData || typeof pokemonData !== 'object') {
      return res.status(400).json({ success: false, message: "לא נבחרו פוקימון" });
    }

    // Get user info
    const [user] = await query(
      "SELECT rank, silver, premiumaccount FROM gebruikers WHERE user_id = ?",
      [userId]
    );

    if (!user || user.rank < 5) {
      return res.status(403).json({ success: false, message: "רנק לא מספיק" });
    }

    const isPremium = user.premiumaccount > Math.floor(Date.now() / 1000);
    let totalSilverNeeded = 0;

    // Validate Pokemon and calculate cost
    for (const [pokemonId, newName] of Object.entries(pokemonData)) {
      const [pokemon] = await query(`
        SELECT ps.user_id, ps.opzak, ps.ei, ps.naam_changes, ps.roepnaam, pw.naam as original_name, pw.zeldzaamheid
        FROM pokemon_speler ps
        INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id
        WHERE ps.id = ?
      `, [pokemonId]);

      if (!pokemon) {
        return res.status(404).json({ success: false, message: "פוקימון לא נמצא" });
      }

      if (pokemon.user_id !== userId) {
        return res.status(403).json({ success: false, message: "זה לא הפוקימון שלך" });
      }

      if (pokemon.ei === 1) {
        return res.status(400).json({ success: false, message: "לא ניתן לשנות שם לביצה" });
      }

      if (pokemon.opzak !== 'ja') {
        return res.status(400).json({ success: false, message: "הפוקימון לא בצוות" });
      }

      if (!removeNames) {
        if (newName.length < 4 || newName.length > 12) {
          return res.status(400).json({ success: false, message: "השם חייב להיות בין 4-12 תווים" });
        }

        if (!/^[a-zA-Z0-9]+$/.test(newName)) {
          return res.status(400).json({ success: false, message: "השם לא יכול להכיל תווים מיוחדים" });
        }

        const currentDisplayName = pokemon.roepnaam || pokemon.original_name;
        if (currentDisplayName === newName) {
          return res.status(400).json({ success: false, message: "השם זהה לשם הנוכחי" });
        }
      }

      // Calculate cost (free for premium users)
      if (!isPremium) {
        let baseCost;
        switch (pokemon.zeldzaamheid) {
          case 1: baseCost = 250; break;
          case 2: baseCost = 350; break;
          case 3: baseCost = 400; break;
          default: baseCost = 600; break;
        }

        if (pokemon.naam_changes > 0) {
          baseCost *= pokemon.naam_changes;
        }

        totalSilverNeeded += baseCost;
      }
    }

    if (!isPremium && user.silver < totalSilverNeeded) {
      return res.status(400).json({ 
        success: false, 
        message: "אין מספיק כסף",
        needed: totalSilverNeeded,
        current: user.silver
      });
    }

    // Update Pokemon names
    for (const [pokemonId, newName] of Object.entries(pokemonData)) {
      const finalName = removeNames ? '' : newName;
      await query(
        "UPDATE pokemon_speler SET naam_changes = naam_changes + 1, roepnaam = ? WHERE id = ?",
        [finalName, pokemonId]
      );
    }

    // Deduct silver (only if not premium)
    if (!isPremium && totalSilverNeeded > 0) {
      await query(
        "UPDATE gebruikers SET silver = silver - ? WHERE user_id = ?",
        [totalSilverNeeded, userId]
      );
    }

    return res.json({
      success: true,
      message: removeNames ? "שמות הוחזרו לברירת מחדל" : "שמות שונו בהצלחה",
      silverSpent: isPremium ? 0 : totalSilverNeeded
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בשינוי שם",
      error: error.message
    });
  }
};

// Change Pokemon nature (random)
export const changeNatureRandom = async (req, res) => {
  try {
    const { userId, pokemonIds } = req.body;

    if (!pokemonIds || !Array.isArray(pokemonIds) || pokemonIds.length === 0) {
      return res.status(400).json({ success: false, message: "לא נבחרו פוקימון" });
    }

    const result = await processNatureChange(userId, pokemonIds, 'random');
    return res.json(result);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בשינוי אופי",
      error: error.message
    });
  }
};

// Change Pokemon nature (targeted)
export const changeNatureTargeted = async (req, res) => {
  try {
    const { userId, pokemonIds, changeType, attribute } = req.body;

    if (!pokemonIds || !Array.isArray(pokemonIds) || pokemonIds.length === 0) {
      return res.status(400).json({ success: false, message: "לא נבחרו פוקימון" });
    }

    if (!changeType || !attribute) {
      return res.status(400).json({ success: false, message: "חסר סוג שינוי או מאפיין" });
    }

    const result = await processNatureChange(userId, pokemonIds, 'targeted', { changeType, attribute });
    return res.json(result);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בשינוי אופי מכוון",
      error: error.message
    });
  }
};

// Change Pokemon nature (exact)
export const changeNatureExact = async (req, res) => {
  try {
    const { userId, pokemonIds, natureName } = req.body;

    if (!pokemonIds || !Array.isArray(pokemonIds) || pokemonIds.length === 0) {
      return res.status(400).json({ success: false, message: "לא נבחרו פוקימון" });
    }

    if (!natureName) {
      return res.status(400).json({ success: false, message: "לא נבחר אופי" });
    }

    const result = await processNatureChange(userId, pokemonIds, 'exact', { natureName });
    return res.json(result);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בשינוי אופי מדויק",
      error: error.message
    });
  }
};

// Helper function for nature changes
const processNatureChange = async (userId, pokemonIds, type, options = {}) => {
  // Get user info
  const [user] = await query(`
    SELECT g.rank, r.gold, g.premiumaccount
    FROM gebruikers g
    LEFT JOIN accounts r ON g.acc_id = r.acc_id
    WHERE g.user_id = ?
  `, [userId]);

  if (!user || user.rank < 5) {
    return { success: false, message: "רנק לא מספיק" };
  }

  const isPremium = user.premiumaccount > Math.floor(Date.now() / 1000);
  let totalGoldNeeded = 0;
  const pokemonData = {};

  // Validate Pokemon and calculate cost
  for (const pokemonId of pokemonIds) {
    const [pokemon] = await query(`
      SELECT ps.*, pw.*
      FROM pokemon_speler ps
      INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id
      WHERE ps.id = ?
    `, [pokemonId]);

    if (!pokemon) {
      return { success: false, message: "פוקימון לא נמצא" };
    }

    if (pokemon.user_id !== userId) {
      return { success: false, message: "זה לא הפוקימון שלך" };
    }

    if (pokemon.ei === 1) {
      return { success: false, message: "לא ניתן לשנות אופי לביצה" };
    }

    if (pokemon.opzak !== 'ja') {
      return { success: false, message: "הפוקימון לא בצוות" };
    }

    // Check humor_change limits based on type
    if (type === 'random' && pokemon.humor_change > 2) {
      return { success: false, message: "הפוקימון הזה שינה אופי מקסימום פעמים" };
    }

    if (type === 'targeted' && pokemon.humor_change > 2) {
      return { success: false, message: "הפוקימון הזה שינה אופי מקסימום פעמים" };
    }

    if (type === 'exact' && pokemon.humor_change > 0) {
      return { success: false, message: "הפוקימון הזה כבר שינה אופי" };
    }

    // Calculate cost
    let cost = 0;
    if (type === 'random') {
      if (pokemon.humor_change === 0) cost = isPremium ? 26 : 30;
      else if (pokemon.humor_change === 1) cost = isPremium ? 43 : 50;
      else cost = isPremium ? 85 : 100;
    } else if (type === 'targeted') {
      if (pokemon.humor_change === 0) cost = 50;
      else if (pokemon.humor_change === 1) cost = 80;
      else cost = 130;
    } else if (type === 'exact') {
      cost = 250;
    }

    totalGoldNeeded += cost;
    pokemonData[pokemonId] = pokemon;
  }

  if (user.gold < totalGoldNeeded) {
    return { 
      success: false, 
      message: "אין מספיק זהב",
      needed: totalGoldNeeded,
      current: user.gold
    };
  }

  // Process nature changes
  for (const pokemonId of pokemonIds) {
    const pokemon = pokemonData[pokemonId];
    let newNature;

    if (type === 'random') {
      // Get random nature excluding current
      const [randomNature] = await query(
        "SELECT * FROM karakters WHERE karakter_naam != ? ORDER BY RAND() LIMIT 1",
        [pokemon.karakter]
      );
      newNature = randomNature;
    } else if (type === 'targeted') {
      // Get nature based on stat preference
      const natures = getNaturesForStat(options.attribute, options.changeType);
      const availableNatures = natures.filter(n => n !== pokemon.karakter);
      const selectedNature = availableNatures[Math.floor(Math.random() * availableNatures.length)];
      
      const [nature] = await query(
        "SELECT * FROM charakters WHERE karakter_naam = ? LIMIT 1",
        [selectedNature]
      );
      newNature = nature;
    } else if (type === 'exact') {
      const [nature] = await query(
        "SELECT * FROM charakters WHERE karakter_naam = ? LIMIT 1",
        [options.natureName]
      );
      
      if (!nature) {
        return { success: false, message: "האופי הזה לא קיים" };
      }
      newNature = nature;
    }

    if (newNature) {
      // Calculate new stats
      const newStats = calculateFullStats(pokemon, newNature);
      
      // Update Pokemon
      const humorIncrease = type === 'exact' ? 3 : 1;
      await query(`
        UPDATE pokemon_speler SET 
          humor_change = humor_change + ?,
          karakter = ?,
          levenmax = ?,
          leven = ?,
          attack = ?,
          defence = ?,
          speed = ?,
          \`spc.attack\` = ?,
          \`spc.defence\` = ?
        WHERE id = ? AND user_id = ?
      `, [
        humorIncrease, newNature.karakter_naam,
        newStats.hp, newStats.hp, newStats.attack, newStats.defence,
        newStats.speed, newStats.spcAttack, newStats.spcDefence,
        pokemonId, userId
      ]);
    }
  }

  // Deduct gold
  await query(
    "UPDATE accounts SET gold = gold - ? WHERE acc_id = (SELECT acc_id FROM gebruikers WHERE user_id = ?)",
    [totalGoldNeeded, userId]
  );

  let message = "אופי שונה בהצלחה!";
  if (type === 'targeted') message = "אופי שונה בכיוון המבוקש!";
  else if (type === 'exact') message = "אופי שונה לאופי הנבחר!";

  return {
    success: true,
    message: `${message} עלות: ${totalGoldNeeded} זהב`,
    goldSpent: totalGoldNeeded
  };
};

// Helper function to get natures for specific stat changes
const getNaturesForStat = (attribute, changeType) => {
  const natureMap = {
    up: {
      attack: ["hardy", "lonely", "brave", "adamant", "naughty"],
      defense: ["bold", "docile", "relaxed", "impish", "lax"],
      spatk: ["modest", "mild", "quiet", "bashful", "rash"],
      spdef: ["calm", "gentle", "sassy", "careful", "quirky"],
      speed: ["timid", "hasty", "serious", "jolly", "naive"]
    },
    down: {
      attack: ["hardy", "bold", "timid", "modest", "calm"],
      defense: ["lonely", "docile", "hasty", "mild", "gentle"],
      spatk: ["adamant", "impish", "jolly", "bashful", "careful"],
      spdef: ["naughty", "lax", "naive", "rash", "quirky"],
      speed: ["brave", "relaxed", "serious", "quiet", "sassy"]
    }
  };

  return natureMap[changeType]?.[attribute] || [];
};