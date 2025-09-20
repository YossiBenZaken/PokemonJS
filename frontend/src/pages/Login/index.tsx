import {
  BackgroundElement,
  Checkbox,
  CheckboxLabel,
  Container,
  DecorativeElement,
  ForgotLink,
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
  LoginButton,
  LoginCard,
  PasswordToggle,
  PokeballIcon,
  RememberForgotRow,
  SignUpLink,
  SignUpSection,
  Subtitle,
  Title,
} from "./styled";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import React, { useState } from "react";

import { Login } from "../../api/auth.api";
import { LoginRequest } from "../../models/login.model";
import { useNavigate } from "react-router-dom";

export const LoginPage: React.FC = () => {
  let navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const request = new LoginRequest(username, password);
    setIsLoading(true);
    try {
      await Login(request);
      setIsLoading(false);
      navigate('/my-characters');
    } catch (err: any) {
    }
  };

  const backgroundElements = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    top: Math.random() * 80,
    left: Math.random() * 80,
    delay: i * 0.5,
  }));

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
          <Title>Pokemon Adventure</Title>
          <Subtitle>Begin your journey, Trainer!</Subtitle>
        </HeaderSection>
        <FormContainer>
          {/* Username Field */}
          <InputGroup>
            <Label>Trainer Name</Label>
            <InputWrapper>
              <InputIcon>
                <User size={20} />
              </InputIcon>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your trainer name"
                required
              />
            </InputWrapper>
          </InputGroup>

          {/* Password Field */}
          <InputGroup>
            <Label>Password</Label>
            <InputWrapper>
              <InputIcon>
                <Lock size={20} />
              </InputIcon>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                hasicon
                required
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </InputWrapper>
          </InputGroup>

          {/* Remember Me & Forgot Password */}
          <RememberForgotRow>
            <CheckboxLabel>
              <Checkbox type="checkbox" />
              <span>Remember me</span>
            </CheckboxLabel>
            <ForgotLink href="#">Forgot password?</ForgotLink>
          </RememberForgotRow>

          {/* Login Button */}
          <LoginButton
            type="button"
            disabled={isLoading}
            onClick={handleOnSubmit}
          >
            {isLoading ? (
              <LoadingContent>
                <LoadingSpinner />
                <span>Starting Adventure...</span>
              </LoadingContent>
            ) : (
              <span>Start Adventure</span>
            )}
          </LoginButton>
        </FormContainer>
        {/* Sign Up Link */}
        <SignUpSection>
          <p>
            New trainer? <SignUpLink onClick={() => navigate('/signUp')}>Create an account</SignUpLink>
          </p>
        </SignUpSection>

        {/* Decorative Elements */}
        <DecorativeElement topRight />
        <DecorativeElement bottomLeft />
      </LoginCard>
    </Container>
  );
};
