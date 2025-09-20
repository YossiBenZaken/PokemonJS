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

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
  overflow: hidden;
`;

const BackgroundElement = styled.div<{
  top: number;
  left: number;
  delay: number;
}>`
  position: absolute;
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #fbbf24, #f97316);
  border-radius: 50%;
  opacity: 0.1;
  animation: ${bounce} ${(props) => 3 + Math.random() * 2}s ease-in-out infinite;
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
  opacity: 0.2;
  animation: ${pulse} 2s ease-in-out infinite;
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

const RegisterCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 2rem;
  width: 100%;
  max-width: 28rem;
  position: relative;
  transform: scale(1);
  transition: transform 0.3s ease;
  box-sizing: border-box;
  &:hover {
    transform: scale(1.02);
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const PokeballIcon = styled.div`
  width: 5rem;
  height: 5rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);
  transform: rotate(0deg);
  transition: transform 0.3s ease;
  position: relative;

  &:hover {
    transform: rotate(12deg);
  }

  &::after {
    content: "";
    width: 2rem;
    height: 2rem;
    background: white;
    border-radius: 50%;
  }

  &::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 2px;
    background: #1f2937;
    top: 50%;
    transform: translateY(-50%);
  }
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: bold;
  background: linear-gradient(to right, #2563eb, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1rem;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const Input = styled.input<{ hasicon?: boolean }>`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #f9fafb;
  outline: none;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-sizing: border-box;
  ${(props) =>
    props.hasicon &&
    css`
      padding-right: 3rem;
    `}

  &:hover {
    background: white;
  }

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #4b5563;
  }
`;

const TermsRow = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #374151;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  color: #3b82f6;
  border: 2px solid #d1d5db;
  border-radius: 0.25rem;
  margin-right: 0.5rem;

  &:focus {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const RegisterButton = styled.button`
  width: 100%;
  background: linear-gradient(to right, #10b981, #3b82f6);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1.125rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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

const LoadingSpinner = styled.div`
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const LoginSection = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: #6b7280;
`;

const LoginLink = styled.a`
  color: #3b82f6;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: #1d4ed8;
  }
`;

const DecorativeElement = styled.div<{
  topRight?: boolean;
  bottomLeft?: boolean;
}>`
  position: absolute;
  border-radius: 50%;
  animation: ${pulse} 2s ease-in-out infinite;

  ${(props) =>
    props.topRight &&
    css`
      top: -1rem;
      right: -1rem;
      width: 2rem;
      height: 2rem;
      background: linear-gradient(135deg, #fbbf24, #f97316);
      opacity: 0.2;
    `}

  ${(props) =>
    props.bottomLeft &&
    css`
      bottom: -1rem;
      left: -1rem;
      width: 1.5rem;
      height: 1.5rem;
      background: linear-gradient(135deg, #10b981, #3b82f6);
      opacity: 0.2;
      animation-delay: 1s;
    `}
`;

export {
  BackgroundElement,
  Checkbox,
  CheckboxLabel,
  Container,
  DecorativeElement,
  FormContainer,
  HeaderSection,
  Input,
  InputGroup,
  InputIcon,
  InputWrapper,
  Label,
  LightningIcon,
  LoadingContent,
  LoadingSpinner,
  RegisterButton,
  RegisterCard,
  PasswordToggle,
  PokeballIcon,
  TermsRow,
  LoginLink,
  LoginSection,
  Subtitle,
  Title,
};
