import {
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
  LoginLink,
  LoginSection,
  PasswordToggle,
  PokeballIcon,
  RegisterButton,
  RegisterCard,
  Subtitle,
  TermsRow,
  Title,
} from "./styled";
import { BookUser, Eye, EyeOff, Lock, Mail, Shield, User } from "lucide-react";
import React, { useState } from "react";

import { Register } from "../../api/auth.api";
import { RegisterRequest } from "../../models/register.model";
import { useNavigate } from "react-router-dom";

export const SignupPage: React.FC = () => {
  let navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (!acceptTerms) {
      alert("Please accept the terms and conditions");
      return;
    }
    const request = new RegisterRequest(username, email, password, confirmPassword, referral, acceptTerms);
    setIsLoading(true);
    try {
      await Register(request);
      setIsLoading(false);
      navigate("/login");
    } catch (err: any) {
      setIsLoading(false);
      console.error("Registration failed:", err);
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

      <RegisterCard>
        <HeaderSection>
          <PokeballIcon />
          <Title>Join Pokemon Adventure</Title>
          <Subtitle>
            Create your trainer account and begin your journey!
          </Subtitle>
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
                placeholder="Choose your trainer name"
                required
              />
            </InputWrapper>
          </InputGroup>

          {/* Email Field */}
          <InputGroup>
            <Label>Email Address</Label>
            <InputWrapper>
              <InputIcon>
                <Mail size={20} />
              </InputIcon>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
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
                placeholder="Create a strong password"
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

          {/* Confirm Password Field */}
          <InputGroup>
            <Label>Confirm Password</Label>
            <InputWrapper>
              <InputIcon>
                <Shield size={20} />
              </InputIcon>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                hasicon
                required
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </InputWrapper>
          </InputGroup>

          {/* Referral Field */}
          <InputGroup>
            <Label>Referral</Label>
            <InputWrapper>
              <InputIcon>
                <BookUser size={20} />
              </InputIcon>
              <Input
                type={"text"}
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
                placeholder="Referral"
                hasicon
                required
              />
            </InputWrapper>
          </InputGroup>

          {/* Terms and Conditions */}
          <TermsRow>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <span>I accept the terms and conditions</span>
            </CheckboxLabel>
          </TermsRow>

          {/* Register Button */}
          <RegisterButton
            type="button"
            disabled={isLoading}
            onClick={handleOnSubmit}
          >
            {isLoading ? (
              <LoadingContent>
                <LoadingSpinner />
                <span>Creating Account...</span>
              </LoadingContent>
            ) : (
              <span>Create Account</span>
            )}
          </RegisterButton>
        </FormContainer>

        {/* Login Link */}
        <LoginSection>
          <p>
            Already have an account?{" "}
            <LoginLink href="/login">Sign in here</LoginLink>
          </p>
        </LoginSection>

        {/* Decorative Elements */}
        <DecorativeElement topRight />
        <DecorativeElement bottomLeft />
      </RegisterCard>
    </Container>
  );
};
