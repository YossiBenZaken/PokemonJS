import styled, { keyframes } from 'styled-components';

import React from 'react';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a90e2;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
`;

const LoaderText = styled.p`
  margin-top: 20px;
  color: #666;
  font-size: 16px;
`;

const Loader: React.FC = () => {
  return (
    <LoaderContainer>
      <div style={{ textAlign: 'center' }}>
        <Spinner />
        <LoaderText>טוען...</LoaderText>
      </div>
    </LoaderContainer>
  );
};

export default Loader;
