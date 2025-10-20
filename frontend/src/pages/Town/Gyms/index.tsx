import React, { useEffect, useState } from "react";
import { getGyms, postChallenge } from "../../../api/gyms.api";

import { initBattle } from "../../../api/battle.api";
import styled from "styled-components";
import { useBattle } from "../../../contexts/BattleContext";
import { useGame } from "../../../contexts/GameContext";
import { useNavigate } from "react-router-dom";

const Page = styled.div`
  max-width: 980px;
  margin: 0 auto;
  padding: 16px;
`;

const Header = styled.h2`
  color: #eee;
  text-align: center;
  margin-bottom: 12px;
`;
const Carousel = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 12px 6px;
`;
const Cell = styled.div<{ selected?: boolean }>`
  width: 150px;
  flex: 0 0 150px;
  transform: ${(p) => (p.selected ? "scale(1.02)" : "scale(0.85)")};
  transition: transform 0.25s;
  text-align: center;
  position: relative;

  img {
    width: 150px;
    height: 150px;
    object-fit: contain;
    filter: grayscale(100%);
  }

  &.complete img {
    filter: grayscale(20%) invert(8%);
  }
  &.blocked img {
    filter: brightness(0%) !important;
  }
`;

const BottomBar = styled.div`
  margin-top: 12px;
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 6px;
  color: #eee;
`;

const DescBox = styled.div`
  min-height: 120px;
  padding: 10px;
  background: #0b1220;
  color: #ddd;
  border-radius: 6px;
  margin-bottom: 10px;
`;

const ActionButton = styled.button<{ disabled?: boolean }>`
  padding: 10px 18px;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  background: ${(p) => (p.disabled ? "#999" : "#4CAF50")};
  color: white;
  border: none;
`;

const GymsPage: React.FC = () => {
  const { selectedCharacter } = useGame();
  const { setChallengeData, setAttackLog, setComputerInfo, setPokemonInfo } =
    useBattle();
  const [gyms, setGyms] = useState<any[]>([]);
  const [selected, setSelected] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedCharacter) {
      let mounted = true;
      getGyms(selectedCharacter?.user_id)
        .then((r) => {
          if (r.success) {
            setGyms(r.data.gyms);
            setNext(r.data.next);
            setSelected(r.data.next || 0);
          } else {
            alert("שגיאה בטעינת המכונים");
          }
        })
        .catch((e) => {
          console.error(e);
          alert("שגיאה בשרת");
        })
        .finally(() => mounted && setLoading(false));
      return () => {
        mounted = false;
      };
    }
  }, [selectedCharacter?.user_id]);

  if (loading) return <Page>טוען...</Page>;

  const sel = gyms[selected] || null;

  const canChallenge =
    selectedCharacter && selectedCharacter.rank! >= 3 && selected === next;
  const challengeText = (() => {
    if (!selectedCharacter || selectedCharacter.rank! < 3)
      return "עליך לעלות בדירוג כדי לאתגר";
    if (selected > (next ?? 0)) return "נצח את המנהיג הקודם כדי לאתגר אותו";
    if (selected < (next ?? 0)) return "כבר ניצחת מנהיג זה";
    return sel ? `אתגר ${sel.namePublic}` : "אתגר";
  })();

  const onChallenge = async () => {
    if (!sel) return;
    try {
      const resp = await postChallenge(sel.naam, selectedCharacter?.user_id);
      if (resp.success) {
        setChallengeData(resp.data);
        const {aanval_log,computer_info,pokemon_info} = await initBattle(resp.data.trainer.aanvalLogId);
        setAttackLog(aanval_log);
        setComputerInfo(computer_info);
        setPokemonInfo(pokemon_info);
        if (resp.redirect) navigate(resp.redirect);
        else alert("האתגר נוצר — הטעינה תתבצע כעת");
      } else {
        alert(resp.message || "שגיאה ביצירת אתגר");
      }
    } catch (err) {
      console.error(err);
      alert("שגיאת רשת");
    }
  };

  return (
    <Page>
      <Header>אצטדיונים באזור {selectedCharacter?.world}</Header>

      <Carousel>
        {gyms.map((g, idx) => (
          <Cell
            key={g.id}
            className={`${g.complete ? "complete" : ""} ${
              g.blocked ? "blocked" : ""
            }`}
            selected={idx === selected}
            onClick={() => setSelected(idx)}
          >
            {!g.badge.includes && !g.badge ? null : g.badge &&
              !g.badge.includes("Elite") &&
              !g.blocked ? (
              <img
                src={require(`../../../assets/images/badges/pixel/${g.badge.replace(
                  " Badge",
                  ""
                )}.png`)}
                alt="badge"
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  width: 32,
                  zIndex: 10,
                }}
              />
            ) : null}
            <img src={require(`../../../assets/images/trainers/${g.naam}.png`)} alt={g.namePublic} />
            <div style={{ marginTop: 6, color: "#eee" }}>{g.namePublic}</div>
            <div style={{ fontSize: 12, color: "#ccc" }}>{g.badge}</div>
          </Cell>
        ))}
      </Carousel>

      <BottomBar>
        <DescBox>
          <h4 style={{ margin: 0 }}>תיאור:</h4>
          <div style={{ marginTop: 8 }}>
            <div
              dangerouslySetInnerHTML={{
                __html: sel ? sel.descr : "בחר מאמן להצגה",
              }}
            />
          </div>
        </DescBox>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ color: "#ddd" }}>
            <div>
              <b>שם מאמן:</b> {sel ? sel.namePublic : "-"}
            </div>
            <div>
              <b>סמל:</b> {sel ? sel.badge : "-"}
            </div>
          </div>

          <ActionButton disabled={!canChallenge} onClick={onChallenge}>
            {challengeText}
          </ActionButton>
        </div>
      </BottomBar>
    </Page>
  );
};

export default GymsPage;
