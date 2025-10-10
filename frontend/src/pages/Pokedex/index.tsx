import React, { useEffect, useState } from "react";
import {
  getPokemon,
  getRarities,
  getSummary,
  listAll,
} from "../../api/pokedex.api";

import Loader from "../../components/Loader";
import styled from "styled-components";
import { useGame } from "../../contexts/GameContext";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100%;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 12px;
  color: white;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 6px;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 12px;
`;

const Panel = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid #577599;
  border-radius: 10px;
  padding: 10px;
  color: #eaeaea;
`;

const Search = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #577599;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
`;

const List = styled.div`
  margin-top: 8px;
  max-height: 640px;
  overflow: auto;
`;

const ListRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
`;

const PokeImg = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 6px;
`;

const InfoWrap = styled.div`
  max-height: 640px;
  overflow: auto;
`;

const PokedexPage: React.FC = () => {
  const { selectedCharacter } = useGame();
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    hasPokedex: boolean;
    seen: number;
    owned: number;
    total: number;
  } | null>(null);
  const [rarities, setRarities] = useState<any[]>([]);
  const [all, setAll] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [pokemonInfo, setPokemonInfo] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!selectedCharacter) return;
      setLoading(true);
      setError(null);
      try {
        const s = await getSummary(selectedCharacter.user_id);
        if (s.success && s.data) setSummary(s.data);
        const r = await getRarities();
        if (r.success && r.data) setRarities(r.data);
        const l = await listAll();
        if (l.success && l.data) setAll(l.data);
      } catch (e: any) {
        setError(e.response?.data?.message || "שגיאה בטעינת פוקדקס");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedCharacter?.user_id]);

  useEffect(() => {
    const loadPoke = async () => {
      if (!selected) return;
      try {
        const r = await getPokemon(selected);
        if (r.success) setPokemonInfo(r.data);
      } catch {}
    };
    loadPoke();
  }, [selected]);

  const filtered = all.filter((p) =>
    (p.naam || "").toLowerCase().includes(filter.toLowerCase())
  );

  const favoriteSpot = (area: string) => {
    switch (area) {
      case "Gras":
        return "דשא";
      case "Lavagrot":
        return "מערת הלבה";
      case "Water":
        return "מים";
      case "Grot":
        return "מערה";
      case "Strand":
        return "חוף";
      case "Vechtschool":
        return "בית ספר ללחימה";
      case "Spookhuis":
        return "בית רדוף רוחות";
      default:
        return "אין מקום אהוב";
    }
  };

  if (loading) return <Loader />;

  if (summary && !summary.hasPokedex)
    return (
      <Container>
        <Header>
          <Title>Pokédex</Title>
          <div className="red">עליך לרכוש Pokédex!</div>
        </Header>
      </Container>
    );

  return (
    <Container>
      <Header>
        <Title>Pokédex</Title>
        {summary && (
          <div className="blue">
            ראית {summary.seen} מתוך {summary.total} פוקימונים, ומתוכם תפסת{" "}
            {summary.owned}.
          </div>
        )}
      </Header>

      <Panel style={{ marginBottom: 7 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 8,
          }}
        >
          {rarities.map((r: any) => (
            <select
              key={r.rarity.id}
              style={{ width: "100%" }}
              onChange={(e) => setSelected(Number(e.target.value))}
            >
              <option disabled selected>
                {r.rarity.nome}
              </option>
              {r.pokemons.map((p: any) => (
                <option key={p.wild_id} value={p.wild_id}>
                  {p.naam}
                </option>
              ))}
            </select>
          ))}
        </div>
      </Panel>

      <Layout>
        <Panel>
          <Search
            placeholder="חיפוש פוקימון"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <List>
            {filtered.map((p: any) => (
              <ListRow key={p.wild_id} onClick={() => setSelected(p.wild_id)}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <PokeImg
                    src={`/images/pokemon/${p.wild_id}.gif`}
                    onError={(e: any) => {
                      e.target.src = "/images/pokemon/1.gif";
                    }}
                  />
                  <span>
                    {p.real_id}. {p.naam}
                  </span>
                </div>
              </ListRow>
            ))}
          </List>
        </Panel>
        <Panel>
          <InfoWrap>
            {!selected ? (
              <div className="red">בחר פוקימון!</div>
            ) : !pokemonInfo ? (
              <div>טוען מידע...</div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <PokeImg
                    style={{ width: 48, height: 48 }}
                    src={`/images/pokemon/${pokemonInfo.wild_id}.gif`}
                    onError={(e: any) => {
                      e.target.src = "/images/pokemon/1.gif";
                    }}
                  />
                  <div style={{ fontWeight: 700, fontSize: 18 }}>
                    {pokemonInfo.real_id}. {pokemonInfo.naam}
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  סוגים: {pokemonInfo.type1}
                  {pokemonInfo.type2 ? ` / ${pokemonInfo.type2}` : ""}
                </div>
                <div style={{ marginTop: 8, display: "inline-flex" }}>
                  <table
                    style={{
                      width: "50%",
                      borderSpacing: 0,
                      background: "#34465f",
                      color: "#eee",
                      verticalAlign: "middle",
                      border: "1px solid rgb(87, 117, 153)",
                    }}
                  >
                    <thead>
                      <tr>
                        <th colSpan={6}>סטאטים בסיסיים</th>
                      </tr>
                      <tr>
                        <th style={{ width: 60 }} align="center">
                          <img
                            src="/images/icons/stats/stat_hp.png"
                            title="HP"
                            alt="HP"
                          />
                        </th>
                        <th style={{ width: 61 }} align="center">
                          <img
                            src="/images/icons/stats/stat_at.png"
                            title="Attack"
                            alt="Attack"
                          />
                        </th>
                        <th style={{ width: 61 }} align="center">
                          <img
                            src="/images/icons/stats/stat_de.png"
                            title="Defense"
                            alt="Defense"
                          />
                        </th>
                        <th style={{ width: 61 }} align="center">
                          <img
                            src="/images/icons/stats/stat_sa.png"
                            title="Special Attack"
                            alt="Special Attack"
                          />
                        </th>
                        <th style={{ width: 61 }} align="center">
                          <img
                            src="/images/icons/stats/stat_sd.png"
                            title="Special Defense"
                            alt="Special Defense"
                          />
                        </th>
                        <th style={{ width: 61 }} align="center">
                          <img
                            src="/images/icons/stats/stat_sp.png"
                            title="Speed"
                            alt="Speed"
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td align="center">{pokemonInfo.hp_base}</td>
                        <td align="center">{pokemonInfo.attack_base}</td>
                        <td align="center">{pokemonInfo.defence_base}</td>
                        <td align="center">{pokemonInfo["spc.attack_base"]}</td>
                        <td align="center">
                          {pokemonInfo["spc.defence_base"]}
                        </td>
                        <td align="center">{pokemonInfo.speed_base}</td>
                      </tr>
                    </tbody>
                  </table>
                  <table
                    style={{
                      width: "50%",
                      borderSpacing: 0,
                      background: "#34465f",
                      color: "#eee",
                      verticalAlign: "middle",
                      border: "1px solid rgb(87, 117, 153)",
                    }}
                  >
                    <thead>
                      <tr>
                        <th colSpan={6}>רווח EV</th>
                      </tr>
                      <tr>
                        <th style={{ width: 60 }} align="center">
                          <img
                            src="/images/icons/stats/stat_hp.png"
                            title="HP"
                            alt="HP"
                          />
                        </th>
                        <th style={{ width: 61 }} align="center">
                          <img
                            src="/images/icons/stats/stat_at.png"
                            title="Attack"
                            alt="Attack"
                          />
                        </th>
                        <th style={{ width: 61 }} align="center">
                          <img
                            src="/images/icons/stats/stat_de.png"
                            title="Defense"
                            alt="Defense"
                          />
                        </th>
                        <th style={{ width: 61 }} align="center">
                          <img
                            src="/images/icons/stats/stat_sa.png"
                            title="Special Attack"
                            alt="Special Attack"
                          />
                        </th>
                        <th style={{ width: 61 }} align="center">
                          <img
                            src="/images/icons/stats/stat_sd.png"
                            title="Special Defense"
                            alt="Special Defense"
                          />
                        </th>
                        <th style={{ width: 61 }} align="center">
                          <img
                            src="/images/icons/stats/stat_sp.png"
                            title="Speed"
                            alt="Speed"
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td align="center">{pokemonInfo.effort_hp}</td>
                        <td align="center">{pokemonInfo.effort_attack}</td>
                        <td align="center">{pokemonInfo.effort_defence}</td>
                        <td align="center">
                          {pokemonInfo["effort_spc.attack"]}
                        </td>
                        <td align="center">
                          {pokemonInfo["effort_spc.defence"]}
                        </td>
                        <td align="center">{pokemonInfo.effort_speed}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid #577599",
                      borderRadius: 8,
                      height: 130,
                      backgroundImage: `url(/images/pokemon/${pokemonInfo.wild_id}.gif)`,
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                  <div
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid #577599",
                      borderRadius: 8,
                      height: 130,
                      backgroundImage: `url(/images/shiny/${pokemonInfo.wild_id}.gif)`,
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                </div>

                <div style={{ marginTop: 10 }}>
                  נדירות: {pokemonInfo.rarity_name || "-"}
                </div>
                <div style={{ marginTop: 6 }}>
                  עולם: {pokemonInfo.wereld || "-"}
                </div>
                <div style={{ marginTop: 6 }}>
                  סיכוי תפיסה: {pokemonInfo.capture_chance}%
                </div>
                <div style={{ marginTop: 6 }}>
                  מקום אהוב: {favoriteSpot(pokemonInfo.gebied)}
                </div>
                <div style={{ marginTop: 6 }}>
                  כמות במשחק:{" "}
                  {Number(pokemonInfo.count_in_game || 0).toLocaleString()}{" "}
                  (Lv.100:{" "}
                  {Number(pokemonInfo.count_level_100 || 0).toLocaleString()})
                </div>

                {pokemonInfo.abilities && pokemonInfo.abilities.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    יכולות: {pokemonInfo.abilities.join(", ")}
                  </div>
                )}

                {(pokemonInfo.aanval_1 ||
                  pokemonInfo.aanвал_2 ||
                  pokemonInfo.aanвал_3 ||
                  pokemonInfo.aanвал_4) && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      מהלכים התחלתיים
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid #577599",
                          borderRadius: 6,
                          padding: 6,
                          textAlign: "center",
                        }}
                      >
                        {pokemonInfo.aanval_1 || "--"}
                      </div>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid #577599",
                          borderRadius: 6,
                          padding: 6,
                          textAlign: "center",
                        }}
                      >
                        {pokemonInfo.aanval_2 || "--"}
                      </div>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid #577599",
                          borderRadius: 6,
                          padding: 6,
                          textAlign: "center",
                        }}
                      >
                        {pokemonInfo.aanval_3 || "--"}
                      </div>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid #577599",
                          borderRadius: 6,
                          padding: 6,
                          textAlign: "center",
                        }}
                      >
                        {pokemonInfo.aanval_4 || "--"}
                      </div>
                    </div>
                  </div>
                )}

                {pokemonInfo.evolve_from && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      מתפתח מ
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <img
                        src={`/images/pokemon/icon/${pokemonInfo.evolve_from.from.wild_id}.gif`}
                        style={{ width: 24, height: 24 }}
                        alt={pokemonInfo.evolve_from.from.naam}
                      />
                      <span>{pokemonInfo.evolve_from.from.naam}</span>
                    </div>
                  </div>
                )}

                {pokemonInfo.level_data &&
                  pokemonInfo.level_data.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>
                        מהלכים/אבולוציה לפי רמות
                      </div>
                      <div
                        style={{
                          maxHeight: 220,
                          overflow: "auto",
                          border: "1px solid #577599",
                          borderRadius: 8,
                        }}
                      >
                        <table style={{ width: "100%", fontSize: 13 }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: "left", padding: 6 }}>
                                Level
                              </th>
                              <th style={{ textAlign: "left", padding: 6 }}>
                                אירוע
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pokemonInfo.level_data.map(
                              (row: any, idx: number) => (
                                <tr key={idx}>
                                  <td style={{ padding: 6 }}>
                                    {row.level < 100 ? row.level || "-" : null}
                                    {row.stone !== "" ? (
                                      <img
                                        src={require(`../../assets/images/items/${row.stone}.png`)}
                                        alt={row.stone}
                                      />
                                    ) : null}
                                    {row.trade === 1 ? (
                                      <img
                                        src={require(`../../assets/images/icons/trade.png`)}
                                        alt="trade"
                                      />
                                    ) : null}
                                    {row.nieuw_id === 106
                                      ? " + Attack > Defense"
                                      : row.nieuw_id === 107
                                      ? " + Attack < Defense"
                                      : row.nieuw_id === 237
                                      ? " + Attack = Defense"
                                      : null}
                                    {row.trade === 1 && row.item !== "" ? (
                                      <>
                                        +
                                        <img
                                          src={require(`../../assets/images/items/${row.item}.png`)}
                                          alt={row.item}
                                        />
                                      </>
                                    ) : null}
                                    {row.region !== ""
                                      ? ` + ${row.region}`
                                      : null}
                                  </td>
                                  <td style={{ padding: 6 }}>
                                    {row.wat === "att" ? (
                                      row.aanval
                                    ) : (
                                      <>
                                        <img
                                          src={require(`../../assets/images/pokemon/icon/${row.nieuw_id}.gif`)}
                                          alt={row.nieuw_id}
                                        />
                                      </>
                                    )}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {pokemonInfo.tmhm && pokemonInfo.tmhm.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      TM/HM
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {pokemonInfo.tmhm.map((t: any) => (
                        <div
                          key={t.naam}
                          style={{
                            border: "1px solid #577599",
                            borderRadius: 6,
                            padding: "6px 8px",
                            background: "rgba(255,255,255,0.06)",
                          }}
                        >
                          {t.naam}
                          <img
                            src={require(`../../assets/images/items/Attack_${t.type1}.png`)}
                            alt={t.omschrijving}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pokemonInfo.type_effectiveness && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      יעילות סוגים נגדו
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(90px, 1fr))",
                        gap: 6,
                      }}
                    >
                      {Object.entries(pokemonInfo.type_effectiveness).map(
                        ([k, v]: any) => (
                          <div
                            key={k}
                            style={{
                              border: "1px solid #577599",
                              borderRadius: 6,
                              padding: 6,
                              background: "rgba(255,255,255,0.06)",
                            }}
                          >
                            <div style={{ fontWeight: 700 }}>{k}</div>
                            <div>{v.multiplier}x</div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {pokemonInfo.top3 && pokemonInfo.top3.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      TOP 3 מהמין
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 8,
                      }}
                    >
                      {pokemonInfo.top3.map((t: any, idx: number) => (
                        <div
                          key={idx}
                          style={{
                            border: "1px solid #577599",
                            borderRadius: 8,
                            padding: 8,
                            background: "rgba(255,255,255,0.06)",
                          }}
                        >
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>
                            #{idx + 1}
                          </div>
                          <div>שחקן: {t.username}</div>
                          <div>
                            כוח: {Number(t.powerTotal).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </InfoWrap>
        </Panel>
      </Layout>
    </Container>
  );
};

export default PokedexPage;
