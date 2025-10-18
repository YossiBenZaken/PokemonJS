import { BannedIP, banIP, getBannedIPs, unbanIP } from "../../api/admin.api";
import React, { useEffect, useState } from "react";

import styled from "styled-components";
import { useSearchParams } from "react-router-dom";

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
  align-items: flex-start;
  margin-bottom: 15px;

  label {
    width: 120px;
    font-weight: 600;
    padding-top: 8px;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const DateInput = styled(Input)`
  max-width: 180px;
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

const BanIP: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [ip, setIp] = useState("");
  const [until, setUntil] = useState("");
  const [reason, setReason] = useState("");
  const [bannedList, setBannedList] = useState<BannedIP[]>([]);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadBannedIPs = async () => {
    try {
      const res = await getBannedIPs();
      if (res.success) {
        setBannedList(res.ips);
      }
    } catch (error) {
      console.error("Error loading banned IPs:", error);
    }
  };

  useEffect(() => {
    loadBannedIPs();
  }, []);

  useEffect(() => {
    const ipParam = searchParams.get("ip");
    if (ipParam) {
      setIp(ipParam);
    }
  }, [searchParams]);

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!ip.trim()) {
      setMessage({ kind: "error", text: "הזן כתובת IP תקינה" });
      return;
    }

    if (!until.trim()) {
      setMessage({ kind: "error", text: "הזן זמן" });
      return;
    }

    if (!reason.trim()) {
      setMessage({ kind: "error", text: "הזן סיבה" });
      return;
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      setMessage({ kind: "error", text: "פורמט IP לא תקין" });
      return;
    }

    setLoading(true);
    try {
      const playerParam = searchParams.get("player");
      const res = await banIP({
        ip: ip.trim(),
        until: until.trim(),
        reason: reason.trim(),
        userId: playerParam
      });

      if (res.success) {
        setMessage({ kind: "success", text: res.message });
        setIp("");
        setUntil("");
        setReason("");
        await loadBannedIPs();
      } else {
        setMessage({ kind: "error", text: res.message });
      }
    } catch (error: any) {
      setMessage({
        kind: "error",
        text: error.response?.data?.message || "שגיאה בחסימת IP",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async (ip: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`האם אתה בטוח שברצונך לשחרר את כתובת ה-IP ${ip} מחסימה?`)) {
      return;
    }

    try {
      const res = await unbanIP(ip);
      if (res.success) {
        setMessage({ kind: "success", text: res.message });
        await loadBannedIPs();
      } else {
        setMessage({ kind: "error", text: res.message });
      }
    } catch (error: any) {
      setMessage({
        kind: "error",
        text: error.response?.data?.message || "שגיאה בשחרור IP",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('T')[0].split("-");
    return `${day}/${month}/${year}`;
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <Page>
      <Box>
        <Header>חסימת כתובת IP</Header>
        <Form onSubmit={handleBan}>
          <FormRow>
            <label>IP:</label>
            <Input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              maxLength={15}
              placeholder="123.456.789.012"
            />
          </FormRow>

          <FormRow>
            <label>זמן:</label>
            <div style={{ flex: 1 }}>
              <DateInput
                type="date"
                value={until}
                onChange={(e) => setUntil(e.target.value)}
                min={getTodayDate()}
              />
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
            <div>
              <Button type="submit" disabled={loading}>
                {loading ? "מעבד..." : "חסום IP"}
              </Button>
              <Note style={{ marginTop: 10 }}>
                זכור שזה משמש רק לחסימת IP ספציפי, ללא חסימת חשבונות/דמויות מעורבות.
              </Note>
            </div>
          </FormRow>
        </Form>
        {message && <Message kind={message.kind}>{message.text}</Message>}
      </Box>

      <Box>
        <Header>רשימת כתובות IP חסומות</Header>
        {bannedList.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            אין כתובות IP חסומות כרגע
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>IP</th>
                <th>חסום עד</th>
                <th>סיבה</th>
                <th>הסר</th>
              </tr>
            </thead>
            <tbody>
              {bannedList.map((ban) => (
                <tr key={ban.ip}>
                  <td style={{ fontFamily: "monospace" }}>{ban.ip}</td>
                  <td>{formatDate(ban.tot)}</td>
                  <td>{ban.reden}</td>
                  <td>
                    <MiniButton onClick={() => handleUnban(ban.ip)}>
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

export default BanIP;