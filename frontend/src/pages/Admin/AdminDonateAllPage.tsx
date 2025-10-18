/* eslint-disable no-restricted-globals */

import React, { useState } from "react";
import {
  giveGoldToAll,
  givePremiumToAll,
  givePremiumToPlayer,
  giveSilverToAll,
} from "../../api/admin.api";

import { Divider } from "@mui/material";
import styled from "styled-components";
import { useGame } from "../../contexts/GameContext";

const Page = styled.div`
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: #667eea;
  margin-bottom: 30px;
  text-align: center;
`;

const Warning = styled.div`
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;

  h3 {
    color: #856404;
    margin: 0 0 10px 0;
    font-size: 18px;
  }

  p {
    color: #856404;
    margin: 0;
    font-size: 14px;
  }
`;

const CardsContainer = styled.div`
  display: grid;
  gap: 20px;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  }
`;

const CardTitle = styled.h3`
  color: #495057;
  margin: 0 0 15px 0;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Icon = styled.span`
  font-size: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Label = styled.label`
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Button = styled.button<{ color?: string }>`
  background: ${(p) =>
    p.color === "gold"
      ? "linear-gradient(135deg, #f7b733 0%, #fc4a1a 100%)"
      : p.color === "premium"
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "linear-gradient(135deg, #a8b8d8 0%, #708090 100%)"};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  min-width: 120px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Message = styled.div<{ kind: "success" | "error" }>`
  margin-top: 15px;
  padding: 12px 15px;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
  font-size: 14px;
  color: ${(p) => (p.kind === "success" ? "#155724" : "#721c24")};
  background: ${(p) => (p.kind === "success" ? "#d4edda" : "#f8d7da")};
  border: 1px solid ${(p) => (p.kind === "success" ? "#c3e6cb" : "#f5c6cb")};
`;

const AdminDonateAllPage: React.FC = () => {
  const { selectedCharacter } = useGame();
  const [silverAmount, setSilverAmount] = useState("");
  const [goldAmount, setGoldAmount] = useState("");
  const [premiumDays, setPremiumDays] = useState("");

  const [silverLoading, setSilverLoading] = useState(false);
  const [goldLoading, setGoldLoading] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [playerPremiumLoading, setPlayerPremiumLoading] = useState(false);

  // For specific player premium
  const [playerUsername, setPlayerUsername] = useState("");
  const [playerPremiumDays, setPlayerPremiumDays] = useState("");

  const [silverMessage, setSilverMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [goldMessage, setGoldMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [premiumMessage, setPremiumMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [playerPremiumMessage, setPlayerPremiumMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const handleSilver = async (e: React.FormEvent) => {
    e.preventDefault();
    setSilverMessage(null);

    if (!silverAmount || Number(silverAmount) <= 0) {
      setSilverMessage({ kind: "error", text: "הסכום חייב להיות גדול מ-0" });
      return;
    }

    if (
      !confirm(
        `האם אתה בטוח שברצונך לתת ${Number(
          silverAmount
        ).toLocaleString()} Silver לכל השחקנים?`
      )
    ) {
      return;
    }

    setSilverLoading(true);
    try {
      const res = await giveSilverToAll(Number(silverAmount));
      if (res.success) {
        setSilverMessage({
          kind: "success",
          text: `${res.message} (${res.playersAffected} שחקנים)`,
        });
        setSilverAmount("");
      } else {
        setSilverMessage({ kind: "error", text: res.message });
      }
    } catch (error: any) {
      setSilverMessage({
        kind: "error",
        text: error.response?.data?.message || "שגיאה במתן Silver",
      });
    } finally {
      setSilverLoading(false);
    }
  };

  const handleGold = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoldMessage(null);

    if (!goldAmount || Number(goldAmount) <= 0) {
      setGoldMessage({ kind: "error", text: "הסכום חייב להיות גדול מ-0" });
      return;
    }

    if (
      !confirm(
        `האם אתה בטוח שברצונך לתת ${Number(
          goldAmount
        ).toLocaleString()} Gold לכל השחקנים?`
      )
    ) {
      return;
    }

    setGoldLoading(true);
    try {
      const res = await giveGoldToAll(Number(goldAmount));
      if (res.success) {
        setGoldMessage({
          kind: "success",
          text: `${res.message} (${res.playersAffected} שחקנים)`,
        });
        setGoldAmount("");
      } else {
        setGoldMessage({ kind: "error", text: res.message });
      }
    } catch (error: any) {
      setGoldMessage({
        kind: "error",
        text: error.response?.data?.message || "שגיאה במתן Gold",
      });
    } finally {
      setGoldLoading(false);
    }
  };

  const handlePremium = async (e: React.FormEvent) => {
    e.preventDefault();
    setPremiumMessage(null);

    if (!premiumDays || Number(premiumDays) <= 0) {
      setPremiumMessage({ kind: "error", text: "הסכום חייב להיות גדול מ-0" });
      return;
    }

    if (
      !confirm(
        `האם אתה בטוח שברצונך לתת ${premiumDays} ימי Premium לכל השחקנים?`
      )
    ) {
      return;
    }

    setPremiumLoading(true);
    try {
      const res = await givePremiumToAll(Number(premiumDays));
      if (res.success) {
        setPremiumMessage({
          kind: "success",
          text: `${res.message} (${res.playersAffected} שחקנים)`,
        });
        setPremiumDays("");
      } else {
        setPremiumMessage({ kind: "error", text: res.message });
      }
    } catch (error: any) {
      setPremiumMessage({
        kind: "error",
        text: error.response?.data?.message || "שגיאה במתן Premium",
      });
    } finally {
      setPremiumLoading(false);
    }
  };

  const handlePlayerPremium = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlayerPremiumMessage(null);

    if (!playerUsername.trim()) {
      setPlayerPremiumMessage({ kind: "error", text: "הזן שם מאמן" });
      return;
    }

    if (!playerPremiumDays || Number(playerPremiumDays) <= 0) {
      setPlayerPremiumMessage({
        kind: "error",
        text: "המספר חייב להיות גדול מ-0",
      });
      return;
    }

    setPlayerPremiumLoading(true);
    try {
      const res = await givePremiumToPlayer(
        playerUsername,
        Number(playerPremiumDays),
        selectedCharacter?.username || "Admin"
      );
      if (res.success) {
        setPlayerPremiumMessage({
          kind: "success",
          text: res.message,
        });
        setPlayerUsername("");
        setPlayerPremiumDays("");
      } else {
        setPlayerPremiumMessage({ kind: "error", text: res.message });
      }
    } catch (error: any) {
      setPlayerPremiumMessage({
        kind: "error",
        text: error.response?.data?.message || "שגיאה במתן Premium",
      });
    } finally {
      setPlayerPremiumLoading(false);
    }
  };

  return (
    <Page>
      <Title>מתן משאבים לכל השחקנים</Title>

      <Warning>
        <h3>⚠️ אזהרה!</h3>
        <p>פעולות אלו משפיעות על כל השחקנים במשחק. השתמש בזהירות!</p>
      </Warning>

      <CardsContainer>
        {/* Silver Card */}
        <Card>
          <CardTitle>
            <Icon>🪙</Icon>
            Silver בבנק
          </CardTitle>
          <Form onSubmit={handleSilver}>
            <Label>כמה Silver תרצה לתת לכל המאמנים בבנק?</Label>
            <InputGroup>
              <Input
                type="number"
                value={silverAmount}
                onChange={(e) => setSilverAmount(e.target.value)}
                placeholder="הזן סכום..."
                min="1"
              />
              <Button type="submit" disabled={silverLoading}>
                {silverLoading ? "שולח..." : "תן Silver"}
              </Button>
            </InputGroup>
            {silverMessage && (
              <Message kind={silverMessage.kind}>{silverMessage.text}</Message>
            )}
          </Form>
        </Card>

        {/* Gold Card */}
        <Card>
          <CardTitle>
            <Icon>💎</Icon>
            Gold
          </CardTitle>
          <Form onSubmit={handleGold}>
            <Label>כמה Gold תרצה לתת לכל המאמנים?</Label>
            <InputGroup>
              <Input
                type="number"
                value={goldAmount}
                onChange={(e) => setGoldAmount(e.target.value)}
                placeholder="הזן סכום..."
                min="1"
              />
              <Button type="submit" color="gold" disabled={goldLoading}>
                {goldLoading ? "שולח..." : "תן Gold"}
              </Button>
            </InputGroup>
            {goldMessage && (
              <Message kind={goldMessage.kind}>{goldMessage.text}</Message>
            )}
          </Form>
        </Card>

        {/* Premium Card */}
        <Card>
          <CardTitle>
            <Icon>⭐</Icon>
            Premium
          </CardTitle>
          <Form onSubmit={handlePremium}>
            <Label>כמה ימי Premium תרצה לתת לכל המאמנים?</Label>
            <InputGroup>
              <Input
                type="number"
                value={premiumDays}
                onChange={(e) => setPremiumDays(e.target.value)}
                placeholder="הזן מספר ימים..."
                min="1"
              />
              <Button type="submit" color="premium" disabled={premiumLoading}>
                {premiumLoading ? "שולח..." : "תן Premium"}
              </Button>
            </InputGroup>
            {premiumMessage && (
              <Message kind={premiumMessage.kind}>
                {premiumMessage.text}
              </Message>
            )}
          </Form>
        </Card>

        <Divider />

        <Card>
          <CardTitle>
            <Icon>👤</Icon>
            Premium - למאמן ספציפי
          </CardTitle>
          <Form onSubmit={handlePlayerPremium}>
            <Label>כמה ימים תרצה לתת ולמי?</Label>
            <InputGroup>
              <Input
                type="text"
                value={playerUsername}
                onChange={(e) => setPlayerUsername(e.target.value)}
                placeholder="שם המאמן"
              />
              <Input
                type="number"
                value={playerPremiumDays}
                onChange={(e) => setPlayerPremiumDays(e.target.value)}
                placeholder="מספר ימים"
                min="1"
                style={{ maxWidth: "150px" }}
              />
              <Button
                type="submit"
                color="premium"
                disabled={playerPremiumLoading}
              >
                {playerPremiumLoading ? "שולח..." : "תן Premium"}
              </Button>
            </InputGroup>
            {playerPremiumMessage && (
              <Message kind={playerPremiumMessage.kind}>
                {playerPremiumMessage.text}
              </Message>
            )}
          </Form>
        </Card>
      </CardsContainer>
    </Page>
  );
};

export default AdminDonateAllPage;
