import React, { useEffect, useState } from 'react';

import Loader from '../../components/Loader';
import { getLeaderboardsSummary } from '../../api/leaderboards.api';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 500px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
  color: white;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
`;

const BoardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
`;

const Board = styled.div`
  background: rgba(255,255,255,0.08);
  border: 1px solid #577599;
  border-radius: 10px;
  padding: 12px;
  color: #eaeaea;
`;

const BoardTitle = styled.h3`
  margin: 0 0 8px 0;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  font-size: 14px;
  &:last-child { border-bottom: none; }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const PokeImg = styled.img`
  width: 28px;
  height: 28px;
  image-rendering: pixelated;
`;

const CharImg = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 4px;
`;

const LeaderboardsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const res = await getLeaderboardsSummary();
        if (res.success && res.data) setData(res.data);
      } catch (e:any) {
        setError(e.response?.data?.message || 'שגיאה בטעינת הטבלאות');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <Container>
      <Header>
        <Title>טבלאות מובילים</Title>
      </Header>
      {error && <div className="red">{error}</div>}

      <BoardsGrid>
        <Board>
          <BoardTitle>חזקים ביותר</BoardTitle>
          {data?.strongest?.map((r:any, i:number) => (
            <Row key={i}>
              <Left>
                <PokeImg src={require(`../../assets/images/pokemon/${r.wild_id}.gif`)} alt={r.naam} />
                <span>{i+1}. {r.username} — {r.naam}</span>
              </Left>
              <span>{Number(r.powerTotal).toLocaleString()}</span>
            </Row>
          ))}
        </Board>

        <Board>
          <BoardTitle>הכי מנוסים</BoardTitle>
          {data?.experienced?.map((r:any, i:number) => (
            <Row key={i}>
              <Left>
                <PokeImg src={require(`../../assets/images/pokemon/${r.wild_id}.gif`)} alt={r.naam} />
                <span>{i+1}. {r.username} — {r.naam}</span>
              </Left>
              <span>{Number(r.totalexp).toLocaleString()}</span>
            </Row>
          ))}
        </Board>

        <Board>
          <BoardTitle>מיליונרים</BoardTitle>
          {data?.millionaires?.map((r:any, i:number) => (
            <Row key={i}>
              <Left>
                <CharImg src={require(`../../assets/images/characters/${r.character}/Thumb.png`)} alt={r.username} onError={(e:any)=>{e.target.style.display='none';}} />
                <span>{i+1}. {r.username}</span>
              </Left>
              <span>{Number(r.total).toLocaleString()} Silver</span>
            </Row>
          ))}
        </Board>

        <Board>
          <BoardTitle>אספני Lv.100</BoardTitle>
          {data?.collectors100?.map((r:any, i:number) => (
            <Row key={i}>
              <Left>
                <CharImg src={require(`../../assets/images/characters/${r.character}/Thumb.png`)} alt={r.username} onError={(e:any)=>{e.target.style.display='none';}} />
                <span>{i+1}. {r.username}</span>
              </Left>
              <span>{Number(r.total).toLocaleString()}</span>
            </Row>
          ))}
        </Board>

        <Board>
          <BoardTitle>דו-קרביסטים</BoardTitle>
          {data?.duelists?.map((r:any, i:number) => (
            <Row key={i}>
              <Left>
                <CharImg src={require(`../../assets/images/characters/${r.character}/Thumb.png`)} alt={r.username} onError={(e:any)=>{e.target.style.display='none';}} />
                <span>{i+1}. {r.username}</span>
              </Left>
              <span>{Number(r.gevechten).toLocaleString()}</span>
            </Row>
          ))}
        </Board>
      </BoardsGrid>
    </Container>
  );
};

export default LeaderboardsPage;


