import { AanvalLog, ComputerInfo, PokemonInfo } from "../api/battle.api";
import React, { ReactNode, createContext, useContext, useState } from "react";

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

  const value: BattleContextType = {
    challengeData,
    setChallengeData,
    computerInfo,
    setComputerInfo,
    pokemonInfo,
    setPokemonInfo,
    attackLog,
    setAttackLog
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
