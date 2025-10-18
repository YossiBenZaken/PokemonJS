import { JudgeResult, judgePokemon } from "../../api/character.api";
import React, { useState } from "react";

import styled from "styled-components";
import { useGame } from "../../contexts/GameContext";

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

const PokemonList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
`;

const PokemonCard = styled.div<{ selected: boolean }>`
  border: ${(p) => (p.selected ? "2px solid #ffd700" : "1px solid #444")};
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  background: ${(p) => (p.selected ? "rgba(255, 215, 0, 0.15)" : "#111")};
  transition: 0.2s;

  &:hover {
    transform: scale(1.05);
    border-color: #ffd700;
  }

  img {
    width: 72px;
    height: 72px;
  }
`;

const Button = styled.button`
  margin-top: 16px;
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(45deg, #2196f3, #0d47a1);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;

  &:disabled {
    background: #555;
    cursor: not-allowed;
  }

  &:hover:enabled {
    transform: scale(1.05);
  }
`;

const ResultBox = styled.div`
  margin-top: 20px;
  background: #222;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #444;
`;
export const Judge: React.FC = () => {
  const { myPokemons, selectedCharacter } = useGame();
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [loading, setLoading] = useState(false);

  // שליחת פוקימון לשיפוט
  const handleJudge = async () => {
    if (!selected || !selectedCharacter?.user_id) return;
    setLoading(true);
    try {
      const res = await judgePokemon(selectedCharacter?.user_id, selected);
      setResult(res);
    } catch (err) {
      console.error("❌ שגיאה בשיפוט:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>⚖️ שופט פוקימונים</Title>
      <p style={{ textAlign: "center" }}>
        בחר פוקימון מהרשימה כדי לראות את ה־IVs והפוטנציאל שלו.
      </p>

      {/* רשימת הפוקימונים */}
      <PokemonList>
        {myPokemons.map((p) => (
          <PokemonCard
            selected={selected === p.id}
            key={p.id}
            onClick={() => setSelected(p.id)}
          >
            <img
              src={require(`../../assets/images/${p.shiny === 1 ? "shiny" : "pokemon"}/${
                p.wild_id
              }.gif`)}
              alt={p.naam}
              style={{ width: 64, height: 64 }}
            />
            <div>{p.naam}</div>
          </PokemonCard>
        ))}
      </PokemonList>

      {/* כפתור */}
      <Button
        onClick={handleJudge}
        disabled={!selected || loading}
      >
        {loading ? "בודק..." : "שפוט"}
      </Button>

      {/* תוצאות */}
      {result && (
        <ResultBox        >
          <h3>תוצאה</h3>
          <p>
            <b>{result.pokemon.name}</b> — {result.potential}
          </p>
          <p>
            הסטאט החזק ביותר: <b>{result.bestStat.stat}</b> (
            {result.bestStat.value})
          </p>

          <ul>
            {Object.entries(result.stats).map(([k, v]) => (
              <li key={k}>
                {k}: {v}
              </li>
            ))}
          </ul>
        </ResultBox>
      )}
    </Container>
  );
};
