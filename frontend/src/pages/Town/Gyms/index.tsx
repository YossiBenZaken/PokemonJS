import React from 'react';
import styled from 'styled-components';

const GymsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const WelcomeBox = styled.div`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  color: white;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const ComingSoonBox = styled.div`
  background: white;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
`;

const ComingSoonIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const ComingSoonTitle = styled.h2`
  color: #4a90e2;
  margin-bottom: 15px;
`;

const ComingSoonText = styled.p`
  color: #666;
  font-size: 18px;
  line-height: 1.6;
`;

const GymsPage: React.FC = () => {
  return (
    <GymsContainer>
      <WelcomeBox>
        <h1>🏟️ גימנסיות</h1>
        <p>
          התמודדו עם מנהיגי הגימנסיה כדי לקבל תגים ולפתוח אזורים חדשים!
          <br />
          כל גימנסיה מציעה אתגר ייחודי ומנהיג חזק.
        </p>
      </WelcomeBox>

      <ComingSoonBox>
        <ComingSoonIcon>🚧</ComingSoonIcon>
        <ComingSoonTitle>בקרוב!</ComingSoonTitle>
        <ComingSoonText>
          מערכת הגימנסיות נמצאת בפיתוח.
          <br />
          בקרוב תוכלו להתמודד עם מנהיגי הגימנסיה החזקים ביותר!
        </ComingSoonText>
      </ComingSoonBox>
    </GymsContainer>
  );
};

export default GymsPage;
