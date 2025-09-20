import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { useGame } from '../../../contexts/GameContext';
import { useNavigate } from 'react-router-dom';

interface CasinoGame {
  id: string;
  name: string;
  image: string;
  link: string;
}

const casinoGames: CasinoGame[] = [
  {
    id: 'slots',
    name: 'Slot Machines',
    image: require('../../../assets/images/cassino/encartes/slots.png'),
    link: '/slots'
  },
  {
    id: 'kluis',
    name: 'Break the Secret',
    image: require('../../../assets/images/cassino/encartes/kluis.png'),
    link: '/kluis'
  },
  {
    id: 'who-is-it-quiz',
    name: 'Who is this Pokémon?',
    image: require('../../../assets/images/cassino/encartes/who-is-it-quiz.png'),
    link: '/who-is-it-quiz'
  },
  {
    id: 'wheel-of-fortune',
    name: 'Wheel of Fortune',
    image: require('../../../assets/images/cassino/encartes/wheel-of-fortune.png'),
    link: '/wheel-of-fortune'
  },
  {
    id: 'casino-store',
    name: 'the Casino Shop',
    image: require('../../../assets/images/cassino/encartes/casino-store.png'),
    link: '/casino-store'
  }
];

const CasinoContainer = styled.div`
  margin-bottom: 7px;
`;

const TicketsDisplay = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
  
  h3 {
    margin: 0;
    color: #495057;
    font-size: 16px;
    font-weight: 600;
  }
`;

const TicketIcon = styled.img`
  width: 20px;
  height: 20px;
  vertical-align: middle;
  margin: 0 5px;
`;

const CasinoBox = styled.div`
  display: inline-block;
  width: 100%;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const CasinoTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  thead th {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px;
    font-size: 18px;
    font-weight: 600;
    text-align: center;
  }
`;

const CarouselContainer = styled.div`
  width: 100%;
  height: 217px;
  position: relative;
  overflow: hidden;
`;

const CarouselTrack = styled.div<{ currentIndex: number }>`
  display: flex;
  transition: transform 0.5s ease;
  height: 100%;
  justify-content: center;
`;

const CarouselCell = styled.div<{ isSelected: boolean }>`
  margin: 10px;
  filter: ${props => props.isSelected ? 'grayscale(20%)' : 'grayscale(100%)'};
  overflow: hidden;
  transform: ${props => props.isSelected ? 'scale(1)' : 'scale(0.8)'};
  transition: all 0.5s ease;
  box-shadow: ${props => props.isSelected ? '0 0 15px rgba(14, 13, 13, 0.4)' : 'none'};
  border-radius: 6px;
  min-width: 300px;
  text-align: center;
  cursor: pointer;
  
  &:hover {
    filter: grayscale(50%);
    transform: scale(0.9);
  }
`;

const GameImage = styled.img`
  width: 100%;
  height: 195px;
  border-radius: 6px;
  object-fit: cover;
`;

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 18px;
  z-index: 10;
  border-radius: 4px;
  
  &:hover {
    background: rgba(0,0,0,0.9);
  }
  
  &.prev {
    left: 10px;
  }
  
  &.next {
    right: 10px;
  }
`;

const VisitButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 10px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

const ButtonContainer = styled.div`
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
`;

const DotsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 15px;
  background: #f8f9fa;
`;

const Dot = styled.button<{ isActive: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: ${props => props.isActive ? '#667eea' : '#dee2e6'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #667eea;
    transform: scale(1.2);
  }
`;

const Casino: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const {selectedCharacter} = useGame();
  const navigate = useNavigate();

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % casinoGames.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + casinoGames.length) % casinoGames.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const visitGame = () => {
    const currentGame = casinoGames[currentIndex];
    navigate(currentGame.link);
  };

  // Initialize with random game (like in original PHP)
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * casinoGames.length);
    setCurrentIndex(randomIndex);
  }, []);

  return (
    <CasinoContainer>
      <TicketsDisplay>
        <h3>
          Tickets no Inventário: 
          <TicketIcon src={require('../../../assets/images/icons/ticket.png')} alt="Tickets" />
          {selectedCharacter?.tickets.toLocaleString()}
        </h3>
      </TicketsDisplay>

      <CasinoBox>
        <CasinoTable>
          <thead>
            <tr>
              <th colSpan={6}>Cassino</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ width: '100%', padding: 0 }}>
                <CarouselContainer>
                  <NavigationButton className="prev" onClick={prevSlide}>
                    ‹
                  </NavigationButton>
                  <NavigationButton className="next" onClick={nextSlide}>
                    ›
                  </NavigationButton>
                  
                  <CarouselTrack currentIndex={currentIndex}>
                    {casinoGames.map((game, index) => (
                      <CarouselCell
                        key={game.id}
                        isSelected={index === currentIndex}
                        onClick={() => goToSlide(index)}
                      >
                        <GameImage
                          src={game.image}
                          alt={game.name}
                        />
                      </CarouselCell>
                    ))}
                  </CarouselTrack>
                </CarouselContainer>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>
                <ButtonContainer>
                  <VisitButton onClick={visitGame}>
                    VISIT {casinoGames[currentIndex].name}
                  </VisitButton>
                </ButtonContainer>
              </td>
            </tr>
          </tfoot>
        </CasinoTable>
        
        <DotsContainer>
          {casinoGames.map((_, index) => (
            <Dot
              key={index}
              isActive={index === currentIndex}
              onClick={() => goToSlide(index)}
            />
          ))}
        </DotsContainer>
      </CasinoBox>
    </CasinoContainer>
  );
};

export default Casino;
