import {
  Activity,
  ArrowLeft,
  CheckCircle,
  Heart,
  Shield,
  Star,
  Target,
  Zap
} from "lucide-react";
import {
  BackgroundElement,
  ChooseButton,
  ChooseButtonText,
  Container,
  DecorativeElement,
  HeaderSection,
  LightningIcon,
  LoadingContent,
  LoadingSpinner,
  LoginCard,
  PokeballIcon,
  PokemonCarousel,
  PokemonCarouselCell,
  PokemonCarouselContainer,
  PokemonCarouselDot,
  PokemonCarouselDots,
  PokemonCarouselImage,
  PokemonCarouselInfo,
  PokemonCarouselName,
  PokemonCarouselType,
  PokemonDescription,
  PokemonStat,
  PokemonStatLabel,
  PokemonStatValue,
  PokemonStats,
  ProfessorMessage,
  ProfessorOak,
  Subtitle,
  SuccessIcon,
  SuccessMessage,
  SuccessStat,
  SuccessStatLabel,
  SuccessStatValue,
  SuccessStats,
  SuccessText,
  Title,
  TypeBadge,
  TypeContainer
} from "./styled";
import React, { useEffect, useRef, useState } from "react";
import {
  StarterPokemon,
  chooseStarterPokemon,
  getAvailableStarterPokemon
} from "../../api/character.api";

import { useGame } from "../../contexts/GameContext";
import { useNavigate } from "react-router-dom";

export const ChoosePokemonPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCharacter } = useGame();
  const [pokemon, setPokemon] = useState<StarterPokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<StarterPokemon | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isChoosing, setIsChoosing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [chosenPokemon, setChosenPokemon] = useState<any>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCharacter?.user_id) {
      loadStarterPokemon();
    }
  }, [selectedCharacter]);

  useEffect(() => {
    if (pokemon.length > 0) {
      setSelectedPokemon(pokemon[0]);
      setCurrentIndex(0);
    }
  }, [pokemon]);

  const loadStarterPokemon = async () => {
    if (!selectedCharacter?.user_id) return;
    
    try {
      const response = await getAvailableStarterPokemon(selectedCharacter.user_id);
      if (response.success) {
        setPokemon(response.data);
      }
    } catch (error) {
      console.error('שגיאה בטעינת הפוקימונים הזמינים:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePokemonSelect = (index: number) => {
    setCurrentIndex(index);
    setSelectedPokemon(pokemon[index]);
  };

  const handleChoosePokemon = async () => {
    if (!selectedPokemon || !selectedCharacter?.user_id) return;

    setIsChoosing(true);
    try {
      const response = await chooseStarterPokemon({
        user_id: selectedCharacter.user_id,
        pokemon_id: selectedPokemon.wild_id
      });

      if (response.success) {
        setChosenPokemon(response.data);
        setShowSuccess(true);
        
        // מעבר לדף הבית אחרי 3 שניות
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error: any) {
      console.error('שגיאה בבחירת פוקימון:', error);
      alert(error.response?.data?.message || 'שגיאה בבחירת פוקימון');
    } finally {
      setIsChoosing(false);
    }
  };

  const getTypeColor = (type: string) => {
    const typeColors: { [key: string]: string } = {
      'normal': '#A8A878',
      'fire': '#F08030',
      'water': '#6890F0',
      'electric': '#F8D030',
      'grass': '#78C850',
      'ice': '#98D8D8',
      'fighting': '#C03028',
      'poison': '#A040A0',
      'ground': '#E0C068',
      'flying': '#A890F0',
      'psychic': '#F85888',
      'bug': '#A8B820',
      'rock': '#B8A038',
      'ghost': '#705898',
      'dragon': '#7038F8',
      'dark': '#705848',
      'steel': '#B8B8D0',
      'fairy': '#EE99AC'
    };
    return typeColors[type.toLowerCase()] || '#A8A878';
  };

  const getPokemonImage = (wildId: number) => {
    return require(`../../assets/images/pokemon/${wildId}.gif`);
  };

  const backgroundElements = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    top: Math.random() * 80,
    left: Math.random() * 80,
    delay: i * 0.5,
  }));

  // בדיקה אם יש דמות נבחרת
  if (!selectedCharacter) {
    return (
      <Container>
        <LoadingContent>
          <span>לא נבחרה דמות לשחק איתה</span>
          <ChooseButton
            onClick={() => navigate('/my-characters')}
            style={{ backgroundColor: '#6c757d', marginTop: '1rem' }}
          >
            <ArrowLeft size={20} />
            <ChooseButtonText>חזור לדמויות שלי</ChooseButtonText>
          </ChooseButton>
        </LoadingContent>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container>
        <LoadingContent>
          <LoadingSpinner />
          <span>טוען פוקימונים זמינים...</span>
        </LoadingContent>
      </Container>
    );
  }

  if (showSuccess && chosenPokemon) {
    return (
      <Container>
        {backgroundElements.map((element) => (
          <BackgroundElement
            key={element.id}
            top={element.top}
            left={element.left}
            delay={element.delay}
          />
        ))}
        <LightningIcon size={40} top="2.5rem" right="2.5rem" />
        <LightningIcon size={30} bottom="5rem" left="2.5rem" delay={1} />

        <LoginCard>
          <HeaderSection>
            <PokeballIcon />
            <Title>הפוקימון הראשון שלך!</Title>
            <Subtitle>ברכות! בחרת את הפוקימון הראשון שלך</Subtitle>
          </HeaderSection>

          <SuccessMessage>
            <SuccessIcon>
              <CheckCircle size={60} color="#27ae60" />
            </SuccessIcon>
            <SuccessText>
              <h2>ברכות! {chosenPokemon.pokemon_name} הוא הפוקימון הראשון שלך!</h2>
              <p>אופי: {chosenPokemon.character_trait}</p>
              <p>רמה: {chosenPokemon.level}</p>
            </SuccessText>

            <SuccessStats>
              <SuccessStat>
                <SuccessStatLabel>HP</SuccessStatLabel>
                <SuccessStatValue>{chosenPokemon.hp}</SuccessStatValue>
              </SuccessStat>
              <SuccessStat>
                <SuccessStatLabel>Attack</SuccessStatLabel>
                <SuccessStatValue>{chosenPokemon.attack}</SuccessStatValue>
              </SuccessStat>
              <SuccessStat>
                <SuccessStatLabel>Defence</SuccessStatLabel>
                <SuccessStatValue>{chosenPokemon.defence}</SuccessStatValue>
              </SuccessStat>
              <SuccessStat>
                <SuccessStatLabel>Speed</SuccessStatLabel>
                <SuccessStatValue>{chosenPokemon.speed}</SuccessStatValue>
              </SuccessStat>
              <SuccessStat>
                <SuccessStatLabel>Sp. Atk</SuccessStatLabel>
                <SuccessStatValue>{chosenPokemon.spc_attack}</SuccessStatValue>
              </SuccessStat>
              <SuccessStat>
                <SuccessStatLabel>Sp. Def</SuccessStatLabel>
                <SuccessStatValue>{chosenPokemon.spc_defence}</SuccessStatValue>
              </SuccessStat>
            </SuccessStats>

            <p style={{ textAlign: 'center', color: '#7f8c8d', marginTop: '2rem' }}>
              מעביר אותך לדף הבית...
            </p>
          </SuccessMessage>

          <DecorativeElement topRight />
          <DecorativeElement bottomLeft />
        </LoginCard>
      </Container>
    );
  }

  return (
    <Container>
      {backgroundElements.map((element) => (
        <BackgroundElement
          key={element.id}
          top={element.top}
          left={element.left}
          delay={element.delay}
        />
      ))}
      <LightningIcon size={40} top="2.5rem" right="2.5rem" />
      <LightningIcon size={30} bottom="5rem" left="2.5rem" delay={1} />

      <LoginCard>
        <HeaderSection>
          <PokeballIcon />
          <Title>בחר את הפוקימון הראשון שלך</Title>
          <Subtitle>זהו רגע חשוב! בחר בחוכמה</Subtitle>
          <p style={{ color: '#667eea', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            דמות: <strong>{selectedCharacter.username}</strong> - {selectedCharacter.wereld}
          </p>
        </HeaderSection>

        <ProfessorOak>
          <Star size={24} color="#f39c12" />
          <ProfessorMessage>
            "ברוך הבא למעבדה שלי! כל מאמן מתחיל צריך לבחור את הפוקימון הראשון שלו. 
            בחר בחוכמה - הפוקימון הזה יהיה בן לוויה נאמן לכל החיים!"
          </ProfessorMessage>
        </ProfessorOak>

        {/* Pokemon Carousel */}
        <PokemonCarouselContainer>
          <PokemonCarousel ref={carouselRef}>
            {pokemon.map((poke, index) => (
              <PokemonCarouselCell
                key={poke.wild_id}
                isSelected={index === currentIndex}
                onClick={() => handlePokemonSelect(index)}
              >
                <PokemonCarouselImage
                  src={getPokemonImage(poke.wild_id)}
                  alt={poke.naam}
                />
                
                {/* Type Badges */}
                <TypeContainer>
                  <TypeBadge style={{ backgroundColor: getTypeColor(poke.type1) }}>
                    {poke.type1}
                  </TypeBadge>
                  {poke.type2 && (
                    <TypeBadge style={{ backgroundColor: getTypeColor(poke.type2) }}>
                      {poke.type2}
                    </TypeBadge>
                  )}
                </TypeContainer>
              </PokemonCarouselCell>
            ))}
          </PokemonCarousel>

          {/* Pokemon Info */}
          {selectedPokemon && (
            <PokemonCarouselInfo>
              <PokemonCarouselName>{selectedPokemon.naam}</PokemonCarouselName>
              <PokemonCarouselType>
                {selectedPokemon.type2 ? `${selectedPokemon.type1} / ${selectedPokemon.type2}` : selectedPokemon.type1}
              </PokemonCarouselType>
            </PokemonCarouselInfo>
          )}

          {/* Carousel Dots */}
          <PokemonCarouselDots>
            {pokemon.map((_, index) => (
              <PokemonCarouselDot
                key={index}
                isActive={index === currentIndex}
                onClick={() => handlePokemonSelect(index)}
              />
            ))}
          </PokemonCarouselDots>
        </PokemonCarouselContainer>

        {/* Pokemon Stats */}
        {selectedPokemon && (
          <PokemonStats>
            <PokemonStat>
              <PokemonStatLabel>
                <Heart size={16} />
                HP Base
              </PokemonStatLabel>
              <PokemonStatValue>{selectedPokemon.hp_base}</PokemonStatValue>
            </PokemonStat>
            <PokemonStat>
              <PokemonStatLabel>
                <Zap size={16} />
                Attack
              </PokemonStatLabel>
              <PokemonStatValue>{selectedPokemon.attack_base}</PokemonStatValue>
            </PokemonStat>
            <PokemonStat>
              <PokemonStatLabel>
                <Shield size={16} />
                Defence
              </PokemonStatLabel>
              <PokemonStatValue>{selectedPokemon.defence_base}</PokemonStatValue>
            </PokemonStat>
            <PokemonStat>
              <PokemonStatLabel>
                <Target size={16} />
                Speed
              </PokemonStatLabel>
              <PokemonStatValue>{selectedPokemon.speed_base}</PokemonStatValue>
            </PokemonStat>
            <PokemonStat>
              <PokemonStatLabel>
                <Activity size={16} />
                Sp. Atk
              </PokemonStatLabel>
              <PokemonStatValue>{selectedPokemon["spc.attack_base"]}</PokemonStatValue>
            </PokemonStat>
            <PokemonStat>
              <PokemonStatLabel>
                <Shield size={16} />
                Sp. Def
              </PokemonStatLabel>
              <PokemonStatValue>{selectedPokemon["spc.defence_base"]}</PokemonStatValue>
            </PokemonStat>
          </PokemonStats>
        )}

        {/* Pokemon Description */}
        {selectedPokemon && (
          <PokemonDescription>
            <p>
              <strong>יכולות:</strong> {selectedPokemon.aanval_1}, {selectedPokemon.aanval_2}, {selectedPokemon.aanval_3}, {selectedPokemon.aanval_4}
            </p>
            <p>
              <strong>סוג צמיחה:</strong> {selectedPokemon.groei}
            </p>
            <p>
              <strong>יכולות מיוחדות:</strong> {selectedPokemon.ability}
            </p>
          </PokemonDescription>
        )}

        {/* Choose Button */}
        <ChooseButton
          onClick={handleChoosePokemon}
          disabled={isChoosing || !selectedPokemon}
        >
          {isChoosing ? (
            <LoadingSpinner />
          ) : (
            <CheckCircle size={20} />
          )}
          <ChooseButtonText>
            {isChoosing 
              ? 'בוחר פוקימון...' 
              : `בחר ${selectedPokemon?.naam || 'פוקימון'}`
            }
          </ChooseButtonText>
        </ChooseButton>

        {/* Back Button */}
        <ChooseButton
          onClick={() => navigate('/my-characters')}
          style={{ 
            backgroundColor: '#6c757d', 
            marginTop: '1rem',
            opacity: isChoosing ? 0.6 : 1 
          }}
          disabled={isChoosing}
        >
          <ArrowLeft size={20} />
          <ChooseButtonText>חזור לדמויות שלי</ChooseButtonText>
        </ChooseButton>

        {/* Decorative Elements */}
        <DecorativeElement topRight />
        <DecorativeElement bottomLeft />
      </LoginCard>
    </Container>
  );
};
