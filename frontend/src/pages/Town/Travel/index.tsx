import React, { useEffect, useMemo, useState } from "react";
import {
  RegionKey,
  TravelInfoResponse,
  fly as apiFly,
  go as apiGo,
  surf as apiSurf,
  getTravelInfo,
} from "../../../api/travel.api";

import Loader from "../../../components/Loader";
import styled from "styled-components";
import { useGame } from "../../../contexts/GameContext";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100%;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
  color: white;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const Subtitle = styled.p`
  font-size: 1rem;
  opacity: 0.9;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
`;

const RegionCard = styled.div<{ disabled?: boolean; current?: boolean }>`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid #577599;
  border-radius: 10px;
  padding: 12px;
  color: #eaeaea;
  box-shadow: ${(p) => (p.current ? "0 0 15px #0e0d0d66" : "none")};
  opacity: ${(p) => (p.disabled ? 0.6 : 1)};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Price = styled.div`
  font-size: 14px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button<{ variant?: "primary" | "ghost" }>`
  border: 1px solid #577599;
  background: ${(p) => (p.variant === "primary" ? "#4d8f6f" : "transparent")};
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #f5c6cb;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #c3e6cb;
`;

const regionsMeta: Record<RegionKey, { label: string }> = {
  kanto: { label: "Kanto" },
  johto: { label: "Johto" },
  hoenn: { label: "Hoenn" },
  sinnoh: { label: "Sinnoh" },
  unova: { label: "Unova" },
  kalos: { label: "Kalos" },
  alola: { label: "Alola" },
};

const TravelPage: React.FC = () => {
  const { selectedCharacter } = useGame();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [info, setInfo] = useState<TravelInfoResponse["data"] | null>(null);
  const [team, setTeam] = useState<
    Array<{
      id: number;
      naam: string;
      level: number;
      attackMoves: (string | null)[];
    }>
  >([]);

  const { api } = useMemo(
    () => ({ api: require("../../../api/specialists.api") }),
    []
  );

  const loadData = async () => {
    if (!selectedCharacter) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getTravelInfo(selectedCharacter.user_id);
      if (res.success && res.data) setInfo(res.data);
      // Load team (for Surf/Fly selection)
      const spec = await api.getSpecialistInfo(selectedCharacter.user_id);
      if (spec.success && spec.data) {
        setTeam(
          spec.data.teamPokemons.map((p: any) => ({
            id: p.id,
            naam: p.naam,
            level: p.level,
            attackMoves: [p.aanval_1, p.aanval_2, p.aanval_3, p.aanval_4],
          }))
        );
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "שגיאה בטעינת נתוני נסיעה");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCharacter]);

  const onGo = async (region: RegionKey) => {
    if (!selectedCharacter) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await apiGo(selectedCharacter.user_id, region);
      setSuccess(res.message);
      await loadData();
    } catch (e: any) {
      setError(e.response?.data?.message || "שגיאה בביצוע נסיעה");
    }
  };

  const pickPokemonAndExec = async (
    label: "Surf" | "Fly",
    exec: (pokemonId: number) => Promise<any>
  ) => {
    // Pick first eligible by move and level >= 80 (UX בסיסי; ניתן לשפר לרשימת בחירה)
    const candidate = team.find(
      (t) => t.level >= 80 && t.attackMoves.includes(label)
    );
    if (!candidate) {
      setError(`אין פוקימון עם ${label} ברמה 80+`);
      return;
    }
    await exec(candidate.id);
  };

  const onSurf = async (region: RegionKey) => {
    if (!selectedCharacter) return;
    setError(null);
    setSuccess(null);
    try {
      await pickPokemonAndExec("Surf", async (pokemonId) => {
        const res = await apiSurf(selectedCharacter.user_id, region, pokemonId);
        setSuccess(res.message);
        await loadData();
      });
    } catch (e: any) {
      setError(e.response?.data?.message || "שגיאה ב-Surf");
    }
  };

  const onFly = async (region: RegionKey) => {
    if (!selectedCharacter) return;
    setError(null);
    setSuccess(null);
    try {
      await pickPokemonAndExec("Fly", async (pokemonId) => {
        const res = await apiFly(selectedCharacter.user_id, region, pokemonId);
        setSuccess(res.message);
        await loadData();
      });
    } catch (e: any) {
      setError(e.response?.data?.message || "שגיאה ב-Fly");
    }
  };

  if (loading) return <Loader />;

  return (
    <Container>
      <Header>
        <Title>מסעות בין אזורים</Title>
        <Subtitle>בחר אזור לנסיעה, או נצל Surf/Fly אם הפוקימון מתאים</Subtitle>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <Grid>
        {info?.regions.map((r) => {
          const current = String(info?.world || "").toLowerCase() === r;
          const price = info?.prices[r];
          return (
            <RegionCard key={r} disabled={current} current={current}>
              <Row>
                <div style={{ fontWeight: 700 }}>{regionsMeta[r].label}</div>
                <Price>עלות: {price?.total?.toLocaleString()} Silver</Price>
              </Row>
              <Row style={{ marginTop: 8 }}>
                <div>זמן נסיעה: {price?.time} שניות</div>
                <Actions>
                  <Button
                    variant="ghost"
                    onClick={() => onSurf(r)}
                    disabled={current}
                  >
                    Surf
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onFly(r)}
                    disabled={current}
                  >
                    Fly
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => onGo(r)}
                    disabled={current}
                  >
                    נסיעה
                  </Button>
                </Actions>
              </Row>
            </RegionCard>
          );
        })}
      </Grid>
    </Container>
  );
};

export default TravelPage;
