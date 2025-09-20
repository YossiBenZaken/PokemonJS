import { FountainTeamMon, fountainApi } from '../../../api/fountain.api';
import React, { useCallback, useEffect, useState } from 'react';

import Loader from '../../../components/Loader';
import styled from 'styled-components';
import { useGame } from '../../../contexts/GameContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  color: white;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const PokemonCard = styled.div<{ selected: boolean; isEgg: boolean }>`
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  cursor: ${props => props.isEgg ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.isEgg ? 0.5 : 1};
  border: ${props => props.selected ? '3px solid #4CAF50' : '3px solid transparent'};
  transform: ${props => props.selected ? 'scale(1.02)' : 'scale(1)'};

  &:hover {
    transform: ${props => props.isEgg ? 'scale(1)' : 'scale(1.02)'};
    box-shadow: ${props => props.isEgg ? '0 8px 25px rgba(0,0,0,0.2)' : '0 12px 35px rgba(0,0,0,0.3)'};
  }
`;

const PokemonImage = styled.img`
  width: 80px;
  height: 80px;
  margin: 0 auto 15px;
  display: block;
`;

const PokemonName = styled.h3`
  text-align: center;
  margin-bottom: 10px;
  color: #333;
  font-size: 1.3rem;
`;

const PokemonInfo = styled.div`
  text-align: center;
  margin-bottom: 15px;
  color: #666;
`;

const PriceSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const PriceItem = styled.div`
  text-align: center;
  flex: 1;
`;

const PriceLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
`;

const PriceValue = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
`;

const ResetButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const Button = styled.button<{ variant?: 'basic' | 'premium' | 'disabled' }>`
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.variant) {
      case 'basic':
        return `
          background: linear-gradient(45deg, #4CAF50, #45a049);
          color: white;
          &:hover {
            background: linear-gradient(45deg, #45a049, #3d8b40);
            transform: translateY(-2px);
          }
        `;
      case 'premium':
        return `
          background: linear-gradient(45deg, #FF9800, #F57C00);
          color: white;
          &:hover {
            background: linear-gradient(45deg, #F57C00, #EF6C00);
            transform: translateY(-2px);
          }
        `;
      case 'disabled':
        return `
          background: #ccc;
          color: #666;
          cursor: not-allowed;
          &:hover {
            transform: none;
          }
        `;
      default:
        return `
          background: #6c757d;
          color: white;
        `;
    }
  }}
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #f5c6cb;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #c3e6cb;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const FountainPage: React.FC = () => {
  const [team, setTeam] = useState<FountainTeamMon[]>([]);
  const [isPremiumAcc, setIsPremiumAcc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const {selectedCharacter} = useGame();

  const loadTeam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fountainApi.getTeam(selectedCharacter?.user_id!);
      setTeam(data.team);
      setIsPremiumAcc(data.isPremiumAcc);
    } catch (err) {
      setError('שגיאה בטעינת הקבוצה');
      console.error('Error loading team:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCharacter]);

  useEffect(() => {
    if(selectedCharacter) {
      loadTeam();
    }
  }, [loadTeam, selectedCharacter]);

  const handleResetBasic = async (pokemonId: number) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      const result = await fountainApi.resetBasic(pokemonId, selectedCharacter?.user_id!);
      
      if (result.success) {
        setSuccess(`Reset בסיסי בוצע בהצלחה! עלות: ${result.price} Silver`);
        await loadTeam();
        setSelectedPokemon(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'שגיאה בביצוע Reset בסיסי');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPremium = async (pokemonId: number) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      const result = await fountainApi.resetPremium(pokemonId, selectedCharacter?.user_id!);
      
      if (result.success) {
        let message = `Reset פרימיום בוצע בהצלחה! עלות: ${result.price} Silver`;
        if (result.returns && result.returns.length > 0) {
          const returnsText = result.returns.map(r => `${r.qty}x ${r.item}`).join(', ');
          message += `\nפריטים שהוחזרו: ${returnsText}`;
        }
        setSuccess(message);
        await loadTeam();
        setSelectedPokemon(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'שגיאה בביצוע Reset פרימיום');
    } finally {
      setSubmitting(false);
    }
  };

  const canResetBasic = (pokemon: FountainTeamMon) => {
    return pokemon.ei === 0 && pokemon.poke_reset < 3;
  };

  const canResetPremium = (pokemon: FountainTeamMon) => {
    return pokemon.ei === 0;
  };

  if (loading) return <Loader />;

  return (
    <Container>
      <Header>
        <Title>מזרקת הנעורים</Title>
        <Subtitle>
          החזר את הפוקימונים שלך לצורתם המקורית ולמפלס 5
          {isPremiumAcc && <span style={{ color: '#FFD700' }}> ✨ חשבון פרימיום פעיל</span>}
        </Subtitle>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage style={{ whiteSpace: 'pre-line' }}>{success}</SuccessMessage>}

      <TeamGrid>
        {team.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            selected={selectedPokemon === pokemon.id}
            isEgg={pokemon.ei === 1}
            onClick={() => !pokemon.ei && setSelectedPokemon(pokemon.id)}
          >
            <PokemonImage
              src={require(`../../../assets/images/pokemon/${pokemon.wild_id}.gif`)}
              alt={pokemon.naam}
              onError={(e) => {
                (e.target as HTMLImageElement).src = require('../../../assets/pokemon/front/001.png');
              }}
            />
            <PokemonName>{pokemon.naam}</PokemonName>
            <PokemonInfo>
              <div>נדירות: {pokemon.zeldzaamheid}</div>
              <div>ריסטים קודמים: {pokemon.poke_reset}/3</div>
              {pokemon.ei === 1 && <div style={{ color: '#ff6b6b' }}>ביצה - לא ניתן לריסט</div>}
            </PokemonInfo>

            <PriceSection>
              <PriceItem>
                <PriceLabel>Reset בסיסי</PriceLabel>
                <PriceValue>{pokemon.price_basic} Silver</PriceValue>
              </PriceItem>
              <PriceItem>
                <PriceLabel>Reset פרימיום</PriceLabel>
                <PriceValue>{pokemon.price_premium} Silver</PriceValue>
              </PriceItem>
            </PriceSection>

            <ResetButtons>
              <Button
                variant={canResetBasic(pokemon) ? 'basic' : 'disabled'}
                onClick={(e) => {
                  e.stopPropagation();
                  if (canResetBasic(pokemon)) {
                    handleResetBasic(pokemon.id);
                  }
                }}
                disabled={!canResetBasic(pokemon) || submitting}
              >
                Reset בסיסי
              </Button>
              <Button
                variant={canResetPremium(pokemon) ? 'premium' : 'disabled'}
                onClick={(e) => {
                  e.stopPropagation();
                  if (canResetPremium(pokemon)) {
                    handleResetPremium(pokemon.id);
                  }
                }}
                disabled={!canResetPremium(pokemon) || submitting}
              >
                Reset פרימיום
              </Button>
            </ResetButtons>
          </PokemonCard>
        ))}
      </TeamGrid>

      {team.length === 0 && (
        <div style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem' }}>
          אין פוקימונים בקבוצה שלך
        </div>
      )}

      {submitting && (
        <LoadingOverlay>
          <Loader />
        </LoadingOverlay>
      )}
    </Container>
  );
};

export default FountainPage;
