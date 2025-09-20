import React, { useEffect, useState } from 'react';
import { getVault, tryVault } from '../../../api/casino.api';

import styled from 'styled-components';
import { useGame } from '../../../contexts/GameContext';

const Page = styled.div``;

const Header = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 7px;
  > div { flex: 1; }
  h3 { margin: 0; font-weight: 600; }
`;

const Box = styled.div`
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #fff;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  thead th {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 14px;
    text-align: center;
  }
  td { text-align: center; padding: 10px; }
`;

const Select = styled.select`
  width: 70px;
  padding: 6px;
`;

const Submit = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Alert = styled.div<{ kind: 'success' | 'error' }>`
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  font-weight: 600;
  color: ${p => (p.kind === 'success' ? '#155724' : '#721c24')};
  background: ${p => (p.kind === 'success' ? '#d4edda' : '#f8d7da')};
  border: 1px solid ${p => (p.kind === 'success' ? '#c3e6cb' : '#f5c6cb')};
`;

const Vault: React.FC = () => {
  const { selectedCharacter } = useGame();
  const userId = selectedCharacter?.user_id;

  const [prize, setPrize] = useState<number>(0);
  const [cost, setCost] = useState<number>(200);
  const [code1, setCode1] = useState<number>(0);
  const [code2, setCode2] = useState<number>(0);
  const [code3, setCode3] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getVault();
      if (data.success) {
        setPrize(data.prize);
        setCost(data.attemptCost);
      }
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const data = await tryVault(userId, code1, code2, code3);
      if (data.success) {
        if (data.won) {
          setMessage({ kind: 'success', text: `כל הכבוד! הזנת קוד נכון וזכית ב-${data.prize} Tickets!` });
          // אחרי זכייה, הפרס נאפס ל-1000
          setPrize(1000);
        } else {
          setMessage({ kind: 'error', text: 'לצערנו הקוד שגוי.' });
          // מגדילים פרס ב-200 בכל ניסיון
          if (typeof data.newPrize === 'number') setPrize(data.newPrize);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page>
      <Header>
        <div className="box-content"><h3>Prêmio Atual: {prize.toLocaleString()} Tickets</h3></div>
        <div className="box-content"><h3>עלות ניסיון: {cost} Tickets</h3></div>
      </Header>

      <Box className="box-content">
        <Table className="general">
          <thead>
            <tr><th>Quebre o segredo</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <form onSubmit={onSubmit}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                    <Select value={code1} onChange={e => setCode1(Number(e.target.value))}>
                      {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                    </Select>
                    <Select value={code2} onChange={e => setCode2(Number(e.target.value))}>
                      {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                    </Select>
                    <Select value={code3} onChange={e => setCode3(Number(e.target.value))}>
                      {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                    </Select>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Submit disabled={isLoading}>{isLoading ? 'בודק…' : 'Tentar!'}</Submit>
                  </div>
                </form>
                {message && <Alert kind={message.kind}>{message.text}</Alert>}
              </td>
            </tr>
          </tbody>
        </Table>
      </Box>
    </Page>
  );
};

export default Vault;


