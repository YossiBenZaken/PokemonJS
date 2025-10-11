import { Alert, Snackbar, SnackbarCloseReason } from "@mui/material";
import { DataGrow, learnNewAttack } from "../../api/battle.api";
import React, { useState } from "react";

import { BoxContent } from "../Attack/TrainerAttack/styled";
import { useBattle } from "../../contexts/BattleContext";
import { useGame } from "../../contexts/GameContext";
import { useNavigate } from "react-router-dom";

const PokeNewAttackPage: React.FC = () => {
  const { pokemonEvolve } = useBattle();
  const { myPokemons, attacks } = useGame();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  function findPokemonByEvolution(pokemons: any[], dataGrow: DataGrow) {
    const matches: { pokemon: any; newAttack: string }[] = [];
    const found = pokemons.find((p) => p.id === dataGrow.pokemonId);
    if (found) {
      matches.push({ pokemon: found, newAttack: dataGrow.newAttack });
    }

    return matches;
  }

  if (!pokemonEvolve) return null;

  const result = findPokemonByEvolution(myPokemons, pokemonEvolve);

  const handleOnSubmit = async (
    pokemon: any,
    oldAttack: number | undefined,
    newAttack: string
  ) => {
    const changeAttack = oldAttack !== undefined ? `aanval_${oldAttack + 1}` : undefined;
    const response = await learnNewAttack(pokemon.id, changeAttack, newAttack);
    if (response.success) {
      navigate("/");
    } else {
      setOpen(true);
    }
  };

  const pokemonAttacks = (pokemon: any) => {
    return [
      pokemon?.aanval_1,
      pokemon?.aanval_2,
      pokemon?.aanval_3,
      pokemon?.aanval_4,
    ].filter((a) => a && a !== ""); // מסנן ערכים ריקים
  };

  const getTypeOfAttack = (attackName: string) => {
    return (
      attacks.find((attack) => attack.naam === attackName)?.soort || "Normal"
    );
  };

  const handleSnackBarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleSnackBarClose}
        dir="rtl"
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
      >
        <Alert
          severity={"error"}
          sx={{ width: "100%" }}
          dir="rtl"
          icon={false}
          slots={{
            action: undefined,
            closeButton: undefined,
          }}
        >
          שגיאה בלמידת מתקפה
        </Alert>
      </Snackbar>
      <BoxContent style={{ width: "100%", height: "100%", direction: "rtl" }}>
        {result.map(({ newAttack, pokemon }) => {
          return (
            <table
              style={{
                borderSpacing: 0,
                background: "#34465f",
                color: "#eee",
                verticalAlign: "middle",
                textAlign: "center",
              }}
              width={"100%"}
            >
              <thead>
                <tr>
                  <th colSpan={6} style={{ textAlign: "center" }}>
                    {pokemon.naam} רוצה ללמוד מתקפה חדשה {newAttack}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ width: "100%", padding: 0, margin: "10px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={`/images/${
                          pokemon.shiny === 1 ? "shiny" : "pokemon"
                        }/${pokemon.wild_id}.gif`}
                        alt={pokemon.naam}
                        style={{
                          margin: "0 auto",
                          height: 100,
                          verticalAlign: "middle",
                        }}
                      />
                    </div>
                    <div>
                      בחר איזה מתקפה אתה רוצה לשכוח בתמורה למתקפה החדשה
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "auto auto",
                          gap: "1rem",
                        }}
                      >
                        {pokemonAttacks(pokemon).map(
                          (attack: string | undefined, index) => (
                            <button
                              key={index}
                              style={{
                                cursor: "pointer",
                                background: `url(/images/attack/moves/${getTypeOfAttack(
                                  attack!
                                )}.png) no-repeat`,
                                margin: "3px auto",
                              }}
                              className="btn-type"
                              onClick={() =>
                                handleOnSubmit(pokemon, index, newAttack)
                              }
                            >
                              {attack}
                            </button>
                          )
                        )}
                      </div>
                        <button
                          style={{
                            cursor: "pointer",
                            margin: "3px auto",
                          }}
                          onClick={() =>
                            handleOnSubmit(pokemon, undefined, newAttack)
                          }
                        >
                          בטל למידה
                        </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          );
        })}
      </BoxContent>
    </>
  );
};

export default PokeNewAttackPage;
