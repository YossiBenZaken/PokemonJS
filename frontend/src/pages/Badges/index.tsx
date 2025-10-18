import React, { useEffect, useState } from "react";

import { getBadges } from "../../api/character.api";
import styled from "styled-components";
import { useGame } from "../../contexts/GameContext";

type BadgeGroups = {
  region: string;
  names: string[];
};

const badgeGroups: BadgeGroups[] = [
  {
    region: "Kanto",
    names: [
      "Boulder",
      "Cascade",
      "Thunder",
      "Rainbow",
      "Marsh",
      "Soul",
      "Volcano",
      "Earth",
    ],
  },
  {
    region: "Johto",
    names: [
      "Zephyr",
      "Hive",
      "Plain",
      "Fog",
      "Storm",
      "Mineral",
      "Glacier",
      "Rising",
    ],
  },
  {
    region: "Hoenn",
    names: [
      "Stone",
      "Knuckle",
      "Dynamo",
      "Heat",
      "Balance",
      "Feather",
      "Mind",
      "Rain",
    ],
  },
  {
    region: "Sinnoh",
    names: [
      "Coal",
      "Forest",
      "Cobble",
      "Fen",
      "Relic",
      "Mine",
      "Icicle",
      "Beacon",
    ],
  },
  {
    region: "Unova",
    names: [
      "Trio",
      "Basic",
      "Insect",
      "Bolt",
      "Quake",
      "Jet",
      "Freeze",
      "Legend",
    ],
  },
  {
    region: "Kalos",
    names: [
      "Bug",
      "Cliff",
      "Rumble",
      "Plant",
      "Voltage",
      "Fairy",
      "Psychic",
      "Iceberg",
    ],
  },
  {
    region: "Alola",
    names: [
      "Melemele Normal",
      "Akala Water",
      "Akala Fire",
      "Akala Grass",
      "Ulaula Electric",
      "Ulaula Ghost",
      "Poni Fairy",
      "Poni Ground",
    ],
  },
];

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100%;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
  color: white;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const BoardsGrid = styled.div`
  flex: auto;
  width: 30%;
`;

const Board = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid #577599;
  border-radius: 10px;
  padding: 12px;
  color: #eaeaea;
`;

const BoardTitle = styled.h3`
  margin: 0 0 8px 0;
  text-align: center;
`;

export const BadgeCase: React.FC = () => {
  const [badges, setBadges] = useState<Record<string, number>>({});
  const { selectedCharacter } = useGame();

  useEffect(() => {
    if (selectedCharacter?.user_id) {
      getBadges(selectedCharacter.user_id).then((res) => {
        setBadges(res);
      });
    }
  }, [selectedCharacter?.user_id]);

  return (
    <Container>
      <Header>
        <Title>תגים</Title>
      </Header>
      <div style={{ display: "flex", width: '100%', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {badgeGroups.map(({ region, names }) => (
          <BoardsGrid key={region} className="badge-group">
            <Board>
              <BoardTitle>{region}</BoardTitle>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {names.map((name) => (
                  <img
                    key={name}
                    src={require(`../../assets/images/badges/pixel/${name}.png`)}
                    alt={`${name} Badge`}
                    title={
                      badges[name] === 1
                        ? `${name} התג נרכש!`
                        : `${name} התג לא נרכש!`
                    }
                    style={{
                      filter: badges[name] === 1 ? "none" : "grayscale(100%)",
                      margin: "4px",
                    }}
                  />
                ))}
              </div>
            </Board>
          </BoardsGrid>
        ))}
      </div>
    </Container>
  );
};
