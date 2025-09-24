import { AvailableMove, LearnMoveResponse, MoveMethod, learnMove, listAvailableMoves } from "../../../api/moves.api";
import React, { useEffect, useMemo, useState } from "react";

import styled from "styled-components";
import { useGame } from "../../../contexts/GameContext";

type TeamPokemon = {
  id: number;
  naam: string;
  wild_id: number;
  level: number;
  aanval_1?: string | null;
  aanval_2?: string | null;
  aanval_3?: string | null;
  aanval_4?: string | null;
};

const MovesPage: React.FC = () => {
  const { selectedCharacter } = useGame();
  const [team, setTeam] = useState<TeamPokemon[]>([]);
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
  const [method, setMethod] = useState<MoveMethod>('tutor');
  const [moves, setMoves] = useState<AvailableMove[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const GOLD_ICON = require("../../../assets/images/icons/gold.png");
  const SILVER_ICON = require("../../../assets/images/icons/silver.png");

  // Load simple team list from Specialists API (already exists in app)
  const { api } = useMemo(() => ({ api: require("../../../api/specialists.api") }), []);

  useEffect(() => {
    const loadTeam = async () => {
      if (!selectedCharacter) return;
      setLoading(true);
      try {
        const res = await api.getSpecialistInfo(selectedCharacter.user_id);
        if (res.success && res.data) {
          setTeam(res.data.teamPokemons);
          if (res.data.teamPokemons.length > 0) {
            setSelectedPokemonId(res.data.teamPokemons[0].id);
          }
        }
      } catch (e) {
        setMessage({ type: 'error', text: 'שגיאה בטעינת הצוות' });
      } finally {
        setLoading(false);
      }
    };
    loadTeam();
  }, [selectedCharacter, api]);

  useEffect(() => {
    const loadMoves = async () => {
      if (!selectedPokemonId) return;
      setLoading(true);
      try {
        const res = await listAvailableMoves(selectedPokemonId, method);
        if (res.success && res.data) setMoves(res.data.moves);
        else setMoves([]);
      } catch (e) {
        setMoves([]);
      } finally {
        setLoading(false);
      }
    };
    loadMoves();
  }, [selectedPokemonId, method]);

  const onLearn = async (moveName: string) => {
    if (!selectedCharacter || !selectedPokemonId) return;
    setLoading(true);
    try {
      const res: LearnMoveResponse = await learnMove(selectedCharacter.user_id, selectedPokemonId, moveName, method);
      const selectedPokemon = team.find(t => t.id === selectedPokemonId);
      if (res.needSlot && selectedPokemon) {
        // Prompt choose slot (simple prompt for now)
        const slots = ['aanval_1', 'aanval_2', 'aanval_3', 'aanval_4'] as const;
        const existingMoves = [selectedPokemon['aanval_1'], selectedPokemon['aanval_2'], selectedPokemon['aanval_3'], selectedPokemon['aanval_4']] as const;
        const chosen = window.prompt(`בחר משבצת להחלפה:\n${existingMoves.map((s, i) => `${i+1}. ${s}`).join("\n")}`);
        const idx = chosen ? parseInt(chosen, 10) - 1 : -1;
        const slot = slots[idx];
        if (slot) {
          const res2 = await learnMove(selectedCharacter.user_id, selectedPokemonId, moveName, method, slot);
          setMessage({ type: res2.success ? 'success' : 'error', text: res2.message });
        }
      } else {
        setMessage({ type: res.success ? 'success' : 'error', text: res.message });
      }
      // Refresh moves after action
      const refreshed = await listAvailableMoves(selectedPokemonId, method);
      if (refreshed.success && refreshed.data) setMoves(refreshed.data.moves);
    } catch (e) {
      setMessage({ type: 'error', text: 'שגיאה בביצוע פעולה' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Move Tutor / Reminder</Title>
        <Subtitle>
          בחר פוקימון ומהלכים לזמינות לפי מצב המורה או הזיכרון
        </Subtitle>
      </Header>

      {message && (
        message.type === 'success' ? <SuccessMessage>{message.text}</SuccessMessage> : <ErrorMessage>{message.text}</ErrorMessage>
      )}

      <Toolbar>
        <Segmented>
          <SegmentButton
            $active={method === 'tutor'}
            onClick={() => setMethod('tutor')}
            disabled={loading}
          >Tutor</SegmentButton>
          <SegmentButton
            $active={method === 'reminder'}
            onClick={() => setMethod('reminder')}
            disabled={loading}
          >Reminder</SegmentButton>
        </Segmented>

        <SelectPokemon
          value={selectedPokemonId ?? ''}
          onChange={(e) => setSelectedPokemonId(Number(e.target.value))}
          disabled={loading}
        >
          {team.map(p => (
            <option key={p.id} value={p.id}>{p.naam} (Lv {p.level})</option>
          ))}
        </SelectPokemon>
      </Toolbar>

      <HelperText>
        {method === 'tutor' ? 'בחר מהלכים מהמורה (TM/HM/Move Tutor) לפי עלות' : 'בחר מהלכים שהפוקימון יכול להיזכר בהם לפי רמתו'}
      </HelperText>

      {loading ? (
        <div>טוען...</div>
      ) : moves.length === 0 ? (
        <ErrorMessage>אין מהלכים זמינים</ErrorMessage>
      ) : (
        <MovesGrid>
          {moves.map((m) => (
            <MoveCard key={m.name}>
              <MoveTitle>{m.name}</MoveTitle>
              <MovePrice>
                {m.price.silver > 0 && (
                  <span><img src={SILVER_ICON} alt="silver" style={{ height: 14, verticalAlign: 'middle' }} /> {m.price.silver.toLocaleString()}</span>
                )}
                {m.price.gold > 0 && (
                  <span><img src={GOLD_ICON} alt="gold" style={{ height: 14, verticalAlign: 'middle' }} /> {m.price.gold.toLocaleString()}</span>
                )}
              </MovePrice>
              <MoveActions>
                <PrimaryButton onClick={() => onLearn(m.name)} disabled={loading}>
                  {method === 'tutor' ? 'ללמד' : 'להזכיר'}
                </PrimaryButton>
              </MoveActions>
            </MoveCard>
          ))}
        </MovesGrid>
      )}
    </Container>
  );
};

// Styled components (Wrapper בסגנון Fountain)
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
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
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
`;

const Subtitle = styled.p`
  font-size: 1rem;
  opacity: 0.9;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const Segmented = styled.div`
  display: inline-flex;
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 4px;
`;

const SegmentButton = styled.button<{ $active?: boolean }>`
  border: none;
  background: ${p => (p.$active ? '#577599' : 'transparent')};
  padding: 6px 12px;
  color: #eee;
  cursor: pointer;
  border-radius: 6px;
`;

const SelectPokemon = styled.select`
  background: rgba(255,255,255,0.08);
  color: #eee;
  border: 1px solid #577599;
  border-radius: 8px;
  padding: 8px;
  min-width: 240px;
`;

const HelperText = styled.div`
  color: #cfd8e3;
  font-size: 12px;
  margin-bottom: 8px;
`;

const MovesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
`;

const MoveCard = styled.div`
  background: rgba(255,255,255,0.08);
  border: 1px solid #577599;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MoveTitle = styled.div`
  font-weight: 700;
  color: #eaeaea;
  font-size: 15px;
`;

const MovePrice = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #eaeaea;
  font-size: 13px;
`;

const MoveActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const PrimaryButton = styled.button`
  background: #4d8f6f;
  border: none;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #f5c6cb;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #c3e6cb;
`;

export default MovesPage;


