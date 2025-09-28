import { InitBattle, getBattleInfo } from "./battle-controller.js";

import { query } from "../config/database.js";

export const startTrainerBattle = async (req) => {
  const userId = req.body.userId;
  const { trainer, trainerAveLevel, gebied } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "משתמש לא מחובר" });
  }

  try {
    // 1. מחיקת קרבות ישנים
    await query("DELETE FROM aanval_log WHERE user_id=?", [userId]);
    await query("DELETE FROM pokemon_speler_gevecht WHERE user_id=?", [userId]);

    const inHand = await query(
      "SELECT id FROM pokemon_speler WHERE user_id=? AND opzak='ja' ORDER BY opzak_nummer ASC",
      [userId]
    );
    for (const row of inHand) {
      await query("DELETE FROM pokemon_speler_gevecht WHERE id=?", [row.id]);
    }

    // 2. יצירת aanval_log חדש
    const insertLog = await query(
      "INSERT INTO aanval_log (user_id, gebied, trainer) VALUES (?, ?, ?)",
      [userId, gebied, trainer]
    );
    const aanvalLogId = insertLog.insertId;

    // 3. בניית היריב (Trainer עם פוקימונים)
    const attackInfo = await createNewTrainer(
      trainer,
      trainerAveLevel,
      aanvalLogId
    );

    // 4. הכנסת הפוקימונים של השחקן
    await createPlayer(userId, aanvalLogId);

    // 5. בדיקה מי מתחיל לפי Speed
    const finalInfo = await whoCanStart(userId, attackInfo);

    if (!finalInfo.bericht) {
      // שמירת מצב הקרב
      updatePokedex(attackInfo.computer_wildid, "zien", userId);
      await saveAttack(userId, finalInfo, aanvalLogId);
      finalInfo["trainer"] = {
        aanvalLogId,
        begin_zien: true,
      };
    } else {
      //Clear Computer
      await query("DELETE FROM `pokemon_wild_gevecht` WHERE `id`=?", [
        attackInfo.computer_id,
      ]);
      //Clear Player
      await query("DELETE FROM `pokemon_speler_gevecht` WHERE `user_id`=?", [
        userId,
      ]);
    }

    return finalInfo;
  } catch (err) {
    console.error("❌ startTrainerBattle error:", err);
  }
};

async function saveAttack(userId, attackInfo, aanvalLogId) {
  const gebruikt = `,${attackInfo.pokemonid},`;
  await query(
    "UPDATE aanval_log SET laatste_aanval=?, tegenstanderid=?, pokemonid=?, gebruikt_id=? WHERE id=?",
    [
      attackInfo.begin,
      attackInfo.computer_id,
      attackInfo.pokemonid,
      gebruikt,
      aanvalLogId,
    ]
  );
  await query("UPDATE gebruikers SET pagina='trainer-attack' WHERE user_id=?", [
    userId,
  ]);
}

async function createPlayer(userId, aanvalLogId) {
  const pokemons = await query(
    "SELECT * FROM pokemon_speler WHERE user_id=? AND opzak='ja' ORDER BY opzak_nummer ASC",
    [userId]
  );
  for (const p of pokemons) {
    await query(
      `INSERT INTO pokemon_speler_gevecht 
        (id, user_id, aanval_log_id, levenmax, leven, attack, defence, speed, \`spc.attack\`, \`spc.defence\`, exp, totalexp, effect, hoelang) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        userId,
        aanvalLogId,
        p.levenmax,
        p.leven,
        p.attack,
        p.defence,
        p.speed,
        p["spc.attack"],
        p["spc.defence"],
        p.exp,
        p.totalexp,
        p.effect,
        p.hoelang,
      ]
    );
  }
}

async function whoCanStart(userId, attackInfo) {
  const opzak = await query(
    "SELECT ps.id, ps.leven, ps.speed, ps.ei, pw.naam FROM pokemon_speler ps INNER JOIN pokemon_wild pw ON ps.wild_id=pw.wild_id WHERE ps.user_id=? AND ps.opzak='ja' ORDER BY ps.opzak_nummer ASC",
    [userId]
  );

  let nummer = 0;
  for (const p of opzak) {
    if (p.leven >= 1 && p.ei == 0) {
      nummer++;
      if (nummer === 1) {
        attackInfo.pokemon_speed = p.speed;
        attackInfo.pokemon = p.naam;
        attackInfo.pokemonid = p.id;
      }
    }
  }

  if (nummer === 0) {
    attackInfo.bericht = "begindood";
  } else {
    attackInfo.begin =
      attackInfo.pokemon_speed >= attackInfo.computer_speed
        ? "spelereersteaanval"
        : "computereersteaanval";
  }

  return attackInfo;
}

async function createNewTrainer(trainer, trainerAveLevel, aanvalLogId) {
  const [trainerInfo] = await query(
    `SELECT trainer.*, trainer_pokemon.* 
       FROM trainer 
       INNER JOIN trainer_pokemon ON trainer.id = trainer_pokemon.trainer_id 
       WHERE trainer.naam = ?`,
    [trainer]
  );

  const trainerPokemonsId = trainerInfo.pokemonwild_id.split(",");
  const attackInfo = {};

  if (trainerPokemonsId.length === 0) {
    attackInfo["bericht"] = "oponent_error";
    return attackInfo;
  }

  for (let index = 0; index < trainerPokemonsId.length; index++) {
    const pokemonId = trainerPokemonsId[index];
    if (!pokemonId) continue;

    // קביעת level
    let level;
    if (trainerInfo.progress === 0 && trainerInfo.badge !== "") {
      level = 3;
    } else if (trainerInfo.badge === "") {
      level = Math.round((trainerAveLevel / 100) * getRandomInt(95, 130));
    } else {
      const val = (trainerInfo.progress + 1) * 2;
      level = Math.round(
        (trainerAveLevel / 100) * getRandomInt(95 + val, 130 + val)
      );
    }

    if (level > 100) level = 100;
    if (level < 5) level = 5;

    // קבלת פרטי הפוקימון
    const [newComputerSql] = await query(
      "SELECT * FROM `pokemon_wild` WHERE `wild_id`=?",
      [pokemonId]
    );

    // יצירת פוקימון חדש עם סטטיסטיקות
    let newComputer = await createNewComputerPokemon(newComputerSql, level);
    newComputer = createNewComputerStats(newComputer, newComputerSql, level);

    // הוספת הפוקימון לטבלת קרב
    const insertComputer = await query(
      `INSERT INTO pokemon_wild_gevecht 
         (wildid, aanval_log_id, level, levenmax, leven, attack, defence, speed, \`spc.attack\`, \`spc.defence\`, aanval_1, aanval_2, aanval_3, aanval_4, ability)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newComputer.id,
        aanvalLogId,
        level,
        newComputer.hpstat,
        newComputer.hpstat,
        newComputer.attackstat,
        newComputer.defencestat,
        newComputer.speedstat,
        newComputer.spcattackstat,
        newComputer.spcdefencestat,
        newComputer.aanval1,
        newComputer.aanval2,
        newComputer.aanval3,
        newComputer.aanval4,
        newComputer.ability,
      ]
    );

    const computerId = insertComputer.insertId;

    // שמירת מידע לפוקימון הראשון בלבד
    if (index === 0) {
      attackInfo.computer_id = computerId;
      attackInfo.computer_wildid = newComputerSql.wild_id;
      attackInfo.computer = newComputer.pokemon;
      attackInfo.computer_speed = newComputer.speedstat;
    }
  }
  return attackInfo;
}

async function createNewComputerPokemon(newComputerSql, computerLevel) {
  const newComputer = {};

  // Alle gegevens vaststellen
  newComputer.id = newComputerSql.wild_id;
  newComputer.pokemon = newComputerSql.naam;
  newComputer.aanval1 = newComputerSql.aanval_1;
  newComputer.aanval2 = newComputerSql.aanval_2;
  newComputer.aanval3 = newComputerSql.aanval_3;
  newComputer.aanval4 = newComputerSql.aanval_4;

  const abilities = newComputerSql.ability.split(",");
  const randAb = Math.floor(Math.random() * abilities.length);
  newComputer.ability = abilities[randAb];

  let klaar = false;
  let loop = 0;

  do {
    let teller = 0;
    loop++;

    // Load leveling data
    const levelenQuery = await query(
      "SELECT * FROM levelen WHERE wild_id = ? AND level <= ? ORDER BY id ASC",
      [newComputer.id, computerLevel]
    );

    for (const groei of levelenQuery) {
      teller++;

      if (computerLevel >= groei.level) {
        if (groei.wat === "att") {
          // Attack slots
          if (!newComputer.aanval1) newComputer.aanval1 = groei.aanval;
          else if (!newComputer.aanval2) newComputer.aanval2 = groei.aanval;
          else if (!newComputer.aanval3) newComputer.aanval3 = groei.aanval;
          else if (!newComputer.aanval4) newComputer.aanval4 = groei.aanval;
          else {
            // Replace random attack if not already present
            if (
              ![
                newComputer.aanval1,
                newComputer.aanval2,
                newComputer.aanval3,
                newComputer.aanval4,
              ].includes(groei.aanval)
            ) {
              const nummer = Math.floor(Math.random() * 4) + 1;
              if (nummer === 1) newComputer.aanval1 = groei.aanval;
              else if (nummer === 2) newComputer.aanval2 = groei.aanval;
              else if (nummer === 3) newComputer.aanval3 = groei.aanval;
              else if (nummer === 4) newComputer.aanval4 = groei.aanval;
            }
          }
        } else if (groei.wat === "evo") {
          // Evolve Pokémon
          const evoResult = await query(
            "SELECT * FROM pokemon_wild WHERE wild_id = ? LIMIT 1",
            [groei.nieuw_id]
          );
          if (evoResult.length > 0) {
            const evo = evoResult[0];
            newComputer.id = groei.nieuw_id;
            newComputer.pokemon = evo.naam;
            loop = 0; // reset loop
            break; // break while-loop
          }
        }
      } else {
        klaar = true;
        break;
      }
    }

    if (teller === 0 || loop === 2) {
      break;
    }
  } while (!klaar);

  return newComputer;
}

export function createNewComputerStats(
  newComputer,
  newComputerSql,
  computerLevel
) {
  // IVs אקראיים בין 2 ל-31
  const attackIv = getRandomInt(2, 31);
  const defenceIv = getRandomInt(2, 31);
  const speedIv = getRandomInt(2, 31);
  const spcAttackIv = getRandomInt(2, 31);
  const spcDefenceIv = getRandomInt(2, 31);
  const hpIv = getRandomInt(2, 31);

  // חישוב סטטיסטיקות
  newComputer.attackstat = Math.round(
    (((newComputerSql.attack_base * 2 + attackIv) * computerLevel) / 100 + 5) *
      1
  );
  newComputer.defencestat = Math.round(
    (((newComputerSql.defence_base * 2 + defenceIv) * computerLevel) / 100 +
      5) *
      1
  );
  newComputer.speedstat = Math.round(
    (((newComputerSql.speed_base * 2 + speedIv) * computerLevel) / 100 + 5) * 1
  );
  newComputer.spcattackstat = Math.round(
    (((newComputerSql["spc.attack_base"] * 2 + spcAttackIv) * computerLevel) /
      100 +
      5) *
      1
  );
  newComputer.spcdefencestat = Math.round(
    (((newComputerSql["spc.defence_base"] * 2 + spcDefenceIv) * computerLevel) /
      100 +
      5) *
      1
  );
  newComputer.hpstat = Math.round(
    ((newComputerSql.hp_base * 2 + hpIv) * computerLevel) / 100 +
      computerLevel +
      10
  );

  return newComputer;
}

export async function updatePokedex(wild_id, wat, userId) {
  const [myData] = await query(
    "SELECT `pok_gezien`,`pok_bezit` FROM `gebruikers` WHERE `user_id`=? LIMIT 1",
    [userId]
  );
  const pokedex_bezit = myData["pok_bezit"].split(",");
  const pokedex_gezien = myData["pok_gezien"].split(",");
  if (["ei", "buy", "evo"].includes(wat)) {
    if (!pokedex_gezien.includes(wild_id)) pokedex_gezien.push(wild_id);
    if (!pokedex_bezit.includes(wild_id)) pokedex_bezit.push(wild_id);
  } else if (wat === "zien") {
    if (!pokedex_gezien.includes(wild_id)) pokedex_gezien.push(wild_id);
  } else if (wat === "vangen") {
    if (!pokedex_bezit.includes(wild_id)) pokedex_bezit.push(wild_id);
  }

  const pokedex_bezit_string = pokedex_bezit.join(",");
  const pokedex_gezien_string = pokedex_gezien.join(",");

  await query(
    "UPDATE `gebruikers` SET `pok_gezien` = ? , `pok_bezit` = ? WHERE user_id = ?",
    [pokedex_gezien_string, pokedex_bezit_string, userId]
  );
}
function getRandomInt(min, max) {
  // מחזיר מספר שלם בין min ל-max כולל
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper functions for battle calculations
const damageController = (attackerInfo, opponentInfo, attackInfo, weather) => {
  // Implement damage calculation from PHP damage_controller function
  let damage = 0;

  // Base damage calculation
  if (attackInfo.sterkte > 0) {
    const level = attackerInfo.level;
    const attackStat =
      attackInfo.tipo === "Physical"
        ? attackerInfo.attack
        : attackerInfo["spc.attack"];
    const defenseStat =
      attackInfo.tipo === "Physical"
        ? opponentInfo.defence
        : opponentInfo["spc.defence"];

    // Pokemon damage formula
    damage = Math.floor(
      ((((((2 * level) / 5 + 2) * attackStat) / defenseStat) *
        attackInfo.sterkte) /
        50 +
        2) *
        (Math.random() * 0.15 + 0.85) // Random factor 85-100%
    );

    // STAB (Same Type Attack Bonus)
    if (
      attackInfo.soort === attackerInfo.type1 ||
      attackInfo.soort === attackerInfo.type2
    ) {
      damage = Math.floor(damage * 1.5);
    }

    // Type effectiveness
    const effectiveness = getTypeEffectiveness(attackInfo.soort, opponentInfo);
    damage = Math.floor(damage * effectiveness);

    // Weather effects
    if (weather) {
      damage = applyWeatherEffects(damage, attackInfo, weather);
    }
  } else if (attackInfo.hp_schade > 0) {
    damage = attackInfo.hp_schade;
  }

  return Math.max(0, damage);
};

const getTypeEffectiveness = (attackType, defender) => {
  // Simplified type effectiveness chart
  const typeChart = {
    Water: { Fire: 2, Ground: 2, Rock: 2, Grass: 0.5, Dragon: 0.5, Water: 0.5 },
    Fire: {
      Grass: 2,
      Ice: 2,
      Bug: 2,
      Steel: 2,
      Water: 0.5,
      Fire: 0.5,
      Rock: 0.5,
    },
    Electric: { Water: 2, Flying: 2, Electric: 0.5, Grass: 0.5, Ground: 0 },
    Grass: { Water: 2, Ground: 2, Rock: 2, Fire: 0.5, Grass: 0.5, Flying: 0.5 },
    Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Steel: 0.5, Dark: 0 },
    Fighting: {
      Normal: 2,
      Ice: 2,
      Rock: 2,
      Dark: 2,
      Steel: 2,
      Flying: 0.5,
      Psychic: 0.5,
      Ghost: 0,
    },
    Normal: { Rock: 0.5, Steel: 0.5, Ghost: 0 },
  };

  let effectiveness = 1;

  if (typeChart[attackType]?.[defender.type1]) {
    effectiveness *= typeChart[attackType][defender.type1];
  }

  if (defender.type2 && typeChart[attackType]?.[defender.type2]) {
    effectiveness *= typeChart[attackType][defender.type2];
  }

  return effectiveness;
};

const applyWeatherEffects = (damage, attackInfo, weather) => {
  switch (weather) {
    case "rain":
    case "heavy_rain":
      if (attackInfo.soort === "Water") return Math.floor(damage * 1.5);
      if (attackInfo.soort === "Fire") return Math.floor(damage * 0.5);
      break;
    case "harsh_sunlight":
    case "extremely_harsh_sunlight":
      if (attackInfo.soort === "Fire") return Math.floor(damage * 1.5);
      if (attackInfo.soort === "Water") return Math.floor(damage * 0.5);
      break;
    case "sandstorm":
      if (
        attackInfo.naam === "Solar Beam" ||
        attackInfo.naam === "Solar Blade"
      ) {
        return Math.floor(damage * 0.5);
      }
      break;
  }
  return damage;
};

const multipleHits = (attackInfo, damage) => {
  let finalDamage = damage;
  let message = "";

  if (attackInfo.aantalkeer === "2-5") {
    const times =
      Math.random() < 0.75
        ? Math.floor(Math.random() * 2) + 2
        : Math.floor(Math.random() * 2) + 4;
    finalDamage = damage * times;
    message = `<br/>${attackInfo.naam} hit ${times} times!`;
  } else if (attackInfo.aantalkeer === "1-2") {
    const times = Math.random() < 0.75 ? 1 : 2;
    finalDamage = damage * times;
    if (times === 2)
      message = `<br/>${attackInfo.naam} hit twice due to Parental Bond!`;
  } else if (
    attackInfo.aantalkeer !== "1" &&
    !isNaN(parseInt(attackInfo.aantalkeer))
  ) {
    const times = parseInt(attackInfo.aantalkeer);
    finalDamage = damage * times;
    message = `<br/>${attackInfo.naam} hit ${times} times!`;
  }

  return { damage: finalDamage, message };
};

const getAttackInfo = async (attackName) => {
  const [attack] = await query("SELECT * FROM aanval WHERE naam = ?", [
    attackName,
  ]);

  return attack || null;
};

const getBattleData = async (battleLogId) => {
  const battleInit = await getBattleInfo(battleLogId);
  return {
    battleLog: battleInit.aanval_log,
    playerPokemon: battleInit.pokemon_info,
    computerPokemon: battleInit.computer_info,
  };
};

// Main attack handler
export const doTrainerAttack = async (req, res) => {
  try {
    let { attack_name, wie, aanval_log_id, zmove } = req.body;
    const userId = req.user?.user_id; // Assuming auth middleware sets this
    if (!wie || !aanval_log_id) {
      return res.status(400).send("Missing required parameters");
    }

    const battleLogId = parseInt(aanval_log_id);
    const isZMove = zmove === "y";

    // Get battle data
    const battleData = await getBattleData(battleLogId);
    if (!battleData) {
      return res.status(404).send("Battle not found");
    }

    const { battleLog, playerPokemon, computerPokemon } = battleData;

    // Security check
    if (battleLog.user_id !== userId) {
      return res.status(403).send("Battle ended due to inactivity!");
    }

    let attackerInfo,
      opponentInfo,
      attackStatus = {};
    let message = "";
    let nextTurn = 0;
    let lifeDecrease = 0;
    let lifeOff = 0;
    let fightEnd = 0;
    let transform = 0;
    let messageAdd = "";
    let messageBurn = "";
    let recoilDamage = 0;
    let recLeft = 0;
    let newExp = 0;
    let steps = "";

    // Check if Pokemon is alive
    if (playerPokemon.leven < 1) {
      nextTurn = 0;
      const alivePokemon = await query(
        `
        SELECT COUNT(*) as count 
        FROM pokemon_speler_gevecht psg 
        INNER JOIN pokemon_speler ps ON psg.id = ps.id 
        WHERE psg.aanval_log_id = ? AND psg.leven > 0 AND ps.ei = 0
      `,
        [battleLogId]
      );

      if (alivePokemon[0].count === 0) {
        fightEnd = 1;
        message = `${playerPokemon.naam_goed} fainted! Fight over!`;
        await query(
          'UPDATE aanval_log SET laatste_aanval = "end_screen" WHERE id = ?',
          [battleLogId]
        );
      } else {
        fightEnd = 0;
        message = `${playerPokemon.naam_goed} fainted! Choose another Pokemon!`;
        await query(
          'UPDATE aanval_log SET laatste_aanval = "speler_wissel" WHERE id = ?',
          [battleLogId]
        );
      }

      return res.json({
        message,
        nextTurn,
        hp: computerPokemon.leven,
        maxHp: computerPokemon.levenmax,
        who: "computer",
        knockedOut: 0,
        battleFinished: fightEnd,
        damage: 0,
        computerId: computerPokemon.id,
        pokemonPosition: playerPokemon.opzak_nummer,
        expGained: newExp,
        levelGained: playerPokemon.expnodig,
        recoilDamage,
        recLeft,
        playerMaxHp: playerPokemon.levenmax,
        whoPlayer: "pokemon",
        steps,
        playerHp: playerPokemon.leven,
        attackType: "",
        pokemonEffect: playerPokemon.effect || "",
        computerEffect: computerPokemon.effect || "",
        transform,
        weather: battleLog.weather || "",
      });
    }

    if (computerPokemon.leven < 1) {
      nextTurn = 0;
      fightEnd = 1;

      const aliveComputers = await query(
        "SELECT COUNT(*) as count FROM pokemon_wild_gevecht WHERE aanval_log_id = ? AND leven > 0",
        [battleLogId]
      );

      if (aliveComputers[0].count === 0) {
        message = `${computerPokemon.naam_goed} fainted! Fight over!`;
        await query(
          'UPDATE aanval_log SET laatste_aanval = "end_screen" WHERE id = ?',
          [battleLogId]
        );
      } else {
        fightEnd = 0;
        message = `${computerPokemon.naam_goed} fainted! ${battleLog.trainer} will choose another Pokemon!`;
        await query(
          'UPDATE aanval_log SET laatste_aanval = "trainer_wissel" WHERE id = ?',
          [battleLogId]
        );
      }

      // Add experience gain logic here
      newExp = playerPokemon.exp + Math.floor(Math.random() * 100) + 50;

      return res.json({
        message,
        nextTurn,
        hp: computerPokemon.leven,
        maxHp: computerPokemon.levenmax,
        who: "computer",
        knockedOut: 0,
        battleFinished: fightEnd,
        damage: 0,
        computerId: computerPokemon.id,
        pokemonPosition: playerPokemon.opzak_nummer,
        expGained: newExp,
        levelGained: playerPokemon.expnodig,
        recoilDamage,
        recLeft,
        playerMaxHp: playerPokemon.levenmax,
        whoPlayer: "pokemon",
        steps,
        playerHp: playerPokemon.leven,
        attackType: "",
        pokemonEffect: playerPokemon.effect || "",
        computerEffect: computerPokemon.effect || "",
        transform,
        weather: battleLog.weather || "",
      });
    }

    // Set up attacker and opponent based on turn
    if (wie === "pokemon") {
      // Player turn check
      if (
        battleLog.laatste_aanval === "pokemon" ||
        battleLog.laatste_aanval === "computereersteaanval"
      ) {
        message = `${computerPokemon.naam} must attack!`;
        nextTurn = 1;
      } else {
        attackerInfo = playerPokemon;
        opponentInfo = computerPokemon;
        attackStatus = {
          lastAttack: "pokemon",
          you: "pokemon",
          opponent: "computer",
          tableFight: "pokemon_speler_gevecht",
          opponentTableFight: "pokemon_wild_gevecht",
        };
        nextTurn = 1;
      }
    } else if (wie === "computer") {
      // Computer turn
      if (
        battleLog.laatste_aanval === "computer" ||
        battleLog.laatste_aanval === "spelereersteaanval"
      ) {
        message = `${playerPokemon.naam} must attack!`;
      } else {
        // Select random computer attack
        const attacks = [
          computerPokemon.aanval_1,
          computerPokemon.aanval_2,
          computerPokemon.aanval_3,
          computerPokemon.aanval_4,
        ].filter((attack) => attack && attack.trim() !== "");

        if (attacks.length === 0) {
          return res.status(500).send("Computer has no available attacks");
        }

        attack_name = attacks[Math.floor(Math.random() * attacks.length)];
        attackerInfo = computerPokemon;
        opponentInfo = playerPokemon;
        attackStatus = {
          lastAttack: "computer",
          you: "computer",
          opponent: "pokemon",
          tableFight: "pokemon_wild_gevecht",
          opponentTableFight: "pokemon_speler_gevecht",
        };
        nextTurn = 0;
      }
    }

    // If no attack processing needed, return early
    if (!attackerInfo) {
      return res.json({
        message,
        nextTurn,
        hp: opponentInfo?.leven || 0,
        maxHp: opponentInfo?.levenmax || 0,
        who: attackStatus?.opponent || "computer",
        knockedOut: 0,
        battleFinished: 0,
        damage: 0,
        computerId: 0,
        pokemonPosition: 0,
        expGained: 0,
        levelGained: 0,
        recoilDamage:0,
        recLeft:0,
        playerMaxHp: 0,
        whoPlayer: "",
        steps: "",
        playerHp: 0,
        attackType: "",
        pokemonEffect: "",
        computerEffect: "",
        transform: 0,
        weather: battleLog.weather || "",
      });
    }

    // Z-Move validation
    if (isZMove) {
      if (battleLog.zmove === 0) {
        // Validate Z-Move (simplified)
        await query("UPDATE aanval_log SET zmove = 1 WHERE id = ?", [
          battleLogId,
        ]);
      } else {
        return res.status(400).send("You cannot use Z-MOVES in this battle!");
      }
    }

    // Validate attack belongs to Pokemon
    const pokemonAttacks = [
      attackerInfo.aanval_1,
      attackerInfo.aanval_2,
      attackerInfo.aanval_3,
      attackerInfo.aanval_4,
    ];

    if (!pokemonAttacks.includes(attack_name) && !isZMove) {
      return res.status(400).send(`Error: Invalid attack ${attack_name}`);
    }

    // Get attack information
    const attackInfo = await getAttackInfo(attack_name);
    if (!attackInfo) {
      return res.status(404).send(`Error: Attack ${attack_name} not found`);
    }

    let attackContinue = 1;

    // Check for status effects
    if (
      attackerInfo.effect &&
      attackerInfo.effect !== "Burn" &&
      attackerInfo.effect !== "Poisoned"
    ) {
      let newEffect = attackerInfo.effect;
      let newDuration = (attackerInfo.hoelang || 1) - 1;

      switch (attackerInfo.effect) {
        case "Flinch":
          newEffect = "";
          attackContinue = 0;
          message = `${attackerInfo.naam_goed} flinched and couldn't move!`;
          break;
        case "Sleep":
          attackContinue = 0;
          if (newDuration >= 1) {
            message = `${attackerInfo.naam_goed} is fast asleep!`;
          } else {
            message = `${attackerInfo.naam_goed} woke up!`;
            newEffect = "";
          }
          break;
        case "Freeze":
          attackContinue = 0;
          if (newDuration >= 1) {
            message = `${attackerInfo.naam_goed} is frozen solid!`;
          } else {
            message = `${attackerInfo.naam_goed} thawed out!`;
            newEffect = "";
          }
          break;
        case "Paralyzed":
          const paralyzeChance = Math.random() * 100;
          if (paralyzeChance > 25) {
            attackContinue = 1;
          } else {
            attackContinue = 0;
            message = `${attackerInfo.naam_goed} is paralyzed! It can't move!`;
          }
          newDuration = (attackerInfo.hoelang || 1) + 1;
          break;
        case "Confused":
          const confuseRoll = Math.floor(Math.random() * 3) + 1;
          if (newDuration === 0) {
            attackContinue = 1;
            message = `${attackerInfo.naam_goed} snapped out of confusion!`;
            newEffect = "";
          } else if (confuseRoll === 2) {
            attackContinue = 1;
          } else {
            attackContinue = 0;
            message = `${attackerInfo.naam_goed} is confused!`;
          }
          break;
      }

      if (attackContinue === 0) {
        await query(
          `UPDATE ${attackStatus.tableFight} SET effect = ?, hoelang = ? WHERE id = ?`,
          [newEffect, newDuration, attackerInfo.id]
        );

        await query(
          "UPDATE aanval_log SET laatste_aanval = ?, beurten = beurten + 1 WHERE id = ?",
          [attackStatus.lastAttack, battleLogId]
        );

        if (wie === "computer") {
          message += " Your turn!";
        } else {
          message += `<br/>${opponentInfo.naam_goed} will choose an attack!`;
        }

        return res.json({
          message,
          nextTurn,
          hp: opponentInfo.leven,
          maxHp: opponentInfo.levenmax,
          who: attackStatus.opponent,
          knockedOut: 0,
          battleFinished: 0,
          damage: 0,
          computerId: opponentInfo.id,
          pokemonPosition: playerPokemon.opzak_nummer,
          expGained: newExp,
          levelGained: playerPokemon.expnodig,
          recoilDamage,
          recLeft,
          playerMaxHp: attackerInfo.levenmax,
          whoPlayer: attackStatus.you,
          steps,
          playerHp: attackerInfo.leven,
          attackType: attackInfo.soort || "",
          pokemonEffect: playerPokemon.effect || "",
          computerEffect: computerPokemon.effect || "",
          transform,
          weather: battleLog.weather || "",
        });
      }
    }

    // Handle Metronome
    if (attack_name === "Metronome") {
      const [randomAttack] = await query(
        "SELECT naam FROM aanval WHERE is_zmoves = 0 ORDER BY RAND() LIMIT 1"
      );
      attack_name = randomAttack.naam;
      const newAttackInfo = await getAttackInfo(attack_name);
      if (newAttackInfo) attackInfo = newAttackInfo;
    }

    // Attack accuracy check
    const hitRatioDown = (attackerInfo.hit_ratio_down || 0) * 2;
    let missChance = attackInfo.mis + hitRatioDown;

    if (missChance > 0 && Math.random() * 100 <= missChance) {
      message = `${attackerInfo.naam_goed} used ${attackInfo.naam}, but it missed!`;

      if (wie === "computer") {
        message += " Your turn!";
      } else {
        message += `<br/>${opponentInfo.naam_goed} will choose an attack!`;
      }

      await query(
        "UPDATE aanval_log SET laatste_aanval = ?, beurten = beurten + 1, laatste_aanval_speler = ? WHERE id = ?",
        [
          attackStatus.lastAttack,
          wie === "pokemon" ? attackInfo.naam : "",
          battleLogId,
        ]
      );

      return res.json({
        message,
        nextTurn,
        hp: opponentInfo.leven,
        maxHp: opponentInfo.levenmax,
        who: attackStatus.opponent,
        knockedOut: 0,
        battleFinished: 0,
        damage: 0,
        computerId: opponentInfo.id,
        pokemonPosition: playerPokemon.opzak_nummer,
        expGained: newExp,
        levelGained: playerPokemon.expnodig,
        recoilDamage,
        recLeft,
        playerMaxHp: attackerInfo.levenmax,
        whoPlayer: attackStatus.you,
        steps,
        playerHp: attackerInfo.leven,
        attackType: attackInfo.soort || "",
        pokemonEffect: playerPokemon.effect || "",
        computerEffect: computerPokemon.effect || "",
        transform,
        weather: battleLog.weather || "",
      });
    }

    // Handle special attacks
    if (attackInfo.naam === "Transform") {
      transform = `${opponentInfo.wild_id},${opponentInfo.shiny || 0},${
        opponentInfo.aanval_1 || ""
      },${opponentInfo.aanval_2 || ""},${opponentInfo.aanval_3 || ""},${
        opponentInfo.aanval_4 || ""
      },${opponentInfo.leven},${opponentInfo.levenmax}`;

      await query(
        `UPDATE ${attackStatus.tableFight} SET leven = ?, levenmax = ?, copiaid = ? WHERE id = ?`,
        [
          opponentInfo.leven,
          opponentInfo.levenmax,
          opponentInfo.wild_id,
          attackerInfo.id,
        ]
      );
    }

    // Calculate damage
    if (attackInfo.sterkte > 0) {
      lifeDecrease = damageController(
        attackerInfo,
        opponentInfo,
        attackInfo,
        battleLog.weather
      );
    } else if (attackInfo.hp_schade > 0) {
      lifeDecrease = attackInfo.hp_schade;
    }

    // Handle multiple hits
    if (attackInfo.aantalkeer !== "1") {
      const multiHit = multipleHits(attackInfo, lifeDecrease);
      lifeDecrease = multiHit.damage;
      messageAdd += multiHit.message;
    }

    // Critical hit calculation
    if (attackInfo.critical == 1) {
      const criticalChance = Math.round((attackerInfo.speed * 100) / 128);
      if (
        Math.random() * 100 <= criticalChance ||
        ["Frost Breath", "Storm Throw"].includes(attackInfo.naam)
      ) {
        lifeDecrease = Math.floor(lifeDecrease * 1.5);
        messageAdd += "<br/>Critical hit!";
      }
    }

    // Handle status effect application
    if (attackInfo.effect_naam && attackInfo.effect_kans > 0) {
      const effectChance = Math.random() * 100;
      if (effectChance <= attackInfo.effect_kans) {
        const effectDuration = getEffectDuration(attackInfo.effect_naam);

        await query(
          `UPDATE ${attackStatus.opponentTableFight} SET effect = ?, hoelang = ? WHERE id = ? AND effect = ''`,
          [attackInfo.effect_naam, effectDuration, opponentInfo.id]
        );

        messageBurn = `<br/>${opponentInfo.naam_goed} was affected by ${attackInfo.effect_naam}!`;
      }
    }

    // Handle recoil damage
    if (attackInfo.recoil > 1) {
      recoilDamage = Math.round(attackerInfo.levenmax / 20);
      recLeft = Math.max(0, attackerInfo.leven - recoilDamage);

      await query(
        `UPDATE ${attackStatus.tableFight} SET leven = ? WHERE id = ?`,
        [recLeft, attackerInfo.id]
      );

      messageAdd += `<br/>${attackerInfo.naam_goed} was damaged by recoil!`;
    }

    // Handle burn damage
    if (attackerInfo.effect === "Burn") {
      recoilDamage = Math.round(attackerInfo.levenmax / 8);
      recLeft = Math.max(0, attackerInfo.leven - recoilDamage);

      await query(
        `UPDATE ${attackStatus.tableFight} SET leven = ? WHERE id = ?`,
        [recLeft, attackerInfo.id]
      );

      messageAdd += `<br/>${attackerInfo.naam_goed} was hurt by its burn!`;
    }

    // Handle poison damage
    if (attackerInfo.effect === "Poisoned") {
      const poisonDamage =
        Math.round(attackerInfo.levenmax / 16) * (attackerInfo.poison || 1);
      recLeft = Math.max(0, attackerInfo.leven - poisonDamage);

      await query(
        `UPDATE ${attackStatus.tableFight} SET leven = ?, poison = poison + 1 WHERE id = ?`,
        [recLeft, attackerInfo.id]
      );

      messageAdd += `<br/>${attackerInfo.naam_goed} was hurt by poison!`;
    }

    // Handle self-destruct moves
    if (
      ["Self-Destruct", "Explosion", "Mind Blown"].includes(attackInfo.naam)
    ) {
      await query(
        `UPDATE ${attackStatus.tableFight} SET leven = 0 WHERE id = ?`,
        [attackerInfo.id]
      );

      messageAdd += `<br/>${attackerInfo.naam_goed} fainted from the explosion!`;
      attackerInfo.leven = 0;
    }

    // Calculate final damage and remaining HP
    if (lifeDecrease > 0) lifeOff = 1;

    let lifeRemaining = Math.max(0, opponentInfo.leven - lifeDecrease);

    // Handle False Swipe
    if (
      ["False Swipe", "Hold Back"].includes(attackInfo.naam) &&
      lifeRemaining <= 0
    ) {
      lifeRemaining = 1;
      lifeDecrease = opponentInfo.leven - 1;
    }

    // Check if battle ends
    if (lifeRemaining < 1) {
      nextTurn = 0;
      lifeRemaining = 0;
      fightEnd = 1;

      if (attackStatus.lastAttack === "computer") {
        // Player Pokemon fainted
        const alivePokemon = await query(
          `
          SELECT COUNT(*) as count 
          FROM pokemon_speler_gevecht psg 
          INNER JOIN pokemon_speler ps ON psg.id = ps.id 
          WHERE psg.aanval_log_id = ? AND psg.leven > 0 AND ps.ei = 0
        `,
          [battleLogId]
        );

        if (alivePokemon[0].count <= 1) {
          message = `${computerPokemon.naam_goed} used ${attackInfo.naam}! ${playerPokemon.naam_goed} fainted! You lose!`;
          await query(
            'UPDATE aanval_log SET laatste_aanval = "end_screen" WHERE id = ?',
            [battleLogId]
          );
        } else {
          fightEnd = 0;
          message = `${computerPokemon.naam_goed} used ${attackInfo.naam}! ${playerPokemon.naam_goed} fainted! Choose another Pokemon!`;
          await query(
            'UPDATE aanval_log SET laatste_aanval = "speler_wissel" WHERE id = ?',
            [battleLogId]
          );
        }
      } else if (attackStatus.lastAttack === "pokemon") {
        // Computer Pokemon fainted
        const aliveComputers = await query(
          "SELECT COUNT(*) as count FROM pokemon_wild_gevecht WHERE aanval_log_id = ? AND leven > 0",
          [battleLogId]
        );

        if (aliveComputers[0].count <= 1) {
          fightEnd = 1;
          message = `${playerPokemon.naam_goed} used ${attackInfo.naam}! ${computerPokemon.naam_goed} fainted! You win!`;
          await query(
            'UPDATE aanval_log SET laatste_aanval = "end_screen" WHERE id = ?',
            [battleLogId]
          );
        } else {
          fightEnd = 0;
          message = `${playerPokemon.naam_goed} used ${attackInfo.naam}! ${computerPokemon.naam_goed} fainted! ${battleLog.trainer} will choose another Pokemon!`;
          attackStatus.lastAttack = 'trainer_wissel';
        }

        // Award experience
        const baseExp = computerPokemon.base_exp || 50;
        const expGained = Math.floor(
          (baseExp * computerPokemon.level * 1.5) / 7
        );
        newExp = playerPokemon.exp + expGained;

        messageAdd += `<br/>${playerPokemon.naam_goed} gained ${expGained} EXP!`;
      }
    } else {
      message = `${attackerInfo.naam_goed} used ${attackInfo.naam}!${messageAdd}${messageBurn}`;

      if (wie === "computer") {
        message += " Your turn!";
      } else {
        message += `<br/>${opponentInfo.naam_goed} will choose an attack!`;
      }
    }

    // Update opponent HP
    if (playerPokemon.leven > 0) {
      await query(
        `UPDATE ${attackStatus.opponentTableFight} SET leven = ? WHERE id = ?`,
        [lifeRemaining, opponentInfo.id]
      );
    }

    // Update battle log
    await query(
      "UPDATE aanval_log SET laatste_aanval = ?, beurten = beurten + 1, laatste_aanval_speler = ?, laatste_aanval_computer = ? WHERE id = ?",
      [
        attackStatus.lastAttack,
        wie === "pokemon" ? attackInfo.naam : "",
        wie === "computer" ? attackInfo.naam : "",
        battleLogId,
      ]
    );

    return res.json({
      message,
      nextTurn,
      hp: lifeRemaining,
      maxHp: opponentInfo.levenmax,
      who: attackStatus.opponent,
      knockedOut: lifeOff,
      battleFinished: fightEnd,
      damage: lifeDecrease,
      computerId: opponentInfo.id,
      pokemonPosition: playerPokemon.opzak_nummer || 1,
      expGained: newExp,
      levelGained: playerPokemon.expnodig,
      recoilDamage,
      recLeft: recLeft || attackerInfo.leven,
      playerMaxHp: attackerInfo.levenmax,
      whoPlayer: attackStatus.you,
      steps,
      playerHp: attackerInfo.leven,
      attackType: attackInfo.soort || "Normal",
      pokemonEffect: playerPokemon.effect || "",
      computerEffect: computerPokemon.effect || "",
      transform,
      weather: battleLog.weather || "",
    });

  } catch (error) {
    console.error("Battle attack error:", error);
    res.status(500).send("Battle system error occurred");
  }
};

// Helper function to determine status effect duration
const getEffectDuration = (effectName) => {
  switch (effectName) {
    case "Sleep":
    case "Freeze":
      return Math.floor(Math.random() * 6) + 1;
    case "Confused":
      return Math.floor(Math.random() * 4) + 1;
    case "Paralyzed":
      return Math.floor(Math.random() * 4) + 1;
    case "Flinch":
      return 1;
    case "Burn":
    case "Poisoned":
      return 0; // Permanent until cured
    default:
      return 0;
  }
};

// Weather system handler
class WeatherSystem {
  constructor(battleLog) {
    this.battleLog = battleLog;
    this.weatherTypes = [
      "harsh_sunlight",
      "extremely_harsh_sunlight",
      "rain",
      "heavy_rain",
      "sandstorm",
      "hail",
      "mysterious_air_current",
    ];
  }

  isActive() {
    return (
      this.battleLog.weather &&
      this.weatherTypes.includes(this.battleLog.weather) &&
      this.battleLog.weather_turns > 0
    );
  }

  async processTurn() {
    if (!this.isActive()) return "";

    let message = "";

    // Decrease weather turns
    if (this.battleLog.weather_turns > 0) {
      await query(
        "UPDATE aanval_log SET weather_turns = weather_turns - 1 WHERE id = ?",
        [this.battleLog.id]
      );

      // Check if weather ends
      if (this.battleLog.weather_turns <= 1) {
        await query(
          "UPDATE aanval_log SET weather = NULL, weather_turns = 0 WHERE id = ?",
          [this.battleLog.id]
        );

        message += this.getWeatherEndMessage();
      } else {
        message += this.getWeatherActiveMessage();
      }
    }

    return message;
  }

  async createWeather(attackerInfo, opponentInfo, attackInfo) {
    const weatherMap = {
      "Sunny Day": { weather: "harsh_sunlight", turns: 5 },
      "Rain Dance": { weather: "rain", turns: 5 },
      Sandstorm: { weather: "sandstorm", turns: 5 },
      Hail: { weather: "hail", turns: 5 },
    };

    const weatherData = weatherMap[attackInfo.naam];
    if (weatherData) {
      await query(
        "UPDATE aanval_log SET weather = ?, weather_turns = ? WHERE id = ?",
        [weatherData.weather, weatherData.turns, this.battleLog.id]
      );
    }
  }

  getWeatherActiveMessage() {
    switch (this.battleLog.weather) {
      case "harsh_sunlight":
        return "<br/>The sunlight is strong!";
      case "rain":
        return "<br/>Rain continues to fall!";
      case "sandstorm":
        return "<br/>The sandstorm rages!";
      case "hail":
        return "<br/>Hail continues to fall!";
      default:
        return "";
    }
  }

  getWeatherEndMessage() {
    switch (this.battleLog.weather) {
      case "harsh_sunlight":
        return "<br/>The sunlight faded!";
      case "rain":
        return "<br/>The rain stopped!";
      case "sandstorm":
        return "<br/>The sandstorm subsided!";
      case "hail":
        return "<br/>The hail stopped!";
      default:
        return "<br/>Weather cleared up!";
    }
  }

  async applyWeatherDamage(pokemon, isPlayer = true) {
    if (!this.isActive()) return "";

    const tableName = isPlayer
      ? "pokemon_speler_gevecht"
      : "pokemon_wild_gevecht";
    let message = "";
    let damage = 0;

    switch (this.battleLog.weather) {
      case "sandstorm":
        // Sandstorm damages non-Rock/Ground/Steel types
        if (
          !["Rock", "Ground", "Steel"].includes(pokemon.type1) &&
          !["Rock", "Ground", "Steel"].includes(pokemon.type2)
        ) {
          damage = Math.round(pokemon.levenmax / 16);
        }
        break;
      case "hail":
        // Hail damages non-Ice types
        if (pokemon.type1 !== "Ice" && pokemon.type2 !== "Ice") {
          damage = Math.round(pokemon.levenmax / 16);
        }
        break;
    }

    if (damage > 0) {
      const newHP = Math.max(0, pokemon.leven - damage);
      await query(`UPDATE ${tableName} SET leven = ? WHERE id = ?`, [
        newHP,
        pokemon.id,
      ]);

      message = `<br/>${pokemon.naam_goed} was hurt by the ${this.battleLog.weather}!`;
    }

    return message;
  }
}

// Experience and leveling system
const calculateExperience = (
  defeatedPokemon,
  winnerPokemon,
  isTraded = false,
  isPremium = false
) => {
  const baseExp = defeatedPokemon.base_exp || 50;
  const level = defeatedPokemon.level;
  let multiplier = 1.5;

  if (isTraded) multiplier += 0.5;
  if (isPremium) multiplier += 0.5;

  const experience = Math.floor((baseExp * level * multiplier) / 7);
  return experience;
};

const checkLevelUp = async (pokemon) => {
  if (pokemon.exp >= pokemon.expnodig && pokemon.level < 100) {
    const newLevel = pokemon.level + 1;

    // Calculate new stats (simplified)
    const hpIncrease = Math.floor(Math.random() * 5) + 2;
    const statIncrease = Math.floor(Math.random() * 3) + 1;

    await query(
      `
      UPDATE pokemon_speler_gevecht SET 
        level = ?, 
        levenmax = levenmax + ?,
        attack = attack + ?,
        defence = defence + ?,
        speed = speed + ?,
        \`spc.attack\` = \`spc.attack\` + ?,
        \`spc.defence\` = \`spc.defence\` + ?
      WHERE id = ?
    `,
      [
        newLevel,
        hpIncrease,
        statIncrease,
        statIncrease,
        statIncrease,
        statIncrease,
        statIncrease,
        pokemon.id,
      ]
    );

    return {
      leveledUp: true,
      newLevel,
      message: `<br/>${pokemon.naam_goed} grew to level ${newLevel}!`,
    };
  }

  return { leveledUp: false, message: "" };
};

// AI for computer Pokemon selection
const selectComputerAttack = (pokemon) => {
  const attacks = [
    pokemon.aanval_1,
    pokemon.aanval_2,
    pokemon.aanval_3,
    pokemon.aanval_4,
  ].filter((attack) => attack && attack.trim() !== "");

  if (attacks.length === 0) return null;

  // Simple AI - prefer attacking moves over status moves
  const attackingMoves = attacks.filter((attack) => {
    // This would normally check the attack database
    return !["Growl", "Tail Whip", "Sand Attack", "String Shot"].includes(
      attack
    );
  });

  if (attackingMoves.length > 0) {
    return attackingMoves[Math.floor(Math.random() * attackingMoves.length)];
  }

  return attacks[Math.floor(Math.random() * attacks.length)];
};

// Status effect processor
const processStatusEffects = async (pokemon, isPlayer = true) => {
  if (!pokemon.effect) return "";

  const tableName = isPlayer
    ? "pokemon_speler_gevecht"
    : "pokemon_wild_gevecht";
  let message = "";
  let damage = 0;

  switch (pokemon.effect) {
    case "Burn":
      damage = Math.round(pokemon.levenmax / 8);
      message = `<br/>${pokemon.naam_goed} was hurt by its burn!`;
      break;
    case "Poisoned":
      damage = Math.round(pokemon.levenmax / 16) * (pokemon.poison || 1);
      message = `<br/>${pokemon.naam_goed} was hurt by poison!`;
      // Increase poison counter
      await query(`UPDATE ${tableName} SET poison = poison + 1 WHERE id = ?`, [
        pokemon.id,
      ]);
      break;
  }

  if (damage > 0) {
    const newHP = Math.max(0, pokemon.leven - damage);
    await query(`UPDATE ${tableName} SET leven = ? WHERE id = ?`, [
      newHP,
      pokemon.id,
    ]);
  }

  return message;
};

// Move validation
const validateMove = (pokemon, moveName) => {
  const pokemonMoves = [
    pokemon.aanval_1,
    pokemon.aanval_2,
    pokemon.aanval_3,
    pokemon.aanval_4,
  ].filter((move) => move && move.trim() !== "");

  return pokemonMoves.includes(moveName);
};

// Battle state validation
const validateBattleState = (battleLog, userId) => {
  if (battleLog.user_id !== userId) {
    throw new Error("Battle ended due to inactivity!");
  }

  if (
    battleLog.laatste_aanval === "klaar" ||
    battleLog.laatste_aanval === "end_screen"
  ) {
    throw new Error("Battle has already ended!");
  }
};

// Trainer change Pokemon handler
export const trainerChangePokemon = async (req, res) => {
  try {
    const { pokemon_info_name, computer_info_name, aanval_log_id,userId } = req.body;
    
    if (!pokemon_info_name || !computer_info_name || !aanval_log_id) {
      return res.status(400).send('Missing required parameters');
    }
    
    const battleLogId = parseInt(aanval_log_id);
    
    // Get battle log
    const [battleLog] = await query(
      'SELECT * FROM aanval_log WHERE id = ?',
      [battleLogId]
    );
    
    if (!battleLog) {
      return res.status(404).send('Battle not found');
    }
    
    // Security check
    if (battleLog.user_id !== userId) {
      return res.status(403).send('Unauthorized');
    }
    
    // Get current player Pokemon data
    const [playerPokemon] = await query(`
      SELECT pw.*, ps.*, psg.*
      FROM pokemon_wild pw
      INNER JOIN pokemon_speler ps ON pw.wild_id = ps.wild_id
      INNER JOIN pokemon_speler_gevecht psg ON ps.id = psg.id
      WHERE psg.id = ?
    `, [battleLog.pokemonid]);
    
    if (!playerPokemon) {
      return res.status(404).send('Player Pokemon not found');
    }
    
    let message = '';
    let refresh = 0;
    let lastMove = '';
    
    // Check if trainer needs to change Pokemon
    if (battleLog.laatste_aanval === 'trainer_wissel') {
      // Get a random alive computer Pokemon
      const [newComputer] = await query(`
        SELECT pw.naam, pw.wild_id, pwg.id, pwg.levenmax, pwg.leven, pwg.speed, pwg.effect
        FROM pokemon_wild pw
        INNER JOIN pokemon_wild_gevecht pwg ON pw.wild_id = pwg.wildid
        WHERE pwg.aanval_log_id = ? AND pwg.leven > 0
        ORDER BY RAND()
        LIMIT 1
      `, [battleLogId]);
      
      if (!newComputer) {
        return res.status(400).send('No available computer Pokemon');
      }
      
      // Apply computer name formatting (simplified)
      const computerNameGood = newComputer.naam; // In real implementation, use computer_naam function
      
      message = `${battleLog.trainer} brought out ${computerNameGood}!<br/>`;
      
      // Determine turn order based on speed
      if (playerPokemon.speed > newComputer.speed) {
        message += 'Your turn!';
        lastMove = 'computer';
        refresh = 0;
      } else {
        message += `${computerNameGood} will attack!`;
        lastMove = 'pokemon';
        refresh = 1;
      }
      
      // Update battle log with new computer Pokemon
      await query(
        'UPDATE aanval_log SET laatste_aanval = ?, tegenstanderid = ? WHERE id = ?',
        [lastMove, newComputer.id, battleLogId]
      );
      
      updatePokedex(newComputer.wild_id,'zien', userId)
      
      // Response format: message | computerName | computerHP | computerMaxHP | refresh | oldComputerId | wildId | effect
      const response = {
        message,
        trainerName: newComputer.naam,
        hp: newComputer.leven,
        maxHp: newComputer.levenmax,
        refresh,
        trainerId:battleLog.tegenstanderid, // old computer ID
        wildId: newComputer.wild_id,
        effect: newComputer.effect || ''
      }
      
      res.json(response);
      
    } else {
      res.status(400).send('Error: 5001 - Invalid battle state for trainer change');
    }
    
  } catch (error) {
    console.error('Trainer change Pokemon error:', error);
    res.status(500).send('Trainer change system error');
  }
};