/* eslint-disable no-restricted-globals */
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  getUserSettings,
  updatePersonalSettings,
  changePassword,
  changeEmail,
  updateLevelChoice,
  UserSettings,
} from "../../api/character.api";

const Page = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const InfoBox = styled.div`
  background: #e3f2fd;
  border: 2px solid #2196f3;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  color: #1565c0;
  font-size: 14px;
  line-height: 1.6;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 15px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
`;

const CardBody = styled.div`
  padding: 20px;
`;

const Table = styled.table`
  width: 100%;
  
  tr {
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  td {
    padding: 12px 8px;
    
    &:first-child {
      font-weight: 500;
      color: #495057;
      width: 45%;
    }
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  
  input {
    cursor: pointer;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ kind: "success" | "error" }>`
  padding: 12px;
  border-radius: 4px;
  margin-top: 10px;
  font-weight: 600;
  text-align: center;
  color: ${(p) => (p.kind === "success" ? "#155724" : "#721c24")};
  background: ${(p) => (p.kind === "success" ? "#d4edda" : "#f8d7da")};
  border: 1px solid ${(p) => (p.kind === "success" ? "#c3e6cb" : "#f5c6cb")};
`;

const AccountSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Personal settings
  const [see_team, setSee_team] = useState<number>(0);
  const [see_badges, setSee_badges] = useState<number>(0);
  const [chat, setChat] = useState<string>("0");
  const [duel_invitation, setDuel_invitation] = useState<number>(0);
  const [exibepokes, setExibepokes] = useState<string>("sim");
  
  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Email
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  
  // Level choice
  const [levelRange, setLevelRange] = useState<string>("5-20");
  
  // Messages
  const [personalMsg, setPersonalMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [emailMsg, setEmailMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [levelMsg, setLevelMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await getUserSettings();
      if (res.success) {
        setSettings(res.settings);
        setSee_team(res.settings.see_team ?? 0);
        setSee_badges(res.settings.see_badges ?? 0);
        setChat(String(res.settings.chat ?? "0"));
        setDuel_invitation(res.settings.duel_invitation ?? 0);
        setExibepokes(res.settings.exibepokes ?? "sim");
        setLevelRange(res.settings.lvl_choose || "5-20");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalMsg(null);

    try {
      const res = await updatePersonalSettings({
        see_team,
        see_badges,
        chat,
        duel_invitation,
        exibepokes,
      });
      
      if (res.success) {
        setPersonalMsg({ kind: "success", text: res.message || "הגדרות אישיות עודכנו בהצלחה!" });
        await loadSettings(); // reload to ensure sync
      } else {
        setPersonalMsg({ kind: "error", text: res.message || "שגיאה בעדכון הגדרות" });
      }
    } catch (error: any) {
      setPersonalMsg({
        kind: "error",
        text: error.response?.data?.message || "שגיאה בעדכון הגדרות",
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    
    if (!confirm("האם אתה בטוח שברצונך לשנות את הסיסמה?")) {
      return;
    }
    
    try {
      const res = await changePassword(currentPassword, newPassword, confirmPassword);
      
      if (res.success) {
        setPasswordMsg({ kind: "success", text: res.message || "הסיסמה שונתה בהצלחה" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg({ kind: "error", text: res.message || "שגיאה בשינוי הסיסמה" });
      }
    } catch (error: any) {
      setPasswordMsg({
        kind: "error",
        text: error.response?.data?.message || "שגיאה בשינוי סיסמה",
      });
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMsg(null);
    
    if (!confirm("האם אתה בטוח שברצונך לשנות את האימייל?")) {
      return;
    }
    
    try {
      const res = await changeEmail(newEmail, confirmEmail);
      
      if (res.success) {
        setEmailMsg({ kind: "success", text: res.message || `האימייל שונה בהצלחה ל-${newEmail}` });
        setNewEmail("");
        setConfirmEmail("");
        await loadSettings(); // Reload to get new email
      } else {
        setEmailMsg({ kind: "error", text: res.message || "שגיאה בשינוי אימייל" });
      }
    } catch (error: any) {
      setEmailMsg({
        kind: "error",
        text: error.response?.data?.message || "שגיאה בשינוי אימייל",
      });
    }
  };

  const handleLevelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLevelMsg(null);
    
    if (!confirm(`האם לשנות את רמות הפוקימונים במפה ל-${levelRange}?`)) {
      return;
    }
    
    try {
      const res = await updateLevelChoice(levelRange);
      
      if (res.success) {
        setLevelMsg({ kind: "success", text: res.message || `עכשיו תוכל למצוא פוקימונים בין הרמות ${levelRange}` });
      } else {
        setLevelMsg({ kind: "error", text: res.message || "שגיאה בעדכון רמות" });
      }
    } catch (error: any) {
      setLevelMsg({
        kind: "error",
        text: error.response?.data?.message || "שגיאה בעדכון רמות",
      });
    }
  };

  if (loading) {
    return <Page>טוען...</Page>;
  }

  if (!settings) {
    return <Page>שגיאה בטעינת הגדרות</Page>;
  }
  return (
    <Page>
      <h2>הגדרות חשבון ⚙️</h2>
      
      <InfoBox>
        שיתוף חשבון הוא אפשרות שמאפשרת גישה לחשבון שלך למאמנים אחרים שהם חברים שלך.
        זה נותן להם גישה לכמה פונקציות של החשבון שלך, לכן השתמש רק באנשים שאתה סומך עליהם!
      </InfoBox>

      {/* Part 1 - Personal Settings & Sharing */}
      <Grid>
        {/* Personal Settings */}
        <Card>
          <CardHeader>נתונים אישיים</CardHeader>
          <CardBody>
            <form onSubmit={handlePersonalSubmit}>
              <Table>
                <tbody>
                  <tr>
                    <td>הצג צוות בפרופיל:</td>
                    <td>
                      <RadioGroup>
                        <RadioLabel>
                          <input
                            type="radio"
                            checked={see_team === 1}
                            onChange={() => setSee_team(1)}
                            name="see_team"
                          />
                          <span>כן</span>
                        </RadioLabel>
                        <RadioLabel>
                          <input
                            type="radio"
                            checked={see_team === 0}
                            onChange={() => setSee_team(0)}
                            name="see_team"
                          />
                          <span>לא</span>
                        </RadioLabel>
                      </RadioGroup>
                    </td>
                  </tr>
                  
                  <tr>
                    <td>הצג תגים בפרופיל:</td>
                    <td>
                      {settings.badgeCase === 0 ? (
                        <span>אין לך קופסת תגים</span>
                      ) : (
                        <RadioGroup>
                          <RadioLabel>
                            <input
                              type="radio"
                              checked={see_badges === 1}
                              onChange={() => setSee_badges(1)}
                              name="see_badges"
                            />
                            <span>כן</span>
                          </RadioLabel>
                          <RadioLabel>
                            <input
                              type="radio"
                              checked={see_badges === 0}
                              onChange={() => setSee_badges(0)}
                              name="see_badges"
                            />
                            <span>לא</span>
                          </RadioLabel>
                        </RadioGroup>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td>צ'אט:</td>
                    <td>
                      <RadioGroup>
                        <RadioLabel>
                          <input
                            type="radio"
                            checked={chat === "1"}
                            onChange={() => setChat("1")}
                            name="chat"
                          />
                          <span>כן</span>
                        </RadioLabel>
                        <RadioLabel>
                          <input
                            type="radio"
                            checked={chat === "0"}
                            onChange={() => setChat("0")}
                            name="chat"
                          />
                          <span>לא</span>
                        </RadioLabel>
                      </RadioGroup>
                    </td>
                  </tr>

                  <tr>
                    <td>קבל אתגרים:</td>
                    <td>
                      <RadioGroup>
                        <RadioLabel>
                          <input
                            type="radio"
                            checked={duel_invitation === 1}
                            onChange={() => setDuel_invitation(1)}
                            name="duel_invitation"
                          />
                          <span>כן</span>
                        </RadioLabel>
                        <RadioLabel>
                          <input
                            type="radio"
                            checked={duel_invitation === 0}
                            onChange={() => setDuel_invitation(0)}
                            name="duel_invitation"
                          />
                          <span>לא</span>
                        </RadioLabel>
                      </RadioGroup>
                    </td>
                  </tr>

                  <tr>
                    <td>הצג סטטוסים בפרופיל:</td>
                    <td>
                      <RadioGroup>
                        <RadioLabel>
                          <input
                            type="radio"
                            checked={exibepokes === "sim"}
                            onChange={() => setExibepokes("sim")}
                            name="exibepokes"
                          />
                          <span>כן</span>
                        </RadioLabel>
                        <RadioLabel>
                          <input
                            type="radio"
                            checked={exibepokes === "nao"}
                            onChange={() => setExibepokes("nao")}
                            name="exibepokes"
                          />
                          <span>לא</span>
                        </RadioLabel>
                      </RadioGroup>
                    </td>
                  </tr>
                </tbody>
              </Table>
              
              <Button type="submit">עדכן</Button>
              {personalMsg && <Message kind={personalMsg.kind}>{personalMsg.text}</Message>}
            </form>
          </CardBody>
        </Card>
      </Grid>

      {/* Part 2 - Password / Email / Level choice */}
      <Grid>
        <Card>
          <CardHeader>שינוי סיסמה</CardHeader>
          <CardBody>
            <form onSubmit={handlePasswordSubmit}>
              <Table>
                <tbody>
                  <tr>
                    <td>סיסמה נוכחית:</td>
                    <td><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></td>
                  </tr>
                  <tr>
                    <td>סיסמה חדשה:</td>
                    <td><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></td>
                  </tr>
                  <tr>
                    <td>אשר את הסיסמה החדשה:</td>
                    <td><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></td>
                  </tr>
                </tbody>
              </Table>
              <Button type="submit">שנה סיסמה</Button>
              {passwordMsg && <Message kind={passwordMsg.kind}>{passwordMsg.text}</Message>}
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>עדכון דוא"ל</CardHeader>
          <CardBody>
            <form onSubmit={handleEmailSubmit}>
              <Table>
                <tbody>
                  <tr>
                    <td>דוא"ל נוכחי:</td>
                    <td>{settings.email}</td>
                  </tr>
                  <tr>
                    <td>דוא"ל חדש:</td>
                    <td><Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></td>
                  </tr>
                  <tr>
                    <td>אשר את הדוא"ל החדש:</td>
                    <td><Input type="email" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} /></td>
                  </tr>
                </tbody>
              </Table>
              <Button type="submit">שנה דוא"ל</Button>
              {emailMsg && <Message kind={emailMsg.kind}>{emailMsg.text}</Message>}
            </form>
          </CardBody>
        </Card>
      </Grid>

      {/* Level choice for high rank users */}
      {settings.rank >= 16 && (
        <div style={{ marginTop: 12 }}>
          <Card>
            <CardHeader>בחר רמה (MAP)</CardHeader>
            <CardBody>
              <form onSubmit={handleLevelSubmit}>
                <Table>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: "center" }}>
                        <label>
                          <input
                            type="radio"
                            name="lvl"
                            value="5-20"
                            checked={levelRange === "5-20"}
                            onChange={() => setLevelRange("5-20")}
                          /> <b>5-20</b>
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "center" }}>
                        <label>
                          <input
                            type="radio"
                            name="lvl"
                            value="20-40"
                            checked={levelRange === "20-40"}
                            onChange={() => setLevelRange("20-40")}
                          /> <b>20-40</b>
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "center" }}>
                        <label>
                          <input
                            type="radio"
                            name="lvl"
                            value="40-60"
                            checked={levelRange === "40-60"}
                            onChange={() => setLevelRange("40-60")}
                          /> <b>40-60</b>
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "center" }}>
                        <label>
                          <input
                            type="radio"
                            name="lvl"
                            value="60-80"
                            checked={levelRange === "60-80"}
                            onChange={() => setLevelRange("60-80")}
                          /> <b>60-80</b>
                        </label>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <Button type="submit">שינוי רמה</Button>
                {levelMsg && <Message kind={levelMsg.kind}>{levelMsg.text}</Message>}
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </Page>
  );
};

export default AccountSettingsPage;
