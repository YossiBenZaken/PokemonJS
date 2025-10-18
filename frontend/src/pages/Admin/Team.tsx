import { BoxContent, Title } from "../Attack/TrainerAttack/styled";
import { Button, TextField } from "@mui/material";
import { List, ListItem } from "./styled";
import React, { useEffect, useState } from "react";
import { addAdmin, getAdminsTeams, removeAdmin } from "../../api/admin.api";

import { useGame } from "../../contexts/GameContext";

export const AdminTeamPage: React.FC = () => {
  const [moderators, setModerators] = useState<{ username: string }[]>();
  const [administrators, setAdministrators] =
    useState<{ username: string }[]>();
  const [owners, setOwners] = useState<{ username: string }[]>();
  const [usernameInput, setUsername] = useState<string>("");
  const { selectedCharacter } = useGame();

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    const response = await getAdminsTeams();
    setAdministrators(response.administrators);
    setModerators(response.moderators);
    setOwners(response.owners);
  };

  const handleOnRemove = async (username: string) => {
    if (selectedCharacter?.username === username) {
      alert("אתה לא יכול למחוק את עצמך");
      return;
    }
    const response = await removeAdmin(username);
    if (response.success) {
      await loadAdmins();
    } else {
      alert("Error");
    }
  };

  const handleAddAdmin = async () => {
    let existAdmins = owners!
      .map((o) => o.username!)
      .concat(administrators!.map((a) => a.username!))
      .concat(moderators!.map((m) => m.username));
    if(existAdmins.includes(usernameInput)) {
      alert("אתה לא יכול להוסיף מישהו שהוא כבר מנהל");
      return;
    }
    const response = await addAdmin(usernameInput);
    if (response.success) {
      await loadAdmins();
    } else {
      alert("Error");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <BoxContent
        style={{
          textAlign: "center",
          direction: "rtl",
          minHeight: 500,
          borderRadius: 16,
        }}
      >
        <Title>נהל צוות</Title>
        <div>
          <TextField
            label="הוסף מנהל"
            variant="outlined"
            sx={{
              direction: "rtl",
            }}
            value={usernameInput}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button onClick={() => handleAddAdmin()}>הוסף</Button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto auto auto",
          }}
        >
          <div>
            <Title>מנחים</Title>
            <List>
              {moderators?.map((m) => (
                <ListItem>
                  <p>{m.username}</p>
                  <button onClick={() => handleOnRemove(m.username)}>
                    הסר
                  </button>
                </ListItem>
              ))}
            </List>
          </div>
          <div>
            <Title>מנהלים</Title>
            <List>
              {administrators?.map((m) => (
                <ListItem>
                  <p>{m.username}</p>
                  <button onClick={() => handleOnRemove(m.username)}>
                    הסר
                  </button>
                </ListItem>
              ))}
            </List>
          </div>
          <div>
            <Title>בעלים</Title>
            <List>
              {owners?.map((m) => (
                <ListItem>
                  <p>{m.username}</p>
                  <button onClick={() => handleOnRemove(m.username)}>
                    הסר
                  </button>
                </ListItem>
              ))}
            </List>
          </div>
        </div>
      </BoxContent>
    </div>
  );
};
