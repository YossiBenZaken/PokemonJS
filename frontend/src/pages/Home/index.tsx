import {
  ActionButton,
  ActionSection,
  BackgroundElement,
  Container,
  ContentSection,
  DecorativeElement,
  FeatureCard,
  FeatureDescription,
  FeatureGrid,
  FeatureIcon,
  FeatureTitle,
  HeaderSection,
  HomeCard,
  LightningIcon,
  Subtitle,
  Title
} from "./styled";
import {
  ArrowRight,
  BookOpen,
  Map,
  Play,
  Sword,
  Trophy,
  Users,
} from "lucide-react";

import React from "react";

export const Home: React.FC = () => {
  const backgroundElements = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    top: Math.random() * 80,
    left: Math.random() * 80,
    delay: i * 0.3,
  }));

  const features = [
    {
      icon: <Sword size={32} />,
      title: "Pokemon Battles",
      description: "Engage in epic battles with other trainers and wild Pokemon"
    },
    {
      icon: <Map size={32} />,
      title: "Explore Regions",
      description: "Journey through Kanto, Johto, and other amazing regions"
    },
    {
      icon: <Users size={32} />,
      title: "Trainer Community",
      description: "Connect with fellow trainers and share your adventures"
    },
    {
      icon: <Trophy size={32} />,
      title: "League Challenges",
      description: "Take on gym leaders and become the ultimate champion"
    },
    {
      icon: <BookOpen size={32} />,
      title: "Pokedex Collection",
      description: "Catch and catalog all Pokemon species in your collection"
    },
    {
      icon: <Play size={32} />,
      title: "Mini Games",
      description: "Enjoy fun mini-games and activities between battles"
    }
  ];

  return (
    <Container>
      {/* Background Elements */}
      {backgroundElements.map((element) => (
        <BackgroundElement
          key={element.id}
          top={element.top}
          left={element.left}
          delay={element.delay}
        />
      ))}
      
      {/* Lightning Icons */}
      <LightningIcon size={40} top="2rem" right="3rem" />
      <LightningIcon size={30} bottom="3rem" left="3rem" delay={1} />
      <LightningIcon size={25} top="15%" left="10%" delay={2} />
      <LightningIcon size={35} bottom="20%" right="15%" delay={1.5} />

      {/* Main Content */}
      <HomeCard>
        <HeaderSection>
          <Title>Welcome to Pokemon Adventure</Title>
          <Subtitle>Your journey to become the greatest Pokemon Master begins here!</Subtitle>
        </HeaderSection>

        <ContentSection>
          <FeatureGrid>
            {features.map((feature, index) => (
              <FeatureCard key={index}>
                <FeatureIcon>
                  {feature.icon}
                </FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeatureGrid>
        </ContentSection>

        <ActionSection>
          <ActionButton>
            <span>Start Your Adventure</span>
            <ArrowRight size={20} />
          </ActionButton>
        </ActionSection>

        {/* Decorative Elements */}
        <DecorativeElement topRight />
        <DecorativeElement bottomLeft />
        <DecorativeElement topLeft />
        <DecorativeElement bottomRight />
      </HomeCard>
    </Container>
  );
};
