import { BoxContent, Title } from "../Attack/TrainerAttack/styled";
import { List, ListItem } from "./styled";
import React, { useEffect, useState } from "react";
import { getAdminsTeams, removeAdmin } from "../../api/admin.api";

export const AdminTeamPage: React.FC = () => {
  const [moderators, setModerators] = useState<{ username: string }[]>();
  const [administrators, setAdministrators] =
    useState<{ username: string }[]>();
  const [owners, setOwners] = useState<{ username: string }[]>();

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
    const response = await removeAdmin(username);
    if(response.success) {
      await loadAdmins();
    } else {
      alert("Error");
    }
  };
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%'
    }}>
      <BoxContent
        style={{
          textAlign: "center",
          direction: "rtl",
          minHeight: 500,
          borderRadius: 16
        }}
      >
        <Title>נהל צוות</Title>
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
