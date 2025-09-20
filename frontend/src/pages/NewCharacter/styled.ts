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
  max-width: 600px;
  position: relative;
  animation: ${fadeIn} 0.8s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    padding: 2rem;
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

// Character Count Info
export const CharacterCountInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(52, 152, 219, 0.1);
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(52, 152, 219, 0.3);

  span {
    color: #2980b9;
    font-weight: 600;
    font-size: 1rem;
  }
`;

export const GoldInfo = styled.div`
  margin-left: auto;

  span {
    color: #f39c12;
    font-weight: 600;
    font-size: 0.9rem;
  }
`;

// Alert Messages
export const AlertContainer = styled.div`
  margin-bottom: 1.5rem;
`;

export const AlertMessage = styled.div<{ type: "success" | "error" }>`
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
  animation: ${fadeIn} 0.3s ease-out;

  ${(props) =>
    props.type === "success"
      ? `
    background: rgba(46, 204, 113, 0.1);
    color: #27ae60;
    border: 1px solid rgba(46, 204, 113, 0.3);
  `
      : `
    background: rgba(231, 76, 60, 0.1);
    color: #c0392b;
    border: 1px solid rgba(231, 76, 60, 0.3);
  `}
`;

// Form Container
export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// Input Groups
export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  z-index: 2;
  color: #7f8c8d;
`;

export const Input = styled.input<{ hasicon?: boolean }>`
  width: 100%;
  padding: 1rem ${(props) => (props.hasicon ? "3rem" : "1rem")};
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  }

  &::placeholder {
    color: #bdc3c7;
  }
`;

// World Select
export const WorldSelect = styled.select`
  width: 100%;
  padding: 1rem 3rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  }

  option {
    padding: 0.5rem;
    font-size: 1rem;
  }
`;

// Character Grid
export const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.5rem;
  }
`;

export const CharacterCard = styled.div<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${(props) => (props.isSelected ? "#667eea" : "transparent")};
  background: ${(props) =>
    props.isSelected ? "rgba(102, 126, 234, 0.1)" : "rgba(255, 255, 255, 0.7)"};

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    background: ${(props) =>
      props.isSelected
        ? "rgba(102, 126, 234, 0.15)"
        : "rgba(255, 255, 255, 0.9)"};
  }

  &:active {
    transform: translateY(-2px);
  }
`;

export const CharacterImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.5rem;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

export const CharacterName = styled.span<{ isSelected: boolean }>`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${(props) => (props.isSelected ? "#667eea" : "#2c3e50")};
  text-align: center;
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

// Loading States
export const LoadingContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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

// Responsive Design
export const Select = styled.select`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;
