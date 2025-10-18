/* eslint-disable no-restricted-globals */

import React, { useEffect, useState } from "react";
import {
  getGameConfigs,
  updateExpMultiplier,
  updateSilverMultiplier,
} from "../../api/admin.api";

import styled from "styled-components";

const Page = styled.div`
  padding: 40px 20px;
  max-width: 700px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: #667eea;
  margin-bottom: 30px;
  text-align: center;
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
`;

const CardTitle = styled.h3`
  color: #495057;
  margin: 0 0 20px 0;
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

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RadioLabel = styled.label<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  border: 2px solid ${(p) => (p.selected ? "#667eea" : "#e9ecef")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: ${(p) => (p.selected ? "#f0f3ff" : "#fff")};

  &:hover {
    border-color: #667eea;
    background: #f8f9fa;
  }

  input {
    cursor: pointer;
    width: 20px;
    height: 20px;
  }

  span {
    font-size: 16px;
    font-weight: ${(p) => (p.selected ? "600" : "normal")};
    color: ${(p) => (p.selected ? "#667eea" : "#495057")};
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Message = styled.div<{ kind: "success" | "error" | "info" }>`
  margin-top: 15px;
  padding: 12px 15px;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
  font-size: 14px;
  color: ${(p) =>
    p.kind === "success" ? "#155724" : p.kind === "error" ? "#721c24" : "#004085"};
  background: ${(p) =>
    p.kind === "success" ? "#d4edda" : p.kind === "error" ? "#f8d7da" : "#cce5ff"};
  border: 1px solid
    ${(p) =>
      p.kind === "success" ? "#c3e6cb" : p.kind === "error" ? "#f5c6cb" : "#b8daff"};
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
`;

const MULTIPLIERS = [
  { value: 1, label: "1x (רגיל)", emoji: "1️⃣" },
  { value: 2, label: "2x (כפול)", emoji: "2️⃣" },
  { value: 3, label: "3x (משולש)", emoji: "3️⃣" },
];

const AdminGameConfigPage: React.FC = () => {
  const [expMultiplier, setExpMultiplier] = useState<number>(1);
  const [silverMultiplier, setSilverMultiplier] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [expLoading, setExpLoading] = useState(false);
  const [silverLoading, setSilverLoading] = useState(false);
  const [expMessage, setExpMessage] = useState<{
    kind: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [silverMessage, setSilverMessage] = useState<{
    kind: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const res = await getGameConfigs();
      if (res.success) {
        setExpMultiplier(res.configs.exp);
        setSilverMultiplier(res.configs.silver);
      }
    } catch (error) {
      console.error("Error loading configs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpMessage(null);

    if (!confirm(`האם אתה בטוח שברצונך לשנות את EXP ל-${expMultiplier}x?`)) {
      return;
    }

    setExpLoading(true);
    try {
      const res = await updateExpMultiplier(expMultiplier);
      if (res.success) {
        setExpMessage({ kind: "success", text: res.message });
      } else {
        setExpMessage({ kind: "error", text: res.message });
      }
    } catch (error: any) {
      setExpMessage({
        kind: "error",
        text: error.response?.data?.message || "שגיאה בשינוי EXP",
      });
    } finally {
      setExpLoading(false);
    }
  };

  const handleSilverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSilverMessage(null);

    if (
      !confirm(`האם אתה בטוח שברצונך לשנות את Silver ל-${silverMultiplier}x?`)
    ) {
      return;
    }

    setSilverLoading(true);
    try {
      const res = await updateSilverMultiplier(silverMultiplier);
      if (res.success) {
        setSilverMessage({ kind: "success", text: res.message });
      } else {
        setSilverMessage({ kind: "error", text: res.message });
      }
    } catch (error: any) {
      setSilverMessage({
        kind: "error",
        text: error.response?.data?.message || "שגיאה בשינוי Silver",
      });
    } finally {
      setSilverLoading(false);
    }
  };

  if (loading) {
    return (
      <Page>
        <LoadingSpinner>
          <div style={{ fontSize: "48px" }}>⚙️</div>
          <div>טוען הגדרות...</div>
        </LoadingSpinner>
      </Page>
    );
  }

  return (
    <Page>
      <Title>הגדרות משחק</Title>

      <CardsContainer>
        {/* EXP Multiplier Card */}
        <Card>
          <CardTitle>
            <Icon>⭐</Icon>
            כפל EXP
          </CardTitle>
          <Form onSubmit={handleExpSubmit}>
            <RadioGroup>
              {MULTIPLIERS.map((mult) => (
                <RadioLabel
                  key={mult.value}
                  selected={expMultiplier === mult.value}
                >
                  <input
                    type="radio"
                    name="exp"
                    value={mult.value}
                    checked={expMultiplier === mult.value}
                    onChange={() => setExpMultiplier(mult.value)}
                  />
                  <span>
                    {mult.emoji} {mult.label}
                  </span>
                </RadioLabel>
              ))}
            </RadioGroup>
            <Button type="submit" disabled={expLoading}>
              {expLoading ? "משנה..." : "שנה!"}
            </Button>
            {expMessage && (
              <Message kind={expMessage.kind}>{expMessage.text}</Message>
            )}
          </Form>
        </Card>

        {/* Silver Multiplier Card */}
        <Card>
          <CardTitle>
            <Icon>🪙</Icon>
            כפל Silver
          </CardTitle>
          <Form onSubmit={handleSilverSubmit}>
            <RadioGroup>
              {MULTIPLIERS.map((mult) => (
                <RadioLabel
                  key={mult.value}
                  selected={silverMultiplier === mult.value}
                >
                  <input
                    type="radio"
                    name="silver"
                    value={mult.value}
                    checked={silverMultiplier === mult.value}
                    onChange={() => setSilverMultiplier(mult.value)}
                  />
                  <span>
                    {mult.emoji} {mult.label}
                  </span>
                </RadioLabel>
              ))}
            </RadioGroup>
            <Button type="submit" disabled={silverLoading}>
              {silverLoading ? "משנה..." : "שנה!"}
            </Button>
            {silverMessage && (
              <Message kind={silverMessage.kind}>{silverMessage.text}</Message>
            )}
          </Form>
        </Card>
      </CardsContainer>
    </Page>
  );
};

export default AdminGameConfigPage;