import React, { useState } from "react";
import styled, { css, keyframes } from "styled-components";

import TICKET_ICON from "../../../assets/images/icons/ticket.png";
import { spinFortune } from "../../../api/casino.api";
import { useGame } from "../../../contexts/GameContext";

// רשימת הפרסים (מתאימה ל-roll 0-5)
const PRIZES = [
  { label: "100 TICKETS", color: "#f44336" },
  { label: "250 TICKETS", color: "#ffc107" },
  { label: "POKÉBALL", color: "#3498db" },
  { label: "ITEM ESPECIAL", color: "#e91e63" },
  { label: "PEDRA EVOLUTIVA", color: "#9c27b0" },
  { label: "TM", color: "#4caf50" },
];

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

const spinAnim = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(2160deg); } /* 6 סיבובים מלאים */
`;

export const WheelContainer = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  margin: 20px auto;
  border-radius: 50%;
  border: 6px solid #333;
  overflow: hidden;
`;

export const Needle = styled.div`
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 25px solid red;
  z-index: 10;
`;

export const Wheel = styled.div<{ spinning: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: transform 5s cubic-bezier(0.2, 0.8, 0.3, 1);
  ${(p) =>
    p.spinning &&
    css`
      animation: ${spinAnim} 5s ease-out;
    `}
`;

export const WheelSlice = styled.div<{ index: number; color: string }>`
  position: absolute;
  width: 50%;
  height: 50%;
  top: 50%;
  left: 50%;
  background: ${(p) => p.color};
  transform-origin: 0% 0%;
  transform: rotate(${(p) => p.index * 60}deg) skewY(-30deg);
  text-align: center;
  line-height: 300px;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  border: 1px solid #333;
`;

const SpinButton = styled.button`
  display: block;
  margin: 20px auto 0;
  padding: 10px 18px;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ kind: "success" | "error" }>`
  margin-top: 15px;
  text-align: center;
  color: ${(p) => (p.kind === "success" ? "#155724" : "#721c24")};
  background: ${(p) => (p.kind === "success" ? "#d4edda" : "#f8d7da")};
  border: 1px solid ${(p) => (p.kind === "success" ? "#c3e6cb" : "#f5c6cb")};
  padding: 10px;
  border-radius: 6px;
  font-weight: 600;
`;

const FortuneWheel: React.FC = () => {
  const { selectedCharacter, setSelectedCharacter } = useGame();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");

  const spin = async () => {
    if (spinning) return;
    if ((selectedCharacter?.geluksrad || 0) <= 0) {
      setMessage("אין לך עוד ספינים להיום!");
      return;
    }
    setMessage("");
    setSpinning(true);

    const data = await spinFortune(selectedCharacter!.user_id);
    if (!data.success) {
      setMessage(data.message || "שגיאה בסיבוב");
      setSpinning(false);
      return;
    }

    // "אנימציה" - נמתין 5 שניות ואז נציג את התוצאה
    setTimeout(() => {
      setSpinning(false);
      setResult(data.result!);
      setMessage(data.message!);

      // עדכון Tickets אם זכית בהם
      if (data.type === "tickets") {
        const delta = Number(data.reward);
        const updated = {
          ...selectedCharacter!,
          tickets: selectedCharacter!.tickets + delta,
          geluksrad: selectedCharacter!.geluksrad - 1,
        };
        setSelectedCharacter(updated);
      } else {
        const updated = {
          ...selectedCharacter!,
          geluksrad: selectedCharacter!.geluksrad - 1,
        };
        setSelectedCharacter(updated);
      }
    }, 5000);
  };

  return (
    <Page>
      <Header>
        <h3>
          Tickets במלאי:
          <img src={TICKET_ICON} alt="Tickets" />
          {selectedCharacter?.tickets.toLocaleString()} | ספינים:
          {selectedCharacter?.geluksrad ?? 0}
        </h3>
      </Header>

      <WheelContainer>
        <Needle />
        <Wheel spinning={spinning}>
          {PRIZES.map((p, i) => (
            <WheelSlice key={i} index={i} color={p.color}>
              {p.label}
            </WheelSlice>
          ))}
        </Wheel>
      </WheelContainer>

      <SpinButton onClick={spin} disabled={spinning}>
        {spinning ? "מסתובב…" : "סובב את הגלגל"}
      </SpinButton>

      {message && <Message kind="success">{message}</Message>}
    </Page>
  );
};

export default FortuneWheel;
