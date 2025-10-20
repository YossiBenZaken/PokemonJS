import {
  BannedPlayer,
  banPlayer,
  getBannedPlayers,
  unbanPlayer,
} from "../../api/admin.api";
import React, { useEffect, useState } from "react";

import styled from "styled-components";

const Page = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Box = styled.div`
  border: 1px solid #000;
  border-radius: 8px;
  background: #fff;
  margin-bottom: 30px;
  overflow: hidden;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
`;

const Form = styled.form`
  padding: 20px;
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  
  label {
    width: 120px;
    font-weight: 600;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const Note = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 5px;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MiniButton = styled(Button)`
  padding: 6px 12px;
  font-size: 12px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    background: #f8f9fa;
    padding: 12px;
    text-align: right;
    border-bottom: 2px solid #dee2e6;
    font-weight: 600;
  }

  td {
    padding: 12px;
    text-align: right;
    border-bottom: 1px solid #dee2e6;
  }

  tr:hover {
    background: #f8f9fa;
  }

  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Message = styled.div<{ kind: "success" | "error" }>`
  margin: 15px 20px;
  padding: 12px 15px;
  border-radius: 6px;
  font-weight: 600;
  color: ${(p) => (p.kind === "success" ? "#155724" : "#721c24")};
  background: ${(p) => (p.kind === "success" ? "#d4edda" : "#f8d7da")};
  border: 1px solid ${(p) => (p.kind === "success" ? "#c3e6cb" : "#f5c6cb")};
  text-align: center;
`;

const BlockPlayerPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [reason, setReason] = useState("");
  const [until, setUntil] = useState("");
  const [bannedList, setBannedList] = useState<BannedPlayer[]>([]);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadBannedPlayers = async () => {
    try {
      const res = await getBannedPlayers();
      if (res.success) {
        setBannedList(res.players);
      }
    } catch (error) {
      console.error("Error loading banned players:", error);
    }
  };

  useEffect(() => {
    loadBannedPlayers();
  }, []);

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!username.trim()) {
      setMessage({ kind: "error", text: "הזן שם של מאמן" });
      return;
    }

    if (!reason.trim()) {
      setMessage({ kind: "error", text: "הזן סיבה" });
      return;
    }

    setLoading(true);
    try {
      const res = await banPlayer({
        username: username.trim(),
        reason: reason.trim(),
        until: until || undefined,
      });

      if (res.success) {
        setMessage({ kind: "success", text: res.message });
        setUsername("");
        setReason("");
        setUntil("");
        await loadBannedPlayers();
      } else {
        setMessage({ kind: "error", text: res.message });
      }
    } catch (error: any) {
      setMessage({
        kind: "error",
        text: error.response?.data?.message || "שגיאה בחסימת מאמן",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async (username: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`האם אתה בטוח שברצונך לשחרר את ${username} מחסימה?`)) {
      return;
    }

    try {
      const res = await unbanPlayer(username);
      if (res.success) {
        setMessage({ kind: "success", text: res.message });
        await loadBannedPlayers();
      } else {
        setMessage({ kind: "error", text: res.message });
      }
    } catch (error: any) {
      setMessage({
        kind: "error",
        text: error.response?.data?.message || "שגיאה בשחרור מאמן",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    if (dateStr.includes("0000-00-00") || !dateStr) {
      return "לצמיתות";
    }
    const [year, month, day] = dateStr.split('T')[0].split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <Page>
      <Box>
        <Header>חסימת מאמנים</Header>
        <Form onSubmit={handleBan}>
          <FormRow>
            <label>מאמן:</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={10}
              placeholder="שם המשתמש"
            />
          </FormRow>

          <FormRow>
            <label>זמן:</label>
            <div style={{ flex: 1 }}>
              <Input
                type="text"
                value={until}
                onChange={(e) => setUntil(e.target.value)}
                placeholder="YYYY-MM-DD"
                maxLength={10}
              />
              <Note>(השאר ריק לחסימה קבועה)</Note>
            </div>
          </FormRow>

          <FormRow>
            <label>סיבה:</label>
            <Input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={30}
              placeholder="סיבת החסימה"
            />
          </FormRow>

          <FormRow>
            <label></label>
            <Button type="submit" disabled={loading}>
              {loading ? "מעבד..." : "חסום"}
            </Button>
          </FormRow>
        </Form>
        {message && <Message kind={message.kind}>{message.text}</Message>}
      </Box>

      <Box>
        <Header>רשימת מאמנים חסומים</Header>
        {bannedList.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            אין מאמנים חסומים כרגע
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>מאמן</th>
                <th>חסום עד</th>
                <th>סיבה</th>
                <th>הסר</th>
              </tr>
            </thead>
            <tbody>
              {bannedList.map((player) => (
                <tr key={player.username}>
                  <td>
                    <a href={`/profile?player=${player.username}`}>
                      {player.username}
                    </a>
                  </td>
                  <td>{formatDate(player.blocked_time)}</td>
                  <td>{player.reasonblocked}</td>
                  <td>
                    <MiniButton onClick={() => handleUnban(player.username)}>
                      שחרר
                    </MiniButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Box>
    </Page>
  );
};

export default BlockPlayerPage;