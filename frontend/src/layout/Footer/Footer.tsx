import {
  FooterContainer,
  OnlineList,
  OnlineSection,
  OnlineUserName,
} from "./styled";
import { OnlineUser, getOnlineUsers } from "../../api/system.api";
import React, { useEffect, useState } from "react";

import dv from "../../assets/images/icons/dv.png";
import elite from "../../assets/images/icons/elite.png";
import { useNavigate } from "react-router-dom";
import userIcon from "../../assets/images/icons/user.png";
import userSuit from "../../assets/images/icons/user_suit.png";
import vip from "../../assets/images/icons/vip.gif";

export const Footer: React.FC = () => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadOnline();
    const interval = setInterval(loadOnline, 30000); // רענון כל 30 שניות
    return () => clearInterval(interval);
  }, []);

  const loadOnline = async () => {
    try {
      const res = await getOnlineUsers();
      if (res.success) {
        setOnlineUsers(res.users);
        setTotal(res.total);
      }
    } catch {}
  };

  return (
    <FooterContainer>
      <OnlineSection>
        <div>
          <strong>Online Trainers ({total})</strong>
        </div>
        <OnlineList>
          {onlineUsers.length === 0 ? (
            <span>אין מאמנים מחוברים כרגע</span>
          ) : (
            onlineUsers.map((user) => (
              <OnlineUserName
                key={user.user_id}
                admin={user.admin}
                dv={user.dv}
                rang={user.rang}
                premium={user.premiumaccount > Date.now() / 1000}
                onClick={() => navigate(`/profile/${user.username}`)}
                title={
                  user.admin === 1
                    ? "מודרטור"
                    : user.admin === 2
                    ? "סופרווייזר"
                    : user.admin === 3
                    ? "אדמין"
                    : user.dv === 1
                    ? "דיוולגדר"
                    : undefined
                }
              >
                {user.dv === 1 ? `[DV]` : ""}
                {user.username}
                {user.rang >= 1 && user.rang <= 4 && user.admin === 0 && (
                  <img
                    src={elite}
                    width={16}
                    height={16}
                    alt="Elite"
                    style={{ marginLeft: 2, verticalAlign: "middle" }}
                  />
                )}
                {user.premiumaccount > Date.now() / 1000 &&
                  user.admin === 0 && (
                    <img
                      src={vip}
                      width={16}
                      height={16}
                      alt="Premium"
                      style={{ marginLeft: 2, verticalAlign: "middle" }}
                    />
                  )}
                {user.admin === 1 && (
                  <img
                    src={userIcon}
                    width={16}
                    height={16}
                    alt="Moderator"
                    style={{ marginLeft: 2, verticalAlign: "middle" }}
                  />
                )}
                {user.admin === 2 && (
                  <img
                    src={userSuit}
                    width={16}
                    height={16}
                    alt="Supervisor"
                    style={{ marginLeft: 2, verticalAlign: "middle" }}
                  />
                )}
                {user.admin === 3 && (
                  <span style={{ color: "yellow", marginLeft: 2 }}>★</span>
                )}
                {user.dv === 1 && (
                  <img
                    src={dv}
                    width={16}
                    height={16}
                    alt="DV"
                    style={{ marginLeft: 2, verticalAlign: "middle" }}
                  />
                )}
              </OnlineUserName>
            ))
          )}
        </OnlineList>
      </OnlineSection>
    </FooterContainer>
  );
};
