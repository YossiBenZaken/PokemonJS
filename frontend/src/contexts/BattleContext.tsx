import { AanvalLog, ComputerInfo, PokemonInfo } from "../api/battle.api";
import { BattleState, battleReducer, initialBattleState } from "../reducers/BattleReducer";
import React, { ReactNode, createContext, useContext, useReducer, useState } from "react";

import { PostChallengeData } from "../api/gyms.api";

interface BattleContextType {
  challengeData: PostChallengeData | undefined;
  setChallengeData: (data: PostChallengeData) => void;

  computerInfo: ComputerInfo | undefined;
  setComputerInfo: (data: ComputerInfo) => void;

  pokemonInfo: PokemonInfo | undefined;
  setPokemonInfo: (data: PokemonInfo) => void;

  attackLog: AanvalLog | undefined;
  setAttackLog: (data: AanvalLog) => void;

  battleState: BattleState;
  dispatchBattle: React.Dispatch<any>
}

const BattleContext = createContext<BattleContextType | undefined>(undefined);

interface BattleProviderProps {
  children: ReactNode;
}

export const BattleProvider: React.FC<BattleProviderProps> = ({ children }) => {
  const [challengeData, setChallengeData] = useState<
    PostChallengeData
  >();

  const [computerInfo, setComputerInfo] = useState<ComputerInfo>();
  const [pokemonInfo, setPokemonInfo] = useState<PokemonInfo>();
  const [attackLog, setAttackLog] = useState<AanvalLog>();

  const [battleState, dispatchBattle] = useReducer(battleReducer, initialBattleState);

  const value: BattleContextType = {
    challengeData,
    setChallengeData,
    computerInfo,
    setComputerInfo,
    pokemonInfo,
    setPokemonInfo,
    attackLog,
    setAttackLog,
    battleState,
    dispatchBattle
  };

  return (
    <BattleContext.Provider value={value}>{children}</BattleContext.Provider>
  );
};

export const useBattle = () => {
  const context = useContext(BattleContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
