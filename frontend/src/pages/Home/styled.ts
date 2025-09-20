import styled, { css, keyframes } from "styled-components";

import { Zap } from "lucide-react";

// Keyframes for animations
const bounce = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.6; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
`;

const BackgroundElement = styled.div<{
  top: number;
  left: number;
  delay: number;
}>`
  position: absolute;
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #fbbf24, #f97316);
  border-radius: 50%;
  opacity: 0.08;
  animation: ${bounce} ${(props) => 4 + Math.random() * 3}s ease-in-out infinite;
  animation-delay: ${(props) => props.delay}s;
  top: ${(props) => props.top}%;
  left: ${(props) => props.left}%;
`;

const LightningIcon = styled(Zap)<{
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  delay?: number;
}>`
  position: absolute;
  color: #fde047;
  opacity: 0.15;
  animation: ${pulse} 3s ease-in-out infinite;
  animation-delay: ${(props) => props.delay || 0}s;

  ${(props) =>
    props.top &&
    css`
      top: ${props.top};
    `}
  ${(props) =>
    props.right &&
    css`
      right: ${props.right};
    `}
  ${(props) =>
    props.bottom &&
    css`
      bottom: ${props.bottom};
    `}
  ${(props) =>
    props.left &&
    css`
      left: ${props.left};
    `}
`;

const HomeCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  padding: 3rem 2rem;
  width: 100%;
  max-width: 80rem;
  position: relative;
  transform: scale(1);
  transition: transform 0.3s ease;
  box-sizing: border-box;
  
  &:hover {
    transform: scale(1.01);
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${slideIn} 0.8s ease-out;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(to right, #1e40af, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1.25rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ContentSection = styled.div`
  margin-bottom: 3rem;
  animation: ${slideIn} 0.8s ease-out 0.2s both;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const FeatureCard = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid #e2e8f0;
  border-radius: 1.5rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
    border-color: #3b82f6;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right, #3b82f6, #7c3aed);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover::before {
    transform: scaleX(1);
  }
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6, #7c3aed);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.3);
  animation: ${float} 3s ease-in-out infinite;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: #6b7280;
  line-height: 1.6;
  font-size: 1rem;
`;

const ActionSection = styled.div`
  text-align: center;
  animation: ${slideIn} 0.8s ease-out 0.4s both;
`;

const ActionButton = styled.button`
  background: linear-gradient(to right, #10b981, #3b82f6);
  color: white;
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 1.25rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 15px 30px -10px rgba(16, 185, 129, 0.3);
  transform: translateY(0);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    box-shadow: 0 25px 50px -15px rgba(16, 185, 129, 0.4);
    transform: translateY(-3px);
  }

  &:active {
    transform: translateY(-1px);
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, #3b82f6, #10b981);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  & > * {
    position: relative;
    z-index: 1;
  }
`;

const DecorativeElement = styled.div<{
  topRight?: boolean;
  bottomLeft?: boolean;
  topLeft?: boolean;
  bottomRight?: boolean;
}>`
  position: absolute;
  border-radius: 50%;
  animation: ${pulse} 3s ease-in-out infinite;

  ${(props) =>
    props.topRight &&
    css`
      top: -1rem;
      right: -1rem;
      width: 2.5rem;
      height: 2.5rem;
      background: linear-gradient(135deg, #fbbf24, #f97316);
      opacity: 0.15;
    `}

  ${(props) =>
    props.bottomLeft &&
    css`
      bottom: -1rem;
      left: -1rem;
      width: 2rem;
      height: 2rem;
      background: linear-gradient(135deg, #10b981, #3b82f6);
      opacity: 0.15;
      animation-delay: 1s;
    `}

  ${(props) =>
    props.topLeft &&
    css`
      top: -1rem;
      left: -1rem;
      width: 1.5rem;
      height: 1.5rem;
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      opacity: 0.15;
      animation-delay: 0.5s;
    `}

  ${(props) =>
    props.bottomRight &&
    css`
      bottom: -1rem;
      right: -1rem;
      width: 1.75rem;
      height: 1.75rem;
      background: linear-gradient(135deg, #f59e0b, #ef4444);
      opacity: 0.15;
      animation-delay: 1.5s;
    `}
`;

export {
  BackgroundElement,
  Container,
  LightningIcon,
  HomeCard,
  HeaderSection,
  Title,
  Subtitle,
  ContentSection,
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
  ActionSection,
  ActionButton,
  DecorativeElement,
};
