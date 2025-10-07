import "./style.css";

import {
  AttackChangePokemonResponse,
  AttackUsePokeballResponse,
  AttackUsePotionResponse,
  BattleResponse,
  ComputerInfo,
  PokemonInfo,
  TrainerAttackRunResponse,
  attackChangePokemon,
  attackUsePokeball,
  attackUsePotion,
  trainerAttackRun,
  wildAttack,
  wildFinish,
} from "../../api/battle.api";
import {
  AttackWrapper,
  BattleArea,
  BattlePokemon,
  BoxContent,
  ComputerStar,
  EffectWrapper,
  ExpProgress,
  ExpWrapper,
  GifAttack,
  HpRed,
  HpWrapper,
  LevelIconText,
  MyPokemonBar,
  MyPokemonHpWrapper,
  MyPokemonName,
  MyPokemonNameWrapper,
  OpponentBar,
  OpponentBarContainer,
  OpponentName,
  OpponentNameWrapper,
  OpponentPokemonImage,
  OpponentWrapper,
  PokemonImage,
  Progress,
  TableDuelArena,
  TextBox,
  Title,
  Weather,
} from "./TrainerAttack/styled";
import { ItemData, ItemInfo } from "../../models/item.model";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useBattle } from "../../contexts/BattleContext";
import { useGame } from "../../contexts/GameContext";

const WildAttack: React.FC = () => {
  const {
    attackLog,
    battleState,
    computerInfo,
    dispatchBattle,
    pokemonInfo,
    setPokemonInfo,
  } = useBattle();

  const { selectedCharacter, myPokemons, itemInfo, attacks } = useGame();
  const location = useLocation();
  const navigate = useNavigate();
  const [showPotionsScreen, setShowPotionsScreen] = useState<boolean>(false);
  const [selectedPotion, setSelectedPotion] = useState("");
  const [showAttacks, setShowAttacks] = useState<boolean>(true);
  const [showPokemons, setShowPokemons] = useState<boolean>(false);
  const [showBag, setShowBag] = useState<boolean>(false);
  const [battleMessage, setBattleMessage] = useState("");

  const itemsToUse = itemInfo.filter(
    (item) => item.soort === "potions" || item.soort === "balls"
  );

  useEffect(() => {
    const initializeBattleState = () => {
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
    };

    initializeBattleState();
  }, []);

  // Attack status handler (from PHP attack_status function)
  const attackStatus = useCallback((response: BattleResponse) => {
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

    // Attack animation GIF
    if (response.attackType) {
      let gifSuffix = "";
      let gifAttack = "_blank";

      const attackTypeMap: Record<string, string> = {
        Fire: "burn",
        Water: "wave",
        Electric: "electric",
        Dark: "dark",
        Steel: "steel",
        Psychic: "psychic",
        Poison: "poison",
        Normal: "normal",
        Ice: "ice",
        Grass: "grass",
        Ground: "ground",
        Ghost: "ghost",
        Flying: "flying",
        Fighting: "fighting",
        Fairy: "fairy",
        Dragon: "dragon",
        Bug: "bug",
        Rock: "rock",
      };

      gifAttack = attackTypeMap[response.attackType] || "_blank";

      if (gifAttack !== "_blank" && response.who === "computer") {
        gifSuffix = "_y";
      }

      // Update attack GIF
      const gifImg = document.querySelector(
        "#gif_attack img"
      ) as HTMLImageElement;
      if (gifImg && response.attackType !== "Fire") {
        if (
          ["Recover", "Roost"].includes(battleState.currentAtk) &&
          response.who === "computer"
        ) {
          gifImg.src = `/images/attacks/${gifAttack}.gif`;
        } else {
          gifImg.src = `/images/attacks/${gifAttack}${gifSuffix}.gif`;
        }
      }
    }

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
        const hpDisplay = document.getElementById("hpPokemon");
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
  }, []);

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
        const response = await wildAttack(undefined, "computer", attackLog.id!);
        attackStatus(response);
      } catch (error) {
        console.error("Computer attack failed:", error);
        setBattleMessage("Computer attack failed!");
      }
    }
  }, [battleState.spelerAttack, attackLog]);

  // Show end screen function
  const showEndScreen = useCallback(
    async (text: string) => {
      if (!attackLog) return;

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
          navigate("/attack/map");
        }, 7500);
      } catch (error) {
        console.error("End screen failed:", error);
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
            img.src = `/images/effects/${effectName}.png`;
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
      if (hpBar) hpBar.style.width = `${lifePercent}%`;

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
      const hpDisplay = document.getElementById("hpPokemon");
      if (hpDisplay) {
        hpDisplay.innerHTML = `${response.hp}/${response.maxHp}`;
      }
    } else {
      const lifePercent = Math.round((response.hp / response.maxHp) * 100);
      // Update HP bar
      const hpBar = document.getElementById("computer_life") as HTMLElement;
      if (hpBar) hpBar.style.width = `${lifePercent}%`;
    }

    // Handle Pokemon transformations/switches
    if (response.transform && response.transform !== "0") {
      const transformData = response.transform.split(",");

      if (response.who === "pokemon") {
        // Player Pokemon transformed
        const hpDisplay = document.getElementById("hpPokemon");
        if (hpDisplay) {
          hpDisplay.innerHTML = `${response.hp}/${response.maxHp}`;
        }

        // Update attack buttons
        for (let i = 0; i < 4; i++) {
          const button = document.querySelector(
            `button:nth-of-type(${i + 1})`
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
          pokemonImg.src = `/images/${map}/back/${transformData[0]}.gif`;
        }
      } else {
        // Computer Pokemon transformed
        const map = transformData[5] === "1" ? "shiny" : "pokemon";
        const computerImg = document.getElementById(
          "img_computer"
        ) as HTMLImageElement;
        if (computerImg) {
          computerImg.src = `/images/${map}/${transformData[0]}.gif`;
        }
      }
    }

    // Handle battle flow
    if (response.who === "pokemon") {
      if (response.battleFinished) {
        setTimeout(() => showEndScreen(response.message), 5000);
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
          setTimeout(() => showEndScreen(response.message), 5000);
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
        const response = await wildAttack(attackName, "pokemon", attackLog.id!);
        if (isZMove) {
          // Show Z-Move animation
          const zmoveEl = document.getElementById("zmove");
          if (zmoveEl) {
            zmoveEl.style.display = "none";
            (
              zmoveEl as HTMLImageElement
            ).src = `/images/zmoves/${attackName.replace(" ", "_")}.png`;
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
        const pokemonLevelEl = document.getElementById("pokemon_level");

        if (pokemonNameEl) pokemonNameEl.innerHTML = changePokemon.naam;
        if (pokemonLevelEl) {
          pokemonLevelEl.innerHTML = `${changePokemon.level} <div id='hpPokemon' style='margin-top: -4px;margin-left: 80px;position: absolute;'></div>`;
        }

        const hpDisplay = document.getElementById("hpPokemon");
        if (hpDisplay) {
          hpDisplay.innerHTML = `${changePokemon.leven}/${changePokemon.levenmax}`;
        }

        // Update move buttons
        for (let i = 0; i < 4; i++) {
          const button = document.querySelector(
            `button:nth-of-type(${i + 1})`
          ) as HTMLButtonElement;
          // גישה בטוחה לשדות במקום אינדקס דינמי על אובייקט טיפוסי
          const move = changePokemon?.[`aanval_${i + 1}`] || "";
          // נניח ש־parts מגיע מה־response או מה־data, נשתמש ב־changePokemon אם יש צורך
          const moveType = data[`attack${i + 1}` as keyof typeof data];

          if (button) {
            if (move) {
              button.innerHTML = move;
              button.style.backgroundImage = `url(/images/attack/moves/${moveType}.png)`;
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
            zMoveBtn.style.backgroundImage = `url(/images/attack/moves/${tz}.png)`;
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
            img.src = `/images/effects/${changePokemon.effect}.png`;
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
            }
          }

          // Update HP display
          const hpDisplay = document.getElementById("hpPokemon");
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
          navigate("/attack/map");
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
      attacks.find((attack) => attack.naam === attackName)?.soort || "Normal"
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

  // Check if battle data is loaded
  if (!attackLog || !computerInfo || !pokemonInfo) {
    return (
      <BoxContent className="max-w-7xl mx-auto p-4 space-y-6">
        <div>Loading battle...</div>
      </BoxContent>
    );
  }

  return (
    <BoxContent className="max-w-7xl mx-auto p-4 space-y-6">
      <Title>קרב</Title>
      <GifAttack>
        <img
          src="/images/attacks/_blank.gif"
          alt="Trainer Attack"
          style={{
            width: 700,
            float: "left",
            height: 323,
          }}
        />
      </GifAttack>
      <Weather id="weather">
        <img id="zmove" />
        <BattleArea
          attackLog={attackLog}
          background={location?.state?.background}
        >
          <tbody>
            <tr>
              <td>
                <OpponentWrapper>
                  <OpponentBar>
                    <OpponentBarContainer>
                      <strong>
                        <LevelIconText>
                          <img
                            src={require(`../../assets/images/lvl.png`)}
                            alt="Lvl"
                            style={{
                              height: 14,
                            }}
                          />{" "}
                          ??{" "}
                        </LevelIconText>
                      </strong>
                    </OpponentBarContainer>
                    <HpWrapper>
                      <HpRed>
                        <Progress
                          id="computer_life"
                          style={{
                            width: `${calculatePercent(computerInfo!)}%`,
                          }}
                          data-original-title={`${computerInfo?.leven}/${computerInfo?.levenmax}`}
                        />
                      </HpRed>
                      <EffectWrapper
                        id="computer_effect"
                        style={{
                          display: computerInfo.effect ? "block" : "none",
                        }}
                      >
                        <img
                          src={require(`../../assets/images/effects/${
                            computerInfo.effect || "none"
                          }.png`)}
                          alt={computerInfo.effect}
                        />
                      </EffectWrapper>
                    </HpWrapper>
                    <OpponentNameWrapper>
                      <OpponentName>
                        <strong>
                          <span id="trainer_naam">
                            {computerInfo?.naam_goed}
                          </span>
                        </strong>
                        <ComputerStar style={{ display: computerInfo?.star }} />
                        {selectedCharacter?.items["Pokedex chip"] === 1 &&
                          selectedCharacter?.items["Pokedex"] === 1 && (
                            <img
                              src={require("../../assets/images/icons/th_pokedex.png")}
                              alt="pokedex"
                            />
                          )}
                      </OpponentName>
                    </OpponentNameWrapper>
                  </OpponentBar>
                </OpponentWrapper>
              </td>
              <td>
                <div id="dame" style={{ display: "none" }} />
                <div className="infront" id="hit" style={{ display: "none" }}>
                  <img src={require("../../assets/images/hit.png")} alt="Hit" />
                </div>
                <OpponentPokemonImage
                  id="img_trainer"
                  src={require(`../../assets/images/${computerInfo?.map}/${computerInfo?.wild_id}.gif`)}
                  alt={computerInfo?.naam_goed}
                />
              </td>
            </tr>
            <tr>
              <td>
                <div id="dame2" style={{ display: "none" }} />
                <div className="inback" id="hit2" style={{ display: "none" }}>
                  <img src={require("../../assets/images/hit.png")} alt="Hit" />
                </div>
                <PokemonImage
                  id="img_pokemon"
                  src={require(`../../assets/images/${pokemonInfo?.map}/back/${pokemonInfo?.wild_id}.gif`)}
                  alt={pokemonInfo?.naam_goed}
                />
              </td>
              <td>
                <MyPokemonHpWrapper>
                  <MyPokemonBar>
                    <MyPokemonNameWrapper>
                      <MyPokemonName>
                        <strong>
                          <span id="pokemon_naam">
                            {pokemonInfo?.naam_goed}
                          </span>
                        </strong>
                        <ComputerStar style={{ display: pokemonInfo?.star }} />
                      </MyPokemonName>
                    </MyPokemonNameWrapper>
                    <strong
                      style={{ position: "absolute", top: 17, right: 20 }}
                    >
                      <LevelIconText>
                        <img
                          src={require(`../../assets/images/lvl.png`)}
                          alt="Lvl"
                          style={{
                            height: 14,
                          }}
                        />
                        <span id="pokemon_level">{` ${pokemonInfo?.level} `}</span>
                        <div
                          id="hpPokemon"
                          style={{
                            position: "absolute",
                            left: -80,
                            top: 20,
                            fontSize: 10,
                          }}
                        >
                          {pokemonInfo?.leven}/{pokemonInfo?.levenmax}
                        </div>
                      </LevelIconText>
                    </strong>
                    <HpWrapper>
                      <HpRed>
                        <Progress
                          id="pokemon_life"
                          style={{ width: "100%" }}
                          data-original-title={`${pokemonInfo?.leven}/${pokemonInfo?.levenmax}`}
                        />
                      </HpRed>
                      <EffectWrapper
                        id="pokemon_effect"
                        style={{
                          display: pokemonInfo.effect ? "block" : "none",
                        }}
                      >
                        <img
                          src={require(`../../assets/images/effects/${
                            pokemonInfo.effect || "none"
                          }.png`)}
                          alt={pokemonInfo.effect}
                        />
                      </EffectWrapper>
                    </HpWrapper>
                    <ExpWrapper>
                      <HpRed>
                        <ExpProgress
                          id="pokemon_exp"
                          style={{
                            width: `${Math.round(
                              (pokemonInfo.exp! / pokemonInfo.expnodig!) * 100
                            )}%`,
                          }}
                        />
                      </HpRed>
                    </ExpWrapper>
                  </MyPokemonBar>
                </MyPokemonHpWrapper>
              </td>
            </tr>
            <tr>
              <AttackWrapper colSpan={2}>
                <center>
                  <div
                    id="atacar"
                    style={{ display: showAttacks ? "block" : "none" }}
                  >
                    {pokemonAttacks.map((attack: string | undefined, index) => (
                      <button
                        key={index}
                        id={`aanval-${index}`}
                        onClick={() => handleAttackClick(attack!)}
                        disabled={!battleState.spelerAttack}
                        style={{
                          background: `url(/images/attack/moves/${getTypeOfAttack(
                            attack!
                          )}.png) no-repeat`,
                          float: index % 2 === 0 ? "left" : "right",
                          opacity: battleState.spelerAttack ? 1 : 0.5,
                          cursor: battleState.spelerAttack
                            ? "pointer"
                            : "not-allowed",
                        }}
                        className="btn-type"
                      >
                        {attack}
                      </button>
                    ))}
                    <br />
                    <button
                      id="use-zmove"
                      onClick={() =>
                        handleAttackClick(pokemonAttacks[0]!, true)
                      }
                      disabled={
                        !battleState.spelerAttack || battleState.trainerZmove
                      }
                      className="zmove btn-type"
                      style={{
                        display: !battleState.trainerZmove ? "none" : "block",
                        opacity: battleState.spelerAttack ? 1 : 0.5,
                      }}
                    ></button>{" "}
                  </div>
                  <div
                    id="pokemon"
                    style={{
                      marginBottom: -27,
                      display: showPokemons ? "block" : "none",
                    }}
                  >
                    {myPokemons.map((pokemon, index) => {
                      return (
                        <BattlePokemon
                          key={pokemon.id}
                          id="change_pokemon"
                          onClick={() => handlePokemonChange(index + 1)}
                          style={{
                            backgroundImage: `url(/images/${
                              pokemon.shiny === 1 ? "shiny" : "pokemon"
                            }/icon/${pokemon.wild_id}.gif)`,
                            opacity:
                              battleState.spelerWissel && pokemon.leven > 0
                                ? 1
                                : 0.5,
                            cursor:
                              battleState.spelerWissel && pokemon.leven > 0
                                ? "pointer"
                                : "not-allowed",
                          }}
                          data-original-title={`${pokemon.naam} HP: ${pokemon.leven}/${pokemon.levenmax}`}
                        >
                          {pokemon.naam}
                          <HpRed style={{ height: 3, width: `86%` }}>
                            <Progress
                              style={{ width: `${calculatePercent(pokemon)}%` }}
                            ></Progress>
                          </HpRed>
                        </BattlePokemon>
                      );
                    })}
                  </div>
                  <div
                    id="mochila"
                    style={{ display: showBag ? "block" : "none" }}
                  >
                    <div
                      className="items-carousel"
                      style={{
                        width: "100%",
                        marginBottom: -21,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {itemsToUse.map((item) => {
                        const name = item.naam as keyof ItemData;
                        const quantity = selectedCharacter?.items[name];
                        if (Number(quantity) > 0) {
                          return (
                            <div key={item.naam} className="carousel-cell">
                              <div
                                data-item-name={item.naam}
                                data-item-type={item.soort}
                                onClick={() => {
                                  handleUseItem(item, name);
                                }}
                                style={{
                                  opacity: battleState.spelerAttack ? 1 : 0.5,
                                  cursor: battleState.spelerAttack
                                    ? "pointer"
                                    : "not-allowed",
                                }}
                              >
                                <img
                                  src={`/images/items/${item.naam}.png`}
                                  className="image"
                                  alt={item.naam}
                                />
                                <span
                                  className="badges qtd"
                                  style={{
                                    position: "absolute",
                                    cursor: "pointer",
                                    bottom: 5,
                                    marginLeft: 10,
                                  }}
                                >
                                  {quantity}
                                </span>
                              </div>
                            </div>
                          );
                        } else {
                          return null;
                        }
                      })}
                    </div>
                  </div>
                </center>
              </AttackWrapper>
            </tr>
          </tbody>
        </BattleArea>
      </Weather>
      <div
        className="potion_screen"
        style={{ display: showPotionsScreen ? "" : "none" }}
      >
        <Title>
          בחרו את הפוקימון שתרצו להשתמש ב{" "}
          <span id="item_name">{selectedPotion}</span>:
        </Title>
        {myPokemons.map((pokemon) => {
          return (
            <BattlePokemon
              id="use_potion"
              key={pokemon.id}
              onClick={() => handleItemUse(selectedPotion, pokemon.id)}
              style={{
                backgroundImage: `url(/images/${
                  pokemon.shiny === 1 ? "shiny" : "pokemon"
                }/icon/${pokemon.wild_id}.gif)`,
                cursor: "pointer",
              }}
              data-original-title={`${pokemon.naam} HP: ${pokemon.leven}/${pokemon.levenmax}`}
            >
              {pokemon.naam}
              <HpRed style={{ height: 3, width: `86%` }}>
                <Progress
                  style={{ width: `${calculatePercent(pokemon)}%` }}
                ></Progress>
              </HpRed>
            </BattlePokemon>
          );
        })}
      </div>
      <TextBox>
        <table style={{ width: "100%" }}>
          <tbody>
            <tr style={{ height: 150 }}>
              <td style={{ width: "41%" }}>
                <div style={{ textAlign: "center" }}>
                  <div
                    onClick={handleSelectAttack}
                    className="selector attack"
                  ></div>
                  <div onClick={handleSelectBag} className="selector bag"></div>
                  <div
                    onClick={handleSelectPokemon}
                    className="selector pokemon"
                  ></div>
                  <div
                    onClick={handleSelectRun}
                    id="run"
                    className="selector run"
                  ></div>
                </div>
              </td>
              <td
                style={{
                  width: "53%",
                  background:
                    "url(/images/layout/battle/text-content.png) no-repeat",
                  backgroundSize: "100% 100%",
                  padding: 12,
                }}
              >
                <div
                  style={{ width: "99%" }}
                  id="message"
                  dangerouslySetInnerHTML={{ __html: battleMessage }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </TextBox>
    </BoxContent>
  );
};

export default WildAttack;
