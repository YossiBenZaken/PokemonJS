import { NavLink, Outlet } from "react-router-dom";

import React from "react";
import styled from "styled-components";

const InboxContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const WelcomeBox = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  color: white;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const OptionsDiv = styled("div")(() => ({
  width: "100%",
  display: "flex",
  padding: 0,
  backgroundColor: "#34465f",
  borderBottom: "2px solid #27374e",
  borderRight: "1px solid #27374e",
  borderRadius: 4,
  verticalAlign: "middle",
  overflow: "hidden",
}));

const OptionsTable = styled("table")(() => ({
  flex: "0 0 17%",
  borderSpacing: 1,
  borderCollapse: "collapse",
}));

const OptionTd = styled("td")(() => ({
  borderBottom: "1px solid #577599",
  background: "#26354b",
  padding: "10px 0",
  color: "#9eadcd",
  cursor: "pointer",
  fontSize: "14px",
  height: "55px",
  textAlign: "center",
}));

const MsgContainer = styled("div")(() => ({
  flex: "1",
  borderLeft: "1px solid #577599",
  fontSize: 14,
  marginTop: 2,
  background: "#1d2b3e",
}));

const OPTIONS_LINK = [
  {
    Link: "official-messages",
    Text: "הודעות רשמיות",
  },
  {
    Link: ".",
    Text: "שיחות",
  },
  {
    Link: "new-message",
    Text: "שיחה חדשה",
  },
];

const InboxPage: React.FC = () => {
  return (
    <InboxContainer>
      <WelcomeBox>
        <p>
          לעולם אל תמסור את הסיסמה או כתובת הדוא"ל שלך לאף אחד בהודעה פרטית.
          בשום שלב אף אחד מצוות המשחק לא יבקש את הסיסמה שלך.
        </p>
      </WelcomeBox>
      <OptionsDiv>
        <OptionsTable>
          <tbody>
            {OPTIONS_LINK.map((option) => (
              <tr
                style={{
                  verticalAlign: "middle",
                }}
              >
                <OptionTd>
                  <NavLink
                    to={option.Link}
                    className={({ isActive }) =>
                      isActive ? "active" : "inactive"
                    }
                  >
                    {option.Text}
                  </NavLink>
                </OptionTd>
              </tr>
            ))}
          </tbody>
        </OptionsTable>
        <MsgContainer>
          <Outlet />
        </MsgContainer>
      </OptionsDiv>
    </InboxContainer>
  );
};

export default InboxPage;
