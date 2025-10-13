import { MultiAccount, detectMultiAccounts } from "../../api/admin.api";
import React, { useState } from "react";

import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Page = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
`;

const ButtonBar = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 30px;
`;

const Button = styled.button<{ active?: boolean }>`
  background: ${(p) =>
    p.active
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "linear-gradient(135deg, #6c757d 0%, #495057 100%)"};
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultsBox = styled.div`
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
`;

const ResultCard = styled.div`
  border-bottom: 1px solid #dee2e6;
  padding: 20px;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8f9fa;
  }
`;

const IPHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
`;

const IPInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const IPAddress = styled.div`
  font-family: monospace;
  font-size: 16px;
  font-weight: 600;
  color: #495057;
  background: #f8f9fa;
  padding: 8px 15px;
  border-radius: 6px;
`;

const Badge = styled.span<{ color?: string }>`
  background: ${(p) => p.color || "#dc3545"};
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
`;

const ActionButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;

  &:hover {
    background: #c82333;
    transform: scale(1.05);
  }
`;

const AccountList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
`;

const AccountItem = styled.div`
  background: #f8f9fa;
  padding: 10px 15px;
  border-radius: 6px;
  font-weight: 600;
  color: #495057;
  text-align: center;
  border: 2px solid #dee2e6;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    background: #e7f1ff;
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: #6c757d;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 15px;
`;

const EmptyText = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const EmptySubtext = styled.div`
  font-size: 14px;
  color: #adb5bd;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 14px;
  color: #6c757d;
`;

const Message = styled.div<{ kind: "success" | "error" | "info" }>`
  margin-bottom: 20px;
  padding: 12px 15px;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
  color: ${(p) =>
    p.kind === "success" ? "#155724" : p.kind === "error" ? "#721c24" : "#004085"};
  background: ${(p) =>
    p.kind === "success" ? "#d4edda" : p.kind === "error" ? "#f8d7da" : "#cce5ff"};
  border: 1px solid
    ${(p) =>
      p.kind === "success" ? "#c3e6cb" : p.kind === "error" ? "#f5c6cb" : "#b8daff"};
`;

const AdminMultiAccountDetector: React.FC = () => {
  const navigate = useNavigate();
  const [detectType, setDetectType] = useState<"login" | "register" | null>(null);
  const [multiAccounts, setMultiAccounts] = useState<MultiAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    kind: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const handleDetect = async (type: "login" | "register") => {
    setDetectType(type);
    setMessage(null);
    setLoading(true);

    try {
      const res = await detectMultiAccounts(type, 100);
      if (res.success) {
        setMultiAccounts(res.multiAccounts);
        if (res.multiAccounts.length === 0) {
          setMessage({
            kind: "info",
            text: `לא נמצאו חשבונות כפולים (${
              type === "login" ? "התחברות" : "הרשמה"
            })`,
          });
        }
      } else {
        setMessage({ kind: "error", text: "שגיאה בזיהוי חשבונות כפולים" });
      }
    } catch (error: any) {
      setMessage({
        kind: "error",
        text: error.response?.data?.message || "שגיאה בזיהוי חשבונות כפולים",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanIP = (ip: string) => {
    navigate(`/admin/ip-ban?ip=${ip}`);
  };

  const handleSearchIP = (ip: string) => {
    navigate(`/admin/ip-search?ip=${ip}`);
  };

  const getBadgeColor = (count: number) => {
    if (count >= 5) return "#dc3545"; // Red - high risk
    if (count >= 3) return "#fd7e14"; // Orange - medium risk
    return "#ffc107"; // Yellow - low risk
  };

  return (
    <Page>
      <ButtonBar>
        <Button
          active={detectType === "register"}
          onClick={() => handleDetect("register")}
          disabled={loading}
        >
          {loading && detectType === "register" ? "מזהה..." : "IP רשום"}
        </Button>
        <Button
          active={detectType === "login"}
          onClick={() => handleDetect("login")}
          disabled={loading}
        >
          {loading && detectType === "login" ? "מזהה..." : "IP מחובר"}
        </Button>
      </ButtonBar>

      {message && <Message kind={message.kind}>{message.text}</Message>}

      {loading && (
        <LoadingSpinner>
          <div>🔍</div>
          <div>מחפש חשבונות כפולים...</div>
        </LoadingSpinner>
      )}

      {!loading && detectType && multiAccounts.length > 0 && (
        <ResultsBox>
          <Header>
            נמצאו {multiAccounts.length} כתובות IP עם חשבונות כפולים (
            {detectType === "login" ? "התחברות" : "הרשמה"})
          </Header>
          {multiAccounts.map((multi, index) => (
            <ResultCard key={`${multi.ip}-${index}`}>
              <IPHeader>
                <IPInfo>
                  <IPAddress>{multi.ip}</IPAddress>
                  <Badge color={getBadgeColor(multi.count)}>
                    {multi.count} חשבונות
                  </Badge>
                </IPInfo>
                <div style={{ display: "flex", gap: "8px" }}>
                  <ActionButton onClick={() => handleSearchIP(multi.ip)}>
                    חפש
                  </ActionButton>
                  <ActionButton onClick={() => handleBanIP(multi.ip)}>
                    חסום IP
                  </ActionButton>
                </div>
              </IPHeader>
              <AccountList>
                {multi.accounts.map((account, idx) => (
                  <AccountItem key={idx}>{account}</AccountItem>
                ))}
              </AccountList>
            </ResultCard>
          ))}
        </ResultsBox>
      )}

      {!loading && detectType && multiAccounts.length === 0 && !message && (
        <ResultsBox>
          <EmptyState>
            <EmptyIcon>✅</EmptyIcon>
            <EmptyText>לא נמצאו חשבונות כפולים</EmptyText>
            <EmptySubtext>
              כל כתובות ה-IP מכילות חשבון אחד בלבד
            </EmptySubtext>
          </EmptyState>
        </ResultsBox>
      )}

      {!detectType && !loading && (
        <ResultsBox>
          <EmptyState>
            <EmptyIcon>🔍</EmptyIcon>
            <EmptyText>בחר סוג זיהוי</EmptyText>
            <EmptySubtext>
              לחץ על אחד הכפתורים למעלה כדי להתחיל לזהות חשבונות כפולים
            </EmptySubtext>
          </EmptyState>
        </ResultsBox>
      )}
    </Page>
  );
};

export default AdminMultiAccountDetector;