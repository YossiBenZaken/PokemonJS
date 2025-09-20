import { NavLink, useSearchParams } from "react-router-dom";
import React, { useEffect, useState } from "react";

import { getOfficialMessage } from "../../api/system.api";
import he from "he";
import styled from "styled-components";
import { useGame } from "../../contexts/GameContext";

const Title = styled("div")(() => ({
  background: "#1d2b3e",
  borderBottom: "1px solid #577599",
  textTransform: "uppercase",
  boxShadow: "0 -2px 3px rgba(0, 0, 0, .05)",
  textAlign: "center",
  p: {
    padding: 10,
    margin: 0,
    color: "#9eadcd",
    fontWeight: "bold",
  },
}));

const Ul = styled("ul")(() => ({
  paddingLeft: 0,
  listStyleType: "none",
  li: {
    background: "#34465f",
    borderBottom: "1px solid #577599",
    lineHeight: "30px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    width: "100%",
    textAlign: "center",
    ":hover": {
      background: "#26354b",
      transition: ".3s",
    },
  },
}));

const OfficialMessages: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { selectedCharacter } = useGame();
  const msgId = searchParams.get("id");
  const [messages, setMessages] = useState<
    {
      id: number;
      title: string;
      message: string;
      date: string;
      is_read: boolean;
    }[]
  >([]);

  useEffect(() => {
    if (msgId) {
      getOfficialMessage(selectedCharacter?.user_id!, msgId).then((res) => {
        const { data } = res;
        setMessages(data);
      });
    } else {
      getOfficialMessage(selectedCharacter?.user_id!).then((res) => {
        const { data } = res;
        setMessages(data);
      });
    }
  }, [msgId, selectedCharacter?.user_id]);

  return (
    <>
      <Title>
        <p>הודעות רשמיות</p>
      </Title>
      <div
        style={{
          maxHeight: 500,
          overflowY: "auto",
        }}
      >
        <Ul>
          {msgId &&
            messages.map((message) => (
              <div
              style={{color: 'white'}}
                dangerouslySetInnerHTML={{ __html: he.decode(message.message) }}
              ></div>
            ))}
          {!msgId &&
            messages.map((message) => (
              <li>
                <NavLink
                  to={"/inbox/official-messages?id=" + message.id}
                  style={{
                    width: "100%",
                    fontWeight: message.is_read ? 400 : 600,
                  }}
                >
                  <div style={{ padding: "0 10px 0 18px" }}>
                    {message.title}
                    <span style={{ float: "left" }}>{message.date}</span>
                  </div>
                </NavLink>
              </li>
            ))}
        </Ul>
      </div>
    </>
  );
};

export default OfficialMessages;
