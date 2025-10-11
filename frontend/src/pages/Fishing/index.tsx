import React, { useEffect, useState } from "react";
import { fish, getFishingLeaders } from "../../api/character.api";

import Loader from "../../components/Loader";
import styled from "styled-components";
import { useGame } from "../../contexts/GameContext";

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%);
  min-height: 500px;
  color: white;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
`;

const FishButton = styled.button`
  background: linear-gradient(45deg, #4caf50, #45a049);
  border: none;
  color: white;
  font-size: 1.2rem;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  margin: 20px auto;
  display: block;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    background: #aaa;
    cursor: not-allowed;
  }
`;

const PokemonCard = styled.div`
  background: white;
  color: #333;
  border-radius: 12px;
  padding: 15px;
  margin: 15px 0;
  text-align: center;
`;

const LeadersTable = styled.table`
  width: 100%;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  margin: 10px 0;
  td,
  th {
    padding: 8px;
    text-align: center;
  }
`;

const FishingPage: React.FC = () => {
  const { selectedCharacter } = useGame();
  const [pokemon, setPokemon] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [leaders, setLeaders] = useState<{ today: any[]; yesterday: any[] }>({ today: [], yesterday: [] });
  const [loading, setLoading] = useState(false);

  const handleFish = async () => {
    if(selectedCharacter?.user_id) {
        try {
          setLoading(true);
          setMessage(null);
          const res = await fish(selectedCharacter.user_id);

          if (res.success) {
            setPokemon(res.data.pokemon);
            setMessage(`השגת ${res.data.points} נקודות!`);
          } else {
            setMessage(res.message);
          }
        } finally {
          setLoading(false);
        }
    }
  };

  const loadLeaders = async () => {
    const res = await getFishingLeaders();
    console.log(res.success);
    if (res.success) setLeaders(res.data);
  };

  useEffect(() => {
    loadLeaders();
  }, []);

  return (
    <Container>
      <Header>
        <Title>תחרות הדיג</Title>
        <Subtitle>צבור כמה שיותר נקודות עד סוף היום ותזכה בפרסים!</Subtitle>
      </Header>

      <FishButton onClick={handleFish} disabled={loading}>
        לדוג 🎣
      </FishButton>

      {loading && <Loader />}
      {message && <div style={{ textAlign: "center", marginTop: 10 }}>{message}</div>}

      {pokemon && (
        <PokemonCard>
          <h3>תפסת {pokemon.name}!</h3>
          <img
            src={require(`../../assets/images/pokemon/${pokemon.id}.gif`)}
            alt={pokemon.name}
            style={{ width: 80 }}
          />
        </PokemonCard>
      )}

      <h2>הטובים של היום</h2>
      <LeadersTable>
        <tbody>
          {leaders.today.map((u, i) => (
            <tr key={u.user_id}>
              <td>{i + 1}.</td>
              <td>{u.username}</td>
              <td>{u.fishing} נק'</td>
            </tr>
          ))}
        </tbody>
      </LeadersTable>

      <h2>מנצחי אתמול</h2>
      <LeadersTable>
        <tbody>
          {leaders.yesterday.filter(v => v).map((u, i) => (
            <tr key={u.user_id}>
              <td>{i + 1}.</td>
              <td>{u.username}</td>
            </tr>
          ))}
        </tbody>
      </LeadersTable>
    </Container>
  );
};

export default FishingPage;
