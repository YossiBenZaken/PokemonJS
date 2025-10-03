import { MapUser, getMap, getUserOnMap, moveOnMap } from "../../api/safari.api";
import React, { useCallback, useEffect, useRef, useState } from "react";

import styled from "styled-components";
import { useGame } from "../../contexts/GameContext";

// Types
interface Position {
  x: number;
  y: number;
}

interface WildEncounter {
  id: number;
  name: string;
  level: number;
}

// Styled Components
const SafariContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const MapContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  background: #1d2b3e;
  border-radius: 8px;
  padding: 20px;
`;

const MapCanvas = styled.div<{ mapId: number }>`
  width: 400px;
  height: 560px;
  position: relative;
  border: 2px solid #577599;
  border-radius: 5px;
  background-image: url("/images/maps/kanto/map${(props) => props.mapId}.png");
  background-size: cover;
  overflow: hidden;
`;

const Sprite = styled.img<{ x: number; y: number; isPlayer?: boolean }>`
  position: absolute;
  left: ${(props) => props.x * 16}px;
  top: ${(props) => props.y * 16 - 4}px;
  z-index: ${(props) => (props.isPlayer ? 10 : 5)};
  image-rendering: pixelated;
  pointer-events: none;
  width: 16px;
  height: 20px;
`;

const NavigationPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  user-select: none;
`;

const NavigationButtons = styled.div`
  position: relative;
  width: 90px;
  height: 90px;
`;

const NavButton = styled.button<{
  direction: "up" | "down" | "left" | "right";
}>`
  position: absolute;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;

  ${(props) => {
    switch (props.direction) {
      case "up":
        return "top: 0; left: 50%; transform: translateX(-50%);";
      case "down":
        return "bottom: 0; left: 50%; transform: translateX(-50%);";
      case "left":
        return "left: 0; top: 50%; transform: translateY(-50%);";
      case "right":
        return "right: 0; top: 50%; transform: translateY(-50%);";
    }
  }}

  &:hover {
    opacity: 0.8;
  }
`;

const MapSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;
`;

const MapButton = styled.button<{ active: boolean; index: number }>`
  width: 70px;
  height: 70px;
  border: 2px solid ${(props) => (props.active ? "#4CAF50" : "#577599")};
  border-radius: 8px;
  background: ${(props) =>
    props.active ? "rgba(76, 175, 80, 0.2)" : "rgba(0,0,0,0.3)"};
  cursor: pointer;
  transition: all 0.3s;
  opacity: ${(props) => (props.active ? 1 : 0.5)};
  background: ${(props) =>
    `url(${require("../../assets/images/maps/kanto/map" +
      (props.index === 8 ? 7 : props.index === 9 ? 1 : props.index) +
      ".png")}) ${
      props.index === 5
        ? "0"
        : props.index === 8
        ? "-216px -60px"
        : props.index === 9
        ? "-96px -232px"
        : ""
    };`}
  background-repeat: no-repeat;
    padding:0;

  &:hover {
    opacity: 1;
    transform: scale(1.05);
  }

  img {
    margin: 0 auto;
  }
`;

const ResultPanel = styled.div`
  min-height: 200px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  color: white;
  text-align: center;
  text-shadow: 0 0 0.4em #000;
`;

const EncounterCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin: 10px 0;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin: 10px 5px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PlayerCount = styled.div`
  background: #577599;
  padding: 10px;
  text-align: center;
  color: white;
  font-weight: bold;
  border-radius: 4px;
  margin-bottom: 10px;
`;

// Main Component
const Safari: React.FC = () => {
  const [currentMap, setCurrentMap] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 5, y: 5 });
  const [users, setUsers] = useState<MapUser[]>([]);
  const [encounter, setEncounter] = useState<WildEncounter | null>(null);
  const [trainerEncounter, setTrainerEncounter] = useState(false);
  const [message, setMessage] = useState("Use the arrows or buttons to move!");
  const [mapData, setMapData] = useState<number[][]>([]);
  const { selectedCharacter } = useGame();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Map names
  const mapNames: Record<number, string> = {
    1: "Grass Area",
    2: "Water Area",
    3: "Cave",
    4: "Ghost Tower",
    5: "Lava Cave",
    6: "Beach",
    7: "Fighting Dojo",
  };

  // Load map data
  useEffect(() => {
    loadMapData(currentMap);
  }, [currentMap]);

  const loadMapData = async (mapId: number) => {
    try {
      const response = await getMap(mapId);

      if (response.success) {
        setMapData(response.tileArray);
        setPosition({ x: response.start_x, y: response.start_y });
      }
    } catch (error) {
      console.error("Failed to load map:", error);
    }
  };

  // Load nearby users
  const loadUsers = useCallback(async () => {
    try {
      const data = await getUserOnMap(currentMap);

      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  }, [currentMap]);

  useEffect(() => {
    loadUsers();
    const interval = setInterval(loadUsers, 3000);
    return () => clearInterval(interval);
  }, [loadUsers]);

  // Movement handler
  const moveSprite = useCallback(
    async (direction: "up" | "down" | "left" | "right") => {
      const movements = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
      };

      const move = movements[direction];
      const newX = position.x + move.x;
      const newY = position.y + move.y;

      // Check if move is valid
      if (
        !mapData[newY] ||
        mapData[newY][newX] === undefined ||
        mapData[newY][newX] < 1
      ) {
        return;
      }

      // Update position
      setPosition({ x: newX, y: newY });

      // Check for map transition (tiles >= 10000)
      if (mapData[newY][newX] >= 10000) {
        const targetMap = Math.floor(mapData[newY][newX] / 10000);
        const targetX = Math.floor((mapData[newY][newX] % 10000) / 100);
        const targetY = Math.floor(mapData[newY][newX] % 100);

        setCurrentMap(targetMap);
        setPosition({ x: targetX, y: targetY });
        return;
      }

      // Send position to server and check for encounters
      try {
        setMessage("Searching...");

        const data = await moveOnMap(currentMap, newX, newY);

        if (data.wildEncounter) {
          setEncounter(data.wildEncounter);
          setMessage(`You encountered a ${data.wildEncounter.name}!`);
        } else if (data.trainerEncounter) {
          setTrainerEncounter(true);
          setMessage("A trainer wants to battle!");
        } else {
          setEncounter(null);
          setTrainerEncounter(false);
          setMessage(data.message || "Keep exploring...");
        }
      } catch (error) {
        console.error("Move failed:", error);
        setMessage("Movement failed!");
      }
    },
    [position, mapData, currentMap]
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (encounter || trainerEncounter) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          moveSprite("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          moveSprite("down");
          break;
        case "ArrowLeft":
          e.preventDefault();
          moveSprite("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          moveSprite("right");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [moveSprite, encounter, trainerEncounter]);

  // Start battle with wild Pokemon
  const startWildBattle = async () => {
    if (!encounter) return;

    try {
      const response = await fetch("/api/safari/start-battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pokemonId: encounter.id,
          level: encounter.level,
          area: mapNames[currentMap],
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to battle
        window.location.href = "/battle/wild";
      } else {
        setMessage(data.message || "Failed to start battle");
      }
    } catch (error) {
      console.error("Failed to start battle:", error);
      setMessage("Failed to start battle!");
    }
  };

  // Start battle with trainer
  const startTrainerBattle = async () => {
    try {
      const response = await fetch("/api/safari/start-trainer-battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area: mapNames[currentMap],
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to trainer battle
        window.location.href = "/battle/trainer";
      } else {
        setMessage(data.message || "Failed to start battle");
      }
    } catch (error) {
      console.error("Failed to start trainer battle:", error);
      setMessage("Failed to start battle!");
    }
  };

  return (
    <SafariContainer>
      <h2 style={{ textAlign: "center", color: "white" }}>
        Safari Zone - {mapNames[currentMap]}
      </h2>

      <PlayerCount>Trainers in area: {users.length + 1}</PlayerCount>

      <MapContainer>
        {/* Map Canvas */}
        <div>
          <MapCanvas ref={canvasRef} mapId={currentMap}>
            {/* Player sprite */}
            <Sprite
              src={`/images/sprites/${currentMap === 2 ? "water/" : ""}${
                selectedCharacter?.map_sprite
              }.png`}
              x={position.x}
              y={position.y}
              isPlayer
              alt="You"
            />

            {/* Other users */}
            {users.slice(0, 10).map((user) => (
              <React.Fragment key={user.id}>
                <Sprite
                  src={`/images/sprites/${currentMap === 2 ? "water/" : ""}${
                    user.sprite
                  }.png`}
                  x={user.x}
                  y={user.y}
                  alt={user.username}
                  title={user.username}
                />
                {user.map_wild && (
                  <Sprite
                    src={`/images/pokemon/icon/${user.map_wild}.gif`}
                    x={user.x }
                    y={user.y }
                    alt={`${user.username}'s Pokemon`}
                    title={user.username}
                    style={{
                        zIndex: 6,
                        width: 32,
                        height: 32
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </MapCanvas>
        </div>

        {/* Navigation Controls */}
        <NavigationPanel>
          <NavigationButtons>
            <img
              src="/images/maps/nav.png"
              alt="Navigation"
              useMap="#navMap"
              style={{ width: "90px", height: "90px" }}
            />
            <map name="navMap">
              <area
                shape="poly"
                coords="43,43,88,3,-2,2"
                onClick={() => moveSprite("up")}
                alt="Up"
              />
              <area
                shape="poly"
                coords="42,44,45,42,89,-1,87,90"
                onClick={() => moveSprite("right")}
                alt="Right"
              />
              <area
                shape="poly"
                coords="1,89,43,45,88,89"
                onClick={() => moveSprite("down")}
                alt="Down"
              />
              <area
                shape="poly"
                coords="0,3,43,44,1,87"
                onClick={() => moveSprite("left")}
                alt="Left"
              />
            </map>
          </NavigationButtons>

          {/* Map Selector */}
          <MapSelector>
            {[1, 2, 3, 4, 5, 6, 7].map((mapId) => (
              <MapButton
                key={mapId}
                index={mapId}
                active={currentMap === mapId}
                onClick={() => setCurrentMap(mapId)}
                title={mapNames[mapId]}
              >
                <img src="/images/animation.gif" alt={mapNames[mapId]} />
              </MapButton>
            ))}
            <MapButton
              index={8}
              active={false}
              onClick={() => (window.location.href = "/pokemoncenter")}
            >
              <img src="/images/animation.gif" alt="Pokemon Center" />
            </MapButton>
            <MapButton
              index={9}
              active={false}
              onClick={() => (window.location.href = "/market")}
            >
              <img src="/images/animation.gif" alt="Market" />
            </MapButton>
          </MapSelector>
        </NavigationPanel>

        {/* Result Panel */}
        <div>
          <ResultPanel>
            {encounter ? (
              <EncounterCard>
                <div
                  style={{
                    backgroundImage: `url('/images/maps/${mapNames[
                      currentMap
                    ].toLowerCase()}.png')`,
                    backgroundPosition: "center bottom",
                    backgroundRepeat: "no-repeat",
                    padding: "20px",
                  }}
                >
                  <img
                    src={`/images/pokemon/${encounter.id}.gif`}
                    alt={encounter.name}
                    style={{ maxWidth: "150px" }}
                  />
                  <h3>You found a {encounter.name}!</h3>
                  <p>Level: {encounter.level}</p>
                </div>
                <ActionButton onClick={startWildBattle}>Battle!</ActionButton>
                <ActionButton onClick={() => setEncounter(null)}>
                  Run Away
                </ActionButton>
              </EncounterCard>
            ) : trainerEncounter ? (
              <EncounterCard>
                <div
                  style={{
                    backgroundImage: `url('/images/maps/${mapNames[
                      currentMap
                    ].toLowerCase()}.png')`,
                    backgroundPosition: "center bottom",
                    backgroundRepeat: "no-repeat",
                    padding: "20px",
                  }}
                >
                  <img
                    src="/images/maps/pokemon_trainer.png"
                    alt="Trainer"
                    style={{ maxWidth: "150px" }}
                  />
                  <h3>A trainer wants to battle!</h3>
                  <p>Will you accept?</p>
                </div>
                <ActionButton onClick={startTrainerBattle}>
                  Battle!
                </ActionButton>
                <ActionButton onClick={() => setTrainerEncounter(false)}>
                  Decline
                </ActionButton>
              </EncounterCard>
            ) : (
              <div>
                <p style={{ fontSize: "16px", lineHeight: "1.6" }}>{message}</p>
                <p
                  style={{ fontSize: "14px", marginTop: "20px", opacity: 0.8 }}
                >
                  Use the arrow keys or navigation buttons to explore the Safari
                  Zone!
                </p>
              </div>
            )}
          </ResultPanel>
        </div>
      </MapContainer>
    </SafariContainer>
  );
};

export default Safari;
