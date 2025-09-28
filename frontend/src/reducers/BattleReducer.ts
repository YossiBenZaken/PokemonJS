export interface BattleState {
  spelerAttack: boolean;
  spelerWissel: boolean;
  trainerZmove: boolean;
  currentWeather: string[];
  attackTimer?: NodeJS.Timeout;
  nextTurnTimer?: NodeJS.Timeout;
  currentAtk: string;
}

type BattleAction =
  | { type: "SET_ATTACK"; attack: string }
  | { type: "SET_SPELER_ATTACK"; value: boolean }
  | { type: "SET_SPELER_WISSEL"; value: boolean }
  | { type: "SET_TRAINER_ZMOVE"; value: boolean }
  | { type: "SET_WEATHER"; weather: string }
  | { type: "SET_ATTACK_TIMER"; timer?: NodeJS.Timeout }
  | { type: "SET_NEXT_TURN_TIMER"; timer?: NodeJS.Timeout }
  | { type: "RESET" };

  export const initialBattleState: BattleState = {
  spelerAttack: false,
  spelerWissel: false,
  trainerZmove: false,
  currentWeather: [
    "harsh_sunlight",
    "extremely_harsh_sunlight",
    "rain",
    "heavy_rain",
    "sandstorm",
    "hail",
    "mysterious_air_current",
  ],
  currentAtk: "",
};

export function battleReducer(
    state: BattleState,
    action: BattleAction
  ): BattleState {
    switch (action.type) {
      case "SET_ATTACK":
        return { ...state, currentAtk: action.attack };
      case "SET_SPELER_ATTACK":
        return { ...state, spelerAttack: action.value };
      case "SET_SPELER_WISSEL":
        return { ...state, spelerWissel: action.value };
      case "SET_TRAINER_ZMOVE":
        return { ...state, trainerZmove: action.value };
      case "SET_WEATHER":
        return {
          ...state,
          currentWeather: state.currentWeather.includes(action.weather)
            ? state.currentWeather
            : [...state.currentWeather, action.weather],
        };
      case "SET_ATTACK_TIMER":
        return { ...state, attackTimer: action.timer };
      case "SET_NEXT_TURN_TIMER":
        return { ...state, nextTurnTimer: action.timer };
      case "RESET":
        return initialBattleState;
      default:
        return state;
    }
  }