import { query } from "../config/database.js";

// Get Pokemon box information
export const getBoxInfo = async (req, res) => {
  try {
    const { userId, boxNumber = 1 } = req.params;

    // Get user info
    const [user] = await query(`
      SELECT g.huis, COUNT(ps.wild_id) AS in_hand FROM gebruikers AS g INNER JOIN pokemon_speler AS ps ON g.user_id = ps.user_id WHERE g.user_id = ?
    `, [userId]);

    if (!user) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }

    // Get house info
    const [house] = await query(
      "SELECT ruimte FROM huizen WHERE afkorting = ?",
      [user.huis]
    );

    if (!house) {
      return res.status(400).json({ success: false, message: "סוג בית לא תקין" });
    }

    // Get Pokemon counts in storage
    const [storageCount] = await query(`
      SELECT COUNT(id) as aantal FROM pokemon_speler 
      WHERE user_id = ? AND (opzak = 'nee' OR opzak = 'tra')
    `, [userId]);

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
    const teamPokemons = await query(`
      SELECT ps.*, pw.naam, pw.type1, pw.type2 
      FROM pokemon_speler ps 
      INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id 
      WHERE ps.user_id = ? AND ps.opzak = 'ja' 
      ORDER BY ps.opzak_nummer ASC
    `, [userId]);

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
          inHand: user.in_hand
        },
        house: {
          ...houseInfo,
          capacity: house.ruimte,
          spotsLeft: Math.max(0, spotsLeft)
        },
        stats: {
          pokemonsInStorage: storageCount.aantal,
          level100Pokemon: level100Count.count,
          top1Pokemon: top1Count.count,
          top2Pokemon: top2Count.count,
          top3Pokemon: top3Count.count
        },
        teamPokemons,
        box: {
          number: parseInt(boxNumber),
          maxBoxes,
          name: boxConfig?.nome || null,
          background: boxConfig?.fundo || 'simple2'
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בטעינת מידע הקופסה",
      error: error.message
    });
  }
};

// Get Pokemon in specific box
export const getBoxPokemons = async (req, res) => {
  try {
    const { userId, boxNumber = 1 } = req.params;

    // Get house capacity to calculate pagination
    const [user] = await query("SELECT huis FROM gebruikers WHERE user_id = ?", [userId]);
    if (!user) {
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
    }

    const [house] = await query("SELECT ruimte FROM huizen WHERE afkorting = ?", [user.huis]);

    const maxPerBox = 50;
    const startSlot = ((boxNumber - 1) * maxPerBox) + 1;
    const endSlot = startSlot + maxPerBox - 1;

    // Get Pokemon in box slots
    const boxPokemons = await query(`
      SELECT ps.*, pw.naam, pw.type1, pw.type2 
      FROM pokemon_speler ps 
      INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id 
      WHERE ps.user_id = ? AND ps.opzak = 'nee' 
        AND ps.opzak_nummer >= ? AND ps.opzak_nummer <= ?
      ORDER BY ps.opzak_nummer ASC
    `, [userId, startSlot, endSlot]);
    // Create slots array with Pokemon or empty slots

    const slots = [];
    for (let i = startSlot; i <= endSlot; i++) {
      const pokemon = boxPokemons.find(p => p.opzak_nummer === i.toString());
      slots.push({
        slotNumber: i,
        pokemon: pokemon || null
      });
    }

    return res.json({
      success: true,
      data: {
        slots,
        boxNumber: parseInt(boxNumber),
        slotRange: { start: startSlot, end: endSlot }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בטעינת פוקימוני הקופסה",
      error: error.message
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
      return res.status(404).json({ success: false, message: "פוקימון לא נמצא" });
    }

    // Get user info
    const [user] = await query("SELECT COUNT(wild_id) AS in_hand FROM pokemon_speler WHERE user_id = ? AND opzak='ja'", [userId]);

    if (from === 'team' && to === 'box') {
      // Moving from team to box
      if (user.in_hand <= 1) {
        return res.status(400).json({ 
          success: false, 
          message: "לא ניתן להשאיר את הצוות ריק" 
        });
      }

      // Find available slot if not specified
      let targetSlot = toSlot;
      if (!targetSlot) {
        targetSlot = await findAvailableBoxSlot(userId);
        if (!targetSlot) {
          return res.status(400).json({ 
            success: false, 
            message: "אין מקום פנוי בקופסה" 
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

    } else if (from === 'box' && to === 'team') {
      // Moving from box to team
      if (user.in_hand >= 6) {
        return res.status(400).json({ 
          success: false, 
          message: "הצוות מלא (מקסימום 6 פוקימון)" 
        });
      }

      const newTeamPosition = user.in_hand + 1;

      // Update Pokemon
      await query(
        "UPDATE pokemon_speler SET opzak = 'ja', opzak_nummer = ? WHERE id = ?",
        [newTeamPosition, pokemonId]
      );

    } else if (from === 'box' && to === 'box') {
      // Moving within box (changing positions)
      if (!toSlot) {
        return res.status(400).json({ 
          success: false, 
          message: "יש לציין מיקום יעד" 
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
          message: "המיקום היעד תפוס" 
        });
      }

      // Update Pokemon position
      await query(
        "UPDATE pokemon_speler SET opzak_nummer = ? WHERE id = ?",
        [toSlot, pokemonId]
      );
    }

    return res.json({
      success: true,
      message: "פוקימון הועבר בהצלחה"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בהעברת פוקימון",
      error: error.message
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
        [name || '', background || 'default', userId, boxNumber]
      );
    } else {
      // Create new configuration
      await query(
        "INSERT INTO boxes (user_id, box_id, nome, fundo) VALUES (?, ?, ?, ?)",
        [userId, boxNumber, name || '', background || 'default']
      );
    }

    return res.json({
      success: true,
      message: "הגדרות הקופסה נשמרו"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בשמירת הגדרות הקופסה",
      error: error.message
    });
  }
};

// Sell Pokemon from box
export const sellPokemon = async (req, res) => {
  try {
    const { userId, pokemonId } = req.body;

    // Get Pokemon info
    const [pokemon] = await query(`
      SELECT ps.*, pw.zeldzaamheid, pw.naam
      FROM pokemon_speler ps 
      INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id 
      WHERE ps.id = ? AND ps.user_id = ?
    `, [pokemonId, userId]);

    if (!pokemon) {
      return res.status(404).json({ success: false, message: "פוקימון לא נמצא" });
    }

    // Calculate sell price based on level and rarity
    let basePrice = 100;
    switch (pokemon.zeldzaamheid) {
      case 1: basePrice = 100; break;
      case 2: basePrice = 200; break;
      case 3: basePrice = 400; break;
      default: basePrice = 800; break;
    }

    const sellPrice = Math.floor(basePrice * (pokemon.level / 10));

    // Delete Pokemon and give silver
    await query("DELETE FROM pokemon_speler WHERE id = ?", [pokemonId]);
    await query(
      "UPDATE gebruikers SET silver = silver + ? WHERE user_id = ?",
      [sellPrice, userId]
    );

    return res.json({
      success: true,
      message: `${pokemon.naam} נמכר תמור ${sellPrice} כסף`,
      silverEarned: sellPrice
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
    const [pokemon] = await query(`
      SELECT ps.*, pw.naam
      FROM pokemon_speler ps 
      INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id 
      WHERE ps.id = ? AND ps.user_id = ?
    `, [pokemonId, userId]);

    if (!pokemon) {
      return res.status(404).json({ success: false, message: "פוקימון לא נמצא" });
    }

    // Delete Pokemon
    await query("DELETE FROM pokemon_speler WHERE id = ?", [pokemonId]);

    return res.json({
      success: true,
      message: `${pokemon.naam} שוחרר לטבע`
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בשחרור פוקימון",
      error: error.message
    });
  }
};

// Helper functions
const getHouseInfo = (houseType) => {
  const houses = {
    'doos': { name: 'קופסה', capacity: 2, image: 'house1.png' },
    'shuis': { name: 'בית קטן', capacity: 20, image: 'house2.gif' },
    'nhuis': { name: 'בית רגיל', capacity: 100, image: 'house3.gif' },
    'villa': { name: 'וילה גדולה', capacity: 2500, image: 'house4.gif' }
  };
  
  return houses[houseType] || houses['doos'];
};

const findAvailableBoxSlot = async (userId) => {
  // Get user's house capacity
  const [user] = await query("SELECT huis FROM gebruikers WHERE user_id = ?", [userId]);
  const [house] = await query("SELECT ruimte FROM huizen WHERE afkorting = ?", [user.huis]);
  
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
    await query(
      "UPDATE pokemon_speler SET opzak_nummer = ? WHERE id = ?",
      [i + 1, teamPokemons[i].id]
    );
  }
};