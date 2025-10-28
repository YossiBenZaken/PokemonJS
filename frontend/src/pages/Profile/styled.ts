import styled, { keyframes } from "styled-components";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

const scaleIn = keyframes`
  from { transform: scale(0.9); opacity: 0; }
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

// Main Card
export const ProfileCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1000px;
  position: relative;
  animation: ${fadeIn} 0.8s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    padding: 2rem;
    max-width: 100%;
  }
`;

// Header Section
export const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

interface ProfileAvatarProps {
  status: 'online' | 'offline';
}

export const ProfileAvatar = styled.div<ProfileAvatarProps>`
  width: 200px;
  height: 200px;
  border-radius: 20px;
  overflow: hidden;
  border: 4px solid ${props => props.status === 'online' ? '#2ecc71' : '#95a5a6'};
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: ${scaleIn} 0.8s ease-out;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    width: 150px;
    height: 150px;
  }
`;

export const ProfileInfo = styled.div`
  flex: 1;

  h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin: 0 0 1rem;
    font-weight: 700;
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    font-size: 1.1rem;
    color: #7f8c8d;
    margin: 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
    }
  }
`;

// Stats Section
export const ProfileStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  animation: ${slideIn} 0.8s ease-out;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 15px;
    border: 2px solid rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
    }

    span {
      font-size: 1.1rem;
      color: #2c3e50;
      font-weight: 600;
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;

    .stat-item {
      padding: 0.8rem;
      font-size: 0.9rem;
    }
  }
`;

// Section
export const ProfileSection = styled.div`
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.8s ease-out;

  h2 {
    font-size: 1.8rem;
    color: #2c3e50;
    margin: 0 0 1.5rem;
    font-weight: 700;
    text-align: center;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -0.5rem;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: linear-gradient(45deg, #667eea, #764ba2);
      border-radius: 2px;
    }
  }

  @media (max-width: 768px) {
    h2 {
      font-size: 1.5rem;
    }
  }
`;

// Grid
export const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;

  .stat-card {
    background: rgba(255, 255, 255, 0.9);
    padding: 1.5rem;
    border-radius: 15px;
    text-align: center;
    border: 2px solid rgba(102, 126, 234, 0.2);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
    }

    h3 {
      font-size: 1rem;
      color: #7f8c8d;
      margin: 0.5rem 0;
      font-weight: 500;
    }

    .stat-value {
      font-size: 2rem;
      color: #667eea;
      font-weight: 700;
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;

    .stat-card {
      padding: 1rem;

      .stat-value {
        font-size: 1.5rem;
      }
    }
  }
`;

// Badge
export const ProfileBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

// Button
export const ProfileButton = styled.button`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Loading
export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Error
export const ErrorMessage = styled.div`
  text-align: center;
  color: white;
  animation: ${fadeIn} 0.8s ease-out;

  h2 {
    font-size: 2rem;
    margin: 0 0 1rem;
    color: #e74c3c;
  }

  p {
    font-size: 1.2rem;
    margin: 0 0 2rem;
    opacity: 0.9;
  }
`;

// Money Cards
export const MoneyCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  border: 2px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
  min-width: 150px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
  }

  h3 {
    font-size: 1.2rem;
    color: #7f8c8d;
    margin: 0.5rem 0;
    font-weight: 500;
  }

  .money-value {
    font-size: 2.5rem;
    color: #f39c12;
    font-weight: 700;
  }
`;
