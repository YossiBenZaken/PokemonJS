import { Emoji, EmojiItem } from "./Emoji";
import {
  Message,
  Trainer,
  getMessages,
  readMessage,
  replyMessage,
} from "../../api/character.api";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import React, { useEffect, useState } from "react";

import { UBBCode } from "./UBBCode";
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

const OtherUserBubble = styled("div")(() => ({
  background: "#0a98c7",
  borderRadius: "0.4em",
  color: "#f9f9f9",
  float: "left",
  padding: "5px 18px",
  position: "relative",
  marginLeft: 10,
  maxWidth: "45%",
  clear: "both",
  marginTop: 7,
  "&::after": {
    border: "24px solid transparent",
    borderBottom: 0,
    borderLeft: 0,
    borderRightColor: "#0a98c7",
    content: '""',
    height: 0,
    left: 0,
    marginLeft: "-8px",
    marginTop: "-12px",
    position: "absolute",
    top: "50%",
    width: 0,
  },
  p: {
    margin: 0,
    textAlign: "left",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    wordBreak: "break-all",
    span: {
      float: "right",
      fontSize: 10,
      display: "block",
      color: "#eee",
    },
  },
}));

const UserBubble = styled("div")(() => ({
  background: "#0074D9",
  borderRadius: "0.4em",
  color: "#f9f9f9",
  float: "right",
  padding: "5px 18px",
  position: "relative",
  marginRight: 10,
  maxWidth: "45%",
  clear: "both",
  marginTop: 7,

  "&::after": {
    border: "24px solid transparent",
    borderBottom: 0,
    borderRight: 0,
    borderLeftColor: "#0074D9",
    content: '""',
    height: 0,
    right: 0,
    marginRight: "-8px",
    marginTop: "-12px",
    position: "absolute",
    top: "50%",
    width: 0,
  },

  p: {
    margin: 0,
    textAlign: "left",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    wordBreak: "break-all",
    span: {
      float: "right",
      fontSize: 10,
      display: "block",
      color: "#eee",
    },
  },
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

const Button = styled('button')(() => ({
  border: '1px solid #577599',
  color: '#fff',
  borderRadius: '3px',
  padding: '7px 21px',
  backgroundColor: '#2e3d53',
  boxShadow: '0 2px 0 0 #0f1a2a',
  textTransform: 'uppercase',
  fontSize: '12px',
  fontWeight: 'bold',
  opacity: .9,
  overflow: 'hidden',
  position: 'relative'
}));

const chunkArray = (arr: EmojiItem[], size: number): EmojiItem[][] => {
  const result: EmojiItem[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const Inbox: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { selectedCharacter } = useGame();
  const navigate = useNavigate();
  const msgId = searchParams.get("id");
  const [messages, setMessages] = useState<Message[]>([]);
  const rows = chunkArray(Emoji, 6);
  const [message, setMessage] = useState("");

  const emote_chat = (emoji: string) => {
    // מוסיף את האימוג’י לסוף ההודעה
    setMessage((prev) => prev + " " + emoji);
  };

  useEffect(() => {
    if (msgId && selectedCharacter?.user_id) {
      getMessages(selectedCharacter?.user_id!).then((res) => {
        const { data } = res;
        const messages = data.messages.filter((m) => m.id.toString() === msgId);
        if (messages.length === 0) navigate("/");
        setMessages(messages);
        readMessage(selectedCharacter.user_id!, Number(msgId));
      });
    } else if (selectedCharacter?.user_id) {
      getMessages(selectedCharacter?.user_id!).then((res) => {
        const { data } = res;
        setMessages(data.messages);
      });
    }
  }, [msgId, selectedCharacter?.user_id]);

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(e);
  };

  function strimWidth(str: string, width: number, trimMarker = "..."): string {
    if (str.length <= width) {
      return str;
    }
    return str.substring(0, width) + trimMarker;
  }

  const getMessage = (message: string, sender: Trainer): React.ReactNode => {
    if (sender.user_id !== selectedCharacter?.user_id) {
      return (
        <>
          <b>{sender.username}:</b> {message}
        </>
      );
    }
    return (
      <>
        <b>אתה:</b> {message}
      </>
    );
  };

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message")?.toString();
    const sender = Number(formData.get("sender"));
    const conversa = Number(formData.get("conversa"));
    setMessage("");
    replyMessage(sender, strimWidth(message!,1000), conversa).then(() => {
      getMessages(selectedCharacter?.user_id!).then((res) => {
        const { data } = res;
        const messages = data.messages.filter((m) => m.id.toString() === msgId);
        setMessages(messages);
      });
    });
  };

  return (
    <>
      {msgId && messages[0] && (
        <MsgContainer>
          <Title>
            <p>{messages[0].title}</p>
          </Title>
          <div
            style={{
              maxHeight: 450,
              overflowY: "auto",
            }}
          >
            <Ul style={{ margin: 0 }}>
              <div>
                {messages[0]?.conversations.map((conversation, index) => {
                  const Bubble =
                    conversation.sender === selectedCharacter?.user_id
                      ? UserBubble
                      : OtherUserBubble;
                  return (
                    <Bubble key={index}>
                      <p>
                        <UBBCode text={conversation.message} />
                        <br />
                        <span>{conversation.date}</span>
                      </p>
                    </Bubble>
                  );
                })}
              </div>
            </Ul>
          </div>
          <div
            style={{
              width: "100%",
              float: "right",
              marginTop: 25,
            }}
          >
            <div
              style={{
                background: "#34465f",
                padding: 10,
              }}
            >
              <form onSubmit={sendMessage}>
                <table style={{ width: "100%", borderSpacing: 1 }}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          width: "60%",
                          paddingLeft: 10,
                        }}
                      >
                        <TextArea
                          name="message"
                          placeholder="תשובה"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        ></TextArea>
                        <input
                          type="hidden"
                          id="conversa"
                          name="conversa"
                          value={messages[0].id}
                        />
                        <input
                          type="hidden"
                          id="sender"
                          name="sender"
                          value={selectedCharacter?.user_id}
                        />
                      </td>
                      <td
                        style={{
                          width: "40%",
                        }}
                      >
                        <table style={{ width: "100%" }}>
                          <tbody>
                            <tr>
                              <td colSpan={6}>
                                <b style={{ color: "white" }}>אמוגיים</b>
                              </td>
                            </tr>
                            {rows.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {row.map((emoji, colIndex) => (
                                  <td key={colIndex}>
                                    <img
                                      src={emoji.image}
                                      style={{ cursor: "pointer" }}
                                      onClick={() =>
                                        emote_chat(emoji.emojiChat)
                                      }
                                      alt={emoji.emojiChat}
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Button type="submit">שלח הודעה</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </form>
            </div>
          </div>
        </MsgContainer>
      )}
      {messages.length === 0 && (
        <li style={{ textAlign: "center", color: "#fff" }}>אין שיחות</li>
      )}
      {!msgId && (
        <>
          <Title>
            <p>שיחות</p>
          </Title>
          <Ul>
            <form onSubmit={handleOnSubmit}>
              {messages.map((message) => {
                const {
                  id,
                  trainer_1,
                  trainer_2,
                  title,
                  last_message,
                  conversations,
                } = message;
                let otherUser = trainer_1;
                if (trainer_1.user_id === selectedCharacter?.user_id) {
                  otherUser = trainer_2;
                }
                const lastMessage = conversations.at(-1);
                let sender = trainer_1;
                if (trainer_2.user_id === lastMessage?.sender) {
                  sender = trainer_2;
                }
                const shortMessage = strimWidth(lastMessage?.message!, 30);
                return (
                  <li
                    style={{
                      background: lastMessage?.seen === 0 ? "#1d2b3f" : "",
                    }}
                  >
                    <NavLink
                      to={"/inbox?id=" + id}
                      style={{
                        width: "100%",
                        fontWeight: 600,
                      }}
                    >
                      <div style={{ padding: "0 10px 0 18px" }}>
                        <table
                          style={{
                            float: "right",
                            width: "100%",
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ width: "5%" }}>
                                <input
                                  type="checkbox"
                                  name="messages"
                                  value={id}
                                />
                              </td>
                              <td style={{ width: "10%" }}>
                                <img
                                  src={require(`../../assets/images/characters/${otherUser.character}/npc.png`)}
                                  width={40}
                                  style={{
                                    verticalAlign: "middle",
                                    marginTop: 4,
                                  }}
                                  alt={otherUser.character}
                                />
                              </td>
                              <td style={{ width: "67%", textAlign: "right" }}>
                                <span>
                                  <NavLink
                                    to={"profile/" + otherUser.username}
                                    style={{ maxWidth: "17%" }}
                                  >
                                    {otherUser.username}
                                  </NavLink>{" "}
                                  -{" "}
                                  <span style={{ fontWeight: "bold" }}>
                                    {title}
                                  </span>
                                </span>
                                <span
                                  style={{
                                    display: "block",
                                    fontSize: 12,
                                    marginTop: -14,
                                  }}
                                >
                                  {getMessage(shortMessage, sender)}
                                </span>
                              </td>
                              <td style={{ width: "20%", direction: "ltr" }}>
                                {last_message}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </NavLink>
                  </li>
                );
              })}

              <Button type="submit">Submit</Button>
            </form>
          </Ul>
        </>
      )}
    </>
  );
};

export default Inbox;
