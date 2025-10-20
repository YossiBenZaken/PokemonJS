import {
  AdminBadge,
  BackgroundElement,
  BannedBadge,
  CharacterCarousel,
  CharacterCarouselCell,
  CharacterCarouselContainer,
  CharacterCarouselDot,
  CharacterCarouselDots,
  CharacterCarouselImage,
  CharacterCarouselInfo,
  CharacterCarouselName,
  CharacterCarouselType,
  CharacterDate,
  CharacterDetails,
  CharacterInfo,
  CharacterRank,
  CharacterStat,
  CharacterStatLabel,
  CharacterStatValue,
  CharacterStats,
  CharacterStatus,
  CharacterWorld,
  Container,
  DecorativeElement,
  HeaderSection,
  LightningIcon,
  LoadingContent,
  LoadingSpinner,
  LoginButton,
  LoginCard,
  NoCharacters,
  PlayButton,
  PlayButtonText,
  PokeballIcon,
  PremiumBadge,
  Subtitle,
  Title,
} from "./styled";
import { ArrowLeft, Ban, Crown, Play, Plus, Shield, Star } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { getUserCharacters, loginWithCharacter } from "../../api/character.api";

import { UserItem } from "../../models/item.model";
import { itemsApi } from "../../api/items.api";
import { useGame } from "../../contexts/GameContext";
import { useNavigate } from "react-router-dom";

export interface Character {
  id?: number;
  user_id: number;
  username: string;
  character: string;
  world: string;
  ultimo_login: string;
  ultimo_login_hour: string;
  date: string;
  registration_date: string;
  rank?: number;
  rankexp?: number;
  rankexpnecessary?: number;
  banned?: string;
  admin?: number;
  premiumaccount?: number;
  antiguidade?: number;
  sec_key?: string;
  chat_key?: string;
  owned?: number;
  pok_possession?: string;
  silver?: number;
  gold?: number;
  tickets: number;
  lucky_wheel: number;
  items: UserItem;
  map_sprite: number;
  quest_1: number;
  quest_2: number;
  daily_bonus: number;
  page: string;
}

export const MyCharactersPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithCharacter: setGameCharacter, setIsLoggedIn } = useGame();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedCharacter, setSelectedCharacter } = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCharacters();
  }, []);

  useEffect(() => {
    if (characters.length > 0) {
      itemsApi.getUserItems(characters[0].user_id.toString()).then((items) => {
        setSelectedCharacter({
          ...characters[0],
          items: items.gebruikers_item,
        });
        setCurrentIndex(0);
      });
    }
  }, [characters]);

  const loadCharacters = async () => {
    try {
      const response = await getUserCharacters();
      if (response.success) {
        setCharacters(response.data);
      }
    } catch (error) {
      console.error("שגיאה בטעינת הדמויות:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCharacterSelect = (index: number) => {
    setCurrentIndex(index);
    setSelectedCharacter(characters[index]);
  };

  const handlePlayCharacter = async () => {
    if (!selectedCharacter) return;

    setIsPlaying(true);
    try {
      const response = await loginWithCharacter({
        user_id: selectedCharacter.user_id,
      });

      if (response.success) {
        // שמירת פרטי המשחק ב-localStorage
        localStorage.setItem(
          "game_session",
          JSON.stringify({
            user_id: response.data.user_id,
            username: response.data.username,
            character: response.data.character,
            world: response.data.world,
            session_token: response.data.session_token,
            sec_key: response.data.sec_key,
            chat_key: response.data.chat_key,
            is_premium: response.data.is_premium,
            premium_expires: response.data.premium_expires,
          })
        );

        // מעבר לדף הבית
        navigate("/");
        setIsLoggedIn(true);
      }
    } catch (error: any) {
      console.error("שגיאה בכניסה למשחק:", error);
      alert(error.response?.data?.message || "שגיאה בכניסה למשחק");
    } finally {
      setIsPlaying(false);
    }
  };

  const getCharacterType = (character: Character) => {
    if (character.banned === "Y") {
      return { type: "חסום", icon: <Ban size={16} />, color: "#e74c3c" };
    } else if (character.admin && character.admin > 0) {
      return { type: "צוות", icon: <Shield size={16} />, color: "#3498db" };
    } else {
      return { type: "מאמן", icon: <Star size={16} />, color: "#f39c12" };
    }
  };

  const getCharacterImage = (characterName: string) => {
    return require(`../../assets/images/characters/${characterName}/Thumb.png`);
  };

  const backgroundElements = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    top: Math.random() * 80,
    left: Math.random() * 80,
    delay: i * 0.5,
  }));

  if (isLoading) {
    return (
      <Container>
        <LoadingContent>
          <LoadingSpinner />
          <span>טוען דמויות...</span>
        </LoadingContent>
      </Container>
    );
  }

  if (characters.length === 0) {
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
            <Title>הדמויות שלי</Title>
            <Subtitle>ניהול הדמויות שלך במשחק</Subtitle>
          </HeaderSection>

          <NoCharacters>
            <Crown size={60} color="#bdc3c7" />
            <h3>אין לך דמויות עדיין</h3>
            <p>צור דמות ראשונה והתחל הרפתקה!</p>
          </NoCharacters>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginTop: "2rem",
            }}
          >
            <LoginButton
              type="button"
              onClick={() => navigate("/new-character")}
              style={{ backgroundColor: "#27ae60" }}
            >
              <Plus size={20} />
              <span>צור דמות חדשה</span>
            </LoginButton>

            <LoginButton
              type="button"
              onClick={() => navigate("/")}
              style={{ backgroundColor: "#6c757d" }}
            >
              <ArrowLeft size={20} />
              <span>חזור לדף הבית</span>
            </LoginButton>
          </div>

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
          <Title>הדמויות שלי</Title>
          <Subtitle>בחר דמות והתחל לשחק!</Subtitle>
        </HeaderSection>

        {/* Character Carousel */}
        <CharacterCarouselContainer>
          <CharacterCarousel ref={carouselRef}>
            {characters.map((character, index) => (
              <CharacterCarouselCell
                key={character.id}
                isSelected={index === currentIndex}
                onClick={() => handleCharacterSelect(index)}
              >
                <CharacterCarouselImage
                  src={getCharacterImage(character.character)}
                  alt={character.username}
                />

                {/* Character Status Badges */}
                <div
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  {character.banned === "Y" && (
                    <BannedBadge>
                      <Ban size={12} />
                    </BannedBadge>
                  )}
                  {character.admin !== undefined && character.admin > 0 && (
                    <AdminBadge>
                      <Shield size={12} />
                    </AdminBadge>
                  )}
                  {character.premiumaccount !== undefined &&
                    character.premiumaccount > Date.now() && (
                      <PremiumBadge>
                        <Star size={12} />
                      </PremiumBadge>
                    )}
                </div>
              </CharacterCarouselCell>
            ))}
          </CharacterCarousel>

          {/* Character Info */}
          {selectedCharacter && (
            <CharacterCarouselInfo>
              <CharacterCarouselName>
                {selectedCharacter.username}
              </CharacterCarouselName>
              <CharacterCarouselType
                style={{ color: getCharacterType(selectedCharacter).color }}
              >
                {getCharacterType(selectedCharacter).icon}
                {getCharacterType(selectedCharacter).type}
              </CharacterCarouselType>
            </CharacterCarouselInfo>
          )}

          {/* Carousel Dots */}
          <CharacterCarouselDots>
            {characters.map((_, index) => (
              <CharacterCarouselDot
                key={index}
                isActive={index === currentIndex}
                onClick={() => handleCharacterSelect(index)}
              />
            ))}
          </CharacterCarouselDots>
        </CharacterCarouselContainer>

        {/* Character Details */}
        {selectedCharacter && (
          <CharacterDetails>
            <CharacterInfo>
              <CharacterRank>
                <strong>דרגה:</strong> {selectedCharacter.rank || 0}
              </CharacterRank>
              <CharacterWorld>
                <strong>עולם:</strong> {selectedCharacter.world}
              </CharacterWorld>
              <CharacterDate>
                <strong>נוצר:</strong>{" "}
                {new Date(selectedCharacter.registration_date).toLocaleDateString(
                  "he-IL"
                )}
              </CharacterDate>
              <CharacterStatus>
                <strong>סטטוס:</strong>{" "}
                {getCharacterType(selectedCharacter).type}
              </CharacterStatus>
            </CharacterInfo>

            {/* Character Stats */}
            <CharacterStats>
              <CharacterStat>
                <CharacterStatLabel>ימים במשחק</CharacterStatLabel>
                <CharacterStatValue>
                  {selectedCharacter.antiguidade || 0}
                </CharacterStatValue>
              </CharacterStat>
              <CharacterStat>
                <CharacterStatLabel>כניסה אחרונה</CharacterStatLabel>
                <CharacterStatValue>
                  {selectedCharacter.ultimo_login}{" "}
                  {selectedCharacter.ultimo_login_hour}
                </CharacterStatValue>
              </CharacterStat>
            </CharacterStats>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              {/* Play Button */}
              <PlayButton
                onClick={handlePlayCharacter}
                disabled={isPlaying || selectedCharacter.banned === "Y"}
                isBanned={selectedCharacter.banned === "Y"}
              >
                {isPlaying ? <LoadingSpinner /> : <Play size={20} />}
                <PlayButtonText>
                  {selectedCharacter.banned === "Y"
                    ? "דמות חסומה"
                    : isPlaying
                    ? "נכנס למשחק..."
                    : "שחק עם " + selectedCharacter.username}
                </PlayButtonText>
              </PlayButton>

              {/* Choose Starter Pokemon Button - רק אם הדמות עדיין לא קיבלה פוקימון */}
              {selectedCharacter.owned !== 1 && (
                <LoginButton
                  type="button"
                  onClick={() => {
                    // שמירת הדמות הנבחרת ב-Context
                    setGameCharacter(selectedCharacter);
                    navigate("/choose-pokemon");
                  }}
                  style={{ backgroundColor: "#e67e22" }}
                >
                  <Star size={20} />
                  <span>בחר פוקימון ראשון</span>
                </LoginButton>
              )}
            </div>
          </CharacterDetails>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          <LoginButton
            type="button"
            onClick={() => navigate("/new-character")}
            style={{ backgroundColor: "#27ae60" }}
          >
            <Plus size={20} />
            <span>צור דמות חדשה</span>
          </LoginButton>

          <LoginButton
            type="button"
            onClick={() => navigate("/")}
            style={{ backgroundColor: "#6c757d" }}
          >
            <ArrowLeft size={20} />
            <span>חזור לדף הבית</span>
          </LoginButton>
        </div>

        {/* Decorative Elements */}
        <DecorativeElement topRight />
        <DecorativeElement bottomLeft />
      </LoginCard>
    </Container>
  );
};
