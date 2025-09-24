import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { sendMessage } from "../../api/character.api";
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

const MsgContainer = styled("div")(() => ({
  flex: 1,
  borderLeft: "1px solid #577599",
  fontSize: 14,
  marginTop: 2,
  background: "#1d2b3e",
}));

const TextArea = styled("textarea")(() => ({
  padding: "5px 10px 5px 30px",
  borderRadius: 5,
  resize: "none",
  height: 155,
  width: "100%",
  border: "1px solid #577599",
  backgroundColor: "#2e3d53",
  color: "#fff",
  margin: 1,
  cursor: "auto",
  fontSize: 11,
  opacity: 0.8,
  fontWeight: 600,
  boxSizing: "border-box",
}));
const Input = styled("input")(() => ({
  padding: "5px 10px 5px 30px",
  borderRadius: 5,
  resize: "none",
  height: 155,
  width: "100%",
  border: "1px solid #577599",
  backgroundColor: "#2e3d53",
  color: "#fff",
  margin: 1,
  cursor: "auto",
  fontSize: 11,
  opacity: 0.8,
  fontWeight: 600,
  boxSizing: "border-box",
}));

const Button = styled("button")(() => ({
  border: "1px solid #577599",
  color: "#fff",
  borderRadius: "3px",
  padding: "7px 21px",
  backgroundColor: "#2e3d53",
  boxShadow: "0 2px 0 0 #0f1a2a",
  textTransform: "uppercase",
  fontSize: "12px",
  fontWeight: "bold",
  opacity: 0.9,
  overflow: "hidden",
  position: "relative",
}));

const NewMessage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const playerParam = searchParams.get("player");
  const { selectedCharacter } = useGame();
  const [message, setMessage] = useState("");
  const [player, setPlayer] = useState(playerParam ?? "");
  const [subject, setSubject] = useState("");
  const navigate = useNavigate();

  const sendMessageHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      message.trim() !== "" &&
      player.trim() !== "" &&
      subject.trim() !== ""
    ) {
      sendMessage(selectedCharacter?.user_id!, subject, message, player).then(
        (id) => {
          navigate("/inbox?id=" + id);
        }
      );
    } else {
      return;
    }
    setMessage("");
  };

  return (
    <>
      <MsgContainer>
        <Title>
          <p>שיחה חדשה</p>
        </Title>
        <div
          style={{
            maxHeight: 450,
            overflowY: "auto",
          }}
        >
          <Ul style={{ margin: 0 }}>
            <form onSubmit={sendMessageHandler}>
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    background: "#34465f",
                    padding: "10px",
                    borderBottom: "2px solid #27374e",
                  }}
                >
                  <div>
                    <Input
                      type="text"
                      name="player"
                      placeholder="אֶל"
                      style={{
                        width: "100%",
                        height: 30,
                        padding: "5px 10px 5px 0",
                      }}
                      required
                      value={player}
                      onChange={(e) => setPlayer(e.target.value)}
                    />
                    <small style={{ color: "#fff" }}>
                      נמען אחד בלבד לכל הודעה.
                    </small>
                  </div>
                </div>
              </div>
              <div style={{ width: "100%", marginTop: 10 }}>
                <div
                  style={{
                    background: "#34465f",
                    padding: 10,
                    borderBottom: "2px solid #27374e",
                  }}
                >
                  <div>
                    <Input
                      type="text"
                      name="subject"
                      placeholder="נוֹשֵׂא"
                      style={{
                        width: "100%",
                        height: 30,
                        padding: "5px 10px 5px 0",
                      }}
                      max="50"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div style={{ width: "100%", marginTop: 10 }}>
                <div
                  style={{
                    background: "#34465f",
                    padding: 10,
                    borderBottom: "2px solid #27374e",
                  }}
                >
                  <div>
                    <TextArea
                      name="message"
                      placeholder="הוֹדָעָה"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    ></TextArea>
                    <Button type="submit">שלח הודעה</Button>
                  </div>
                </div>
              </div>
            </form>
          </Ul>
        </div>
      </MsgContainer>
    </>
  );
};

export default NewMessage;
