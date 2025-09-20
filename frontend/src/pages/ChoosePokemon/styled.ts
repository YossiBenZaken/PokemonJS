import styled, { keyframes } from "styled-components";

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

const scaleIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0,-30px,0); }
  70% { transform: translate3d(0,-15px,0); }
`;

// Container
export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// Background Elements
export const BackgroundElement = styled.div<{
  top: number;
  left: number;
  delay: number;
}>`
  position: absolute;
  top: ${(props) => props.top}%;
  left: ${(props) => props.left}%;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: ${float} 6s ease-in-out infinite;
  animation-delay: ${(props) => props.delay}s;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

// Lightning Icons
export const LightningIcon = styled.div<{
  size: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  delay?: number;
}>`
  position: absolute;
  top: ${(props) => props.top || "auto"};
  bottom: ${(props) => props.bottom || "auto"};
  left: ${(props) => props.left || "auto"};
  right: ${(props) => props.right || "auto"};
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  border-radius: 50%;
  animation: ${float} 4s ease-in-out infinite;
  animation-delay: ${(props) => props.delay || 0}s;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
`;

// Main Card
export const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 900px;
  position: relative;
  animation: ${fadeIn} 0.8s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    padding: 2rem;
    max-width: 100%;
  }
`;

// Header Section
export const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  animation: ${slideIn} 0.8s ease-out;
`;

export const PokeballIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #ff0000, #cc0000);
  border-radius: 50%;
  margin: 0 auto 1rem;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background: #ffffff;
    border-radius: 50%;
    border: 3px solid #000000;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 30px;
    background: #ffffff;
    border-radius: 30px 30px 0 0;
    border-bottom: 3px solid #000000;
  }
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0 0 0.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
  font-weight: 400;
`;

// Professor Oak Section
export const ProfessorOak = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(243, 156, 18, 0.1);
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  border: 2px solid rgba(243, 156, 18, 0.3);
  animation: ${fadeIn} 0.8s ease-out;
`;

export const ProfessorMessage = styled.p`
  color: #2c3e50;
  font-size: 1.1rem;
  font-style: italic;
  margin: 0;
  line-height: 1.6;
`;

// Pokemon Carousel
export const PokemonCarouselContainer = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

export const PokemonCarousel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

export const PokemonCarouselCell = styled.div<{ isSelected: boolean }>`
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: ${(props) => (props.isSelected ? "scale(1.1)" : "scale(0.9)")};
  filter: ${(props) => (props.isSelected ? "grayscale(0%)" : "grayscale(30%)")};
  animation: ${(props) => (props.isSelected ? scaleIn : "none")} 0.3s ease-out;

  &:hover {
    transform: scale(1.05);
    filter: grayscale(0%);
  }

  @media (max-width: 768px) {
    transform: ${(props) => (props.isSelected ? "scale(1)" : "scale(0.8)")};
    
    &:hover {
      transform: scale(0.9);
    }
  }
`;

export const PokemonCarouselImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 20px;
  object-fit: contain;
  border: 4px solid #667eea;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
`;

export const PokemonCarouselInfo = styled.div`
  margin-bottom: 1rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

export const PokemonCarouselName = styled.h3`
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0 0 0.5rem;
  font-weight: 700;
`;

export const PokemonCarouselType = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #667eea;
`;

export const PokemonCarouselDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

export const PokemonCarouselDot = styled.div<{ isActive: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) => (props.isActive ? "#667eea" : "#bdc3c7")};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.isActive ? "#5a6fd8" : "#95a5a6")};
    transform: scale(1.2);
  }
`;

// Type Badges
export const TypeContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const TypeBadge = styled.div`
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  min-width: 50px;
  text-align: center;
`;

// Pokemon Stats
export const PokemonStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.8);
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid rgba(102, 126, 234, 0.2);

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
    padding: 1rem;
  }
`;

export const PokemonStat = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
  }
`;

export const PokemonStatLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
`;

export const PokemonStatValue = styled.div`
  font-size: 1.3rem;
  color: #2c3e50;
  font-weight: 700;
`;

// Pokemon Description
export const PokemonDescription = styled.div`
  background: rgba(255, 255, 255, 0.8);
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  border: 2px solid rgba(102, 126, 234, 0.2);

  p {
    margin: 0.5rem 0;
    color: #2c3e50;
    font-size: 1rem;
    line-height: 1.6;

    strong {
      color: #667eea;
    }
  }
`;

// Choose Button
export const ChooseButton = styled.button`
  background: linear-gradient(45deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  padding: 1.2rem 2.5rem;
  border-radius: 15px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(39, 174, 96, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  @media (max-width: 768px) {
    padding: 1rem 2rem;
    font-size: 1rem;
  }
`;

export const ChooseButtonText = styled.span`
  font-weight: 600;
`;

// Loading States
export const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
`;

export const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Success Message
export const SuccessMessage = styled.div`
  text-align: center;
  animation: ${bounce} 1s ease-out;
`;

export const SuccessIcon = styled.div`
  margin-bottom: 1rem;
  animation: ${bounce} 1s ease-out 0.5s both;
`;

export const SuccessText = styled.div`
  margin-bottom: 2rem;

  h2 {
    color: #27ae60;
    font-size: 1.8rem;
    margin: 1rem 0;
  }

  p {
    color: #2c3e50;
    font-size: 1.1rem;
    margin: 0.5rem 0;
  }
`;

export const SuccessStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  background: rgba(39, 174, 96, 0.1);
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid rgba(39, 174, 96, 0.3);

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const SuccessStat = styled.div`
  text-align: center;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  border: 1px solid rgba(39, 174, 96, 0.3);
`;

export const SuccessStatLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.3rem;
  font-weight: 500;
`;

export const SuccessStatValue = styled.div`
  font-size: 1.2rem;
  color: #27ae60;
  font-weight: 700;
`;

// Decorative Elements
export const DecorativeElement = styled.div<{
  topRight?: boolean;
  bottomLeft?: boolean;
}>`
  position: absolute;
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 50%;
  opacity: 0.1;

  ${(props) =>
    props.topRight &&
    `
    top: -50px;
    right: -50px;
  `}

  ${(props) =>
    props.bottomLeft &&
    `
    bottom: -50px;
    left: -50px;
  `}
`;
