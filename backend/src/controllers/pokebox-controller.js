import { query } from "../config/database.js";

// Get Pokemon box information
export const getBoxInfo = async (req, res) => {
  try {
    const { userId, boxNumber = 1 } = req.params;

    // Get user info
    const [user] = await query(
      `
      SELECT g.huis, COUNT(ps.wild_id) AS in_hand FROM gebruikers AS g INNER JOIN pokemon_speler AS ps ON g.user_id = ps.user_id WHERE g.user_id = ?
    `,
      [userId]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }

    // Get house info
    const [house] = await query(
      "SELECT ruimte FROM huizen WHERE afkorting = ?",
      [user.huis]
    );

    if (!house) {
      return res
        .status(400)
        .json({ success: false, message: "סוג בית לא תקין" });
    }

    // Get Pokemon counts in storage
    const [storageCount] = await query(
      `
      SELECT COUNT(id) as aantal FROM pokemon_speler 
      WHERE user_id = ? AND (opzak = 'nee' OR opzak = 'tra')
    `,
      [userId]
    );

    // Get level 100 Pokemon count
    const [level100Count] = await query(
      "SELECT COUNT(id) as count FROM pokemon_speler WHERE user_id = ? AND level = 100",
      [userId]
    );

    // Get top Pokemon counts
    const [top1Count] = await query(
      "SELECT COUNT(id) as count FROM pokemon_speler WHERE user_id = ? AND top3 = '1'",
      [userId]
    );
    const [top2Count] = await query(
      "SELECT COUNT(id) as count FROM pokemon_speler WHERE user_id = ? AND top3 = '2'",
      [userId]
    );
    const [top3Count] = await query(
      "SELECT COUNT(id) as count FROM pokemon_speler WHERE user_id = ? AND top3 = '3'",
      [userId]
    );

    // Get team Pokemon
    const teamPokemons = await query(
      `
      SELECT ps.*, pw.naam, pw.type1, pw.type2 
      FROM pokemon_speler ps 
      INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id 
      WHERE ps.user_id = ? AND ps.opzak = 'ja' 
      ORDER BY ps.opzak_nummer ASC
    `,
      [userId]
    );

    // Get box configuration
    const [boxConfig] = await query(
      "SELECT nome, fundo FROM boxes WHERE user_id = ? AND box_id = ?",
      [userId, boxNumber]
    );

    // Calculate box pagination
    const maxPerBox = 50;
    const maxBoxes = Math.ceil(house.ruimte / maxPerBox);

    const houseInfo = getHouseInfo(user.huis);
    const spotsLeft = houseInfo.capacity - storageCount.aantal;

    return res.json({
      success: true,
      data: {
        user: {
          huis: user.huis,
          inHand: user.in_hand,
        },
        house: {
          ...houseInfo,
          capacity: house.ruimte,
          spotsLeft: Math.max(0, spotsLeft),
        },
        stats: {
          pokemonsInStorage: storageCount.aantal,
          level100Pokemon: level100Count.count,
          top1Pokemon: top1Count.count,
          top2Pokemon: top2Count.count,
          top3Pokemon: top3Count.count,
        },
        teamPokemons,
        box: {
          number: parseInt(boxNumber),
          maxBoxes,
          name: boxConfig?.nome || null,
          background: boxConfig?.fundo || "simple2",
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בטעינת מידע הקופסה",
      error: error.message,
    });
  }
};

// Get Pokemon in specific box
export const getBoxPokemons = async (req, res) => {
  try {
    const { userId, boxNumber = 1 } = req.params;

    // Get house capacity to calculate pagination
    const [user] = await query(
      "SELECT huis FROM gebruikers WHERE user_id = ?",
      [userId]
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }

    const maxPerBox = 50;
    const startSlot = (boxNumber - 1) * maxPerBox + 1;
    const endSlot = startSlot + maxPerBox - 1;

    // Get Pokemon in box slots
    const boxPokemons = await query(
      `
      SELECT ps.*, pw.naam, pw.type1, pw.type2 
      FROM pokemon_speler ps 
      INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id 
      WHERE ps.user_id = ? AND ps.opzak = 'nee' 
        AND ps.opzak_nummer >= ? AND ps.opzak_nummer <= ?
      ORDER BY ps.opzak_nummer ASC
    `,
      [userId, startSlot, endSlot]
    );
    // Create slots array with Pokemon or empty slots

    const slots = [];
    for (let i = startSlot; i <= endSlot; i++) {
      const pokemon = boxPokemons.find((p) => p.opzak_nummer === i.toString());
      slots.push({
        slotNumber: i,
        pokemon: pokemon || null,
      });
    }

    return res.json({
      success: true,
      data: {
        slots,
        boxNumber: parseInt(boxNumber),
        slotRange: { start: startSlot, end: endSlot },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בטעינת פוקימוני הקופסה",
      error: error.message,
    });
  }
};

// Move Pokemon between team and box
export const movePokemon = async (req, res) => {
  try {
    const { userId, pokemonId, from, to, toSlot } = req.body;

    // Validate Pokemon ownership
    const [pokemon] = await query(
      "SELECT * FROM pokemon_speler WHERE id = ? AND user_id = ?",
      [pokemonId, userId]
    );

    if (!pokemon) {
      return res
        .status(404)
        .json({ success: false, message: "פוקימון לא נמצא" });
    }

    // Get user info
    const [user] = await query(
      "SELECT COUNT(wild_id) AS in_hand FROM pokemon_speler WHERE user_id = ? AND opzak='ja'",
      [userId]
    );

    if (from === "team" && to === "box") {
      // Moving from team to box
      if (user.in_hand <= 1) {
        return res.status(400).json({
          success: false,
          message: "לא ניתן להשאיר את הצוות ריק",
        });
      }

      // Find available slot if not specified
      let targetSlot = toSlot;
      if (!targetSlot) {
        targetSlot = await findAvailableBoxSlot(userId);
        if (!targetSlot) {
          return res.status(400).json({
            success: false,
            message: "אין מקום פנוי בקופסה",
          });
        }
      }

      // Update Pokemon
      await query(
        "UPDATE pokemon_speler SET opzak = 'nee', opzak_nummer = ? WHERE id = ?",
        [targetSlot, pokemonId]
      );

      // Reorganize team positions
      await reorganizeTeamPositions(userId);
    } else if (from === "box" && to === "team") {
      // Moving from box to team
      if (user.in_hand >= 6) {
        return res.status(400).json({
          success: false,
          message: "הצוות מלא (מקסימום 6 פוקימון)",
        });
      }

      const newTeamPosition = user.in_hand + 1;

      // Update Pokemon
      await query(
        "UPDATE pokemon_speler SET opzak = 'ja', opzak_nummer = ? WHERE id = ?",
        [newTeamPosition, pokemonId]
      );
    } else if (from === "box" && to === "box") {
      // Moving within box (changing positions)
      if (!toSlot) {
        return res.status(400).json({
          success: false,
          message: "יש לציין מיקום יעד",
        });
      }

      // Check if target slot is occupied
      const [occupiedSlot] = await query(
        "SELECT id FROM pokemon_speler WHERE user_id = ? AND opzak = 'nee' AND opzak_nummer = ?",
        [userId, toSlot]
      );

      if (occupiedSlot && occupiedSlot.id !== pokemonId) {
        return res.status(400).json({
          success: false,
          message: "המיקום היעד תפוס",
        });
      }

      // Update Pokemon position
      await query("UPDATE pokemon_speler SET opzak_nummer = ? WHERE id = ?", [
        toSlot,
        pokemonId,
      ]);
    }

    return res.json({
      success: true,
      message: "פוקימון הועבר בהצלחה",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בהעברת פוקימון",
      error: error.message,
    });
  }
};

// Configure box settings
export const configureBox = async (req, res) => {
  try {
    const { userId, boxNumber, name, background } = req.body;

    // Check if box configuration exists
    const [existingConfig] = await query(
      "SELECT id FROM boxes WHERE user_id = ? AND box_id = ?",
      [userId, boxNumber]
    );

    if (existingConfig) {
      // Update existing configuration
      await query(
        "UPDATE boxes SET nome = ?, fundo = ? WHERE user_id = ? AND box_id = ?",
        [name || "", background || "default", userId, boxNumber]
      );
    } else {
      // Create new configuration
      await query(
        "INSERT INTO boxes (user_id, box_id, nome, fundo) VALUES (?, ?, ?, ?)",
        [userId, boxNumber, name || "", background || "default"]
      );
    }

    return res.json({
      success: true,
      message: "הגדרות הקופסה נשמרו",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בשמירת הגדרות הקופסה",
      error: error.message,
    });
  }
};

export const getPokemonSellInfo = async (req, res) => {
  try {
    const { userId, pokemonId } = req.body;

    // Get Pokemon and user info
    const [pokemon] = await query(
      `
      SELECT ps.*, pw.naam, pw.zeldzaamheid, g.rank, g.premiumaccount, g.admin, r.gold
      FROM pokemon_speler ps
      INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id
      INNER JOIN gebruikers g ON ps.user_id = g.user_id
      INNER JOIN rekeningen r ON g.acc_id = r.acc_id
      WHERE ps.id = ? AND ps.user_id = ?
    `,
      [pokemonId, userId]
    );

    if (!pokemon) {
      return res
        .status(404)
        .json({ success: false, message: "פוקימון לא נמצא" });
    }

    // Check selling restrictions
    if (pokemon.user_id !== parseInt(userId)) {
      return res
        .status(403)
        .json({ success: false, message: "זה לא הפוקימון שלך" });
    }

    if (pokemon.gehecht === 1) {
      return res
        .status(400)
        .json({ success: false, message: "לא ניתן למכור פוקימון התחלתי" });
    }
    if (pokemon.can_trade !== '1') {
      return res
        .status(400)
        .json({ success: false, message: "הפוקימון הזה לא יכול להיסחר" });
    }

    if (pokemon.rank <= 3) {
      return res
        .status(400)
        .json({ success: false, message: "רנק נמוך מדי למכירה" });
    }

    if (pokemon.opzak === "tra") {
      return res
        .status(400)
        .json({ success: false, message: "הפוקימון כבר למכירה" });
    }

    if (pokemon.opzak === "day") {
      return res
        .status(400)
        .json({ success: false, message: "הפוקימון בגן ילדים" });
    }

    // Check sell limits
    const [sellCount] = await query(
      "SELECT COUNT(id) as count FROM transferlijst WHERE user_id = ?",
      [userId]
    );

    let allowed = 10;
    if (pokemon.premiumaccount > Math.floor(Date.now() / 1000)) allowed = 20;
    if (pokemon.admin >= 3) allowed = 1000000;

    if (sellCount.count >= allowed) {
      return res.status(400).json({
        success: false,
        message: `לא ניתן למכור יותר מ-${allowed} פוקימון`,
      });
    }

    return res.json({
      success: true,
      data: {
        pokemon: {
          id: pokemon.id,
          naam: pokemon.naam,
          level: pokemon.level,
          shiny: pokemon.shiny,
          wild_id: pokemon.wild_id,
        },
        limits: {
          allowed,
          current: sellCount.count,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בטעינת מידע מכירה",
      error: error.message,
    });
  }
};

// Sell Pokemon with different methods
export const sellPokemon = async (req, res) => {
  try {
    console.log(req.body);
    const { userId, pokemonId, method, silvers, golds = 0, negotiable = false, trainer } = req.body;

    // Validate method
    if (!['auction', 'direct', 'private'].includes(method)) {
      return res.status(400).json({ success: false, message: "שיטת מכירה לא קיימת" });
    }

    // Get Pokemon info first
    const sellInfoResponse = await getPokemonSellInfo({ body: { userId, pokemonId } }, { 
      status: (code) => ({ json: (data) => data }),
      json: (data) => data 
    });

    if (!sellInfoResponse.success) {
      return res.status(400).json(sellInfoResponse);
    }

    // Validate prices based on method
    if (method === 'auction') {
      if (silvers < 500 || silvers > 1000000) {
        return res.status(400).json({ 
          success: false, 
          message: "מחיר התחלתי חייב להיות בין 500 ל-1,000,000 כסף" 
        });
      }

      // Create auction
      const endTime = Math.floor(Date.now() / 1000) + (48 * 60 * 60); // 48 hours
      const date = new Date().toLocaleDateString('he-IL');

      await query(`
        INSERT INTO transferlijst (datum, user_id, silver, pokemon_id, time_end, type) 
        VALUES (?, ?, ?, ?, ?, 'auction')
      `, [date, userId, silvers, pokemonId, endTime]);

    } else if (method === 'direct') {
      if (silvers < 500 || silvers > 1500000) {
        return res.status(400).json({ 
          success: false, 
          message: "מחיר כסף חייב להיות בין 500 ל-1,500,000" 
        });
      }

      if (golds < 0 || golds > 1000) {
        return res.status(400).json({ 
          success: false, 
          message: "מחיר זהב חייב להיות בין 0 ל-1,000" 
        });
      }

      const date = new Date().toLocaleDateString('he-IL');
      await query(`
        INSERT INTO transferlijst (datum, user_id, silver, pokemon_id, gold, type, negociavel) 
        VALUES (?, ?, ?, ?, ?, 'direct', ?)
      `, [date, userId, silvers, pokemonId, golds, negotiable ? 1 : 0]);

    } else if (method === 'private') {
      if (!trainer) {
        return res.status(400).json({ success: false, message: "יש לציין שם מאמן" });
      }

      if (silvers < 500 || silvers > 2000000) {
        return res.status(400).json({ 
          success: false, 
          message: "מחיר כסף חייב להיות בין 500 ל-2,000,000" 
        });
      }

      if (golds < 0 || golds > 1000) {
        return res.status(400).json({ 
          success: false, 
          message: "מחיר זהב חייב להיות בין 0 ל-1,000" 
        });
      }

      // Check if trainer exists
      const [targetTrainer] = await query(
        "SELECT user_id FROM gebruikers WHERE username = ? AND user_id != ?",
        [trainer, userId]
      );

      if (!targetTrainer) {
        return res.status(400).json({ 
          success: false, 
          message: "המאמן לא קיים או שזה אתה" 
        });
      }

      const date = new Date().toLocaleDateString('he-IL');
      await query(`
        INSERT INTO transferlijst (datum, user_id, silver, pokemon_id, gold, type, to_user) 
        VALUES (?, ?, ?, ?, ?, 'private', ?)
      `, [date, userId, silvers, pokemonId, golds, targetTrainer.user_id]);
    }

    // Update Pokemon status
    await query("UPDATE pokemon_speler SET opzak = 'tra' WHERE id = ?", [pokemonId]);

    // Reorganize team positions
    await reorganizeTeamPositions(userId);

    const methodNames = {
      auction: 'מכירה פומבית',
      direct: 'מכירה ישירה', 
      private: 'מכירה פרטית'
    };

    return res.json({
      success: true,
      message: `הפוקימון נשלח ל${methodNames[method]} בהצלחה`
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה במכירת פוקימון",
      error: error.message
    });
  }
};

// Release Pokemon (set free)
export const releasePokemon = async (req, res) => {
  try {
    const { userId, pokemonId } = req.body;

    // Get Pokemon info
    const [pokemon] = await query(
      `
      SELECT ps.*, pw.naam
      FROM pokemon_speler ps 
      INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id 
      WHERE ps.id = ? AND ps.user_id = ?
    `,
      [pokemonId, userId]
    );

    if (!pokemon) {
      return res
        .status(404)
        .json({ success: false, message: "פוקימון לא נמצא" });
    }

    // Delete Pokemon
    await query("DELETE FROM pokemon_speler WHERE id = ?", [pokemonId]);

    return res.json({
      success: true,
      message: `${pokemon.naam} שוחרר לטבע`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בשחרור פוקימון",
      error: error.message,
    });
  }
};

// Helper functions
const getHouseInfo = (houseType) => {
  const houses = {
    doos: { name: "קופסה", capacity: 2, image: "house1.png" },
    shuis: { name: "בית קטן", capacity: 20, image: "house2.gif" },
    nhuis: { name: "בית רגיל", capacity: 100, image: "house3.gif" },
    villa: { name: "וילה גדולה", capacity: 2500, image: "house4.gif" },
  };

  return houses[houseType] || houses["doos"];
};

const findAvailableBoxSlot = async (userId) => {
  // Get user's house capacity
  const [user] = await query("SELECT huis FROM gebruikers WHERE user_id = ?", [
    userId,
  ]);
  const [house] = await query("SELECT ruimte FROM huizen WHERE afkorting = ?", [
    user.huis,
  ]);

  // Find first available slot
  for (let i = 1; i <= house.ruimte; i++) {
    const [occupied] = await query(
      "SELECT id FROM pokemon_speler WHERE user_id = ? AND opzak = 'nee' AND opzak_nummer = ?",
      [userId, i]
    );

    if (!occupied) {
      return i;
    }
  }

  return null;
};

const reorganizeTeamPositions = async (userId) => {
  // Get all team Pokemon
  const teamPokemons = await query(
    "SELECT id FROM pokemon_speler WHERE user_id = ? AND opzak = 'ja' ORDER BY opzak_nummer ASC",
    [userId]
  );

  // Reassign positions
  for (let i = 0; i < teamPokemons.length; i++) {
    await query("UPDATE pokemon_speler SET opzak_nummer = ? WHERE id = ?", [
      i + 1,
      teamPokemons[i].id,
    ]);
  }
};
