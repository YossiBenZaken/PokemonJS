import {
  DataGrow,
  EvolutionOption,
  acceptEvolution,
} from "../../api/battle.api";

import { ArrowBigRight } from "lucide-react";
import { BoxContent } from "../Attack/TrainerAttack/styled";
import React from "react";
import { useBattle } from "../../contexts/BattleContext";
import { useGame } from "../../contexts/GameContext";
import { useNavigate } from "react-router-dom";

const PokeEvolvePage: React.FC = () => {
  const { pokemonEvolve, setPokemonEvolve } = useBattle();
  const { myPokemons } = useGame();
  const navigate = useNavigate();
  function findPokemonByEvolution(pokemons: any[], dataGrow: DataGrow) {
    const matches: { pokemon: any; evolution: EvolutionOption }[] = [];

    for (const evo of dataGrow.evolutionOptions) {
      const found = pokemons.find((p) => p.id === evo.pokemonId);
      if (found) {
        matches.push({ pokemon: found, evolution: evo });
      }
    }

    return matches;
  }

  if(!pokemonEvolve) return null;

  const result = findPokemonByEvolution(myPokemons, pokemonEvolve);
  const cancelEvo = async (pokemonId: number, fromAccept: boolean = false) => {
    const filteredPokemon = pokemonEvolve.evolutionOptions.filter(
      (evo) => evo.pokemonId !== pokemonId
    );
    setPokemonEvolve((prev) => ({
      ...prev!,
      evolutionOptions: filteredPokemon,
    }));
    if (!fromAccept) {
      await acceptEvolution(
        pokemonId,
        filteredPokemon[0].evolutionData.nieuw_id,
        false
      );
    }
    navigate("/");
  };
  const handleOnSubmit = async (pokemonId: number) => {
    const filteredPokemon = pokemonEvolve.evolutionOptions.filter(
      (evo) => evo.pokemonId === pokemonId
    );
    await acceptEvolution(pokemonId, filteredPokemon[0].evolutionData.nieuw_id);
    await cancelEvo(pokemonId, true);
  };

  return (
    <BoxContent style={{ width: "100%", height: "100%" }}>
      {result.map((pokemon) => {
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
                  הגיע הזמן להתפתח
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
                      src={require(`../../assets/images/${
                        pokemon.pokemon.shiny === 1 ? "shiny" : "pokemon"
                      }/${pokemon.evolution.evolutionData.wild_id}.gif`)}
                      alt={pokemon.pokemon.naam}
                      style={{
                        margin: "0 auto",
                        height: 100,
                        verticalAlign: "middle",
                      }}
                    />{" "}
                    <ArrowBigRight size={50} />
                    <img
                      src={require(`../../assets/images/${
                        pokemon.pokemon.shiny === 1 ? "shiny" : "pokemon"
                      }/${pokemon.evolution.evolutionData.nieuw_id}.gif`)}
                      alt={pokemon.pokemon.naam}
                      style={{
                        margin: "0 auto",
                        height: 100,
                        verticalAlign: "middle",
                      }}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <button
                onClick={() => handleOnSubmit(pokemon.evolution.pokemonId)}
                name="submit"
                className="button"
                style={{ margin: 6 }}
              >
                אשר התפתחות
              </button>
              <button
                onClick={() => cancelEvo(pokemon.evolution.pokemonId)}
                name="submit"
                className="button"
                style={{ margin: 6 }}
              >
                בטל התפתחות
              </button>
            </tfoot>
          </table>
        );
      })}
    </BoxContent>
  );
};

export default PokeEvolvePage;
