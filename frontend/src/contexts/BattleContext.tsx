import {
  AttackLog,
  ComputerInfo,
  DataGrow,
  PokemonInfo,
} from "../api/battle.api";
import {
  BattleState,
  battleReducer,
  initialBattleState,
} from "../reducers/BattleReducer";
import React, {
  ReactNode,
  createContext,
  useContext,
  useReducer,
  useState,
} from "react";

import { PostChallengeData } from "../api/gyms.api";

interface BattleContextType {
  challengeData: PostChallengeData | undefined;
  setChallengeData: React.Dispatch<
    React.SetStateAction<PostChallengeData | undefined>
  >;

  computerInfo: ComputerInfo | undefined;
  setComputerInfo: React.Dispatch<
    React.SetStateAction<ComputerInfo | undefined>
  >;

  pokemonInfo: PokemonInfo | undefined;
  setPokemonInfo: React.Dispatch<React.SetStateAction<PokemonInfo | undefined>>;

  attackLog: AttackLog | undefined;
  setAttackLog: React.Dispatch<React.SetStateAction<AttackLog | undefined>>;

  pokemonEvolve: DataGrow | undefined;
  setPokemonEvolve: React.Dispatch<React.SetStateAction<DataGrow|undefined>>;

  battleState: BattleState;
  dispatchBattle: React.Dispatch<any>;

  enemyPokemons: { id: number; leven: number }[];
  setEnemyPokemons: React.Dispatch<
    React.SetStateAction<{ id: number; leven: number }[]>
  >;
}

const BattleContext = createContext<BattleContextType | undefined>(undefined);

interface BattleProviderProps {
  children: ReactNode;
}

export const BattleProvider: React.FC<BattleProviderProps> = ({ children }) => {
  const [challengeData, setChallengeData] = useState<PostChallengeData>();

  const [computerInfo, setComputerInfo] = useState<ComputerInfo>();
  const [pokemonInfo, setPokemonInfo] = useState<PokemonInfo>();
  const [attackLog, setAttackLog] = useState<AttackLog>();
  const [pokemonEvolve, setPokemonEvolve] = useState<DataGrow>();
  const [enemyPokemons, setEnemyPokemons] = useState<
    { id: number; leven: number }[]
  >([]);

  const [battleState, dispatchBattle] = useReducer(
    battleReducer,
    initialBattleState
  );

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
    dispatchBattle,
    pokemonEvolve,
    setPokemonEvolve,
    enemyPokemons,
    setEnemyPokemons,
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
