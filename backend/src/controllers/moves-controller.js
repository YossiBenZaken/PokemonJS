import { query, transaction } from "../config/database.js";

// Helpers
const getUserWallet = async (userId) => {
  const [user] = await query(
    `SELECT g.user_id, g.silver, r.gold
     FROM gebruikers g
     LEFT JOIN accounts r ON g.acc_id = r.acc_id
     WHERE g.user_id = ? LIMIT 1`,
    [userId]
  );
  return user || null;
};

const getPokemonWithWild = async (pokemonId) => {
  const [row] = await query(
    `SELECT pw.wild_id, pw.type1, pw.type2, pw.naam, pw.zeldzaamheid,
            ps.*
       FROM pokemon_speler ps
  INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id
      WHERE ps.id = ?
      LIMIT 1`,
    [pokemonId]
  );
  return row || null;
};

const calculateReminderCost = (moveInfo) => {
  // Pricing per PHP logic
  let silver = 0;
  let gold = 0;

  if (moveInfo.tipo === "Status") silver = 50000;
  else if (moveInfo.sterkte <= 70) silver = 25000;
  else if (moveInfo.sterkte >= 70 && moveInfo.sterkte <= 100) silver = 75000;
  else if (moveInfo.sterkte >= 100) gold = 3;

  return { silver, gold };
};

const hasMoveAlready = (pokemon, moveName) => {
  return [pokemon.aanval_1, pokemon.aanval_2, pokemon.aanval_3, pokemon.aanval_4].includes(moveName);
};

const firstEmptySlot = (pokemon) => {
  if (!pokemon.aanval_1) return "aanval_1";
  if (!pokemon.aanval_2) return "aanval_2";
  if (!pokemon.aanval_3) return "aanval_3";
  if (!pokemon.aanval_4) return "aanval_4";
  return null;
};

// GET /api/moves/list/:pokemonId?method=tutor|reminder
export const listAvailableMoves = async (req, res) => {
  try {
    const { pokemonId } = req.params;
    const method = (req.query.method === "reminder") ? "reminder" : "tutor";

    const pokemon = await getPokemonWithWild(pokemonId);
    if (!pokemon) return res.status(404).json({ success: false, message: "פוקימון לא נמצא" });
    if (pokemon.ei === 1) return res.status(400).json({ success: false, message: "הפוקימון עדיין ביצה" });
    if (pokemon.opzak !== 'ja') return res.status(400).json({ success: false, message: "הפוקימון לא בצוות" });

    const moves = [];

    if (method === "tutor") {
      // From tmhm_movetutor where related list contains this wild_id and pokemon doesn't already know the move
      const tutorRows = await query("SELECT * FROM tmhm_movetutor");
      for (const row of tutorRows) {
        if (!row.relacionados) continue;
        const related = String(row.relacionados).split(",").map((s) => s.trim()).filter(Boolean);
        if (!related.includes(String(pokemon.wild_id))) continue;
        if (hasMoveAlready(pokemon, row.naam)) continue;

        const price = {
          silver: Number(row.silver) || 0,
          gold: Number(row.gold) || 0,
        };
        moves.push({ name: row.naam, type: row.soort || null, price });
      }
    } else {
      // Reminder: from levelen up to current level; skip Sketch and existing moves
      const levelRows = await query(
        "SELECT * FROM levelen WHERE wild_id = ? AND level <= ? ORDER BY level ASC",
        [pokemon.wild_id, pokemon.level]
      );

      for (const row of levelRows) {
        const [move] = await query("SELECT * FROM attack WHERE name = ? LIMIT 1", [row.aanval]);
        if (!move) continue;
        if (move.name === "Sketch") continue;
        if (hasMoveAlready(pokemon, move.name)) continue;

        const price = calculateReminderCost(move);
        moves.push({ name: move.name, type: move.type, price });
      }
    }

    return res.json({ success: true, data: { moves, pokemonId: pokemon.id, method } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/moves/learn
// body: { userId, pokemonId, moveName, method: 'tutor'|'reminder', replaceSlot?: 'aanval_1'|'aanval_2'|'aanval_3'|'aanval_4' }
export const learnMove = async (req, res) => {
  try {
    const { userId, pokemonId, moveName, method, replaceSlot } = req.body || {};
    if (!userId || !pokemonId || !moveName) return res.status(400).json({ success: false, message: "נתונים חסרים" });

    const user = await getUserWallet(userId);
    if (!user) return res.status(404).json({ success: false, message: "משתמש לא נמצא" });

    const pokemon = await getPokemonWithWild(pokemonId);
    if (!pokemon) return res.status(404).json({ success: false, message: "פוקימון לא נמצא" });
    if (pokemon.user_id !== userId) return res.status(403).json({ success: false, message: "הפוקימון אינו שלך" });
    if (pokemon.ei === 1) return res.status(400).json({ success: false, message: "הפוקימון עדיין ביצה" });
    if (pokemon.opzak !== 'ja') return res.status(400).json({ success: false, message: "הפוקימון לא בצוות" });

    // Determine pricing
    let price = { silver: 0, gold: 0 };
    if (method === "tutor") {
      const [row] = await query("SELECT * FROM tmhm_movetutor WHERE naam = ? LIMIT 1", [moveName]);
      if (!row) return res.status(404).json({ success: false, message: "מהלך לא נתמך" });
      price = { silver: Number(row.silver) || 0, gold: Number(row.gold) || 0 };
    } else {
      const [move] = await query("SELECT * FROM attack WHERE naam = ? LIMIT 1", [moveName]);
      if (!move) return res.status(404).json({ success: false, message: "מהלך לא נמצא" });
      // verify learned by level
      const [allowed] = await query(
        "SELECT 1 FROM levelen WHERE wild_id = ? AND level <= ? AND aanval = ? LIMIT 1",
        [pokemon.wild_id, pokemon.level, moveName]
      );
      if (!allowed) return res.status(400).json({ success: false, message: "המהלך לא זמין להיזכרות" });
      price = calculateReminderCost(move);
    }

    // Already knows
    if (hasMoveAlready(pokemon, moveName)) {
      return res.status(400).json({ success: false, message: "הפוקימון כבר יודע את המהלך" });
    }

    // Check funds
    if ((user.silver || 0) < price.silver) return res.status(400).json({ success: false, message: "אין מספיק Silvers" });
    if ((user.gold || 0) < price.gold) return res.status(400).json({ success: false, message: "אין מספיק Golds" });

    // Determine target slot
    let slot = firstEmptySlot(pokemon);
    if (!slot) {
      if (!replaceSlot || !["aanval_1", "aanval_2", "aanval_3", "aanval_4"].includes(replaceSlot)) {
        // Ask client to choose slot
        return res.status(200).json({
          success: true,
          needSlot: true,
          message: "בחר מהלך להחלפה",
          currentMoves: [pokemon.aanval_1, pokemon.aanval_2, pokemon.aanval_3, pokemon.aanval_4],
          price
        });
      }
      slot = replaceSlot;
    }

    // Perform transaction: deduct funds and set move
    await transaction(async (conn) => {
      await conn.execute(`UPDATE gebruikers SET silver = silver - ? WHERE user_id = ?`, [price.silver, userId]);
      await conn.execute(`UPDATE accounts SET gold = gold - ? WHERE acc_id = ?`, [price.gold, userId]);
      await conn.execute(`UPDATE pokemon_speler SET ${slot} = ? WHERE id = ?`, [moveName, pokemonId]);
    });

    return res.json({ success: true, message: method === 'tutor' ? `הפוקימון למד את ${moveName}` : `הפוקימון נזכר ב-${moveName}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


