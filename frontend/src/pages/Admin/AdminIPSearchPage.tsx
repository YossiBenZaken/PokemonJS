import { AccountByIP, searchAccountsByIP } from "../../api/admin.api";
import React, { useState } from "react";

import USER_BAN_ICON from "../../assets/images/icons/user_ban.png";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Page = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
`;

const SearchBox = styled.div`
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const Input = styled.input`
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  width: 200px;
`;

const Select = styled.select`
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;
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

const ResultsBox = styled.div`
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    background: #f8f9fa;
    padding: 12px;
    text-align: center;
    border-bottom: 2px solid #dee2e6;
    font-weight: 600;
    font-size: 14px;
  }

  td {
    padding: 12px;
    text-align: center;
    border-bottom: 1px solid #dee2e6;
    font-size: 14px;
  }

  tr:hover {
    background: #f8f9fa;
  }
`;

const IPCell = styled.td`
  font-family: monospace;
  color: #495057;
`;

const BanButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  img {
    width: 20px;
    height: 20px;
    transition: transform 0.2s;
  }

  &:hover img {
    transform: scale(1.1);
  }
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
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

const AdminIPSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [ip, setIp] = useState("");
  const [searchType, setSearchType] = useState<"login" | "register">("login");
  const [accounts, setAccounts] = useState<AccountByIP[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState<{
    kind: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!ip.trim()) {
      setMessage({ kind: "error", text: "הזן כתובת IP לחיפוש" });
      return;
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      setMessage({ kind: "error", text: "פורמט IP לא תקין" });
      return;
    }

    setLoading(true);
    setSearched(false);
    try {
      const res = await searchAccountsByIP(ip.trim(), searchType);
      if (res.success) {
        setAccounts(res.accounts);
        setSearched(true);
        if (res.accounts.length === 0) {
          setMessage({
            kind: "info",
            text: `לא נמצאו חשבונות עבור IP ${ip} (${
              searchType === "login" ? "התחברות" : "הרשמה"
            })`,
          });
        }
      } else {
        setMessage({ kind: "error", text: "שגיאה בחיפוש" });
      }
    } catch (error: any) {
      setMessage({
        kind: "error",
        text: error.response?.data?.message || "שגיאה בחיפוש חשבונות",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanIP = (ip: string, accId: number) => {
    // Navigate to ban page with pre-filled IP
    navigate(`/admin/ip-ban?ip=${ip}&player=${accId}`);
  };

  return (
    <Page>
      <SearchBox>
        <SearchForm onSubmit={handleSearch}>
          <div>
            <strong>IP:</strong>
          </div>
          <Input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="123.456.789.012"
            maxLength={15}
          />
          <Select value={searchType} onChange={(e) => setSearchType(e.target.value as any)}>
            <option value="login">IP התחברות</option>
            <option value="register">IP הרשמה</option>
          </Select>
          <Button type="submit" disabled={loading}>
            {loading ? "מחפש..." : "חפש!"}
          </Button>
        </SearchForm>
      </SearchBox>

      {message && <Message kind={message.kind}>{message.text}</Message>}

      {searched && accounts.length > 0 && (
        <ResultsBox>
          <Header>
            תוצאות חיפוש - {accounts.length} חשבונות עבור IP: {ip} (
            {searchType === "login" ? "התחברות" : "הרשמה"})
          </Header>
          <Table>
            <thead>
              <tr>
                <th>#</th>
                <th>חשבון</th>
                <th>IP הרשמה</th>
                <th>IP התחברות</th>
                <th>חסום IP</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, index) => (
                <tr key={account.acc_id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{account.username}</strong>
                  </td>
                  <IPCell>{account.ip_registered}</IPCell>
                  <IPCell>{account.ip_loggedin}</IPCell>
                  <td>
                    <BanButton
                      onClick={() =>
                        handleBanIP(
                          searchType === "register"
                            ? account.ip_registered
                            : account.ip_loggedin,
                          account.acc_id
                        )
                      }
                      title={`חסום IP ${
                        searchType === "register" ? "הרשמה" : "התחברות"
                      }`}
                    >
                      <img src={USER_BAN_ICON} alt="חסום" />
                    </BanButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ResultsBox>
      )}

      {searched && accounts.length === 0 && !message && (
        <ResultsBox>
          <EmptyState>לא נמצאו חשבונות עבור כתובת IP זו</EmptyState>
        </ResultsBox>
      )}
    </Page>
  );
};

export default AdminIPSearchPage;