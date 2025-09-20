import React, { useEffect, useState } from "react";
import {
  StoreItem,
  buyStoreItem,
  buyTickets,
  getStoreItems,
  sellTickets,
} from "../../../api/casino.api";

import styled from "styled-components";
import { useGame } from "../../../contexts/GameContext";

const TICKET_ICON = require("../../../assets/images/icons/ticket.png");

const Page = styled.div``;

const Header = styled.div`
  margin-bottom: 7px;
  h3 {
    margin: 0;
    font-weight: 600;
  }
  img {
    width: 20px;
    height: 20px;
    vertical-align: middle;
    margin: 0 6px;
  }
`;

const Box = styled.div`
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #fff;
  margin-bottom: 15px;
  padding: 12px;
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
  td {
    text-align: center;
    padding: 10px;
    border-bottom: 1px solid #dee2e6;
  }
`;

const Input = styled.input`
  width: 60px;
  text-align: center;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-right: 8px;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 160px);
  gap: 12px;
  justify-content: center;
  margin-top: 15px;
`;

const ItemCard = styled.div`
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #fafafa;
  text-align: center;
  padding: 10px;
  font-size: 14px;
`;

const Message = styled.div<{ kind: "success" | "error" }>`
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  font-weight: 600;
  color: ${(p) => (p.kind === "success" ? "#155724" : "#721c24")};
  background: ${(p) => (p.kind === "success" ? "#d4edda" : "#f8d7da")};
  border: 1px solid ${(p) => (p.kind === "success" ? "#c3e6cb" : "#f5c6cb")};
  text-align: center;
`;

const CasinoStore: React.FC = () => {
  const { selectedCharacter, setSelectedCharacter } = useGame();
  const [buyQty, setBuyQty] = useState(1);
  const [sellQty, setSellQty] = useState(1);
  const [items, setItems] = useState<StoreItem[]>([]);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const loadItems = async () => {
    const { success, items } = await getStoreItems();
    if (success) setItems(items);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const doBuyTickets = async () => {
    const res = await buyTickets(selectedCharacter!.user_id, buyQty);
    if (res.success) {
      const newChar = { ...selectedCharacter!, tickets: selectedCharacter!.tickets + res.ticketsGained };
      setSelectedCharacter(newChar);
      setMessage({ kind: "success", text: `קנית ${res.ticketsGained} Tickets!` });
    } else {
      setMessage({ kind: "error", text: res.message });
    }
  };

  const doSellTickets = async () => {
    const res = await sellTickets(selectedCharacter!.user_id, sellQty);
    if (res.success) {
      const newChar = { ...selectedCharacter!, tickets: selectedCharacter!.tickets - sellQty * 50 };
      setSelectedCharacter(newChar);
      setMessage({ kind: "success", text: `מכרת ${sellQty * 50} Tickets וקיבלת ${res.silversGained} Silvers!` });
    } else {
      setMessage({ kind: "error", text: res.message });
    }
  };

  const doBuyItem = async (itemId: number, price: number) => {
    const res = await buyStoreItem(selectedCharacter!.user_id, itemId);
    if (res.success) {
      const newChar = { ...selectedCharacter!, tickets: selectedCharacter!.tickets - price };
      setSelectedCharacter(newChar);
      setMessage({ kind: "success", text: res.message });
    } else {
      setMessage({ kind: "error", text: res.message });
    }
  };

  return (
    <Page>
      <Header>
        <h3>
          Tickets במלאי:
          <img src={TICKET_ICON} alt="Tickets" />
          {selectedCharacter?.tickets.toLocaleString()}
        </h3>
      </Header>

      <Box>
        <Table>
          <thead>
            <tr>
              <th>קנה / מכור Tickets</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div>
                  <Input
                    type="number"
                    value={buyQty}
                    min={1}
                    onChange={(e) => setBuyQty(Number(e.target.value))}
                  />
                  <ActionButton onClick={doBuyTickets}>
                    קנה {buyQty * 50} Tickets ב־{buyQty * 2500} Silvers
                  </ActionButton>
                </div>
                <div style={{ marginTop: 10 }}>
                  <Input
                    type="number"
                    value={sellQty}
                    min={1}
                    onChange={(e) => setSellQty(Number(e.target.value))}
                  />
                  <ActionButton onClick={doSellTickets}>
                    מכור {sellQty * 50} Tickets וקבל {sellQty * 1250} Silvers
                  </ActionButton>
                </div>
              </td>
            </tr>
          </tbody>
        </Table>
      </Box>

      <Box>
        <Table>
          <thead>
            <tr>
              <th>פריטים לקנייה ב־Tickets</th>
            </tr>
          </thead>
        </Table>
        <StoreGrid>
          {items.map((it) => (
            <ItemCard key={it.id}>
              <div>{it.name}</div>
              <div style={{ margin: "6px 0" }}>
                <img src={TICKET_ICON} alt="t" /> {it.price}
              </div>
              <ActionButton onClick={() => doBuyItem(it.id, it.price)}>קנה</ActionButton>
            </ItemCard>
          ))}
        </StoreGrid>
      </Box>

      {message && <Message kind={message.kind}>{message.text}</Message>}
    </Page>
  );
};

export default CasinoStore;
