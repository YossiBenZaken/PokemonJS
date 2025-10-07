import styled, { keyframes } from "styled-components";

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

const Events = styled("div")(() => ({
  marginRight: '1rem',
  width: 245,
  img: {
    marginRight: 3,
    width: 45,
    textAlign: "right",
    float: "right",
    cursor: "pointer",
  },
}));

export {
  UserMenu,
  UserMenuItem,
  Badges,
  Events,
};
