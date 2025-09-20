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
  max-width: 800px;
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

// Character Carousel
export const CharacterCarouselContainer = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

export const CharacterCarousel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

export const CharacterCarouselCell = styled.div<{ isSelected: boolean }>`
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: ${(props) => (props.isSelected ? "scale(1)" : "scale(0.85)")};
  filter: ${(props) => (props.isSelected ? "grayscale(20%)" : "grayscale(100%)")};
  animation: ${(props) => (props.isSelected ? scaleIn : "none")} 0.3s ease-out;

  &:hover {
    transform: scale(0.95);
    filter: grayscale(50%);
  }

  @media (max-width: 768px) {
    transform: ${(props) => (props.isSelected ? "scale(0.9)" : "scale(0.7)")};
    
    &:hover {
      transform: scale(0.8);
    }
  }
`;

export const CharacterCarouselImage = styled.img`
  width: 130px;
  height: 130px;
  border-radius: 15px;
  object-fit: cover;
  border: 3px solid #667eea;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

export const CharacterCarouselInfo = styled.div`
  margin-bottom: 1rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

export const CharacterCarouselName = styled.h3`
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0 0 0.5rem;
  font-weight: 700;
`;

export const CharacterCarouselType = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
`;

export const CharacterCarouselDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

export const CharacterCarouselDot = styled.div<{ isActive: boolean }>`
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

// Character Details
export const CharacterDetails = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

export const CharacterInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

export const CharacterRank = styled.div`
  color: #2c3e50;
  font-size: 1rem;
  
  strong {
    color: #667eea;
  }
`;

export const CharacterWorld = styled.div`
  color: #2c3e50;
  font-size: 1rem;
  
  strong {
    color: #667eea;
  }
`;

export const CharacterDate = styled.div`
  color: #2c3e50;
  font-size: 1rem;
  
  strong {
    color: #667eea;
  }
`;

export const CharacterStatus = styled.div`
  color: #2c3e50;
  font-size: 1rem;
  
  strong {
    color: #667eea;
  }
`;

// Character Stats
export const CharacterStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const CharacterStat = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(102, 126, 234, 0.3);
`;

export const CharacterStatLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

export const CharacterStatValue = styled.div`
  font-size: 1.2rem;
  color: #2c3e50;
  font-weight: 700;
`;

// Status Badges
export const PremiumBadge = styled.div`
  background: linear-gradient(45deg, #f39c12, #e67e22);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export const AdminBadge = styled.div`
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export const BannedBadge = styled.div`
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

// Play Button
export const PlayButton = styled.button<{ isBanned: boolean }>`
  background: ${(props) =>
    props.isBanned
      ? "linear-gradient(45deg, #e74c3c, #c0392b)"
      : "linear-gradient(45deg, #27ae60, #2ecc71)"};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 15px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: ${(props) => (props.isBanned ? "not-allowed" : "pointer")};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  opacity: ${(props) => (props.isBanned ? 0.6 : 1)};

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
`;

export const PlayButtonText = styled.span`
  font-weight: 600;
`;

// No Characters
export const NoCharacters = styled.div`
  text-align: center;
  padding: 3rem 2rem;

  h3 {
    color: #2c3e50;
    margin: 1rem 0 0.5rem;
    font-size: 1.5rem;
  }

  p {
    color: #7f8c8d;
    margin: 0;
    font-size: 1.1rem;
  }
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

// Buttons
export const LoginButton = styled.button`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
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
