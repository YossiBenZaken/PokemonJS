import styled from "styled-components";

const Container = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100vh;
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

const FilterBox = styled.div`
  background: #1c3248;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  color: white;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  align-items: center;
`;

export {
    Container,FilterBox,FilterRow,Header,Title
}