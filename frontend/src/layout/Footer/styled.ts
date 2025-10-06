import styled from "styled-components";

const FooterContainer = styled.footer`
  width: 100%;
  background: #222;
  color: #fff;
  padding: 1rem 0;
  position: fixed;
  bottom: 0;
  z-index: 100;
`;

const OnlineSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const OnlineList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const OnlineUserName = styled.span<{
  admin?: number;
  dv?: number;
  rang?: number;
  premium?: boolean;
}>`
  font-weight: bold;
  color: ${({ admin, dv, rang, premium }) =>
    admin === 1
      ? "#A1FF77"
      : admin === 2
      ? "#FF3030"
      : admin === 3
      ? "yellow"
      : dv === 1
      ? "orange"
      : premium
      ? "#f39c12"
      : rang && rang >= 1 && rang <= 4
      ? "black"
      : "#fff"};
  text-shadow: #000 1px -1px 2px, #000 -1px 1px 2px, #000 1px 1px 2px,
    #000 -1px -1px 2px;
  margin-right: 0.5rem;
  cursor: pointer;
`;

export { FooterContainer, OnlineList, OnlineSection, OnlineUserName };
