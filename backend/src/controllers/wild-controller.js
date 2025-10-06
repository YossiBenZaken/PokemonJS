import { ZMoves, getBattleData } from "./trainer-controller.js";
import {
  applyAttackEffect,
  cleanupBattle,
  createNewComputerPokemon,
  createNewComputerStats,
  createPlayer,
  damageController,
  getAttackInfo,
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

import { calculatePokemonLevel } from "./safari-controller.js";
import { getBattleInfo } from "./battle-controller.js";
import { query } from "../config/database.js";

export const startWildBattle = async (req, res) => {
  let { computer_id, computer_level, gebied, rarity } = req.body;
  const userId = req.user?.user_id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "משתמש לא מחובר" });
  }

  if (!computer_id) {
    const [user] = await query("SELECT * FROM `gebruikers` WHERE `user_id`=?", [
      userId,
    ]);
    const [randomComputer] = await query(
      "SELECT wild_id FROM `pokemon_wild` WHERE `gebied`=? AND `wereld`=? AND `zeldzaamheid`=? AND `aparece`='sim' ORDER BY rand() limit 1",
      [gebied, user.wereld, rarity]
    );
    computer_id = randomComputer.wild_id;
    computer_level = await calculatePokemonLevel(user.rank);
  }

  // 1. מחיקת קרבות ישנים
  await cleanupBattle(userId);

  // 2. יצירת aanval_log חדש
  const insertLog = await query(
    "INSERT INTO aanval_log (user_id, gebied) VALUES (?, ?)",
    [userId, gebied]
  );
  const aanvalLogId = insertLog.insertId;

  // 3. בניית יריב
  const attackInfo = await createNewComputer(
    computer_id,
    computer_level,
    gebied,
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

  await query(
    "UPDATE `gebruikers` SET `pagina`='attack',`background`=? WHERE `user_id`=?",
    [gebied == "Gras" ? "gras-1" : "wate-1", userId]
  );

  return res.json({ aanvalLogId });
};

export const finishWildBattle = async (req, res) => {
  const { aanval_log_id } = req.body;
  const userId = req.user?.user_id;
  const accId = req.user.acc_id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "משתמש לא מחובר" });
  }

  let text = false;
  let drop = false;
  let money = 0;
  const { computer_info, aanval_log } = await getBattleInfo(aanval_log_id);

  const [user] = await query(
    "SELECT * FROM gebruikers AS g INNER JOIN gebruikers_item AS gi ON g.user_id = gi.user_id WHERE g.user_id = ?",
    [userId]
  );

  if (aanval_log.laatste_aanval != "end_screen") {
    throw new Error("Not finished yet");
  }

  if (computer_info.leven <= 0) {
    rankerbij('attack',userId, accId);
    await query(
      "UPDATE `gebruikers` SET `gewonnen`=`gewonnen`+'1',`in_battle`=0,`map_wild`=0,`points`=(`points` + 50),`points_temp`=(`points_temp` + 50) WHERE `user_id`=?",
      [userId]
    );

    //TODO: Check Events

    text = true;
    money = 0;
  } else {
    if (user.rank >= 3) money = Math.round(user.silver / 10);
    await query(
      "UPDATE `gebruikers` SET `silver`=`silver`-?, `verloren`=`verloren`+'1',`points`=if (`points` > 0, (`points` - 60), 0),`points_temp`=if (`points_temp` > 0, (`points_temp` - 60), 0) WHERE `user_id`=?",
      [money, userId]
    );
    text = false;
  }
  await pokemonPlayerHandUpdate(userId);

  await pokemon_grow(userId);

  // מחיקה של הקרב
  await removeAttack(userId, aanval_log.id);

  return res.json({
    success: true,
    data: {
      text,
      money,
      drop,
    },
  });
};

// Main attack handler
export const doWildAttack = async (req, res) => {
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

    if (battleLog.laatste_aanval == "gevongen")
      message = `תפסת את ${computerPokemon.naam_goed}!`;
    else if (battleLog.laatste_aanval == "klaar")
      message = `${computerPokemon.naam_goed} לא יכול להילחם כי הוא נוקאאוט.`;

    // Set up attacker and opponent based on turn
    if (wie === "pokemon") {
      // Player turn check
      if (
        battleLog.laatste_aanval === "pokemon" ||
        battleLog.laatste_aanval === "computereersteaanval"
      ) {
        message = `${computerPokemon.naam} must attack!`;
        nextTurn = 1;
      } else if (playerPokemon.leven <= 0) {
        message = computerPokemon.naam + " מת";
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
      attackStatus
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
        const { exp } = await onePokemonExp(
          battleLog,
          playerPokemon,
          computerPokemon,
          userId
        );
        newExp = playerPokemon.exp + (exp || 50);

        messageAdd += `<br/>${playerPokemon.naam_goed} gained ${newExp} EXP!`;
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

export const attackUsePokeball = async (req, res) => {
  const { item, option_id, aanval_log_id, computerEffect } = req.body;
  const userId = req.user?.user_id;

  // Get battle data
  const battleData = await getBattleData(aanval_log_id);
  if (!battleData) {
    return res.status(404).send("Battle not found");
  }

  const { battleLog, computerPokemon, playerPokemon } = battleData;

  // Security check
  if (battleLog.user_id !== userId) {
    return res.status(403).send("Battle ended due to inactivity!");
  }

  const [playerItemInfo] = await query(
    "SELECT `Poke ball`, `Great ball`, `Ultra ball`, `Premier ball`, `Net ball`, `Dive ball`, `Nest ball`, `Repeat ball`, `Timer ball`, `Master ball`, `Moon ball`, `Dusk ball`, `Dream ball`, `Luxury ball`, `Rocket ball`, `DNA ball`, `Cherish ball`, `Black ball`, `Santa ball`, `Antique ball`, `Frozen ball`, `GS ball`, `Trader ball`, `Ecology ball` FROM `gebruikers_item` WHERE `user_id`=?",
    [userId]
  );
  const [given] = await query(
    "SELECT `huis` FROM `gebruikers` WHERE `user_id`=?",
    [userId]
  );
  const [itemInfo] = await query(
    "SELECT `naam`, `wat`, `kracht`, `apart`, `type1`, `type2`, `type3`, `kracht2` FROM `items` WHERE `naam`=?",
    [item]
  );
  const playerHand = (
    await query(
      "SELECT `id` FROM `pokemon_speler` WHERE `user_id`=? and `opzak` = 'ja'",
      [userId]
    )
  ).length;
  const house = (
    await query(
      "SELECT `id` FROM `pokemon_speler` WHERE `user_id`=? AND `opzak`='nee'",
      [userId]
    )
  ).length;
  let good = true;
  let drop = false;
  let message = "";
  let catched = false;
  const { huis } = given;
  const over =
    (huis == "doos" ? 2 : huis == "shuis" ? 20 : huis == "nhuis" ? 100 : 2500) -
    house;
  if (itemInfo.wat != "pokeball")
    message = "You have to use a Pok&eacute;ball.";
  else if (playerItemInfo[item] <= 0) message = "You do not have a " + item;
  else if (playerHand > 5 && over <= 0)
    message = "You have no more room left for a new Pok&eacute;mon.";
  else if (battleLog.laatste_aanval == "gevongen")
    message = `You've caught ${computerPokemon.naam_goed}. The battle finished.`;
  else if (battleLog.laatste_aanval == "klaar")
    message = `${computerPokemon.naam_goed} cannot battle because he's knocked out.`;
  else if (battleLog.laatste_aanval == "pokemon")
    message = `${computerPokemon.naam_goed} need to attack`;
  else {
    switch (itemInfo.naam) {
      case "Master ball":
      case "DNA ball":
      case "Cherish ball":
      case "Black ball":
      case "Santa ball":
      case "GS ball":
        catched = true;
        break;
    }
    let catch_change;
    if (!catched) {
      if (computerEffect != "") {
        const [effectInfo] = await query(
          "SELECT `vangkans` FROM `effect` WHERE `actie`=?",
          [computerEffect]
        );
        catch_change = effectInfo.vangkans;
        if (catch_change < 0.5) catch_change = 1;
      } else catch_change = 1;

      let pokeballPower;
      if (itemInfo.apart === "nee") pokeballPower = itemInfo.kracht;
      else if (itemInfo.apart === "ja") {
        if (itemInfo.type2 == "") itemInfo.type2 = "None";
        if (
          [
            "Net ball",
            "Antique ball",
            "Frozen ball",
            "Dive ball",
            "Dream ball",
            "Dusk ball",
            "Ecology ball",
            "Moon ball",
            "Nest ball",
            "Repeat ball",
            "Timer ball",
          ].includes(itemInfo.naam)
        ) {
          if (
            computerPokemon.type1 == itemInfo.type1 ||
            computerPokemon.type1 == itemInfo.type2 ||
            computerPokemon.type2 == itemInfo.type1 ||
            computerPokemon.type2 == itemInfo.type2
          ) {
            pokeballPower = itemInfo.kracht2;
          } else pokeballPower = itemInfo.kracht;
        }
      }

      let resultCatchRate =
        (((3 * computerPokemon.levenmax - 2 * computerPokemon.leven) *
          computerPokemon.vangbaarheid *
          pokeballPower) /
          (3 * computerPokemon.levenmax)) *
        catch_change;
      if (resultCatchRate >= 255) catched = true;
      else {
        if (resultCatchRate == 0) resultCatchRate = 1;
        let catchRate = 16711680 / resultCatchRate;
        catchRate = Math.pow(catchRate, 1 / 4);
        if (catchRate == 0) catchRate = 1;
        catchRate = Math.floor(1048650 / catchRate);

        const number1 = getRandomInt(4e4, 65535);
        const number2 = getRandomInt(0, 65535);
        const number3 = getRandomInt(0, 65535);
        const number4 = getRandomInt(0, 65535);

        if (
          catchRate >= number1 &&
          catchRate >= number2 &&
          catchRate >= number3 &&
          catchRate >= number4
        ) {
          catched = true;
        } else catched = false;
      }
    }

    await query(
      `UPDATE gebruikers_item SET \`${itemInfo.naam}\`=\`${itemInfo.naam}\` - '1' WHERE user_id=?`,
      [userId]
    );

    if (catched) {
      await updatePokedex(computerPokemon.wild_id, "vangen", userId);

      const [karakter] = await query(
        "SELECT * FROM karakters ORDER BY RAND() LIMIT 1"
      );
      const currentPlayerHands = playerHand + 1;
      const [experienceInfo] = await query(
        "SELECT `punten` FROM `experience` WHERE `soort`=? AND `level`=?",
        [computerPokemon.groei, computerPokemon.level + 1]
      );
      let newPokemon = {
        karakter: karakter.karakter_naam,
        expnodig: experienceInfo.punten,
        attack_iv: getRandomInt(0, 31),
        defence_iv: getRandomInt(0, 31),
        speed_iv: getRandomInt(0, 31),
        spcattack_iv: getRandomInt(0, 31),
        spcdefence_iv: getRandomInt(0, 31),
        hp_iv: getRandomInt(0, 31),
      };

      newPokemon["attackstat"] = Math.round(
        (((computerPokemon.attack_base * 2 + newPokemon.attack_iv) *
          computerPokemon.level) /
          100 +
          5) *
          1 *
          karakter.attack_add
      );
      newPokemon["defencestat"] = Math.round(
        (((computerPokemon.defence_base * 2 + newPokemon.defence_iv) *
          computerPokemon.level) /
          100 +
          5) *
          1 *
          karakter.defence_add
      );
      newPokemon["speedstat"] = Math.round(
        (((computerPokemon.speed_base * 2 + newPokemon.speed_iv) *
          computerPokemon.level) /
          100 +
          5) *
          1 *
          karakter.speed_add
      );
      newPokemon["spcattackstat"] = Math.round(
        (((computerPokemon["spc.attack_base"] * 2 + newPokemon.spcattack_iv) *
          computerPokemon.level) /
          100 +
          5) *
          1 *
          karakter["spc.attack_add"]
      );
      newPokemon["spcdefencestat"] = Math.round(
        (((computerPokemon["spc.defence_base"] * 2 + newPokemon.spcdefence_iv) *
          computerPokemon.level) /
          100 +
          5) *
          1 *
          karakter["spc.defence_add"]
      );
      newPokemon["hpstat"] = Math.round(
        ((computerPokemon["hp_base"] * 2 + newPokemon.hp_iv) *
          computerPokemon.level) /
          100 +
          computerPokemon.level +
          10
      );

      message =
        "You threw a " +
        itemInfo.naam +
        ". " +
        computerPokemon.naam_goed +
        " was caught.";

      good = false;

      if (currentPlayerHands > 6) {
        const [lastInHouse] = await query("SELECT COALESCE(MIN(t1.opzak_nummer) + 1, 1) AS next_opzak_nummer FROM pokemon_speler t1 WHERE NOT EXISTS (SELECT 1 FROM pokemon_speler t2 WHERE t2.user_id = t1.user_id AND t2.opzak = 'nee' AND t2.opzak_nummer = t1.opzak_nummer + 1) AND t1.user_id = ? AND t1.opzak = 'nee'", [userId])
        await query(
          "INSERT INTO `pokemon_speler` (`wild_id`, `user_id`, `opzak`, `opzak_nummer`, `karakter`, `shiny`, `level`, `levenmax`, `leven`, `expnodig`, `attack`, `defence`, `speed`, `spc.attack`, `spc.defence`, `attack_iv`, `defence_iv`, `speed_iv`, `spc.attack_iv`, `spc.defence_iv`, `hp_iv`, `aanval_1`, `aanval_2`, `aanval_3`, `aanval_4`, `effect`, `gevongenmet`, `ability`, `capture_date`) \
          SELECT `wildid`, ?, 'nee', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, `effect`, ?, ?, ?  FROM `pokemon_wild_gevecht` WHERE `id`=?",
          [
            userId,
            lastInHouse.next_opzak_nummer,
            newPokemon.karakter,
            computerPokemon.shiny,
            computerPokemon.level,
            newPokemon.hpstat,
            computerPokemon.leven,
            newPokemon.expnodig,
            newPokemon.attackstat,
            newPokemon.defencestat,
            newPokemon.speedstat,
            newPokemon["spcattackstat"],
            newPokemon["spcdefencestat"],
            newPokemon.attack_iv,
            newPokemon.defence_iv,
            newPokemon.speed_iv,
            newPokemon.spcattack_iv,
            newPokemon.spcdefence_iv,
            newPokemon.hp_iv,
            computerPokemon.aanval_1,
            computerPokemon.aanval_2,
            computerPokemon.aanval_3,
            computerPokemon.aanval_4,
            itemInfo.naam,
            computerPokemon.ability,
            new Date(),
            computerPokemon.id,
          ]
        );
        message += `${computerPokemon.naam_goed} is in your house.`;
      } else {
        await query("INSERT INTO `pokemon_speler` (`wild_id`, `user_id`, `opzak`, `opzak_nummer`, `karakter`, `shiny`, `level`, `levenmax`, `leven`, `expnodig`, `attack`, `defence`, `speed`, `spc.attack`, `spc.defence`, `attack_iv`, `defence_iv`, `speed_iv`, `spc.attack_iv`, `spc.defence_iv`, `hp_iv`, `aanval_1`, `aanval_2`, `aanval_3`, `aanval_4`, `effect`, `gevongenmet`, `ability`, `capture_date`) \
          SELECT `wildid`, ?, 'ja', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, `effect`, ?, ?, ? FROM `pokemon_wild_gevecht` WHERE `id`=?", [
          userId,
          currentPlayerHands,
          newPokemon.karakter,
          computerPokemon.shiny,
          computerPokemon.level,
          newPokemon.hpstat,
          computerPokemon.leven,
          newPokemon.expnodig,
          newPokemon.attackstat,
          newPokemon.defencestat,
          newPokemon.speedstat,
          newPokemon["spcattackstat"],
          newPokemon["spcdefencestat"],
          newPokemon.attack_iv,
          newPokemon.defence_iv,
          newPokemon.speed_iv,
          newPokemon.spcattack_iv,
          newPokemon.spcdefence_iv,
          newPokemon.hp_iv,
          computerPokemon.aanval_1,
          computerPokemon.aanval_2,
          computerPokemon.aanval_3,
          computerPokemon.aanval_4,
          itemInfo.naam,
          computerPokemon.ability,
          new Date(),
          computerPokemon.id,
        ]);
      }

      await query("UPDATE `gebruikers` SET `aantalpokemon`=`aantalpokemon`+'1' WHERE `user_id`=?",[userId]);

      await pokemonPlayerHandUpdate(userId);

      await removeAttack(userId, aanval_log_id);
    } else {
      await query("UPDATE `aanval_log` SET `laatste_aanval`='pokemon' WHERE `id`=?",[aanval_log_id]);
      message = `You threw a ${itemInfo.naam}. ${computerPokemon.naam_goed} has escaped.`
    }
  }

  res.json({
    message,
    ballLeft: playerItemInfo[itemInfo.naam] - 1,
    good,
    option_id,
    name: itemInfo.naam,
    type: "Pokeball",
    drop,
  });
};

const createNewComputer = async (
  computer_id,
  computer_level,
  gebied,
  aanvalLogId
) => {
  const [newComputerSql] = await query(
    "SELECT * FROM `pokemon_wild` WHERE `wild_id`=?",
    [computer_id]
  );

  let newComputer = await createNewComputerPokemon(
    newComputerSql,
    computer_level
  );
  newComputer = createNewComputerStats(
    newComputer,
    newComputerSql,
    computer_level,
    15
  );

  const shiny = getRandomInt(1, 600) == 150 ? 1 : 0;

  const insertComputer = await query(
    `INSERT INTO pokemon_wild_gevecht 
       (wildid, aanval_log_id, shiny,level, levenmax, leven, attack, defence, speed, \`spc.attack\`, \`spc.defence\`, aanval_1, aanval_2, aanval_3, aanval_4,effect, local, ability)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newComputer.id,
      aanvalLogId,
      shiny,
      computer_level,
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
      "",
      gebied,
      newComputer.ability,
    ]
  );

  return {
    computer_id: insertComputer.insertId,
    computer_wildid: newComputer.id,
    computer_speed: newComputer.speedstat,
  };
};
