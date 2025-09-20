import {
  AlertContainer,
  AlertMessage,
  BackgroundElement,
  CharacterCard,
  CharacterCountInfo,
  CharacterGrid,
  CharacterImage,
  CharacterName,
  Container,
  DecorativeElement,
  FormContainer,
  GoldInfo,
  HeaderSection,
  Input,
  InputGroup,
  InputIcon,
  InputWrapper,
  Label,
  LightningIcon,
  LoadingContent,
  LoadingSpinner,
  LoginButton,
  LoginCard,
  PokeballIcon,
  Subtitle,
  Title,
  WorldSelect,
} from "./styled";
import { Crown, Map, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createCharacter, getAvailableCharacters, getUserCharacterCount } from "../../api/character.api";

import { useNavigate } from "react-router-dom";

export const NewCharacterPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [selectedWorld, setSelectedWorld] = useState("Kanto");
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [characters, setCharacters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [needsGold, setNeedsGold] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const worlds = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola'];

  useEffect(() => {
    loadCharacters();
    loadCharacterCount();
  }, []);

  const loadCharacters = async () => {
    try {
      const response = await getAvailableCharacters();
      if (response.success) {
        setCharacters(response.data);
        if (response.data.length > 0) {
          setSelectedCharacter(response.data[0]);
        }
      }
    } catch (error) {
      console.error('שגיאה בטעינת הדמויות:', error);
    }
  };

  const loadCharacterCount = async () => {
    try {
      const response = await getUserCharacterCount();
      if (response.success) {
        setCharacterCount(response.data.characterCount);
        setNeedsGold(response.data.needsGold);
      }
    } catch (error) {
      console.error('שגיאה בטעינת מספר הדמויות:', error);
    }
  };

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !selectedWorld || !selectedCharacter) {
      setAlert({ type: 'error', message: 'יש למלא את כל השדות' });
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      const response = await createCharacter({
        inlognaam: username,
        wereld: selectedWorld,
        character: selectedCharacter
      });

      if (response.success) {
        setAlert({ type: 'success', message: 'הדמות נוצרה בהצלחה!' });
        setTimeout(() => {
          navigate('/my-characters');
        }, 2000);
      }
    } catch (error: any) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'שגיאה ביצירת הדמות' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const backgroundElements = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    top: Math.random() * 80,
    left: Math.random() * 80,
    delay: i * 0.5,
  }));

  const getCharacterImage = (characterName: string) => {
    try {
      // ניסיון לטעון תמונה מה-assets
      return require(`../../assets/images/characters/${characterName}/Thumb.png`);
    } catch {
    }
  };

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
          <Title>יצירת דמות חדשה</Title>
          <Subtitle>בחר את הדמות שלך והתחל הרפתקה חדשה!</Subtitle>
        </HeaderSection>

        {/* מידע על מספר הדמויות */}
        <CharacterCountInfo>
          <Crown size={20} />
          <span>דמויות קיימות: {characterCount}/7</span>
          {needsGold && (
            <GoldInfo>
              <span>💰 נדרש 10 Gold ליצירת דמות נוספת</span>
            </GoldInfo>
          )}
        </CharacterCountInfo>

        {/* הודעות מערכת */}
        {alert && (
          <AlertContainer>
            <AlertMessage type={alert.type}>
              {alert.message}
            </AlertMessage>
          </AlertContainer>
        )}

        <FormContainer>
          {/* שם משתמש */}
          <InputGroup>
            <Label>שם הדמות</Label>
            <InputWrapper>
              <InputIcon>
                <User size={20} />
              </InputIcon>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="הכנס שם דמות (4-12 תווים)"
                maxLength={12}
                minLength={4}
                required
              />
            </InputWrapper>
          </InputGroup>

          {/* בחירת עולם */}
          <InputGroup>
            <Label>עולם התחלה</Label>
            <InputWrapper>
              <InputIcon>
                <Map size={20} />
              </InputIcon>
              <WorldSelect
                value={selectedWorld}
                onChange={(e) => setSelectedWorld(e.target.value)}
                required
              >
                {worlds.map((world) => (
                  <option key={world} value={world}>
                    {world}
                  </option>
                ))}
              </WorldSelect>
            </InputWrapper>
          </InputGroup>

          {/* בחירת דמות */}
          <InputGroup>
            <Label>בחר דמות</Label>
            <CharacterGrid>
              {characters.map((character) => (
                <CharacterCard
                  key={character}
                  isSelected={selectedCharacter === character}
                  onClick={() => setSelectedCharacter(character)}
                >
                  <CharacterImage
                    src={getCharacterImage(character)}
                    alt={character}
                  />
                  <CharacterName isSelected={selectedCharacter === character}>
                    {character}
                  </CharacterName>
                </CharacterCard>
              ))}
            </CharacterGrid>
          </InputGroup>

          {/* כפתור יצירה */}
          <LoginButton
            type="button"
            disabled={isLoading || characterCount >= 7}
            onClick={handleOnSubmit}
          >
            {isLoading ? (
              <LoadingContent>
                <LoadingSpinner />
                <span>יוצר דמות...</span>
              </LoadingContent>
            ) : (
              <span>צור דמות חדשה</span>
            )}
          </LoginButton>

          {/* כפתור חזרה */}
          <LoginButton
            type="button"
            onClick={() => navigate('/my-characters')}
            style={{ 
              backgroundColor: '#6c757d', 
              marginTop: '1rem',
              opacity: isLoading ? 0.6 : 1 
            }}
            disabled={isLoading}
          >
            חזור לדמויות שלי
          </LoginButton>
        </FormContainer>

        {/* Decorative Elements */}
        <DecorativeElement topRight />
        <DecorativeElement bottomLeft />
      </LoginCard>
    </Container>
  );
};
