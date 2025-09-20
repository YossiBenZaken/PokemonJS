import { query } from "../config/database.js";
import {updatePokedex} from '../helpers/pokedex-helper.js';

// Helper function to calculate Pokemon stats
const calculateStats = (baseStat, iv, level, characterMultiplier) => {
  return Math.round((((baseStat * 2 + iv) * level / 100) + 5) * characterMultiplier);
};

const calculateHP = (baseHP, hpIV, level) => {
  return Math.round(((baseHP * 2 + hpIV) * level / 100) + level + 10);
};

// Get all traders and their current offers
export const getTraders = async (req, res) => {
  try {
    const traders = await query("SELECT * FROM traders");
    
    return res.json({
      success: true,
      data: traders.map(trader => ({
        eigenaar: trader.eigenaar,
        wil: trader.wil || null, // Pokemon they want
        naam: trader.naam || null, // Pokemon they offer
        hasOffer: !!(trader.wil && trader.naam)
      }))
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao carregar comerciantes",
      error: error.message
    });
  }
};

// Execute a trade with a trader
export const executeTrade = async (req, res) => {
  try {
    const { userId, traderName } = req.body;

    // Check user restrictions and rank
    const [user] = await query(
      "SELECT username, rank, `restrict` FROM gebruikers WHERE user_id = ?",
      [userId]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado" });
    }

    if (user.restrict === '1') {
      return res.status(403).json({ 
        success: false, 
        message: "Usuário restrito não pode fazer trocas" 
      });
    }

    if (user.rank < 4) {
      return res.status(403).json({ 
        success: false, 
        message: "RANK MÍNIMO PARA TROCAR POKÉMONS: 4 - First Coach" 
      });
    }

    // Get trader info
    const [trader] = await query(
      "SELECT * FROM traders WHERE eigenaar = ? LIMIT 1",
      [traderName]
    );

    if (!trader) {
      return res.status(404).json({ success: false, message: "Comerciante não encontrado" });
    }

    if (!trader.wil || !trader.naam) {
      return res.status(400).json({ 
        success: false, 
        message: `${trader.eigenaar} não tem uma oferta disponível no momento` 
      });
    }

    // Check if user has the required Pokemon
    const userPokemon = await query(`
      SELECT ps.id, ps.opzak_nummer, ps.level, pw.naam
      FROM pokemon_speler ps
      INNER JOIN pokemon_wild pw ON ps.wild_id = pw.wild_id
      WHERE pw.naam = ? AND ps.user_id = ? AND ps.opzak = 'ja'
      ORDER BY ps.opzak_nummer ASC
      LIMIT 1
    `, [trader.wil, userId]);

    if (userPokemon.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Você não tem um ${trader.wil} em sua equipe` 
      });
    }

    const pokemonToTrade = userPokemon[0];

    // Special case: Wayne gives 100 silver
    if (trader.eigenaar === 'Wayne') {
      await query(
        "UPDATE gebruikers SET silver = silver + 100 WHERE user_id = ? LIMIT 1",
        [userId]
      );
    }

    // Delete the user's Pokemon
    await query("DELETE FROM pokemon_speler WHERE id = ? LIMIT 1", [pokemonToTrade.id]);

    // Create the new Pokemon
    await createTradedPokemon(userId, trader.naam, pokemonToTrade.level, pokemonToTrade.opzak_nummer);

    // Clear the trader's offer
    await query(
      "UPDATE traders SET wil = '', naam = '' WHERE eigenaar = ?",
      [traderName]
    );

    return res.json({
      success: true,
      message: `${trader.eigenaar}: Troca realizada com sucesso! Você recebeu ${trader.naam}!`,
      bonusMessage: trader.eigenaar === 'Wayne' ? "Você também recebeu 100 Silver!" : null
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao executar troca",
      error: error.message
    });
  }
};

// Helper function to create a traded Pokemon with proper evolution and moves
const createTradedPokemon = async (userId, pokemonName, level, position) => {
  // Get base Pokemon data
  const [basePokemon] = await query(
    "SELECT wild_id, naam, aanval_1, aanval_2, aanval_3, aanval_4, ability FROM pokemon_wild WHERE naam = ? LIMIT 1",
    [pokemonName]
  );

  if (!basePokemon) {
    throw new Error(`Pokemon ${pokemonName} not found`);
  }

  let currentPokemon = {
    id: basePokemon.wild_id,
    pokemon: basePokemon.naam,
    aanval1: basePokemon.aanval_1,
    aanval2: basePokemon.aanval_2,
    aanval3: basePokemon.aanval_3,
    aanval4: basePokemon.aanval_4
  };

  // Process evolution and moves up to the given level
  let finished = false;
  let loop = 0;

  do {
    let counter = 0;
    loop++;

    // Get level-up data for current Pokemon
    const levelData = await query(
      "SELECT * FROM levelen WHERE wild_id = ? AND level <= ? ORDER BY id ASC",
      [currentPokemon.id, level]
    );

    for (const growth of levelData) {
      counter++;

      if (level >= growth.level) {
        if (growth.wat === 'att') {
          // Add move
          if (!currentPokemon.aanval1) currentPokemon.aanval1 = growth.aanval;
          else if (!currentPokemon.aanval2) currentPokemon.aanval2 = growth.aanval;
          else if (!currentPokemon.aanval3) currentPokemon.aanval3 = growth.aanval;
          else if (!currentPokemon.aanval4) currentPokemon.aanval4 = growth.aanval;
          else {
            // Replace random move if all slots filled and move is new
            const moves = [currentPokemon.aanval1, currentPokemon.aanval2, currentPokemon.aanval3, currentPokemon.aanval4];
            if (!moves.includes(growth.aanval)) {
              const randomSlot = Math.floor(Math.random() * 4) + 1;
              currentPokemon[`aanval${randomSlot}`] = growth.aanval;
            }
          }
        } else if (growth.wat === 'evo') {
          // Evolution
          currentPokemon.id = growth.nieuw_id;
          currentPokemon.pokemon = growth.naam;
          loop = 0;
          break;
        }
      } else {
        finished = true;
        break;
      }
    }

    if (counter === 0 || loop === 2) {
      finished = true;
    }
  } while (!finished);

  // Get Pokemon stats and info for the final evolved form
  const [pokemonInfo] = await query(
    "SELECT * FROM pokemon_wild WHERE wild_id = ?",
    [currentPokemon.id]
  );

  // Get experience needed for next level
  const nextLevel = level + 1;
  const [experience] = await query(
    "SELECT punten FROM experience WHERE soort = ? AND level = ?",
    [pokemonInfo.groei, nextLevel]
  );

  // Get random character
  const [character] = await query(
    "SELECT * FROM karakters ORDER BY RAND() LIMIT 1"
  );

  // Generate IVs (2-15 for traded Pokemon, weaker than caught ones)
  const attackIV = Math.floor(Math.random() * (15 - 2 + 1)) + 2;
  const defenceIV = Math.floor(Math.random() * (15 - 2 + 1)) + 2;
  const speedIV = Math.floor(Math.random() * (15 - 2 + 1)) + 2;
  const spcAttackIV = Math.floor(Math.random() * (15 - 2 + 1)) + 2;
  const spcDefenceIV = Math.floor(Math.random() * (15 - 2 + 1)) + 2;
  const hpIV = Math.floor(Math.random() * (15 - 2 + 1)) + 2;

  // Calculate stats
  const attackStat = calculateStats(pokemonInfo.attack_base, attackIV, level, character.attack_add);
  const defenceStat = calculateStats(pokemonInfo.defence_base, defenceIV, level, character.defence_add);
  const speedStat = calculateStats(pokemonInfo.speed_base, speedIV, level, character.speed_add);
  const spcAttackStat = calculateStats(pokemonInfo['spc.attack_base'], spcAttackIV, level, character['spc.attack_add']);
  const spcDefenceStat = calculateStats(pokemonInfo['spc.defence_base'], spcDefenceIV, level, character['spc.defence_add']);
  const hpStat = calculateHP(pokemonInfo.hp_base, hpIV, level);

  // Handle ability
  const abilities = pokemonInfo.ability.split(',');
  const randomAbility = abilities[Math.floor(Math.random() * abilities.length)];

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Insert the new Pokemon
  await query(`
    INSERT INTO pokemon_speler (
      wild_id, user_id, opzak, opzak_nummer, karakter, trade, level, 
      levenmax, leven, expnodig, attack, defence, speed, \`spc.attack\`, \`spc.defence\`,
      attack_iv, defence_iv, speed_iv, \`spc.attack_iv\`, \`spc.defence_iv\`, hp_iv,
      aanval_1, aanval_2, aanval_3, aanval_4, gevongenmet, ability, capture_date
    ) VALUES (?, ?, 'ja', ?, ?, '1.5', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Trader ball', ?, ?)
  `, [
    currentPokemon.id, userId, position, character.karakter_naam, level,
    hpStat, hpStat, experience?.punten || 0, attackStat, defenceStat, speedStat, spcAttackStat, spcDefenceStat,
    attackIV, defenceIV, speedIV, spcAttackIV, spcDefenceIV, hpIV,
    currentPokemon.aanval1, currentPokemon.aanval2, currentPokemon.aanval3, currentPokemon.aanval4,
    randomAbility, now
  ]);

  // Update Pokedex (if you have this function)
  await updatePokedex(userId, currentPokemon.id, '', 'ei');
};

// Admin function to refresh traders (reset their offers)
export const refreshTraders = async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if user is admin
    const [user] = await query(
      "SELECT admin FROM gebruikers WHERE user_id = ?",
      [userId]
    );

    if (!user || user.admin === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "Acesso negado - apenas administradores" 
      });
    }

    // Clear all trader offers
    await query("UPDATE traders SET wil = '', naam = ''");

    return res.json({
      success: true,
      message: "Comerciantes atualizados com sucesso!"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao atualizar comerciantes",
      error: error.message
    });
  }
};