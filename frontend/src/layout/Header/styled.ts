import styled, { css, keyframes } from "styled-components";

import { Link } from "react-router-dom";
import eventos from '../../assets/images/layout/eventos.png';
import gold from "../../assets/images/layout/Gold.png";
import logo from '../../assets/images/layout/Logo/logo4.png'
import plus from "../../assets/images/layout/plus.png";
import silvers from "../../assets/images/layout/silvers.png";

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
  }
`;


const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: #6b7280;
  text-decoration: none;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;

  &:hover {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
    transform: translateY(-2px);
  }

  &.active {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 3px;
      background: linear-gradient(to right, #3b82f6, #7c3aed);
      border-radius: 2px;
    }
  }

  span {
    @media (max-width: 1200px) {
      display: none;
    }
  }
`;

const UserMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  min-width: 200px;
  animation: ${slideDown} 0.3s ease-out;
  z-index: 1001;
`;

const UserMenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0.5rem;
  margin: 0.25rem;

  &:hover {
    background: #f3f4f6;
    color: #3b82f6;
  }

  span {
    font-weight: 500;
  }
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;

  @media (max-width: 640px) {
    gap: 0.5rem;
  }
`;

const AuthButton = styled.button<{ variant: "primary" | "outline" }>`
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;

  ${(props) =>
    props.variant === "primary"
      ? css`
          background: linear-gradient(to right, #3b82f6, #7c3aed);
          color: white;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
          }
        `
      : css`
          background: transparent;
          color: #3b82f6;
          border: 2px solid #3b82f6;

          &:hover {
            background: #3b82f6;
            color: white;
            transform: translateY(-2px);
          }
        `}

  @media (max-width: 640px) {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    min-width: 70px;
  }
`;

const AuthLink = styled(Link)`
  text-decoration: none;
`;


const HeaderHubContainer = styled("div")(() => ({
  width: 1010,
  height: "auto !important",
  paddingBottom: 5,
  margin: "0 auto",
  display: 'flex'
}));

const HeaderHub = styled("div")(() => ({
  width: 990,
  height: 270,
  margin: "0 auto",
  display: 'flex',
  flexDirection: 'column'
}));

const Hub = styled("div")(() => ({
  display: "flex",
  paddingTop: 30,
  width: "100%",
  position: 'relative'
}));

const HubHud = styled("ul")(() => ({
  display: "flex",
  listStyle: "none",
  alignItems: 'stretch',
  flexDirection: 'row',
  position:'relative',
  width: '100%',
  justifyContent:'end'
}));

const HubHudLine = styled("li")(() => ({
}));

const Silvers = styled("div")(() => ({
  background: `url(${silvers}) no-repeat`,
  display: "inline-block",
  height: 45,
  textAlign: "center",
  paddingTop: 10,
  width: 120,
  position: 'relative',
  "> p": {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
    marginRight: 20,
    width: "46%",
  },
}));
const Golds = styled("div")(() => ({
  background: `url(${gold}) no-repeat`,
  display: "inline-block",
  height: 45,
  textAlign: "center",
  paddingTop: 10,
  width: 120,
  position: 'relative',
  "> p": {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
    marginRight: 20,
    width: "46%",
  },
}));

const Add = styled("div")(() => ({
  position: 'absolute',
  right: 0,
  width: 45,
  height: 45,
  marginRight: -26,
  marginTop: -7,
  background: `url(${plus}) no-repeat`,
}));

const Badges = styled("span")(() => ({
  backgroundColor: "red",
  border: "1px solid white",
  borderRadius: "50%",
  width: 18,
  height: 18,
  color: "white",
  lineHeight: "18px",
  fontSize: 10,
  textAlign: "center",
  display: "inline-block",
  verticalAlign: "middle",
}));

const HubLogo = styled('div')(() => ({
  width: 401,
  height: 200,
  background: `url(${logo}) no-repeat center`,
  backgroundSize: 'cover',
}));

const MyPokemon = styled('div')(() => ({
  float: 'left',
  display: 'flex',
  '> div.icon': {
    background: `url(${eventos}) no-repeat`,
    marginLeft: 2,
    width: 44,
    height: 44,
    borderRadius: 5,
    verticalAlign: 'bottom',
    '> div': {
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      margin: '0 2px',
      width: 42,
      height: 42,
      display: 'inline-block'
    }
  }
}))

export {
  HeaderContainer,
  HeaderContent,
  Navigation,
  NavLink,
  UserMenu,
  UserMenuItem,
  AuthSection,
  AuthButton,
  AuthLink,
  HeaderHubContainer,
  HeaderHub,
  Hub,
  HubHud,
  HubHudLine,
  Silvers,
  Add,
  Golds,
  Badges,
  HubLogo,
  MyPokemon
};
