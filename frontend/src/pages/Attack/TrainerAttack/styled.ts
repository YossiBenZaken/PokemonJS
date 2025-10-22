import { AanvalLog } from "../../../api/battle.api";
import styled, {keyframes} from "styled-components";

// ✅ Define the keyframes
const slideInFromRight = keyframes`
  0% {
    opacity: 0;
    transform: translate(100px) scale(0.8);
  }

  60% {
    transform: translate(-10px) scale(1.05);
  }

  to {
    opacity: 1;
    transform: translate(0) scale(1);
  }
`;

const slideInFromLeft = keyframes`
  0% {
    opacity: 0;
    transform: translate(-100px) scale(0.8);
  }

  60% {
    transform: translate(10px) scale(1.05);
  }

  to {
    opacity: 1;
    transform: translate(0) scale(1);
  }
`;

export const BoxContent = styled("div")(() => ({
  padding: 0,
  backgroundColor: "#34465f",
  borderBottom: "2px solid #27374e",
  borderRight: "1px solid #27374e",
  borderRadius: 3,
  verticalAlign: "middle",
  overflow: "hidden",
  direction: "ltr",
  width: 970,
}));

export const Title = styled("h3")(() => ({
  padding: 5,
  background: "url(/images/layout/line.png) no-repeat",
  backgroundPosition: "bottom",
  backgroundSize: "70%",
  fontSize: 15,
  margin: "5px 0 0",
  fontWeight: "bold",
  color: "#9eadcd",
  textAlign: "center",
}));

export const Weather = styled("div")(() => ({
  position: "relative",
  borderRadius: 5,
  overflow: "hidden",
  margin: 0,
}));
export const hour = new Date().getHours();
export const TableDuelArena = styled("table")(() => ({
  backgroundImage: `url(${require(`../../../assets/images/attack/backgrounds/duel-area-${
    hour >= 6 && hour < 18 ? "1" : "2"
  }.png`)})`,
  width: "100%",
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  borderSpacing: 1,
  height: 480,
}));

export const BattleArea = styled("table")<{
  attackLog: AanvalLog;
  background: string | undefined;
}>(({ attackLog, background }) => {
  let backgroundImage = "";
  if (background) {
    backgroundImage = `url(${require(`../../../assets/images/attack/backgrounds/${background}.png`)})`;
  } else {
    const { gebied } = attackLog;
    let name = "gras-1";
    switch (gebied) {
      case "Lavagrot":
        name = "lavagrot";
        break;
      case "Grot":
        name = "grot";
        break;
      case "Spookhuis":
        name = "spookhous";
        break;
      case "Strand":
        name = "strand";
        break;
      case "Vechtschool":
        name = "dojo";
        break;
      case "Water":
        name = "water-1";
        break;
    }
    backgroundImage = `url(${require("../../../assets/images/attack/backgrounds/" +
      name +
      ".png")})`;
  }
  return {
    backgroundImage,
    width: "100%",
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    height: 480,
  };
});


export const HpRed = styled("div")(() => ({
  background: "#ccc",
  border: "#f2f2f2 1px solid",
  borderRadius: 4,
  clear: "both",
  height: 14,
  marginLeft: 10,
  marginTop: "1rem",
  overflow: "hidden",
  width: 170,
}));

export const Progress = styled("div")(() => ({
  backgroundImage: `url(${require(`../../../assets/images/progress.gif`)})`,
  backgroundPosition: "left",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  borderRadius: 4,
  height: "100%",
  maxWidth: "100%",
  transition: "width 1s ease-in-out",
  fontSize: 12,
  color: "black",
  textAlign: "center",
  lineHeight: "14px",
}));
export const ExpProgress = styled("div")(() => ({
  background: `#0074D9`,
  borderRadius: 4,
  float: "left",
  height: "100%",
  maxWidth: "100%",
  transition: "width 1s ease-in-out",
}));

export const ComputerStar = styled("span")(() => ({
  float: "right",
  width: 16,
  height: 16,
  backgroundImage: `url(${require("../../../assets/images/icons/lidbetaald.png")})`,
}));

export const HpWrapper = styled.div`
  padding: 0 0 5px 43px;
`;
export const EffectWrapper = styled.div`
  position: absolute;
  bottom: 5px;
  left: 30px;
`;
export const OpponentNameWrapper = styled.div`
  padding: 5px 0 0 10px;
`;
export const OpponentName = styled.i`
  font-size: 12px;
  display: flex;
  justify-content: start;
`;

export const Name = styled.strong`
  ${(props) => props.color && `background: ${props.color}`};
  padding: 0 7px;
  border: 1px solid #d9d9d9;
  border-radius: 5px;
  color: white;
`;

export const PokeBallWrapper = styled.div`
  display: flex;
`;
export const OpponentPokemonImage = styled.img`
  position: absolute;
  top: 170px;
  right: 100px;
  filter: drop-shadow(0px 4px 2px) invert(8%);
  animation: ${slideInFromRight} 0.8s ease-out forwards;
`;
export const PokemonImage = styled.img`
  position: absolute;
  bottom: 130px;
  left: 100px;
  filter: drop-shadow(0px 4px 2px) invert(8%);
  animation: ${slideInFromLeft} 0.8s ease-out forwards;
`;

export const MyPokemonBar = styled("div")(() => ({
  position: "absolute",
  left: 20,
  bottom: 50,
  height: 70,
  transform: "skew(20deg)",
  background: "#000000b3",
  backdropFilter: "blur(5px)",
  borderRadius: 8,
  padding: 5,
}));

export const MyPokemonNameWrapper = styled.div`
  transform: skew(-20deg);
  padding-right: 15px;
  direction: rtl;
`;
export const MyPokemonName = styled.i`
  font-size: 12px;
  display: flex;
  justify-content: start;
`;

export const ExpWrapper = styled.div`
  padding: 0px 0 0px 44px;
`;
export const AttackWrapper = styled.div`
  width: 100%;
  height: 74px;
`;
export const BattlePokemon = styled.div`
  text-align: center;
  display: inline-block;
  margin-left: 10px;
  height: 32px;
  width: 120px;
  padding-left: 24px;
  padding-top: 8px;
  cursor: pointer;
  background-repeat: no-repeat;
  border-radius: 5px;
  margin-top: 4px;
  box-shadow: rgba(14, 13, 13, 0.4) 0px 0px 15px;
  font-size: 12px;
  font-weight: 700;
  color: #9eadcd;
  background-color: #34465f;
  border-bottom: 2px solid #27374e;
  border-right: 1px solid #27374e;
`;

export const TextBox = styled("div")(() => ({
  width: "100%",
  height: "100%",
  color: "#fff",
  textAlign: "left",
}));
