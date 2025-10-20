import React, { ReactNode, createContext, useContext, useState } from "react";

import { Ability } from "../models/ability.model";
import { Attack } from "../models/attack.model";
import { Character } from "../pages/MyCharacters";
import { Config } from "../api/system.api";
import Cookies from "js-cookie";
import { ItemInfo } from "../models/item.model";
import { Karakter } from "../models/karakter.model";
import { Rank } from "../models/rank.model";

interface GameSession {
  user_id: number;
  username: string;
  character: string;
  world: string;
  session_token: string;
  sec_key: string;
  chat_key: string;
  is_premium: boolean;
  premium_expires: number;
}

interface GameContextType {
  // פרטי הדמות שנבחרה לשחק
  selectedCharacter: Character | null;

  // פרטי המשחק הנוכחי (אחרי כניסה למשחק)
  gameSession: GameSession | null;

  isLoggedIn: boolean;

  ranks: Rank[];

  myPokemons: any[];

  karakters: Karakter[];

  attacks: Attack[];

  abilities: Ability[];

  setAbilities: (data: Ability[]) => void;

  itemInfo: ItemInfo[];

  setItemInfo: (data: ItemInfo[]) => void;
  
  config: Config[];

  setConfig: (data: Config[]) => void;


  setRanks: (data: Rank[]) => void;

  setKarakters: (data: Karakter[]) => void;

  setAttacks: (data: Attack[]) => void;

  setIsLoggedIn: (isLoggedIn: boolean) => void;

  // פונקציות לניהול המצב
  setSelectedCharacter: (character: Character | null) => void;

  setGameSession: (session: GameSession | null) => void;

  // פונקציה לכניסה למשחק עם דמות
  loginWithCharacter: (character: Character) => void;

  // פונקציה ליציאה מהמשחק
  logoutFromGame: () => void;

  // פונקציה לבדיקה אם המשתמש במשחק
  isInGame: () => boolean;

  // פונקציה לבדיקה אם יש דמות נבחרת
  hasSelectedCharacter: () => boolean;

  setMyPokemons: (pokemons: any[]) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );

  const [gameSession, setGameSession] = useState<GameSession | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [ranks, setRanks] = useState<Rank[]>([]);

  const [myPokemons, setMyPokemons] = useState<any[]>([]);

  const [karakters, setKarakters] = useState<Karakter[]>([]);

  const [attacks, setAttacks] = useState<Attack[]>([]);

  const [abilities, setAbilities] = useState<Ability[]>([]);

  const [itemInfo, setItemInfo] = useState<ItemInfo[]>([]);

  const [config, setConfig] = useState<Config[]>([]);

  // כניסה למשחק עם דמות
  const loginWithCharacter = (character: Character) => {
    setSelectedCharacter(character);
  };

  // יציאה מהמשחק
  const logoutFromGame = () => {
    setSelectedCharacter(null);
    setGameSession(null);
    Cookies.remove("access_token");
    // מחיקת הנתונים מ-localStorage
    localStorage.removeItem("game_session");
  };

  // בדיקה אם המשתמש במשחק
  const isInGame = () => {
    return gameSession !== null;
  };

  // בדיקה אם יש דמות נבחרת
  const hasSelectedCharacter = () => {
    return selectedCharacter !== null;
  };

  const value: GameContextType = {
    selectedCharacter,
    gameSession,
    setSelectedCharacter,
    setGameSession,
    loginWithCharacter,
    logoutFromGame,
    isInGame,
    hasSelectedCharacter,
    isLoggedIn,
    setIsLoggedIn,
    ranks,
    setRanks,
    setMyPokemons,
    myPokemons,
    karakters,
    setKarakters,
    attacks,
    setAttacks,
    abilities,
    setAbilities,
    itemInfo,
    setItemInfo,
    config,
    setConfig,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Hook לשימוש ב-Context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
