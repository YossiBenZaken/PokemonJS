import "./style.css";

import {
  AttackWrapper,
  BattlePokemon,
  BoxContent,
  ComputerStar,
  EffectWrapper,
  ExpProgress,
  ExpWrapper,
  HpRed,
  HpWrapper,
  MyPokemonBar,
  MyPokemonName,
  MyPokemonNameWrapper,
  Name,
  OpponentName,
  OpponentNameWrapper,
  OpponentPokemonImage,
  PokeBallWrapper,
  PokemonImage,
  Progress,
  TableDuelArena,
  TextBox,
  Title,
  Weather,
} from "./TrainerAttack/styled";
import React from "react";

import { ItemData } from "../../models/item.model";
import { useBattle } from "../../contexts/BattleContext";
import { useGame } from "../../contexts/GameContext";
import { useAttack } from "./useAttack";

const TrainerAttack: React.FC = () => {
  const { attackLog, computerInfo, pokemonInfo, battleState } = useBattle();
  const { myPokemons, selectedCharacter, itemInfo } = useGame();
  const {
    getColorOfPokemon,
    getRareOfPokemon,
    calculatePercent,
    getTypeOfAttack,
    handleAttackClick,
    handleItemUse,
    handlePokemonChange,
    handleSelectAttack,
    handleSelectBag,
    handleSelectPokemon,
    handleSelectRun,
    handleUseItem,
    pokemonAttacks,
    showPotionsScreen,
    battleMessage,
    selectedPotion,
    showAttacks,
    showBag,
    showPokemons,
    enemyPokemons
  } = useAttack(true);

  const potions = itemInfo.filter((item) => item.soort === "potions");

  // Check if battle data is loaded
  if (!attackLog || !computerInfo || !pokemonInfo) {
    return (
      <BoxContent className="max-w-7xl mx-auto p-4 space-y-6">
        <div>Loading battle...</div>
      </BoxContent>
    );
  }

  return (
    <BoxContent className="max-w-7xl mx-auto p-4 space-y-6">
      <Title>קרב נגד {attackLog?.trainer}</Title>
      <Weather id="weather">
        <img id="zmove" />
        <TableDuelArena>
          <tbody>
            <tr>
              <td>
                <section
                  style={{
                    position: "absolute",
                    right: 50,
                    top: 50,
                    height: 70,
                    transform: "skew(20deg)",
                    background: "#000000b3",
                    backdropFilter: "blur(5px)",
                    borderRadius: 8,
                    padding: 5,
                  }}
                >
                  <div
                    style={{
                      transform: "skew(-20deg)",
                      paddingRight: 15,
                      direction: "rtl",
                    }}
                  >
                    <OpponentNameWrapper>
                      <OpponentName>
                        <Name
                          color={getColorOfPokemon(computerInfo?.zeldzaamheid)}
                        >
                          <span id="trainer_naam">
                            {computerInfo?.naam_goed} ({computerInfo?.level},{" "}
                            {getRareOfPokemon(computerInfo?.zeldzaamheid!)})
                          </span>
                        </Name>
                        <ComputerStar style={{ display: computerInfo?.star }} />
                        <EffectWrapper
                          id="computer_effect"
                          style={{
                            display: computerInfo.effect ? "block" : "none",
                          }}
                        >
                          <img
                            src={require(`../../assets/images/effects/${
                              computerInfo.effect || "none"
                            }.png`)}
                            alt={computerInfo.effect}
                          />
                        </EffectWrapper>
                      </OpponentName>
                      <PokeBallWrapper>
                        {enemyPokemons.map((pokemon) => (
                          <img
                            key={pokemon.id}
                            id={`trainer_${pokemon.id}`}
                            src={pokemon.leven > 0 ?require("../../assets/images/icons/pokeball.gif") : require("../../assets/images/icons/pokeball_black.gif")}
                            title="Ready"
                            alt="Ready"
                            width="14"
                            height="14"
                          />
                        ))}
                      </PokeBallWrapper>
                    </OpponentNameWrapper>
                    <HpWrapper>
                      <HpRed
                        style={{
                          marginTop: 6,
                        }}
                      >
                        <Progress
                          id="computer_life"
                          style={{
                            width: `${calculatePercent(computerInfo!)}%`,
                          }}
                          data-original-title={`${computerInfo?.leven}/${computerInfo?.levenmax}`}
                        >
                          {calculatePercent(computerInfo!)}%
                        </Progress>
                      </HpRed>
                    </HpWrapper>
                  </div>
                </section>
              </td>
              <td>
                <div id="dame" style={{ display: "none" }} />
                <div className="infront" id="hit" style={{ display: "none" }}>
                  <img src={require("../../assets/images/hit.png")} alt="Hit" />
                </div>
                <OpponentPokemonImage
                  id="img_trainer"
                  src={require(`../../assets/images/${computerInfo?.map}/${computerInfo?.wild_id}.gif`)}
                  alt={computerInfo?.naam_goed}
                />
              </td>
            </tr>
            <tr>
              <td>
                <div id="dame2" style={{ display: "none" }} />
                <div className="inback" id="hit2" style={{ display: "none" }}>
                  <img src={require("../../assets/images/hit.png")} alt="Hit" />
                </div>
                <PokemonImage
                  id="img_pokemon"
                  src={require(`../../assets/images/${pokemonInfo?.map}/back/${pokemonInfo?.wild_id}.gif`)}
                  alt={pokemonInfo?.naam_goed}
                />
              </td>
              <td>
                <MyPokemonBar>
                  <MyPokemonNameWrapper>
                    <MyPokemonName>
                      <Name
                        color={getColorOfPokemon(pokemonInfo?.zeldzaamheid!)}
                      >
                        <span id="pokemon_naam">
                          {pokemonInfo?.naam_goed} ({pokemonInfo?.level},{" "}
                          {getRareOfPokemon(pokemonInfo?.zeldzaamheid!)})
                        </span>
                      </Name>
                      <ComputerStar style={{ display: pokemonInfo?.star }} />
                    </MyPokemonName>
                  </MyPokemonNameWrapper>
                  <HpWrapper>
                    <HpRed
                      style={{
                        marginTop: 6,
                      }}
                    >
                      <Progress
                        id="pokemon_life"
                        style={{  width: `${calculatePercent(pokemonInfo!)}%`, }}
                        
                        data-original-title={`${pokemonInfo?.leven}/${pokemonInfo?.levenmax}`}
                      >
                        {pokemonInfo?.leven}/{pokemonInfo?.levenmax}
                      </Progress>
                    </HpRed>
                    <EffectWrapper
                      id="pokemon_effect"
                      style={{
                        display: pokemonInfo.effect ? "block" : "none",
                      }}
                    >
                      <img
                        src={require(`../../assets/images/effects/${
                          pokemonInfo.effect || "none"
                        }.png`)}
                        alt={pokemonInfo.effect}
                      />
                    </EffectWrapper>
                  </HpWrapper>
                  <ExpWrapper>
                    <HpRed
                      style={{
                        marginTop: 0,
                      }}
                    >
                      <ExpProgress
                        id="pokemon_exp"
                        style={{
                          width: `${Math.round(
                            (pokemonInfo.exp! / pokemonInfo.expnodig!) * 100
                          )}%`,
                        }}
                      />
                    </HpRed>
                  </ExpWrapper>
                </MyPokemonBar>
              </td>
            </tr>
          </tbody>
        </TableDuelArena>
      </Weather>
      <AttackWrapper>
        <center>
          <div id="atacar" style={{ display: showAttacks ? "block" : "none" }}>
            {pokemonAttacks.map((attack: string | undefined, index) => (
              <button
                key={index}
                id={`aanval-${index}`}
                onClick={() => handleAttackClick(attack!)}
                disabled={!battleState.spelerAttack}
                style={{
                  background: `url(${require(`../../assets/images/attack/moves/${getTypeOfAttack(
                    attack!
                  )}.png`)}) no-repeat`,
                  float: index % 2 === 0 ? "left" : "right",
                  opacity: battleState.spelerAttack ? 1 : 0.5,
                  cursor: battleState.spelerAttack ? "pointer" : "not-allowed",
                }}
                className="btn-type"
              >
                {attack}
              </button>
            ))}
            <br />
            <button
              id="use-zmove"
              onClick={() => handleAttackClick(pokemonAttacks[0]!, true)}
              disabled={!battleState.spelerAttack || battleState.trainerZmove}
              className="zmove btn-type"
              style={{
                display: !battleState.trainerZmove ? "none" : "block",
                opacity: battleState.spelerAttack ? 1 : 0.5,
              }}
            ></button>{" "}
          </div>
          <div
            id="pokemon"
            style={{
              marginBottom: -27,
              display: showPokemons ? "block" : "none",
            }}
          >
            {myPokemons.map((pokemon, index) => {
              return (
                <BattlePokemon
                  key={pokemon.id}
                  id="change_pokemon"
                  onClick={() => handlePokemonChange(index + 1)}
                  style={{
                    backgroundImage: `url(${require(`../../assets/images/${
                      pokemon.shiny === 1 ? "shiny" : "pokemon"
                    }/icon/${pokemon.wild_id}.gif`)})`,
                    opacity:
                      battleState.spelerWissel && pokemon.leven > 0 ? 1 : 0.5,
                    cursor:
                      battleState.spelerWissel && pokemon.leven > 0
                        ? "pointer"
                        : "not-allowed",
                  }}
                  data-original-title={`${pokemon.naam} HP: ${pokemon.leven}/${pokemon.levenmax}`}
                >
                  {pokemon.naam}
                  <HpRed style={{ height: 3, width: `86%` }}>
                    <Progress
                      style={{ width: `${calculatePercent(pokemon)}%` }}
                    ></Progress>
                  </HpRed>
                </BattlePokemon>
              );
            })}
          </div>
          <div id="mochila" style={{ display: showBag ? "block" : "none" }}>
            <div
              className="items-carousel"
              style={{
                width: "100%",
                marginBottom: -21,
                display: "flex",
                justifyContent: "center",
              }}
            >
              {potions.map((potion) => {
                const name = potion.naam as keyof ItemData;
                const quantity = selectedCharacter?.items[name];
                if (Number(quantity) > 0) {
                  return (
                    <div key={potion.naam} className="carousel-cell">
                      <div
                        data-item-name={potion.naam}
                        data-item-type={potion.soort}
                        onClick={() => {
                          handleUseItem(potion, name);
                        }}
                        style={{
                          opacity: battleState.spelerAttack ? 1 : 0.5,
                          cursor: battleState.spelerAttack
                            ? "pointer"
                            : "not-allowed",
                          position: "relative",
                        }}
                      >
                        <img
                          src={require(`../../assets/images/items/${potion.naam}.png`)}
                          className="image"
                          alt={potion.naam}
                        />
                        <span
                          className="badges qtd"
                          style={{
                            position: "absolute",
                            cursor: "pointer",
                            bottom: 5,
                            marginLeft: 10,
                          }}
                        >
                          {quantity}
                        </span>
                      </div>
                    </div>
                  );
                } else {
                  return null;
                }
              })}
            </div>
          </div>
        </center>
      </AttackWrapper>
      <div
        className="potion_screen"
        style={{ display: showPotionsScreen ? "" : "none" }}
      >
        <Title>
          בחרו את הפוקימון שתרצו להשתמש ב{" "}
          <span id="item_name">{selectedPotion}</span>:
        </Title>
        {myPokemons.map((pokemon) => {
          return (
            <BattlePokemon
              id="use_potion"
              key={pokemon.id}
              onClick={() => handleItemUse(selectedPotion, pokemon.id)}
              style={{
                backgroundImage: `url(${require(`../../assets/images/${
                  pokemon.shiny === 1 ? "shiny" : "pokemon"
                }/icon/${pokemon.wild_id}.gif`)})`,
                cursor: "pointer",
              }}
              data-original-title={`${pokemon.naam} HP: ${pokemon.leven}/${pokemon.levenmax}`}
            >
              {pokemon.naam}
              <HpRed style={{ height: 3, width: `86%` }}>
                <Progress
                  style={{ width: `${calculatePercent(pokemon)}%` }}
                ></Progress>
              </HpRed>
            </BattlePokemon>
          );
        })}
      </div>
      <TextBox>
        <table style={{ width: "100%" }}>
          <tbody>
            <tr style={{ height: 150 }}>
              <td style={{ width: "41%" }}>
                <div style={{ textAlign: "center" }}>
                  <div
                    onClick={handleSelectAttack}
                    className="selector attack"
                  ></div>
                  <div onClick={handleSelectBag} className="selector bag"></div>
                  <div
                    onClick={handleSelectPokemon}
                    className="selector pokemon"
                  ></div>
                  <div
                    onClick={handleSelectRun}
                    id="run"
                    className="selector run"
                  ></div>
                </div>
              </td>
              <td
                style={{
                  width: "53%",
                  background: `url(${require("../../assets/images/layout/battle/text-content.png")}) no-repeat`,
                  backgroundSize: "100% 100%",
                  padding: 12,
                }}
              >
                <div
                  style={{ width: "99%" }}
                  id="message"
                  dangerouslySetInnerHTML={{ __html: battleMessage }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </TextBox>
    </BoxContent>
  );
};

export default TrainerAttack;
