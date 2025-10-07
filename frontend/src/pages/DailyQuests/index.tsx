// frontend/src/pages/DailyQuests/index.tsx

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import { DailyQuestsData, Quest, completeDailyQuest, getDailyQuests } from "../../api/system.api";
import React, { useEffect, useState } from "react";

import axios from "axios";
import styled from "styled-components";

const Container = styled.div`
  max-width: 1200px;
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

const NPCBox = styled.div`
  background: #1c3248;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  color: white;
  display: flex;
  gap: 20px;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const NPCImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
`;

const NPCText = styled.div`
  flex: 1;
  
  h3 {
    margin: 0 0 12px 0;
    font-size: 1.5rem;
    color: #fbbf24;
  }
  
  p {
    margin: 0;
    line-height: 1.6;
  }
`;

const StreakDisplay = styled.div`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  color: white;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  h2 {
    margin: 0 0 12px 0;
    font-size: 1.8rem;
  }
  
  .streak-count {
    font-size: 3rem;
    font-weight: bold;
    color: #fbbf24;
  }
`;

const QuestsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const QuestCard = styled(Card)<{ completed?: boolean }>`
  background: ${props => props.completed ? '#10b981' : '#1e293b'} !important;
  color: white !important;
  border: 2px solid ${props => props.completed ? '#059669' : '#475569'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

const QuestTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.3rem;
  color: #fbbf24;
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
`;

const QuestDescription = styled.p`
  font-size: 1.1rem;
  margin: 16px 0;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border-left: 4px solid #fbbf24;
`;

const ProgressSection = styled.div`
  margin: 20px 0;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 600;
`;

const RewardSection = styled.div`
  margin: 20px 0;
  padding: 16px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
`;

const RewardDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
  
  img {
    width: 32px;
    height: 32px;
    vertical-align: middle;
  }
`;


const DailyQuestsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [questsData, setQuestsData] = useState<DailyQuestsData | null>(null);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDailyQuests();
      setQuestsData(response);
    } catch (err: any) {
      setError(err.response?.data?.error || "שגיאה בטעינת המשימות");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuest = async (questNumber: number) => {
    if (!window.confirm(`האם להשלים משימה ${questNumber}?`)) return;

    setError(null);
    setSuccess(null);

    try {
      const response = await completeDailyQuest(questNumber);

      setSuccess(response.message);

      if (response.data.masterBallReceived) {
        setSuccess(
          `${response.message}\n🎉 השלמת 7 ימים רצופים וקיבלת Master Ball!`
        );
      }

      // רענון הנתונים
      await loadQuests();
    } catch (err: any) {
      setError(err.response?.data?.error || "שגיאה בהשלמת המשימה");
    }
  };

  const renderReward = (reward: Quest["reward"]) => {
    if (reward.type === "item") {
      if (reward.attackType) {
        return (
          <RewardDisplay>
            {reward.quantity}x {reward.item}
            <img src={`/images/items/Attack_${reward.attackType}.png`} alt={reward.attackType} />
          </RewardDisplay>
        );
      }
      return (
        <RewardDisplay>
          {reward.quantity}x {reward.item}
          <img src={`/images/items/${reward.item}.png`} alt={reward.item} />
        </RewardDisplay>
      );
    } else if (reward.type === "gold") {
      return (
        <RewardDisplay>
          {reward.quantity}x
          <img src="/images/icons/gold.png" alt="Gold" />
        </RewardDisplay>
      );
    } else {
      return (
        <RewardDisplay>
          {reward.quantity}x
          <img src="/images/icons/silver.png" alt="Silver" />
        </RewardDisplay>
      );
    }
  };

  const renderQuestCard = (quest: Quest, questNumber: number) => {
    const progressPercentage = (quest.progress / quest.required) * 100;

    return (
      <QuestCard completed={quest.isCompleted}>
        <CardContent>
          <QuestTitle>משימה {questNumber}</QuestTitle>

          <QuestDescription>{quest.description}</QuestDescription>

          {!quest.isCompleted && (
            <ProgressSection>
              <ProgressLabel>
                <span>התקדמות:</span>
                <span>
                  {quest.progress} / {quest.required}
                </span>
              </ProgressLabel>
              <LinearProgress
                variant="determinate"
                value={Math.min(progressPercentage, 100)}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: quest.canComplete ? "#10b981" : "#3b82f6",
                  },
                }}
              />
            </ProgressSection>
          )}

          <RewardSection>
            <Typography variant="subtitle1" gutterBottom align="center">
              {quest.isCompleted ? "✅ משימה הושלמה!" : "🎁 פרס:"}
            </Typography>
            {!quest.isCompleted && renderReward(quest.reward)}
            {quest.rewardClaimed && !quest.isCompleted && (
              <Alert severity="info" sx={{ mt: 2 }}>
                הפרס כבר נדרש בדמות אחרת!
              </Alert>
            )}
          </RewardSection>

          {quest.canComplete && !quest.isCompleted && (
            <Button
              variant="contained"
              color="success"
              fullWidth
              size="large"
              onClick={() => handleCompleteQuest(questNumber)}
              sx={{ mt: 2, fontWeight: "bold", fontSize: "1.1rem" }}
            >
              {quest.rewardClaimed
                ? "השלם משימה"
                : "השלם משימה וקבל פרס"}
            </Button>
          )}
        </CardContent>
      </QuestCard>
    );
  };

  if (loading) {
    return (
      <Container>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!questsData) {
    return (
      <Container>
        <Alert severity="error">{error || "לא נמצאו נתונים"}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>משימות יומיות</Title>
      </Header>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <NPCBox>
        <NPCImage src="/images/npc/13.png" alt="Quest NPC" />
        <NPCText>
          <h3>משימות יומיות</h3>
          <p>
            השלם משימות כל יום כדי לקבל פרסים! <br />
            אם תשלים משימות למשך 7 ימים רצופים, תקבל{" "}
            <strong>Master Ball</strong>{" "}
            <img
              src="/images/items/Master ball.png"
              style={{ width: 24, height: 24, verticalAlign: "middle" }}
            />
            <br />
            זכור שצריך מקום בתיק שלך לפרסים ול-Master Ball!
          </p>
        </NPCText>
      </NPCBox>

      <Alert severity="warning" sx={{ mb: 3 }}>
        ניתן לקבל את הפרסים והמאסטר בול פעם אחת לכל <strong>חשבון</strong>,
        ולא לכל דמות!
      </Alert>

      <StreakDisplay>
        <h2>רצף השלמות</h2>
        <div className="streak-count">
          {questsData.streak} / {questsData.maxStreak}
        </div>
        <Typography variant="body1">ימים רצופים</Typography>
      </StreakDisplay>

      {questsData.streakCompleted && (
        <Alert severity="success" sx={{ mb: 3 }}>
          🎉 כבר השגת את ה-<strong>Master Ball</strong> השבוע! חזור מחר
          למשימות חדשות!
        </Alert>
      )}

      {questsData.allQuestsCompleted && !questsData.streakCompleted && (
        <Alert severity="info" sx={{ mb: 3 }}>
          ✅ השלמת את כל המשימות להיום! חזור <strong>מחר</strong> למשימות
          חדשות!
        </Alert>
      )}

      <QuestsRow>
        {renderQuestCard(questsData.quest1, 1)}
        {renderQuestCard(questsData.quest2, 2)}
      </QuestsRow>
    </Container>
  );
};

export default DailyQuestsPage;