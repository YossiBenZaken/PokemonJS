import {
  AlolaMap,
  HoennMap,
  JohtoMap,
  KalosMap,
  KantoMap,
  SinnohMap,
  UnovaMap,
} from "./AttackMapWorlds";
import React, { useEffect, useState } from "react";
import { initBattle, startWildBattleApi } from "../../api/battle.api";

import styled from "styled-components";
import { useBattle } from "../../contexts/BattleContext";
import { useGame } from "../../contexts/GameContext";
import { useNavigate } from "react-router-dom";

export type TerrainType = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface TerrainConfig {
  id: TerrainType;
  name: string;
  hebrewName: string;
  requiresItem?: string;
}

const Container = styled.div`
  background: rgba(0, 0, 0, 0.65);
  padding: 20px;
  border-radius: 12px;
  color: #eee;
  font-family: "Arial", sans-serif;
  max-width: 700px;
  margin: 0 auto;
`;

const Title = styled.h2`
  margin-top: 0;
  text-align: center;
  color: #ffd700;
  text-shadow: 1px 1px 3px #000;
`;

const TERRAINS: Record<TerrainType, TerrainConfig> = {
  1: { id: 1, name: "Lavagrot", hebrewName: "מערת לבה" },
  2: { id: 2, name: "Vechtschool", hebrewName: "דוג'ו לחימה" },
  3: { id: 3, name: "Gras", hebrewName: "שדה עשב" },
  4: { id: 4, name: "Spookhuis", hebrewName: "בית רוחות" },
  5: { id: 5, name: "Grot", hebrewName: "מערה", requiresItem: "Cave suit" },
  6: { id: 6, name: "Water", hebrewName: "מים", requiresItem: "Fishing rod" },
  7: { id: 7, name: "Strand", hebrewName: "חוף" },
};

const AttackMap: React.FC = () => {
  const navigate = useNavigate();
  const { setAttackLog, setComputerInfo, setPokemonInfo } = useBattle();
  const { selectedCharacter, myPokemons } = useGame();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Check if user has Pokemon in hand
    if (!myPokemons || myPokemons.length === 0) {
      setError("אין לך פוקימונים בצוות!");
      return;
    }

    const alivePokemon = myPokemons.filter((p) => p.leven > 0 && p.ei === 0);
    if (alivePokemon.length === 0) {
      setError("אין לך פוקימונים בריאים!");
    }
  }, [myPokemons]);

  const handleTerrainClick = async (terrainId: TerrainType) => {
    if (loading) return;

    const terrain = TERRAINS[terrainId];

    // Validation checks
    if (!selectedCharacter) {
      setError("משתמש לא מחובר");
      return;
    }

    if (!myPokemons || myPokemons.length === 0) {
      setError("אין לך פוקימונים בצוות!");
      return;
    }

    const alivePokemon = myPokemons.filter((p) => p.leven > 0 && p.ei === 0);
    if (alivePokemon.length === 0) {
      setError("אין לך פוקימונים בריאים!");
      return;
    }

    // Check required items
    if (terrain.requiresItem) {
      const itemKey =
        terrain.requiresItem as keyof typeof selectedCharacter.items;
      if (
        !selectedCharacter.items[itemKey] ||
        selectedCharacter.items[itemKey] === 0
      ) {
        setError(
          `אתה צריך ${terrain.requiresItem} כדי להיכנס ל${terrain.hebrewName}!`
        );
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      // Calculate rarity
      const rand = Math.floor(Math.random() * 3050) + 1;
      let isTrainer = false;
      let rarity = 1;

      if (rand <= 50) {
        isTrainer = true;
      } else if (rand <= 1950) {
        rarity = 1;
      } else if (rand <= 3000) {
        rarity = 2;
      } else if (rand <= 3020) {
        rarity = 3;
      } else if (rand <= 3040) {
        rarity = 4;
      } else if (rand <= 3045) {
        rarity = 5;
      } else if (rand <= 3050) {
        rarity = 8;
      }

      // Adjust high rarity
      if (rarity > 3 && rarity !== 8) {
        const randAdjust = Math.floor(Math.random() * 200) + 1;
        if (randAdjust <= 30) {
          const rarities = [4, 5, 8];
          rarity = rarities[Math.floor(Math.random() * rarities.length)];
        } else {
          rarity = Math.floor(Math.random() * 2) + 1;
        }
      }

      if (isTrainer) {
        // Start trainer battle
        // const trainerAveLevel = myPokemons.reduce((sum, p) => sum + p.level, 0) / myPokemons.length;
        // const response = await startTrainerBattle({
        //   userId: selectedCharacter.user_id,
        //   gebied: terrain.name,
        //   trainerAveLevel,
        // });
        // if (response.trainer) {
        //   navigate("/trainer-attack");
        // } else {
        //   setError(response.bericht || "שגיאה ביצירת קרב מאמן");
        // }
      } else {
        // Start wild battle
        const response = await startWildBattleApi(
          undefined,
          undefined,
          terrain.name,
          rarity
        );

        if (response.aanvalLogId) {
          const { aanval_log, computer_info, pokemon_info } = await initBattle(
            response.aanvalLogId
          );
          setAttackLog(aanval_log);
          setComputerInfo(computer_info);
          setPokemonInfo(pokemon_info);
          // Set background based on terrain
          let background = "";
          if (terrainId === 3) {
            const chance = Math.floor(Math.random() * 3) + 1;
            background = `gras-${chance}`;
          } else if (terrainId === 6) {
            const chance = Math.floor(Math.random() * 2) + 1;
            background = `water-${chance}`;
          }

          navigate("/attack/wild", { state: { background } });
        } else {
          setError("שגיאה ביצירת קרב");
        }
      }
    } catch (err: any) {
      console.error("Battle start error:", err);
      setError(err.message || "שגיאה ביצירת קרב");
    } finally {
      setLoading(false);
    }
  };

  const renderMap = () => {
    const world = selectedCharacter?.world || "Kanto";

    const mapProps = {
      onTerrainClick: handleTerrainClick,
    };

    switch (world) {
      case "Kanto":
        return <KantoMap {...mapProps} />;
      case "Johto":
        return <JohtoMap {...mapProps} />;
      case "Hoenn":
        return <HoennMap {...mapProps} />;
      case "Sinnoh":
        return <SinnohMap {...mapProps} />;
      case "Unova":
        return <UnovaMap {...mapProps} />;
      case "Kalos":
        return <KalosMap {...mapProps} />;

      case "Alola":
        return <AlolaMap {...mapProps}/>
      default:
        return <div className="blue">מפה עבור {world} בבנייה</div>;
    }
  };

  return (
    <Container className="max-w-7xl mx-auto p-4 space-y-6">
      <Title>מפת {selectedCharacter?.world}</Title>

      <div className="blue" style={{ marginBottom: 10 }}>
        שלום, מאמן! ברוך הבא למפה של אזור {selectedCharacter?.world}.
        <br />
        התקדם במשחק על ידי הביס ולכידת פוקימונים רבים. זכור תמיד ללכת עם Poke
        balls!
      </div>

      {error && (
        <div className="red" style={{ marginBottom: 10 }}>
          {error}
        </div>
      )}

      <div className="blue" style={{ marginBottom: 10 }}>
        כדי לגשת למים/אגם קנה <strong>FISHING ROD</strong> וכדי לגשת למערה רכוש{" "}
        <strong>CAVE SUIT</strong> בחנות!
      </div>

      {loading && (
        <div className="blue" style={{ marginBottom: 10 }}>
          מחפש פוקימון...
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center" }}>
        {renderMap()}
      </div>
    </Container>
  );
};

export default AttackMap;
