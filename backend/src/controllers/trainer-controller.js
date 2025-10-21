import {
  applyAttackEffect,
  cleanupBattle,
  createNewComputerPokemon,
  createNewComputerStats,
  createPlayer,
  damageController,
  getAttackInfo,
  getEffectDuration,
  getRandomInt,
  multipleHits,
  onePokemonExp,
  pokemonPlayerHandUpdate,
  pokemon_grow,
  rankerbij,
  removeAttack,
  saveAttack,
  updatePokedex,
  whoCanStart,
} from "../helpers/battle-utils.js";
import {
  computerNaam,
  getBattleInfo,
  pokemonNaam,
} from "./battle-controller.js";

import { query } from "../config/database.js";
import { startTrainerAttack } from "./gyms-controller.js";

export const startTrainerBattle = async (req) => {
  const userId = req.body.userId;
  const { trainer, trainerAveLevel, gebied } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "משתמש לא מחובר" });
  }

  try {
    // 1. מחיקת קרבות ישנים
    await cleanupBattle(userId);

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
    newComputer = createNewComputerStats(
      newComputer,
      newComputerSql,
      level,
      31
    );

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

export const startRandomBattle = async (req, res) => {
  const userId = req.user?.user_id;

  const [gebruiker] = await query(
    "SELECT * FROM `gebruikers` WHERE user_id = ?",
    [userId]
  );
  
  if(gebruiker.level < 4) {
    return res.json({
      suceess: false,
      message: "דרג המשתמש נמוך מדי."
    })
  }

  const allTrainers = await query(
    "SELECT `naam` FROM `trainer` WHERE `badge`='' AND (`gebied`!='') ORDER BY RAND() LIMIT 10",
    []
  );
  var trainersNames = [];

  for (const trainer of allTrainers) {
    trainersNames.push(trainer.naam);
  }
  const randomTrainer = trainersNames[getRandomInt(0, trainersNames.length)];

  const alivePokemon = await query(
    "SELECT `id`,`level` FROM `pokemon_speler` WHERE `user_id`=? AND `opzak`='ja' AND `leven`>'0'",
    [userId]
  );

  if (!alivePokemon) {
    return res.json({
      suceess: false,
      message: "אין לך פוקימונים",
    });
  }

  const pokemonCount = alivePokemon.length;
  let level = 0;
  for (const pokemon of alivePokemon) {
    level += pokemon.level;
  }

  const averageOfLevel = level / pokemonCount;

  const start = await startTrainerAttack(
    randomTrainer,
    averageOfLevel,
    '',
    userId
  );
  if (!start.success) {
    return res.json({
      success: false,
      message: start.message || "לא ניתן להתחיל את הקרב",
    });
  }
  return res.json({
    success: true,
    redirect: "/attack/trainer",
    data: start.data
  });
};

export const getBattleData = async (battleLogId) => {
  const battleInit = await getBattleInfo(battleLogId);
  if(battleInit) {
    return {
      battleLog: battleInit.aanval_log,
      playerPokemon: battleInit.pokemon_info,
      computerPokemon: battleInit.computer_info,
    };
  } else {
    return undefined;
  }
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
      const { bericht, exp } = await onePokemonExp(
        battleLog,
        playerPokemon,
        computerPokemon,
        userId
      );
      newExp = exp || 0;
      message += bericht;

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
        recoilDamage: 0,
        recLeft: 0,
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
        zmove = (await ZMoves.move(attackInfo))[0];
        if (zmove == attack_name) {
          await query("UPDATE aanval_log SET zmove = 1 WHERE id = ?", [
            battleLogId,
          ]);
        }
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
        default:
          newEffect = "";
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
      lifeDecrease = (await damageController(
        attackerInfo,
        opponentInfo,
        attackInfo,
        battleLog.weather
      )).damage;
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
    const {
      jsonResponse,
      messageAdd: messageToAdd,
      shouldExit,
    } = await applyAttackEffect(
      attackInfo,
      opponentInfo,
      attackerInfo,
      battleLog,
      playerPokemon,
      computerPokemon,
      attackStatus,
      lifeDecrease
    );

    if (shouldExit && jsonResponse) {
      return res.json(jsonResponse);
    }

    if (messageToAdd) {
      messageAdd += messageToAdd;
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
          attackStatus.lastAttack = "end_screen";
        } else {
          fightEnd = 0;
          message = `${computerPokemon.naam_goed} used ${attackInfo.naam}! ${playerPokemon.naam_goed} fainted! Choose another Pokemon!`;
          attackStatus.lastAttack = "speler_wissel";
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
          attackStatus.lastAttack = "end_screen";
        } else {
          fightEnd = 0;
          message = `${playerPokemon.naam_goed} used ${attackInfo.naam}! ${computerPokemon.naam_goed} fainted! ${battleLog.trainer} will choose another Pokemon!`;
          attackStatus.lastAttack = "trainer_wissel";
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

// Trainer change Pokemon handler
export const trainerChangePokemon = async (req, res) => {
  try {
    const { pokemon_info_name, computer_info_name, aanval_log_id, userId } =
      req.body;

    if (!pokemon_info_name || !computer_info_name || !aanval_log_id) {
      return res.status(400).send("Missing required parameters");
    }

    const battleLogId = parseInt(aanval_log_id);

    // Get battle log
    const [battleLog] = await query("SELECT * FROM aanval_log WHERE id = ?", [
      battleLogId,
    ]);

    if (!battleLog) {
      return res.status(404).send("Battle not found");
    }

    // Security check
    if (battleLog.user_id !== userId) {
      return res.status(403).send("Unauthorized");
    }

    // Get current player Pokemon data
    const [playerPokemon] = await query(
      `
      SELECT pw.*, ps.*, psg.*
      FROM pokemon_wild pw
      INNER JOIN pokemon_speler ps ON pw.wild_id = ps.wild_id
      INNER JOIN pokemon_speler_gevecht psg ON ps.id = psg.id
      WHERE psg.id = ?
    `,
      [battleLog.pokemonid]
    );

    if (!playerPokemon) {
      return res.status(404).send("Player Pokemon not found");
    }

    let message = "";
    let refresh = 0;
    let lastMove = "";

    // Check if trainer needs to change Pokemon
    if (
      battleLog.laatste_aanval === "trainer_wissel" ||
      battleLog.laatste_aanval === "pokemon"
    ) {
      // Get a random alive computer Pokemon
      const [newComputer] = await query(
        `
        SELECT pw.naam, pw.wild_id, pwg.id, pwg.levenmax, pwg.leven, pwg.speed, pwg.effect
        FROM pokemon_wild pw
        INNER JOIN pokemon_wild_gevecht pwg ON pw.wild_id = pwg.wildid
        WHERE pwg.aanval_log_id = ? AND pwg.leven > 0
        ORDER BY RAND()
        LIMIT 1
      `,
        [battleLogId]
      );

      if (!newComputer) {
        return res.status(400).send("No available computer Pokemon");
      }

      // Apply computer name formatting (simplified)
      const computerNameGood = newComputer.naam; // In real implementation, use computer_naam function

      message = `${battleLog.trainer} brought out ${computerNameGood}!<br/>`;

      // Determine turn order based on speed
      if (playerPokemon.speed > newComputer.speed) {
        message += "Your turn!";
        lastMove = "computer";
        refresh = 0;
      } else {
        message += `${computerNameGood} will attack!`;
        lastMove = "pokemon";
        refresh = 1;
      }

      // Update battle log with new computer Pokemon
      await query(
        "UPDATE aanval_log SET laatste_aanval = ?, tegenstanderid = ? WHERE id = ?",
        [lastMove, newComputer.id, battleLogId]
      );

      updatePokedex(newComputer.wild_id, "zien", userId);

      // Response format: message | computerName | computerHP | computerMaxHP | refresh | oldComputerId | wildId | effect
      const response = {
        message,
        trainerName: newComputer.naam,
        hp: newComputer.leven,
        maxHp: newComputer.levenmax,
        refresh,
        trainerId: battleLog.tegenstanderid, // old computer ID
        wildId: newComputer.wild_id,
        effect: newComputer.effect || "",
      };

      res.json(response);
    } else {
      res
        .status(400)
        .send("Error: 5001 - Invalid battle state for trainer change");
    }
  } catch (error) {
    console.error("Trainer change Pokemon error:", error);
    res.status(500).send("Trainer change system error");
  }
};

/**
 * סיום קרב מאמן
 */
export const finishTrainerBattle = async (req, res) => {
  const { aanval_log_id } = req.body;
  const userId = req.user?.user_id;
  const accId = req.user.acc_id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "משתמש לא מחובר" });
  }

  try {
    const [user] = await query(
      "SELECT * FROM gebruikers AS g INNER JOIN gebruikers_item AS gi ON g.user_id = gi.user_id WHERE g.user_id = ?",
      [userId]
    );
    let victory = false;
    let reward = 0;
    let badge = null;
    let hm = "";

    const [logs] = await query("SELECT * FROM aanval_log WHERE id = ?", [
      aanval_log_id,
    ]);
    if (!logs) {
      return res
        .status(400)
        .json({ success: false, message: "לא נמצא קרב פעיל" });
    }

    if (logs.laatste_aanval != "end_screen") {
      throw new Error("Not finished yet");
    }

    const myPokemonWasInBattle = await query(
      "SELECT `id` FROM `pokemon_speler_gevecht` WHERE `user_id`=? AND `leven`>'0'",
      [userId]
    );

    const [trainer] = await query("SELECT * FROM `trainer` WHERE `naam`=?", [
      logs.trainer,
    ]);

    if (myPokemonWasInBattle.length === 0) {
      let money = 0;
      // You lose
      if (user.rank >= 3) {
        money = Math.round(user.silver / 50);
      }
      victory = false;
      await query(
        "UPDATE `gebruikers` SET `silver`=`silver`-?, `lost`=`lost`+'1',`points`=if (`points` > 0, (`points` - 60), 0),`points_temp`=if (`points_temp` > 0, (`points_temp` - 60), 0) WHERE `user_id`=?",
        [money, userId]
      );
    } else {
      victory = true;
      // חישוב פרס לפי מאמן

      badge = trainer.badge;
      switch (badge) {
        case "Hive":
          await query(
            "UPDATE `gebruikers_tmhm` SET `HM01`='1' WHERE `user_id`=?",
            [userId]
          );
          hm = "You also get HM01 Cut.";
          break;
        case "Feather":
          await query(
            "UPDATE `gebruikers_tmhm` SET `HM02`='1' WHERE `user_id`=?",
            [userId]
          );
          hm = "You also get HM02 Fly.";
          break;
        case "Cascade":
          await query(
            "UPDATE `gebruikers_tmhm` SET `HM03`='1' WHERE `user_id`=?",
            [userId]
          );
          hm = "You also get HM03 Surf.";
          break;
        case "Knuckle":
          await query(
            "UPDATE `gebruikers_tmhm` SET `HM04`='1' WHERE `user_id`=?",
            [userId]
          );
          hm = "You also get HM04 Strength.";
          break;
        case "Relic":
          await query(
            "UPDATE `gebruikers_tmhm` SET `HM05`='1' WHERE `user_id`=?",
            [userId]
          );
          hm = "You also get HM05 Flash.";
          break;
        case "Storm":
          await query(
            "UPDATE `gebruikers_tmhm` SET `HM06`='1' WHERE `user_id`=?",
            [userId]
          );
          hm = "You also get HM06 Rock Smash.";
          break;
        case "Fen":
          await query(
            "UPDATE `gebruikers_tmhm` SET `HM07`='1' WHERE `user_id`=?",
            [userId]
          );
          hm = "You also get HM07 Waterfall.";
          break;
        case "Rain":
          await query(
            "UPDATE `gebruikers_tmhm` SET `HM08`='1' WHERE `user_id`=?",
            [userId]
          );
          hm = "You also get HM08 Rock Climb.";
          break;
      }

      if (badge) {
        await query(
          "UPDATE `gebruikers_badges` SET `" +
            badge +
            "` = '1' WHERE `user_id`=?",
          [userId]
        );

        const gymWorld = `${user.world}_gym`;
        if (user[gymWorld] === 7) {
          const unlockWorldDic = {
            Kanto: "Johto",
            Johto: "Hoenn",
            Hoenn: "Sinnoh",
            Sinnoh: "Unova",
            Unova: "Kalos",
            Kalos: "Alola",
            Alola: "Kanto",
          };
          const unlockWorld = unlockWorldDic[user.world] + "_block";
          await query(
            "UPDATE gebruikers SET badges = badges + '1', " +
              gymWorld +
              " = " +
              gymWorld +
              " + '1', " +
              unlockWorld +
              " = '1' WHERE user_id = ",
            [userId]
          );
          await query(
            "INSERT INTO gebeurtenis (`datum`,`ontvanger_id`,`bericht`,`gelezen`) VALUES (?,?,?,'0')",
            [
              new Date().toISOString().replace("T", " ").split(".")[0],
              userId,
              `השגת את <b>כל</b> התגים עבור <b>${
                user.world
              }</b> ופתחת גישה ל<b>אזור חדש</b>:${unlockWorldDic[user.world]}`,
            ]
          );
        } else {
          await query(
            "UPDATE gebruikers SET badges = badges + '1'," +
              gymWorld +
              " = " +
              gymWorld +
              " + '1' WHERE user_id = ?",
            [userId]
          );
        }

        // עליית רמה לפי gym
        rankerbij("gym", userId, accId);
      } else {
        // עליית רמה לפי trainer
        rankerbij("trainer", userId, accId);
      }

      // Give money
      reward = Math.round(
        trainer.prijs * (getRandomInt(95, 110 + user.rank + 20) / 20)
      );
      const [silverTrainerValue] = await query(
        "SELECT * FROM `configs` WHERE config='silver'"
      );
      reward *= silverTrainerValue.valor;
      await query(
        "UPDATE `gebruikers` SET `won`=`won`+1,`silver`=`silver`+?,`points`=(`points`+100),`points_temp`=(`points_temp`+100) WHERE `user_id`=?",
        [reward, userId]
      );
      if (user["Badge case"] == 0) {
        await query(
          "UPDATE `gebruikers_item` SET `Badge case`='1' WHERE `user_id`=?",
          [userId]
        );
      }
    }

    if (trainer.naam == "Jessie e James") {
      hm = "<br/>צוות רוקט שוב ​​יוצא לדרך!";
    }

    // עדכון סטטיסטיקות פוקימונים
    await pokemonPlayerHandUpdate(userId);

    const dataOfLevelGrow = await pokemon_grow(userId);

    // מחיקה של הקרב
    await removeAttack(userId, logs.id);
    return res.json({
      success: true,
      data: {
        badge,
        reward,
        hm,
        victory,
        dataOfLevelGrow
      },
    });
  } catch (err) {
    console.error("❌ finishTrainerBattle error:", err);
    return res
      .status(500)
      .json({ success: false, message: "שגיאת שרת", error: err.message });
  }
};

/**
 * שינוי פוקימון
 */
export const attackChangePokemon = async (req, res) => {
  const { opzak_nummer, aanval_log_id } = req.body;
  const userId = req.user?.user_id;
  let good = false;
  let refresh = false;
  let message = "";
  const { battleLog, computerPokemon } = await getBattleData(aanval_log_id);
  // Security check
  if (battleLog.user_id !== userId) {
    return res.status(403).send("Unauthorized");
  }

  const existsPokemons = await query(
    "SELECT `id` FROM `pokemon_speler` WHERE `user_id`=? AND `opzak`='ja' AND `opzak_nummer`=?",
    [userId, opzak_nummer]
  );
  if (existsPokemons.length > 0) {
    const [changePokemon] = await query(
      "SELECT * FROM pokemon_wild INNER JOIN pokemon_speler ON pokemon_speler.wild_id = pokemon_wild.wild_id INNER JOIN pokemon_speler_gevecht ON pokemon_speler.id = pokemon_speler_gevecht.id WHERE pokemon_speler.user_id=? AND pokemon_speler.opzak='ja' AND pokemon_speler.opzak_nummer=?",
      [userId, opzak_nummer]
    );
    //Are you hit by block and you're pokemon still alive.
    if (changePokemon.leven > 0 && battleLog["effect_speler"] == "Block")
      message = "אי אפשר לשנות את הפוקימון שלך!";
    //Is the new pokemon an egg
    else if (changePokemon.ei == 1) message = "אי אפשר לבחור ביצה!";
    //Is the new pokemon alive
    else if (changePokemon.leven < 1)
      message = `${changePokemon.naam} חלש מדי כדי להיכנס לקרב.`;
    //You've caught the computer
    else if (battleLog["laatste_aanval"] == "gevongen")
      message = `אתה לכדת ${computerPokemon} בהצלחה. הקרב הסתיים.`;
    //The fight is ended
    else if (battleLog["laatste_aanval"] == "klaar")
      message = `The fight is ended with ${computerPokemon.naam_goed}`;
    //Check if it is not your turn
    else if (battleLog["laatste_aanval"] == "pokemon") {
      message = `זה לא תורך זה התור של ${computerPokemon.naam_goed}`;
      refresh = true;
    }
    //Check if you can do something
    else if (
      ["computer", "wissel", "speler_wissel", "spelereersteaanval"].includes(
        battleLog["laatste_aanval"]
      )
    ) {
      //Change Pokemon Was A Success
      good = true;
      let lastMove;
      //Check Who can begin
      if (computerPokemon.speed > changePokemon.speed) {
        message = `Switching Pok&eacute;mon. ${changePokemon.naam} is attacking..`;
        lastMove = "pokemon";
        refresh = true;
      } else {
        message = "You've switched Pok&eacute;mon, you can attack now";
        lastMove = "computer";
      }

      //Check if New pokemon is used before
      const usedId = battleLog["gebruikt_id"].split(",");
      let used;
      if (usedId.includes(changePokemon.id)) {
        used = battleLog["gebruikt_id"];
      } else {
        used = `${battleLog["gebruikt_id"]},${changePokemon.id},`;
      }
      await query(
        "UPDATE `aanval_log` SET `laatste_aanval`=? ,`aanval_bezig_speler`='', `pokemonid`=?, `gebruikt_id`=? WHERE `id`=?",
        [lastMove, changePokemon.id, used, battleLog.id]
      );

      const attack1 = await atk(changePokemon.aanval_1, changePokemon.soort);
      const attack2 = await atk(changePokemon.aanval_2, changePokemon.soort);
      const attack3 = await atk(changePokemon.aanval_3, changePokemon.soort);
      const attack4 = await atk(changePokemon.aanval_4, changePokemon.soort);

      const zmove = false;
      const tz = false;

      // check zmove
      if (await ZMoves.valid(changePokemon)[0]) {
        zmove = (await ZMoves.move(changePokemon))[0];
        tz = await atk(zmove, changePokemon.soort);
      }

      changePokemon["naam_klein"] = changePokemon.naam.toLowerCase();
      changePokemon["naam_goed"] = pokemonNaam(
        changePokemon.naam,
        changePokemon.roepnaam
      );

      if (changePokemon.shiny === 1) {
        changePokemon["map"] = "shiny";
        changePokemon["star"] = "block";
      } else {
        changePokemon["map"] = "pokemon";
        changePokemon["star"] = "none";
      }

      return res.json({
        success: true,
        data: {
          message,
          good,
          refresh,
          changePokemon,
          opzak_nummer,
          attack1,
          attack2,
          attack3,
          attack4,
          zmove,
          tz,
        },
      });
    } else {
      return res.json({
        success: false,
        message: "שגיאה, משהו השתבש",
      });
    }
  } else {
    return res.json({
      success: false,
      message: "שגיאה, משהו השתבש",
    });
  }
};

export async function atk(atkName, poke = null) {
  // שליפת המתקפה
  const [rows] = await query("SELECT * FROM aanval WHERE naam = ?", [atkName]);
  let arr = rows;

  if (poke) {
    const pokeAbility = await ability(poke.ability);
    poke.ability = pokeAbility?.name;

    const [pokeWildRows] = await query(
      "SELECT type1 FROM pokemon_wild WHERE wild_id = ?",
      [poke.wild_id]
    );
    poke.type1 = pokeWildRows[0]?.type1;

    // Z-Moves
    if (arr.is_zmoves === 1 && typeof zMoves !== "undefined") {
      const zinfo = await ZMoves.move(poke);
      if (Array.isArray(zinfo) && zinfo.length === 3) {
        arr.sterkte = zinfo[1];
        arr.soort = zinfo[2];
      }
    }

    // Normal → שינוי סוג לפי יכולת
    if (arr.soort === "Normal") {
      switch (poke.ability) {
        case "Refrigerate":
          arr.soort = "Ice";
          break;
        case "Pixilate":
          arr.soort = "Fairy";
          break;
        case "Aerilate":
          arr.soort = "Flying";
          break;
        case "Galvanize":
          arr.soort = "Electric";
          break;
      }
    }

    // עוד התאמות לפי יכולת
    if (poke.ability === "Normalize") {
      arr.soort = "Normal";
    } else if (poke.ability === "Liquid Voice" && based(atkName) === "sound") {
      arr.soort = "Water";
    } else if (poke.ability === "Parental Bond") {
      arr.aantalkeer = "1-2";
    } else if (poke.ability === "Speed Boost") {
      arr.effect_kans = "100";
      arr.effect_naam = "Speed_up_2";
    } else if (poke.ability === "Poison Touch" && arr.makes_contact === 1) {
      arr.effect_kans = "30";
      arr.effect_naam = "Poison";
    } else if (poke.ability === "Skill Link" && arr.aantalkeer !== "1") {
      arr.aantalkeer = "2-5";
    }

    // Hidden Power & Special moves
    if (atkName === "Hidden Power") {
      arr.soort = hiddenPower(
        poke.hp_iv,
        poke.attack_iv,
        poke.defence_iv,
        poke.speed_iv,
        poke["spc.attack_iv"],
        poke["spc.defence_iv"]
      );
    } else if (
      ["Judgment", "Multi-Attack", "Revelation Dance"].includes(atkName)
    ) {
      arr.soort = poke.type1;
    } else if (atkName === "Techno Blast") {
      const a = ["Fire", "Ice", "Water", "Electric"];
      const b = ["Burn Drive", "Chill Drive", "Douse Drive", "Shock Drive"];
      if (b.includes(poke.item)) {
        arr.soort = a[b.indexOf(poke.item)];
      }
    }

    // Items adjustments
    if (poke.item === "Scope Lens" && arr.critical === 0) {
      if (Math.floor(Math.random() * 7) === 6) arr.critical = 1;
    } else if (poke.item === "Wide Lens") {
      const percent = Math.floor(arr.mis * 0.15);
      arr.mis -= percent;
    } else if (poke.item === "Lucky Punch" && poke.wild_id === "113") {
      if (arr.critical === 0 && Math.floor(Math.random() * 5) === 4)
        arr.critical = 1;
    } else if (poke.item === "Stick" && poke.wild_id === "83") {
      if (arr.critical === 0 && Math.floor(Math.random() * 5) === 4)
        arr.critical = 1;
    }
  }

  return arr;
}

export async function ability(id) {
  const [rows] = await query("SELECT * FROM abilities WHERE id=?", [id]);
  if (!rows) return null;
  return rows;
}

export function hiddenPower(
  hpIv,
  attackIv,
  defenceIv,
  speedIv,
  spAttackIv,
  spDefenceIv
) {
  const p = [hpIv, attackIv, defenceIv, speedIv, spAttackIv, spDefenceIv];

  const h = Math.round(
    ((p[0] + p[1] * 2 + p[2] * 4 + p[3] * 8 + p[4] * 16 + p[5] * 32) * 15) /
      63 /
      31.5
  );

  const typeArr = [
    "Fighting",
    "Flying",
    "Poison",
    "Ground",
    "Rock",
    "Bug",
    "Ghost",
    "Steel",
    "Fire",
    "Water",
    "Grass",
    "Electric",
    "Psychic",
    "Ice",
    "Dragon",
    "Dark",
  ];

  return typeArr[h];
}

/**
 * מחזיר את סוג המהלך (bite, dance, sound וכו') לפי שם ההתקפה
 * @param {string} atk
 * @returns {"normal" | "bite" | "aura, pulse" | "ball, bomb" | "dance" | "powder, spore" | "punch" | "sound"}
 */
export function based(atk) {
  let a = "normal";

  if (
    [
      "Bite",
      "Crunch",
      "Fire Fang",
      "Hyper Fang",
      "Ice Fang",
      "Poison Fang",
      "Psychic Fangs",
      "Thunder Fang",
    ].includes(atk)
  ) {
    a = "bite";
  } else if (
    [
      "Aura Sphere",
      "Dark Pulse",
      "Heal Pulse",
      "Origin Pulse",
      "Water Pulse",
    ].includes(atk)
  ) {
    a = "aura, pulse";
  } else if (
    [
      "Acid Spray",
      "Aura Sphere",
      "Barrage",
      "Beak Blast",
      "Bullet Seed",
      "Egg Bomb",
      "Electro Ball",
      "Energy Ball",
      "Focus Blast",
      "Gyro Ball",
      "Ice Ball",
      "Magnet Bomb",
      "Mist Ball",
      "Mud Bomb",
      "Octazooka",
      "Pollen Puff",
      "Rock Blast",
      "Rock Wrecker",
      "Searing Shot",
      "Seed Bomb",
      "Shadow Ball",
      "Sludge Bomb",
      "Weather Ball",
      "Zap Cannon",
    ].includes(atk)
  ) {
    a = "ball, bomb";
  } else if (
    [
      "Dragon Dance",
      "Feather Dance",
      "Fiery Dance",
      "Lunar Dance",
      "Petal Dance",
      "Quiver Dance",
      "Revelation Dance",
      "Swords Dance",
      "Teeter Dance",
    ].includes(atk)
  ) {
    a = "dance";
  } else if (
    [
      "Cotton Spore",
      "Poison Powder",
      "Powder",
      "Rage Powder",
      "Sleep Powder",
      "Spore",
      "Stun Spore",
    ].includes(atk)
  ) {
    a = "powder, spore";
  } else if (
    [
      "Bullet Punch",
      "Comet Punch",
      "Dizzy Punch",
      "Drain Punch",
      "Dynamic Punch",
      "Fire Punch",
      "Focus Punch",
      "Hammer Arm",
      "Ice Hammer",
      "Ice Punch",
      "Mach Punch",
      "Mega Punch",
      "Meteor Mash",
      "Power-Up Punch",
      "Shadow Punch",
      "Sky Uppercut",
      "Thunder Punch",
    ].includes(atk)
  ) {
    a = "punch";
  } else if (
    [
      "Boomburst",
      "Bug Buzz",
      "Chatter",
      "Clanging Scales",
      "Confide",
      "Disarming Voice",
      "Echoed Voice",
      "Grass Whistle",
      "Growl",
      "Heal Bell",
      "Hyper Voice",
      "Metal Sound",
      "Noble Roar",
      "Parting Shot",
      "Perish Song",
      "Relic Song",
      "Roar",
      "Round",
      "Screech",
      "Shadow Panic",
      "Sing",
      "Snarl",
      "Snore",
      "Sparkling Aria",
      "Supersonic",
      "Uproar",
      "Clangorous Soulblaze",
    ].includes(atk)
  ) {
    a = "sound";
  }

  return a;
}

export async function pokemonEquip(id, item) {
  id = String(id);

  if (
    ["Burn Drive", "Chill Drive", "Douse Drive", "Shock Drive"].includes(item)
  ) {
    if (id !== "649") return false;
  } else if (item === "Dragon Scale" && id !== "117") {
    return false;
  } else if (item === "Metal Coat" && !["95", "123"].includes(id)) {
    return false;
  } else if (item === "Kings Rock" && !["79", "61"].includes(id)) {
    return false;
  } else if (item === "Whipped Dream" && id !== "684") {
    return false;
  } else if (item === "Dubious Disc" && id !== "233") {
    return false;
  } else if (item === "Up-Grade" && id !== "137") {
    return false;
  } else if (item === "Sachet" && id !== "682") {
    return false;
  } else if (item === "Reaper Cloth" && id !== "356") {
    return false;
  } else if (item === "Protector" && id !== "112") {
    return false;
  } else if (item === "Electirizer" && !["125", "737"].includes(id)) {
    return false;
  } else if (item === "Magmarizer" && id !== "467") {
    return false;
  } else if (item === "Razor Claw" && id !== "215") {
    return false;
  } else if (item === "Razor Fang" && id !== "207") {
    return false;
  } else if (
    item === "Light Ball" &&
    !["25", "923", "967", "968", "966", "965"].includes(id)
  ) {
    return false;
  } else if (item === "Thick Club" && !["104", "105"].includes(id)) {
    return false;
  } else if (item === "Lucky Punch" && id !== "113") {
    return false;
  } else if (item === "Stick" && id !== "83") {
    return false;
  } else if (
    item === "Soul Dew" &&
    !["381", "842", "841", "380"].includes(id)
  ) {
    return false;
  } else if (item?.includes(" Z")) {
    const rows = await query(
      "SELECT pokemons FROM zaanval_relacionados WHERE item = ?",
      [item]
    );

    if (rows.length === 1) {
      const { pokemons } = rows[0];

      if (pokemons && pokemons.trim() !== "") {
        const allowed = pokemons.split(",").map(String);
        if (!allowed.includes(id)) return false;
      } else {
        // מקרה חריג – חריגה לפי PHP
        if (["902", "917", "919"].includes(id)) return false;
      }
    }
  }

  return true;
}

export class ZMoves {
  /**
   * בדיקה אם הפוקימון יכול להשתמש ב־Z-Move
   * @param {any} poke
   * @returns {[boolean, string?, string?]} [isValid, zMoveName, baseMove?]
   */
  static async valid(poke) {
    if (!poke) return [false];

    const item = poke.item;
    const validEquip = await pokemonEquip(poke.wild_id, item);

    if (!validEquip) return [false];

    const zaanval_relacionados = await query(
      "SELECT * FROM zaanval_relacionados WHERE item = ?",
      [item]
    );

    if (zaanval_relacionados.length === 0) return [false];
    const row = zaanval_relacionados[0];

    // טוענים את כל ההתקפות של הפוקימון
    const atk1 = await atk(poke.aanval_1);
    const atk2 = await atk(poke.aanval_2);
    const atk3 = await atk(poke.aanval_3);
    const atk4 = await atk(poke.aanval_4);

    if (row.typed === 1) {
      const atkType = (await atk(row.naam)).soort;
      const atkArr = [atk1.soort, atk2.soort, atk3.soort, atk4.soort];

      if (atkArr.includes(atkType)) {
        const key = atkArr.indexOf(atkType);
        const atkArr2 = [atk1.naam, atk2.naam, atk3.naam, atk4.naam];
        return [true, row.naam, atkArr2[key]];
      }
    } else {
      const atkArr = [atk1.naam, atk2.naam, atk3.naam, atk4.naam];
      if (atkArr.includes(row.required_move)) {
        return [true, row.naam];
      }
    }

    return [false];
  }

  /**
   * החזרת Z-Move מותאם לפי הפוקימון
   * @param {any} poke
   * @returns {[string, number?, string?]} [name, power?, type?]
   */
  static async move(poke) {
    const valid = await this.valid(poke);

    if (!valid[0]) return;

    const name = valid[1];

    // אם יש 3 ערכים → יש התאמה לפי סוג
    if (valid.length === 3) {
      const baseAtk = await atk(valid[2]);
      const power = baseAtk.sterkte;
      let pow = 200; // ברירת מחדל הכי חזק

      if (power >= 0 && power <= 55) pow = 100;
      else if (power >= 60 && power <= 65) pow = 120;
      else if (power >= 70 && power <= 75) pow = 140;
      else if (power >= 80 && power <= 85) pow = 160;
      else if (power >= 90 && power <= 95) pow = 175;
      else if (power === 100) pow = 180;
      else if (power === 110) pow = 185;
      else if (power >= 120 && power <= 125) pow = 190;
      else if (power === 130) pow = 195;

      const type = baseAtk.soort;
      return [name, pow, type];
    } else {
      return [name];
    }
  }
}

export const trainerAttackRun = async (req, res) => {
  const { aanval_log_id } = req.body;
  const userId = req.user?.user_id;
  let good = false;
  let message = "";
  const { battleLog, computerPokemon, playerPokemon } = await getBattleData(
    aanval_log_id
  );
  if (battleLog.user_id !== userId) {
    return res.status(403).send("Unauthorized");
  }

  //You've caught the computer
  else if (battleLog["laatste_aanval"] == "gevongen")
    message = `אתה לכדת ${computerPokemon} בהצלחה. הקרב הסתיים.`;
  //The fight is ended
  else if (battleLog["laatste_aanval"] == "klaar")
    message = `The fight is ended with ${computerPokemon.naam_goed}`;
  //Check if it is not your turn
  else if (battleLog["laatste_aanval"] == "pokemon") {
    message = `זה לא תורך זה התור של ${computerPokemon.naam_goed}`;
  } else {
    let chance = 0;
    if (playerPokemon.leven > computerPokemon.leven) chance = 90;
    else chance = 60;

    const rand = getRandomInt(1, 100);

    if (chance > rand) {
      good = true;
      message = "הצלחת לברוח.";

      const playerHandRows = await query(
        "SELECT `id`, `leven`, `effect` FROM `pokemon_speler_gevecht` WHERE `user_id`=?",
        [userId]
      );
      for (const row of playerHandRows) {
        await query(
          "UPDATE pokemon_speler SET leven = ?, effect = ? WHERE id = ?",
          [row.leven, row.effect, row.id]
        );
      }

      removeAttack(userId, aanval_log_id);
    } else {
      message = "נכשלת בניסיון לברוח מ" + computerPokemon.naam_goed;
      await query(
        "UPDATE `aanval_log` SET `laatste_aanval`='pokemon', `beurten`=`beurten`+'1' WHERE `id`=?",
        [aanval_log_id]
      );
    }
  }

  res.json({
    message,
    good,
  });
};

export const attackUsePotion = async (req, res) => {
  const {
    item,
    computer_info_name,
    option_id,
    potion_pokemon_id,
    aanval_log_id,
  } = req.body;
  const userId = req.user?.user_id;
  const { battleLog } = await getBattleData(aanval_log_id);
  if (battleLog.user_id !== userId) {
    return res.status(403).send("Unauthorized");
  }

  let good = false;
  let message = "";
  let [pokemon_info] = await query(
    "SELECT pw.*, ps.*, psg.* FROM pokemon_wild AS pw INNER JOIN pokemon_speler AS ps ON ps.wild_id = pw.wild_id INNER JOIN pokemon_speler_gevecht AS psg ON ps.id = psg.id  WHERE psg.id= ?",
    [potion_pokemon_id]
  );
  pokemon_info["naam_goed"] = pokemonNaam(
    pokemon_info.naam,
    pokemon_info.roepnaam
  );

  const [player_item_info] = await query(
    "SELECT `Potion`, `Super potion`, `Hyper potion`, `Full heal`, `Revive`, `Max revive`, `Moomoo Milk`, `Fresh Water`, `Soda Pop`, `Lemonade` FROM `gebruikers_item` WHERE `user_id`=?",
    [userId]
  );

  const [item_info] = await query(
    "SELECT `naam`, `wat`, `kracht`, `apart`, `type1`, `type2`, `kracht2` FROM `items` WHERE `naam`=?",
    [item]
  );

  const computer_naam = computerNaam(computer_info_name);
  let new_life;
  if (item == "Kies") message = "בחר פריט שבבעלותך או קרב נגדו.";
  else if (item_info.wat != "potion") message = "השתמש בשיקוי.";
  else if (player_item_info[item_info.naam] <= 0)
    message = "אתה לא יכול להשתמש ב" + item;
  else if (
    ["Revive", "Max revive"].includes(item_info.naam) &&
    pokemon_info.leven > 0
  )
    message =
      pokemon_info.naam + " - אי אפשר להחיות אותו כי עדיין יש לו נקודות חיים!";
  else if (
    !["Revive", "Max revive"].includes(item_info.naam) &&
    pokemon_info.leven <= 0
  )
    message = pokemon_info.naam_goed + " - אין לו נקודות חיים לקבלת שיקויים!";
  else if (pokemon_info.leven >= pokemon_info.levenmax)
    message = pokemon_info.naam_goed + "יש לו חיים מלאים";
  else if (battleLog["laatste_aanval"] == "klaar")
    message = `The fight is ended with ${computer_naam}`;
  else if (battleLog["laatste_aanval"] == "pokemon")
    message = `זה לא תורך זה התור של ${computer_naam}`;
  else {
    let pokemon_effect = pokemon_info.effect;
    let new_amount = player_item_info[item_info.naam];

    switch (item_info.apart) {
      //Item isn't strange
      case "nee":
        //Pokemon is dead, potions don't work
        if (pokemon_info["leven"] <= 0)
          message =
            pokemon_info.naam_goed + " אין נקודות חיים לשימוש בשיקויים!";
        else {
          message = `נתת ${item_info.naam} ל${pokemon_info.naam_goed}`;
          //Calculate New life
          new_life = pokemon_info["leven"] + item_info["kracht"];
          //If new life is bigger than life max, new life becomes lifemax
          if (new_life > pokemon_info["levenmax"])
            new_life = pokemon_info["levenmax"];
          //Set new amount
          new_amount -= 1;
        }
        break;
      //Item is strange
      case "ja":
        //Its a full heal
        if (item_info["naam"] == "Full heal") {
          //Effect is empty
          pokemon_effect = "";
          new_life = pokemon_info["levenmax"];
        }

        //Its a Revive
        else if (item_info["naam"] == "Revive") {
          //Calculate new life
          new_life = Math.round(pokemon_info["levenmax"] / 2);
        }

        //Its a max revive
        else if (item_info["naam"] == "Max revive") {
          //Calculate new life
          new_life = pokemon_info["levenmax"];
        }
        message = `השתמשת ב${item_info["naam"]} - ${pokemon_info["naam"]} נרפא`;
        //Set new amount
        new_amount -= 1;

        break;
    }

    good = true;
    await query(
      "UPDATE `pokemon_speler_gevecht` SET `leven`=?, `effect` = ? WHERE `id`=?",
      [new_life, pokemon_effect, pokemon_info.id]
    );
    await query(
      "UPDATE `aanval_log` SET `laatste_aanval`='pokemon' WHERE `id`=?",
      [aanval_log_id]
    );
    await query(
      "UPDATE `gebruikers_item` SET `" +
        item_info["naam"] +
        "`=? WHERE `user_id`=?",
      [new_amount, userId]
    );
  }

  const info_potion_left = player_item_info[item_info.naam] - 1;
  let pokemon_infight = false;
  if (battleLog.pokemonid == pokemon_info.id) pokemon_infight = true;

  return res.json({
    message,
    good,
    info_potion_left,
    option_id,
    item_info_naam: item_info.naam,
    name: "Potion",
    new_life,
    pokemonInfo: pokemon_info,
    pokemon_infight,
  });
};
