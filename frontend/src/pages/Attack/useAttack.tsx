import { useCallback, useEffect, useState } from "react";
import { useBattle } from "../../contexts/BattleContext";
import { socket } from "../../App";
import { useNavigate } from "react-router-dom";
import {
  AttackLog,
  attackChangePokemon,
  AttackChangePokemonResponse,
  attackUsePokeball,
  AttackUsePokeballResponse,
  attackUsePotion,
  AttackUsePotionResponse,
  BattleResponse,
  ComputerInfo,
  PokemonInfo,
  trainerAttack,
  trainerAttackRun,
  TrainerAttackRunResponse,
  trainerChangePokemonApi,
  TrainerChangePokemonResponse,
  trainerFinish,
  wildAttack,
  wildFinish,
} from "../../api/battle.api";
import { useGame } from "../../contexts/GameContext";
import { ItemData, ItemInfo } from "../../models/item.model";

const rarities = {
  1: {
    name: "נפוץ",
    color: "rgb(82, 196, 26)",
  },
  2: {
    name: "נדיר",
    color: "rgb(24, 144, 255)",
  },
  3: {
    name: "נדיר מאוד",
    color: "rgb(114, 46, 209)",
  },
  4: {
    name: "אגדי",
    color: "rgb(250, 140, 22)",
  },
  5: {
    name: "התחלתי",
    color: "rgb(245, 34, 45)",
  },
  6: {
    name: "מיסטיק",
    color: "rgb(0, 255, 255)",
  },
  7: {
    name: "מגה",
    color: "rgb(235, 47, 150)",
  },
  8: {
    name: "מיוחד",
    color: "rgb(255, 215, 0)",
  },
};

export const useAttack = (isTrainer: boolean = false) => {
  const {
    attackLog,
    computerInfo,
    pokemonInfo,
    battleState,
    dispatchBattle,
    setPokemonInfo,
    setPokemonEvolve,
    setAttackLog,
    setComputerInfo,
    setEnemyPokemons,
  } = useBattle();
  const { attacks, selectedCharacter, setSelectedCharacter } = useGame();
  const navigate = useNavigate();

  const [showPotionsScreen, setShowPotionsScreen] = useState<boolean>(false);
  const [showAttacks, setShowAttacks] = useState<boolean>(true);
  const [showPokemons, setShowPokemons] = useState<boolean>(false);
  const [showBag, setShowBag] = useState<boolean>(false);
  const [selectedPotion, setSelectedPotion] = useState("");
  const [battleMessage, setBattleMessage] = useState("");

  useEffect(() => {
    initializeBattleState();
  }, []);

  useEffect(() => {
    if (!attackLog) return;
    let spelerAttack = false;
    let spelerWissel = false;
    let message = "";

    switch (attackLog.laatste_aanval) {
      case "spelereersteaanval":
        spelerAttack = true;
        message = "Your turn to attack!";
        break;
      case "computereersteaanval":
        spelerAttack = false;
        spelerWissel = false;
        message = `${computerInfo?.naam_goed} will attack first!`;
        // Auto trigger computer turn
        setTimeout(() => computerAttack(), 3000);
        break;
      case "pokemon":
        spelerAttack = false;
        message = `${computerInfo?.naam_goed} is thinking...`;
        setTimeout(() => computerAttack(), 3000);
        break;
      case "computer":
        spelerAttack = true;
        message = "Your turn!";
        break;
      case "speler_wissel":
        spelerAttack = false;
        spelerWissel = true;
        message = `${pokemonInfo?.naam_goed} must be switched!`;
        break;
      case "klaar":
        spelerAttack = true;
        message = "Battle finished!";
        setTimeout(() => {
          // Redirect logic here
        }, 3000);
        break;
      case "end_screen":
        spelerAttack = false;
        spelerWissel = false;
        showEndScreen("חכו עד שהקרב יסתיים.");
        break;
      case "trainer_wissel":
        spelerAttack = false;
        spelerWissel = false;
        setTimeout(() => trainerChange(), 3000);
        break;
      default:
        message = `Error: ${attackLog.laatste_aanval}`;
    }

    dispatchBattle({ type: "SET_SPELER_ATTACK", value: spelerAttack });
    dispatchBattle({ type: "SET_SPELER_WISSEL", value: spelerWissel });
    setBattleMessage(message);

    // Handle weather
    if (
      attackLog.weather &&
      battleState.currentWeather.includes(attackLog.weather)
    ) {
      document
        .getElementById("weather")
        ?.classList.add("weather", attackLog.weather);
    } else {
      document.getElementById("weather")?.classList.remove("weather");
    }
  }, [attackLog]);

  const initializeBattleState = async () => {
    if (!attackLog) {
      socket.emit(
        "currentBattle",
        ({
          attackLogId,
          success,
        }: {
          attackLogId: number;
          success: boolean;
        }) => {
          if (!success) {
            navigate("/");
            return;
          }

          socket.emit(
            "InitBattle",
            attackLogId,
            ({
              attack_log,
              computer_info,
              pokemon_info,
              enemyPokemons,
            }: {
              computer_info: ComputerInfo;
              pokemon_info: PokemonInfo;
              attack_log: AttackLog;
              enemyPokemons: { id: number; leven: number }[];
            }) => {
              setAttackLog(attack_log);
              setComputerInfo(computer_info);
              setPokemonInfo(pokemon_info);
              setEnemyPokemons(enemyPokemons);
            }
          );
        }
      );
    }
  };

  // Attack status handler (from PHP attack_status function)
  const attackStatus = useCallback(
    (response: BattleResponse) => {
      // Calculate animation time based on damage
      const damage = parseInt(response.damage);
      let time = 250;
      if (damage < 25) time = 1000;
      else if (damage < 50) time = 1200;
      else if (damage < 100) time = 1300;
      else if (damage < 150) time = 1500;
      else if (damage < 200) time = 1700;
      else if (damage < 250) time = 2000;
      else if (damage >= 250) time = 2200;

      // Handle weather
      if (
        response.weather &&
        battleState.currentWeather.includes(response.weather)
      ) {
        document
          .getElementById("weather")
          ?.classList.add("weather", response.weather);
      } else {
        document.getElementById("weather")?.classList.remove("weather");
      }

      // Z-Move fade out
      setTimeout(() => {
        const zmoveEl = document.getElementById("zmove");
        if (zmoveEl) zmoveEl.style.display = "none";
      }, 3000);

      // Pokemon animations
      const allowAnim = true;
      if (response.who === "computer") {
        const imgPokemon = document.getElementById("img_pokemon");
        const imgTrainer = document.getElementById("img_trainer");

        if (["Quick Attack", "Fly"].includes(battleState.currentAtk)) {
          imgPokemon?.classList.add("quick_atk");
        } else if (battleState.currentAtk === "Earthquake") {
          document.getElementById("weather")?.classList.add("shake");
        } else if (battleState.currentAtk === "Explode") {
          imgPokemon?.classList.add("explode");
        }

        if (allowAnim && imgTrainer) {
          imgTrainer.classList.add("shake");
        }
      }

      // Show damage and HP updates
      if (response.who === "computer") {
        // Computer took damage
        const dameEl = document.getElementById("dame");
        if (dameEl) {
          dameEl.style.display = "block";
          dameEl.innerHTML = response.damage;
        }

        // Update player Pokemon HP display if it was affected
        if (response.playerHp) {
          const hpDisplay = document.getElementById("");
          if (hpDisplay) {
            if (response.playerHp === 0) {
              hpDisplay.innerHTML = "";
              dispatchBattle({ type: "SET_SPELER_WISSEL", value: true });
            } else {
              hpDisplay.innerHTML = `${response.playerHp}/${response.playerMaxHp}`;
            }
          }
        }
      } else {
        // Player Pokemon took damage
        const dame2El = document.getElementById("dame2");
        if (dame2El) {
          dame2El.style.display = "block";
          dame2El.innerHTML = response.damage;
        }
      }

      // Set timer for phase 2
      const timer = setTimeout(() => attackStatus2(response), time);
      dispatchBattle({ type: "SET_ATTACK_TIMER", timer });
    },
    [attackLog]
  );

  // Computer attack function (from PHP computer_attack)
  const computerAttack = useCallback(async () => {
    if (!battleState.spelerAttack && attackLog) {
      setBattleMessage("Computer is attacking...");
      setShowPotionsScreen(false);

      // Hide hit indicators
      const hit1 = document.getElementById("hit");
      const hit2 = document.getElementById("hit2");
      if (hit1) hit1.style.display = "none";
      if (hit2) hit2.style.display = "block";

      try {
        if (isTrainer) {
          const response = await trainerAttack(
            undefined,
            "computer",
            attackLog.id!
          );
          attackStatus(response);
        } else {
          const response = await wildAttack(
            undefined,
            "computer",
            attackLog.id!
          );
          attackStatus(response);
        }
      } catch (error) {
        console.error("Computer attack failed:", error);
        setBattleMessage("Computer attack failed!");
      }
    }
  }, [battleState.spelerAttack, attackLog]);

  // Trainer change Pokemon function
  const trainerChange = useCallback(async () => {
    if (!battleState.spelerAttack && attackLog && pokemonInfo && computerInfo) {
      setShowPotionsScreen(false);

      ["hit", "hit2"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
      });

      try {
        const response = await trainerChangePokemonApi(
          pokemonInfo.naam!,
          computerInfo.naam,
          attackLog.id!,
          selectedCharacter?.user_id
        );
        trainerChangePokemon(response);
      } catch (error) {
        console.error("Trainer change failed:", error);
      }
    }
  }, [battleState.spelerAttack, attackLog, pokemonInfo, computerInfo]);

  // Trainer change Pokemon response handler
  const trainerChangePokemon = useCallback(
    (response: TrainerChangePokemonResponse) => {
      const {
        message,
        trainerName,
        maxHp,
        hp,
        trainerId,
        wildId,
        effect,
        refresh,
      } = response;

      setBattleMessage(message);

      // Update trainer name display
      const trainerNameEl = document.getElementById("trainer_naam");
      if (trainerNameEl) trainerNameEl.innerHTML = trainerName;

      // Update trainer Pokemon image
      const trainerImg = document.getElementById(
        "img_trainer"
      ) as HTMLImageElement;
      if (trainerImg) {
        trainerImg.src = require(`../../assets/images/pokemon/${wildId}.gif`);
      }
      // Handle status effect
      const computerEffectEl = document.getElementById("computer_effect");
      if (!effect || effect === "") {
        if (computerEffectEl) computerEffectEl.style.display = "none";
      } else {
        const img = computerEffectEl?.querySelector("img") as HTMLImageElement;
        if (img) {
          img.src = require(`../../assets/images/effects/${effect}.png`);
          img.alt = effect;
          img.title = effect;
        }
        if (computerEffectEl) computerEffectEl.style.display = "block";
      }

      // Update HP bar
      const computerLifePercent = Math.round((hp / maxHp) * 100);
      const computerLifeEl = document.getElementById("computer_life");
      if (computerLifeEl) {
        computerLifeEl.style.width = `${computerLifePercent}%`;
        computerLifeEl.innerText = `${computerLifePercent}%`;
      }

      // Mark old Pokemon as defeated
      const oldTrainerEl = document.getElementById(`trainer_${trainerId}`);
      if (oldTrainerEl) {
        (
          oldTrainerEl as HTMLImageElement
        ).src = require(`../../assets/images/icons/pokeball_black.gif`);
        oldTrainerEl.title = "Defeated";
      }

      // Continue battle flow
      if (refresh === 1) {
        setTimeout(() => computerAttack(), 3000);
      } else {
        dispatchBattle({ type: "SET_SPELER_ATTACK", value: true });
        dispatchBattle({ type: "SET_SPELER_WISSEL", value: true });
      }
    },
    [dispatchBattle]
  );

  // Show end screen function
  const showEndScreen = useCallback(
    async (text: string) => {
      if (!attackLog) return;
      if (isTrainer) {
        try {
          const response = await trainerFinish(attackLog.id!);

          // Hide hit indicators
          ["hit", "hit2"].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
          });

          if (response.victory) {
            // Player won
            let message = "";
            if (response.badge === "") {
              message = `You defeated ${attackLog.trainer}! You gained ${response.reward} Silvers.`;
            } else {
              message = `You defeated ${attackLog.trainer}! You earned the ${response.badge} badge and ${response.reward} Silvers.`;
            }

            setBattleMessage(message);

            // Show badge if earned
            if (response.badge && !response.badge.includes("Elite")) {
              const zmoveEl = document.getElementById("zmove");
              if (zmoveEl) {
                zmoveEl.style.display = "none";
                (
                  zmoveEl as HTMLImageElement
                ).src = require(`../../assets/images/badges/pixel/${response.badge}.png`);
                zmoveEl.style.marginLeft = "81%";
                zmoveEl.style.display = "block";
              }
            }
          } else {
            // Player lost
            let message = `${attackLog.trainer} defeated you!`;
            if (response.reward > 0) {
              message += ` You lost ${response.reward} Silvers.`;
            }
            message += " Better luck next time!";
            setBattleMessage(message);
          }

          // Hide Pokemon text and reset images
          const pokemonTextEl = document.getElementById("pokemon_text");
          if (pokemonTextEl) pokemonTextEl.style.display = "none";

          // Redirect after delay
          setTimeout(() => {
            if (response.dataOfLevelGrow.needsAttention) {
              setPokemonEvolve(response.dataOfLevelGrow);
              if (response.dataOfLevelGrow.newAttack) {
                navigate("/poke-new-attack");
              } else {
                navigate("/poke-evolve");
              }
            } else {
              navigate("/attack/map");
            }
            navigate("/");
          }, 7500);
        } catch (error) {
          console.error("End screen failed:", error);
        }
      } else {
        try {
          const response = await wildFinish(attackLog.id!);

          // Hide hit indicators
          ["hit", "hit2"].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
          });

          if (response.text) {
            // Player won
            let message = `ניצחת את ${text}!`;
            setBattleMessage(message);
          } else {
            // Player lost
            let message = `הפסדת`;
            if (response.money > 0) {
              message += `הפסדת ${response.money} סילבר.`;
            }
            message += " בהצלחה מחדש!";
            setBattleMessage(message);
          }

          // Hide Pokemon text and reset images
          const pokemonTextEl = document.getElementById("pokemon_text");
          if (pokemonTextEl) pokemonTextEl.style.display = "none";

          // Redirect after delay
          setTimeout(() => {
            socket.emit(
              "getUserInfo",
              selectedCharacter?.user_id,
              ({ success, data }: { success: boolean; data: any }) => {
                if (success) {
                  setSelectedCharacter(data.user);
                  if (response.dataOfLevelGrow.needsAttention) {
                    setPokemonEvolve(response.dataOfLevelGrow);
                    if (response.dataOfLevelGrow.newAttack) {
                      navigate("/poke-new-attack");
                    } else {
                      navigate("/poke-evolve");
                    }
                  } else {
                    navigate("/attack/map");
                  }
                }
              }
            );
          }, 7500);
        } catch (error) {
          console.error("End screen failed:", error);
        }
      }
    },
    [attackLog, navigate]
  );

  // Attack status phase 2 (from PHP attack_status_2 function)
  const attackStatus2 = (response: BattleResponse) => {
    // Clear attack timer
    if (battleState.attackTimer) {
      clearTimeout(battleState.attackTimer);
    }

    // Hide animations
    ["hit", "hit2", "dame", "dame2"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });

    setBattleMessage(response.message);

    // Handle status effects
    const handleStatusEffect = (
      effectName: string | undefined,
      targetId: string
    ) => {
      const effectEl = document.getElementById(targetId);
      if (!effectName || effectName === "") {
        if (effectEl) effectEl.style.display = "none";
      } else {
        if (effectEl) {
          const img = effectEl.querySelector("img") as HTMLImageElement;
          if (img) {
            img.src = require(`../../assets/images/effects/${effectName}.png`);
            img.alt = effectName;
            img.title = effectName;
          }
          effectEl.style.display = "block";
        }
      }
    };

    handleStatusEffect(response.pokemonEffect, "pokemon_effect");
    handleStatusEffect(response.computerEffect, "computer_effect");

    // Handle HP updates and progress bars
    if (response.who === "pokemon") {
      const lifePercent = Math.round((response.hp / response.maxHp) * 100);

      // Update HP bar
      const hpBar = document.getElementById("pokemon_life") as HTMLElement;
      if (hpBar) {
        hpBar.style.width = `${lifePercent}%`;
        hpBar.innerText = `${lifePercent}%`;
      }

      // Update Pokemon selection display
      const pokemonDisplay = document.querySelector(
        `div[id='change_pokemon'][name='${response.pokemonPosition}']`
      );
      if (pokemonDisplay) {
        const progressBar = pokemonDisplay.querySelector(
          ".progress"
        ) as HTMLElement;
        if (progressBar) progressBar.style.width = `${lifePercent}%`;

        pokemonDisplay.setAttribute(
          "data-original-title",
          `${pokemonInfo?.naam} HP: ${response.hp}/${response.maxHp}`
        );
      }

      // Update HP display
      const hpDisplay = document.getElementById("pokemon_life");
      if (hpDisplay) {
        hpDisplay.innerHTML = `${response.hp}/${response.maxHp}`;
      }
    } else {
      const lifePercent = Math.round((response.hp / response.maxHp) * 100);
      // Update HP bar
      const hpBar = document.getElementById("computer_life") as HTMLElement;
      if (hpBar) {
        hpBar.style.width = `${lifePercent}%`;
        hpBar.innerText = `${lifePercent}%`;
      }
    }

    // Handle Pokemon transformations/switches
    if (response.transform && response.transform !== "0") {
      const transformData = response.transform.split(",");

      if (response.who === "pokemon") {
        // Player Pokemon transformed
        const hpDisplay = document.getElementById("pokemon_life");
        if (hpDisplay) {
          hpDisplay.innerHTML = `${response.hp}/${response.maxHp}`;
          hpDisplay.style.width = `${Math.round(
            (response.hp / response.maxHp) * 100
          )}%`;
        }

        // Update attack buttons
        for (let i = 0; i < 4; i++) {
          const button = document.querySelector(
            `button.btn-type:nth-of-type(${i + 1})`
          ) as HTMLButtonElement;
          if (button && transformData[i + 2]) {
            button.innerHTML = transformData[i + 2];
          }
        }

        // Update Pokemon image
        const map = transformData[5] === "1" ? "shiny" : "pokemon";
        const pokemonImg = document.getElementById(
          "img_pokemon"
        ) as HTMLImageElement;
        if (pokemonImg) {
          pokemonImg.src = require(`../../assets/images/${map}/back/${transformData[0]}.gif`);
        }
      } else {
        // Computer Pokemon transformed
        const map = transformData[5] === "1" ? "shiny" : "pokemon";
        const computerImg = document.getElementById(
          "img_computer"
        ) as HTMLImageElement;
        if (computerImg) {
          computerImg.src = require(`../../assets/images/${map}/${transformData[0]}.gif`);
        }
      }
    }

    // Handle battle flow
    if (response.who === "pokemon") {
      if (response.battleFinished) {
        setTimeout(() => showEndScreen(response?.message), 5000);
      } else if (response.hp <= 0) {
        dispatchBattle({ type: "SET_SPELER_WISSEL", value: true });
      } else {
        dispatchBattle({ type: "SET_SPELER_ATTACK", value: true });
        dispatchBattle({ type: "SET_SPELER_WISSEL", value: true });
      }
    } else if (response.who === "computer") {
      dispatchBattle({ type: "SET_SPELER_ATTACK", value: false });
      dispatchBattle({ type: "SET_SPELER_WISSEL", value: false });

      if (response.hp <= 0) {
        // Handle experience gain
        if (response.expGained && response.levelGained) {
          expChange(response.expGained, response.levelGained);
        }

        if (response.battleFinished) {
          if (isTrainer) {
            const trainerEl = document.getElementById(
              `trainer_${response.computerId}`
            );
            if (trainerEl) {
              (
                trainerEl as HTMLImageElement
              ).src = require(`../../assets/images/icons/pokeball_black.gif`);
            }
          }
          setTimeout(() => showEndScreen(response.message), 5000);
        } else {
          const timer = setTimeout(() => trainerChange(), 3000);
          dispatchBattle({ type: "SET_NEXT_TURN_TIMER", timer });
        }
      } else if (response.nextTurn) {
        setTimeout(() => computerAttack(), 3000);
      }
    }

    // Check if player Pokemon needs switching
    if (response.playerHp === 0) {
      dispatchBattle({ type: "SET_SPELER_WISSEL", value: true });
    }
  };

  const expChange = (expGained: number, levelGained: number) => {
    setPokemonInfo((prev) => ({
      ...prev,
      exp: expGained,
      expnodig: levelGained,
    }));
  };

  const handleAttackClick = useCallback(
    async (attackName: string, isZMove = false) => {
      if (!battleState.spelerAttack || !attackLog || !pokemonInfo) return;

      dispatchBattle({ type: "SET_SPELER_ATTACK", value: false });
      dispatchBattle({ type: "SET_ATTACK", attack: attackName });

      // Show hit animation
      const hitEl = document.getElementById("hit");
      const hit2El = document.getElementById("hit2");
      if (hitEl) hitEl.style.display = "block";
      if (hit2El) hit2El.style.display = "none";

      setBattleMessage(`${pokemonInfo.naam_goed} used ${attackName}!`);
      setShowPotionsScreen(false);

      try {
        let response: BattleResponse = {} as BattleResponse;
        if (isTrainer) {
          response = await trainerAttack(attackName, "pokemon", attackLog.id!);
        } else {
          response = await wildAttack(attackName, "pokemon", attackLog.id!);
        }
        if (isZMove) {
          // Show Z-Move animation
          const zmoveEl = document.getElementById("zmove");
          if (zmoveEl) {
            zmoveEl.style.display = "none";
            (
              zmoveEl as HTMLImageElement
            ).src = require(`../../assets/images/zmoves/${attackName.replace(
              " ",
              "_"
            )}.png`);
            zmoveEl.style.display = "block";
          }

          // Hide Z-Move button
          const zMoveBtn = document.getElementById("use-zmove");
          if (zMoveBtn) {
            zMoveBtn.style.display = "none";
          }
          dispatchBattle({ type: "SET_TRAINER_ZMOVE", value: true });
        }

        attackStatus(response);
      } catch (error) {
        console.error("Attack failed:", error);
        setBattleMessage("Attack failed!");
        dispatchBattle({ type: "SET_SPELER_ATTACK", value: true });
      }
    },
    [battleState.spelerAttack, attackLog, pokemonInfo, dispatchBattle]
  );

  // Handle Pokemon change
  const handlePokemonChange = useCallback(
    async (pokemonIndex: number) => {
      if (!battleState.spelerWissel || !attackLog || !computerInfo) return;

      setShowPotionsScreen(false);

      ["hit", "hit2"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
      });

      try {
        const response = await attackChangePokemon(pokemonIndex, attackLog.id!);
        changePokemonStatus(response);
      } catch (error) {
        console.error("Pokemon change failed:", error);
      }
    },
    [battleState.spelerWissel, attackLog, computerInfo]
  );

  // Change Pokemon status handler
  const changePokemonStatus = useCallback(
    (response: AttackChangePokemonResponse) => {
      const { data } = response;
      const { message, good, changePokemon, zmove, tz, opzak_nummer, refresh } =
        data;
      setBattleMessage(message);

      if (good) {
        // Change was successful
        // Update Pokemon name and level
        const pokemonNameEl = document.getElementById("pokemon_naam");

        if (pokemonNameEl)
          pokemonNameEl.innerHTML = `${changePokemon.naam} (${
            changePokemon?.level
          }, ${getRareOfPokemon(changePokemon?.zeldzaamheid!)})`;

        const hpDisplay = document.getElementById("pokemon_life");
        if (hpDisplay) {
          hpDisplay.innerHTML = `${changePokemon.leven}/${changePokemon.levenmax}`;
          hpDisplay.style.width = `${Math.round(
            (changePokemon.leven / changePokemon.levenmax) * 100
          )}%`;
        }

        // Update move buttons
        for (let i = 0; i < 4; i++) {
          const button = document.querySelector(
            `button.btn-type:nth-of-type(${i + 1})`
          ) as HTMLButtonElement;
          // גישה בטוחה לשדות במקום אינדקס דינמי על אובייקט טיפוסי
          const move = changePokemon?.[`aanval_${i + 1}`] || "";
          // נניח ש־parts מגיע מה־response או מה־data, נשתמש ב־changePokemon אם יש צורך
          const moveType = data[`attack${i + 1}` as keyof typeof data];

          if (button) {
            if (move) {
              button.innerHTML = move;
              button.style.backgroundImage = `url(${require(`../../assets/images/attack/moves/${moveType.type}.png`)})`;
              button.style.display = "block";
            } else {
              button.style.display = "none";
            }
          }
        }

        // Handle Z-Move
        if (!battleState.trainerZmove && zmove && tz) {
          const zMoveBtn = document.getElementById("use-zmove");
          if (zMoveBtn) {
            zMoveBtn.style.display = "block";
            zMoveBtn.innerHTML = zmove;
            zMoveBtn.style.backgroundImage = `url(${require(`../../assets/images/attack/moves/${tz}.png`)})`;
          }
        } else {
          const zMoveBtn = document.getElementById("use-zmove");
          if (zMoveBtn) zMoveBtn.style.display = "none";
        }

        // Handle status effect
        const pokemonEffectEl = document.getElementById("pokemon_effect");
        if (!changePokemon.effect || changePokemon.effect === "") {
          if (pokemonEffectEl) pokemonEffectEl.style.display = "none";
        } else {
          const img = pokemonEffectEl?.querySelector("img") as HTMLImageElement;
          if (img) {
            img.src = require(`../../assets/images/effects/${changePokemon.effect}.png`);
            img.alt = changePokemon.effect;
            img.title = changePokemon.effect;
          }
          if (pokemonEffectEl) pokemonEffectEl.style.display = "block";
        }

        setPokemonInfo(changePokemon);

        // Show all Pokemon in hand and hide the active one
        for (let i = 1; i < 7; i++) {
          const pokemonEl = document.querySelector(
            `div[id='change_pokemon'][name='${i}']`
          );
          if (pokemonEl && pokemonEl.getAttribute("data-original-title")) {
            (pokemonEl as HTMLElement).style.display = "block";
          }
        }

        // Hide the new active Pokemon
        const activePokemonEl = document.querySelector(
          `div[id='change_pokemon'][name='${opzak_nummer}']`
        );
        if (activePokemonEl) {
          (activePokemonEl as HTMLElement).style.display = "none";
        }
        // Update HP and EXP bars
        const pokemonLifePercent = Math.round(
          (changePokemon.leven / changePokemon.levenmax) * 100
        );
        const pokemonLifeEl = document.getElementById("pokemon_life");
        if (pokemonLifeEl) {
          pokemonLifeEl.style.width = `${pokemonLifePercent}%`;
          pokemonLifeEl.innerText = `${pokemonLifePercent}%`;
        }

        // Set battle state for next phase
        if (refresh) {
          dispatchBattle({ type: "SET_SPELER_ATTACK", value: false });
          dispatchBattle({ type: "SET_SPELER_WISSEL", value: false });
          setTimeout(() => computerAttack(), 3000);
        } else {
          dispatchBattle({ type: "SET_SPELER_ATTACK", value: true });
          dispatchBattle({ type: "SET_SPELER_WISSEL", value: true });
        }
      }
    },
    [battleState.trainerZmove, dispatchBattle]
  );

  // Handle item use
  const handleItemUse = useCallback(
    async (itemName: string, targetPokemonId: number) => {
      if (!battleState.spelerAttack || !attackLog || !computerInfo) return;

      try {
        const response = await attackUsePotion(
          itemName,
          computerInfo.naam,
          1,
          targetPokemonId,
          attackLog.id!
        );
        handleUseItemStatus(response);
        setShowPotionsScreen(false);
      } catch (error) {
        console.error("Item use failed:", error);
      }
    },
    [battleState.spelerAttack, attackLog, computerInfo]
  );

  // Use item status handler
  const handleUseItemStatus = useCallback(
    (response: AttackUsePotionResponse) => {
      const {
        good,
        info_potion_left,
        item_info_naam,
        message,
        name,
        new_life,
        pokemon_infight,
        pokemonInfo,
      } = response;
      setBattleMessage(message);

      // Update item quantity
      const itemEl = document.querySelector(
        `div[data-item-name='${item_info_naam}'] .qtd`
      );
      const amount = info_potion_left;

      if (name === "Potion") {
        if (good) {
          // Update Pokemon HP if it's the active Pokemon
          if (pokemon_infight) {
            const pokemonLifeEl = document.getElementById("pokemon_life");
            const newHp = new_life;
            const maxHp = pokemonInfo.levenmax;
            const lifePercent = Math.round((newHp / maxHp) * 100);

            if (pokemonLifeEl) {
              pokemonLifeEl.style.width = `${lifePercent}%`;
              pokemonLifeEl.innerText = `${lifePercent}%`;
            }
          }

          // Update HP display
          const hpDisplay = document.getElementById("pokemon_life");
          if (pokemon_infight && hpDisplay) {
            hpDisplay.innerHTML = `${new_life}/${pokemonInfo.levenmax}`;
          }

          // Update Pokemon in selection list
          const pokemonSelectionEl = document.querySelector(
            `div[id='change_pokemon'][name='${pokemonInfo.opzak_nummer}']`
          );
          if (pokemonSelectionEl) {
            const green = Math.round((new_life / pokemonInfo.levenmax) * 100);
            pokemonSelectionEl.innerHTML = `${pokemonInfo.naam_goed}<div class='hp_red' style='height: 3px; width: 86%;'><div class='progress' style='width: 100%'></div></div>`;

            const progressEl = pokemonSelectionEl.querySelector(
              ".progress"
            ) as HTMLElement;
            if (progressEl) {
              progressEl.style.width = `${green}%`;
            }

            pokemonSelectionEl.setAttribute(
              "data-original-title",
              `${pokemonInfo.naam_goed} HP: ${new_life}/${pokemonInfo.levenmax}`
            );
          }

          // Update item quantity
          if (amount < 1) {
            itemEl?.parentElement?.parentElement?.remove();
          } else if (itemEl) {
            itemEl.innerHTML = amount.toString();
          }
        }

        // Computer's turn if needed
        if (good) {
          dispatchBattle({ type: "SET_SPELER_ATTACK", value: false });
          dispatchBattle({ type: "SET_SPELER_WISSEL", value: false });
          setTimeout(() => computerAttack(), 3000);
        }
      }
    },
    [dispatchBattle]
  );

  // Handle run attempt
  const handleRunAttempt = useCallback(async () => {
    if (!battleState.spelerAttack || !attackLog || !computerInfo) return;

    setShowPotionsScreen(false);

    try {
      const response = await trainerAttackRun(attackLog.id!);
      attackRunStatus(response);
    } catch (error) {
      console.error("Run attempt failed:", error);
    }
  }, [battleState.spelerAttack, attackLog, computerInfo]);

  // Attack run status handler
  const attackRunStatus = useCallback(
    (response: TrainerAttackRunResponse) => {
      setBattleMessage(response.message);

      if (response.good) {
        // Successfully ran away
        setTimeout(() => {
          navigate(isTrainer ? "/" : "/attack/map");
        }, 3000);
      } else {
        // Failed to run, computer's turn
        dispatchBattle({ type: "SET_SPELER_ATTACK", value: false });
        dispatchBattle({ type: "SET_SPELER_WISSEL", value: false });
        setTimeout(() => computerAttack(), 3000);
      }
    },
    [dispatchBattle]
  );

  const handleSelectAttack = () => {
    setShowPotionsScreen(false);
    setShowPokemons(false);
    setShowBag(false);
    setShowAttacks(true);
  };

  const handleSelectBag = () => {
    setShowPotionsScreen(false);
    setShowPokemons(false);
    setShowBag(true);
    setShowAttacks(false);
  };

  const handleSelectPokemon = () => {
    setShowPotionsScreen(false);
    setShowPokemons(true);
    setShowBag(false);
    setShowAttacks(false);
  };

  const handleSelectRun = () => {
    setShowPotionsScreen(false);
    handleRunAttempt();
  };

  const calculatePercent = (info: ComputerInfo | PokemonInfo) => {
    if (info.leven !== 0) {
      return Math.round((info.leven! / info.levenmax!) * 100);
    }
    return 0;
  };

  const getTypeOfAttack = (attackName: string) => {
    return (
      attacks.find((attack) => attack.name === attackName)?.type || "Normal"
    );
  };

  const handleUseItem = async (item: ItemInfo, name: keyof ItemData) => {
    if (battleState.spelerAttack) {
      switch (item.soort) {
        case "balls":
          setShowPotionsScreen(false);
          setSelectedPotion("");
          if (attackLog?.id && computerInfo?.effect != null) {
            const response = await attackUsePokeball(
              attackLog.id,
              name,
              item.soort,
              computerInfo.effect
            );
            handleUsePokeballStatus(response);
          }
          break;
        case "potions":
          setShowPotionsScreen(true);
          setSelectedPotion(name);
          break;
      }
    }
  };

  const handleUsePokeballStatus = useCallback(
    (response: AttackUsePokeballResponse) => {
      const { good, message, name, ballLeft, drop, type } = response;
      setBattleMessage(message);

      // Update item quantity
      const itemEl = document.querySelector(
        `div[data-item-name='${name}'] .qtd`
      );
      const amount = ballLeft;

      if (type === "Pokeball") {
        if (amount < 1) {
          itemEl?.parentElement?.parentElement?.remove();
        } else if (itemEl) {
          itemEl.innerHTML = amount.toString();
        }
        if (!good) {
          // Update item quantity
          setTimeout(() => {
            navigate("/");
          }, 4000);
        } else {
          dispatchBattle({ type: "SET_SPELER_ATTACK", value: false });
          dispatchBattle({ type: "SET_SPELER_WISSEL", value: false });
          setTimeout(() => computerAttack(), 3000);
        }
      }
    },
    [dispatchBattle]
  );

  const pokemonAttacks = [
    pokemonInfo?.aanval_1,
    pokemonInfo?.aanval_2,
    pokemonInfo?.aanval_3,
    pokemonInfo?.aanval_4,
  ].filter((a) => a && a !== ""); // מסנן ערכים ריקים

  function getRareOfPokemon(zeldzaamheid: number): React.ReactNode {
    return rarities[zeldzaamheid as keyof typeof rarities].name;
  }

  function getColorOfPokemon(zeldzaamheid: number): string {
    return rarities[zeldzaamheid as keyof typeof rarities].color;
  }

  return {
    getRareOfPokemon,
    getColorOfPokemon,
    calculatePercent,
    pokemonAttacks,
    handleAttackClick,
    getTypeOfAttack,
    handlePokemonChange,
    handleUseItem,
    handleItemUse,
    handleSelectAttack,
    handleSelectBag,
    handleSelectRun,
    handleSelectPokemon,
    showPotionsScreen,
    showAttacks,
    showBag,
    showPokemons,
    selectedPotion,
    battleMessage,
  };
};
