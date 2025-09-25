import { Outlet } from "react-router-dom";
import React from "react";
import styled from "styled-components";

const Container = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100%;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
  color: white;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const InformationPage: React.FC = () => {
  return (
    <Container>
      <Header>
        <Title>מידע</Title>
      </Header>

      <Outlet />
    </Container>
  );
};

export default InformationPage;
