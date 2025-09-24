import { query } from "../config/database.js";

// Helper function to calculate Pokemon stats
const calculateStats = (baseStat, iv, level) => {
  return Math.round(((baseStat * 2 + iv) * level) / 100 + 5);
};

const calculateHP = (baseHP, hpIV, level) => {
  return Math.round(((baseHP * 2 + hpIV) * level) / 100 + level + 10);
};

// Get daycare status and user's Pokemon
export const getDaycareStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check for eggs
    const eggRows = await query(
      "SELECT * FROM daycare WHERE user_id = ? AND ei = '1'",
      [userId]
    );

    // Get daycare Pokemon
    const daycareRows = await query(
      `
      SELECT d.*, ps.wild_id, ps.shiny, pw.naam 
      FROM daycare d 
      INNER JOIN pokemon_speler ps ON d.pokemonid = ps.id 
      INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id
      WHERE d.user_id = ? AND d.ei = '0'
    `,
      [userId]
    );

    // Get user's team Pokemon
    const teamRows = await query(
      `
      SELECT ps.*, pw.naam, pw.type1, pw.type2
      FROM pokemon_speler ps 
      INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id 
      WHERE ps.user_id = ? AND ps.opzak = 'ja' 
      ORDER BY ps.opzak_nummer ASC
    `,
      [userId]
    );

    // Get user info
    const [user] = await query(
      "SELECT COUNT(ps.wild_id) AS in_hand, g.premiumaccount, g.silver FROM gebruikers AS g INNER JOIN pokemon_speler AS ps ON g.user_id = ps.user_id WHERE g.user_id = ? AND ps.opzak='ja'",
      [userId]
    );

    const isPremium = user.premiumaccount > Date.now() / 1000;
    const maxSlots = isPremium ? 2 : 1;

    return res.json({
      success: true,
      data: {
        egg: eggRows.length > 0 ? eggRows[0] : null,
        daycarePokemons: daycareRows,
        teamPokemons: teamRows,
        user: {
          inHand: user.in_hand,
          isPremium,
          maxSlots,
          silver: user.silver,
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Erro ao carregar informações do jardim de infância",
      error: error.message,
    });
  }
};

// Accept egg and hatch it
export const acceptEgg = async (req, res) => {
  try {
    const { userId } = req.body;

    // Get user info
    const [user] = await query(
      "SELECT COUNT(ps.wild_id) AS in_hand FROM gebruikers AS g INNER JOIN pokemon_speler AS ps ON g.user_id = ps.user_id WHERE g.user_id = ? AND ps.opzak='ja'",
      [userId]
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Usuário não encontrado" });
    }

    // Check if user has space
    if (user.in_hand >= 6) {
      return res
        .status(400)
        .json({ success: false, message: "Equipe está cheia" });
    }

    // Get egg info
    const [egg] = await query(
      "SELECT * FROM daycare WHERE user_id = ? AND ei = '1'",
      [userId]
    );
    if (!egg) {
      return res
        .status(400)
        .json({ success: false, message: "Nenhum ovo encontrado" });
    }

    // Get Pokemon data
    const [wildPokemon] = await query(
      "SELECT * FROM pokemon_wild WHERE naam = ? LIMIT 1",
      [egg.naam]
    );

    // Generate random character
    const [character] = await query(
      "SELECT karakter_naam FROM karakters ORDER BY RAND() LIMIT 1"
    );

    // Generate random IVs
    const attackIV = Math.floor(Math.random() * 32);
    const defenceIV = Math.floor(Math.random() * 32);
    const speedIV = Math.floor(Math.random() * 32);
    const spcAttackIV = Math.floor(Math.random() * 32);
    const spcDefenceIV = Math.floor(Math.random() * 32);
    const hpIV = Math.floor(Math.random() * 32);

    const level = 5;

    // Calculate stats
    const attackStat = calculateStats(wildPokemon.attack_base, attackIV, level);
    const defenceStat = calculateStats(
      wildPokemon.defence_base,
      defenceIV,
      level
    );
    const speedStat = calculateStats(wildPokemon.speed_base, speedIV, level);
    const spcAttackStat = calculateStats(
      wildPokemon["spc.attack_base"],
      spcAttackIV,
      level
    );
    const spcDefenceStat = calculateStats(
      wildPokemon["spc.defence_base"],
      spcDefenceIV,
      level
    );
    const hpStat = calculateHP(wildPokemon.hp_base, hpIV, level);

    // Get experience needed for next level
    const [experience] = await query(
      "SELECT punten FROM experience WHERE soort = ? AND level = ? LIMIT 1",
      [wildPokemon.groei, level + 1]
    );

    // Handle ability
    const abilities = wildPokemon.ability.split(",");
    const randomAbility =
      abilities[Math.floor(Math.random() * abilities.length)];

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const newHandPosition = user.in_hand + 1;

    // Update the Pokemon with all the calculated stats and data
    await query(
      `
    UPDATE pokemon_speler SET 
      karakter = ?, expnodig = ?, opzak = 'ja', opzak_nummer = ?, 
      shiny = ?, ei = '0', ei_tijd = ?, attack_iv = ?, defence_iv = ?, 
      speed_iv = ?, \`spc.attack_iv\` = ?, \`spc.defence_iv\` = ?, hp_iv = ?, 
      attack = ?, defence = ?, speed = ?, \`spc.attack\` = ?, \`spc.defence\` = ?, 
      levenmax = ?, leven = ?, level = ?, ability = ?, capture_date = ?
    WHERE user_id = ? AND wild_id = ?
  `,
      [
        character.karakter_naam,
        experience.punten,
        newHandPosition,
        egg.levelup,
        now,
        attackIV,
        defenceIV,
        speedIV,
        spcAttackIV,
        spcDefenceIV,
        hpIV,
        attackStat,
        defenceStat,
        speedStat,
        spcAttackStat,
        spcDefenceStat,
        hpStat,
        hpStat,
        level,
        randomAbility,
        now,
        userId,
        wildPokemon.wild_id
      ]
    );

    // Update user Pokemon count and in_hand count
    await query(
      "UPDATE gebruikers SET aantalpokemon = aantalpokemon + 1 WHERE user_id = ?",
      [userId]
    );

    // Delete egg from daycare
    await query("DELETE FROM daycare WHERE user_id = ? AND ei = '1'", [userId]);

    return res.json({
      success: true,
      message: "Ovo chocado com sucesso!",
      pokemon: {
        name: wildPokemon.naam,
        shiny: egg.levelup === "1",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao chocar ovo",
      error: error.message,
    });
  }
};

// Reject egg
export const rejectEgg = async (req, res) => {
  try {
    const { userId } = req.body;

    const result = await query(
      "DELETE FROM daycare WHERE user_id = ? AND ei = '1'",
      [userId]
    );

    if (result.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Ovo rejeitado",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Nenhum ovo encontrado",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao rejeitar ovo",
      error: error.message,
    });
  }
};

// Leave Pokemon at daycare
export const leavePokemon = async (req, res) => {
  try {
    const { userId, pokemonId } = req.body;

    // Get Pokemon info
    const [pokemon] = await query(
      `
      SELECT ps.*, pw.naam, pw.type1 
      FROM pokemon_speler ps 
      INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id 
      WHERE ps.id = ? LIMIT 1
    `,
      [pokemonId]
    );

    if (!pokemon) {
      return res
        .status(404)
        .json({ success: false, message: "Pokemon não encontrado" });
    }

    if (pokemon.user_id !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Este Pokemon não é seu" });
    }

    // Get user info
    const [user] = await query(
      "SELECT COUNT(ps.wild_id) AS in_hand, g.premiumaccount FROM gebruikers AS g INNER JOIN pokemon_speler AS ps ON g.user_id = ps.user_id WHERE g.user_id = ?",
      [userId]
    );

    if (user.in_hand <= 1) {
      return res.status(400).json({
        success: false,
        message: "Você não pode ficar sem nenhum pokémon em seu time.",
      });
    }

    if (pokemon.type1 === "Shadow") {
      return res.status(400).json({
        success: false,
        message:
          "Pokémons do tipo Shadow não podem ficar no Jardim de infância.",
      });
    }

    if (pokemon.opzak === "day") {
      return res.status(400).json({
        success: false,
        message: "Pokemon já está no jardim de infância",
      });
    }

    if (pokemon.level >= 100) {
      return res.status(400).json({
        success: false,
        message: "Pokemon já está no nível máximo",
      });
    }

    // Check daycare capacity
    const daycareCount = await query(
      "SELECT COUNT(*) as count FROM daycare WHERE user_id = ? AND ei = '0'",
      [userId]
    );

    const isPremium = user.premiumaccount > Date.now() / 1000;
    const maxSlots = isPremium ? 2 : 1;

    if (daycareCount[0].count >= maxSlots) {
      return res.status(400).json({
        success: false,
        message: "Jardim de infância está lotado",
      });
    }

    // Get all user's Pokemon to reorganize positions
    const allPokemon = await query(
      "SELECT id FROM pokemon_speler WHERE user_id = ? AND opzak = 'ja' ORDER BY opzak_nummer ASC",
      [userId]
    );

    // Update Pokemon to daycare
    await query(
      "UPDATE pokemon_speler SET opzak = 'day', opzak_nummer = '' WHERE id = ?",
      [pokemonId]
    );

    // Insert into daycare
    await query(
      "INSERT INTO daycare (pokemonid, user_id, naam, level, ei) VALUES (?, ?, ?, ?, ?)",
      [pokemonId, userId, pokemon.naam, pokemon.level, pokemon.ei]
    );

    // Reorganize remaining Pokemon positions
    let position = 1;
    for (const p of allPokemon) {
      if (p.id !== pokemonId) {
        await query("UPDATE pokemon_speler SET opzak_nummer = ? WHERE id = ?", [
          position,
          p.id,
        ]);
        position++;
      }
    }

    return res.json({
      success: true,
      message: "Pokemon deixado no jardim de infância com sucesso",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao deixar Pokemon",
      error: error.message,
    });
  }
};

// Take Pokemon from daycare
export const takePokemon = async (req, res) => {
  try {
    const { userId, pokemonId } = req.body;

    // Get daycare Pokemon info
    const [daycarePokemon] = await query(
      "SELECT * FROM daycare WHERE pokemonid = ?",
      [pokemonId]
    );

    if (!daycarePokemon) {
      return res
        .status(404)
        .json({ success: false, message: "פוקימון לא נמצא בגינה" });
    }

    if (daycarePokemon.user_id !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "הפוקימון הזה לא שלך" });
    }

    // Get user info
    const [user] = await query(
      "SELECT COUNT(ps.wild_id) AS in_hand, silver FROM gebruikers AS g INNER JOIN pokemon_speler AS ps ON g.user_id = ps.user_id WHERE g.user_id = ? AND ps.opzak='ja'",
      [userId]
    );

    if (user.in_hand >= 6) {
      return res
        .status(400)
        .json({ success: false, message: "הצוות מלא" });
    }

    // Calculate cost
    const baseCost = 250;
    const levelupCost = daycarePokemon.levelup * 500;
    const totalCost = baseCost + levelupCost;

    if (user.silver < totalCost) {
      return res.status(400).json({
        success: false,
        message: "חוסר כסף",
        cost: totalCost,
        userSilver: user.silver,
      });
    }

    const newHandPosition = user.in_hand + 1;

    // Update Pokemon back to team
    await query(
      "UPDATE pokemon_speler SET opzak = 'ja', opzak_nummer = ? WHERE id = ?",
      [newHandPosition, pokemonId]
    );

    // Remove from daycare
    await query("DELETE FROM daycare WHERE pokemonid = ?", [pokemonId]);

    // Deduct silver
    await query("UPDATE gebruikers SET silver = silver - ? WHERE user_id = ?", [
      totalCost,
      userId,
    ]);

    // Level up Pokemon (simplified version - you may want to implement full level up logic)
    if (daycarePokemon.levelup > 0) {
      await query("UPDATE pokemon_speler SET level = level + ? WHERE id = ?", [
        daycarePokemon.levelup,
        pokemonId,
      ]);

      // Create event notification
      await query(
        `
        INSERT INTO gebeurtenis (datum, ontvanger_id, bericht, gelezen) 
        VALUES (NOW(), ?, ?, '0')
      `,
        [userId, `${daycarePokemon.naam} עלה רמה!`]
      );
    }

    return res.json({
      success: true,
      message: "פוקימון הוסר בהצלחה מהגן",
      levelUps: daycarePokemon.levelup,
      cost: totalCost,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "שגיאה בהסרת פוקימון",
      error: error.message,
    });
  }
};
