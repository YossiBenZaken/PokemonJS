import { PcPokemon, pokemonCenterApi } from "../../../api/pokemoncenter.api";
import React, { useEffect, useMemo, useState } from "react";

import Loader from "../../../components/Loader";
import styled from "styled-components";
import { useGame } from "../../../contexts/GameContext";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Hero = styled.div`
  background: #f6fbff url(${require('../../../assets/images/layout/joy.png')}) no-repeat
    center/cover;
  border-radius: 10px;
  height: 300px;
  position: relative;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  align-items: end;
`;

const HealButton = styled.button`
  width: 120px;
  height: 38px;
  border: none;
  border-radius: 8px;
  background: #e74c3c;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(231, 76, 60, 0.4);
  transition: transform 0.1s ease;
  margin: 0 0 1rem 4rem;
  &:disabled {
    cursor: not-allowed;
  }
  &:active {
    transform: translateY(1px);
  }
`;

const Box = styled.div`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 16px;
`;

const Title = styled.h3`
  margin: 0 0 12px;
`;

const HandList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
`;

const HandItem = styled.li<{ disabled?: boolean }>`
  background: #f7f9fc;
  border: 2px solid ${({ disabled }) => (disabled ? "#e5e7eb" : "#cfe3ff")};
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const PokeImg = styled.img`
  width: 32px;
  height: 32px;
`;

const FooterBar = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Status = styled.div<{ kind: "ok" | "err" }>`
  background: ${({ kind }) => (kind === "ok" ? "#e8fff1" : "#ffefef")};
  color: ${({ kind }) => (kind === "ok" ? "#067647" : "#b42318")};
  border: 1px solid ${({ kind }) => (kind === "ok" ? "#95f1bf" : "#ffbaba")};
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 14px;
`;

const PokemonCenterPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hand, setHand] = useState<PcPokemon[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const { selectedCharacter } = useGame();
  const [remaining, setRemaining] = useState(0);

  const canHealMap = useMemo(() => {
    const map: Record<number, boolean> = {};
    hand.forEach((p) => {
      map[p.id] = p.leven < p.levenmax || !!p.effect;
    });
    return map;
  }, [hand]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pokemonCenterApi.getHand(selectedCharacter?.user_id!);
      setHand(data);
      setSelected([]);
    } catch (e) {
      setError("שגיאה בטעינת הפוקימונים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCooldown = async () => {
      const { remaining } = await pokemonCenterApi.getCooldown(selectedCharacter?.user_id!);
      setRemaining(remaining);
    };
    if(selectedCharacter) {
      loadCooldown();
    }
  }, [selectedCharacter?.user_id]);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  useEffect(() => {
    if (selectedCharacter) {
      load();
    }
  }, [selectedCharacter?.user_id]);

  const toggle = (id: number) => {
    if (!canHealMap[id]) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onHeal = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      const res = await pokemonCenterApi.heal(
        selected,
        selectedCharacter?.user_id!
      );
      if (res.success) {
        setSuccess(
          `נרפאו ${res.healed} פוקימונים. זמן המתנה: ${res.count_time}s`
        );
        setRemaining(res.count_time);
        await load();
      } else {
        setError("הריפוי נכשל");
      }
    } catch (e: any) {
      const r = e?.response?.data?.remaining ?? 0;
      if (r > 0) setRemaining(r);
      setError(e?.response?.data?.message || "שגיאה בריפוי");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <Container>
      <Hero>
        <HealButton
          onClick={onHeal}
          disabled={submitting || selected.length === 0 || remaining > 0}
        >
          {remaining > 0 ? `המתן ${remaining}s` : "רפא נבחרים"}
        </HealButton>
      </Hero>

      <Box>
        <Title>הפוקימונים שלי (ביד)</Title>
        <HandList>
          {hand.map((p) => {
            const isHealable = canHealMap[p.id];
            const checked = selected.includes(p.id);
            const imgSrc =
              p.ei === 1
                ? require("../../../assets/images/icons/egg.gif")
                : require(`../../../assets/images/${p.shiny === 1 ? 'shiny': 'pokemon'}/${p.wild_id}.gif`);
            return (
              <HandItem key={p.id} disabled={!isHealable}>
                <label
                  style={{
                    display: "flex",
                    flexDirection: 'column',
                    alignItems:'center',
                    cursor: isHealable ? "pointer" : "default",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!isHealable}
                    onChange={() => toggle(p.id)}
                    style={{ marginBottom: 6 }}
                  />
                  <PokeImg src={imgSrc} alt={p.naam} />
                  <div style={{ fontSize: 12, marginTop: 6 }}>{p.naam}</div>
                </label>
              </HandItem>
            );
          })}
        </HandList>

        <FooterBar>
          {error && <Status kind="err">{error}</Status>}
          {success && <Status kind="ok">{success}</Status>}
        </FooterBar>
      </Box>
    </Container>
  );
};

export default PokemonCenterPage;
