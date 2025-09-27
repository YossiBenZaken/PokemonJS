import styled from "styled-components";

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

export const GifAttack = styled("div")(() => ({
  position: "absolute",
  float: "right",
  marginLeft: 165,
  marginTop: 70,
  zIndex: 0,
  width: 700,
}));

export const Weather = styled("div")(() => ({
  position: "relative",
  borderRadius: 5,
  overflow: "hidden",
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
}));

export const OpponentBar = styled("div")(() => ({
  backgroundImage: `url(${require(`../../../assets/images/attack/new_bar2.png`)})`,
  backgroundRepeat: "no-repeat",
  width: 240,
  height: 90,
}));

export const HpRed = styled("div")(() => ({
  background: "#ccc",
  border: "#f2f2f2 1px solid",
  borderRadius: 4,
  clear: "both",
  height: 8,
  marginLeft: 10,
  marginTop: 1,
  overflow: "hidden",
  width: 130,
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

export const OpponentWrapper = styled.div`
  padding: 0 0 100px 0;
`;
export const OpponentBarContainer = styled.div`
  padding: 15px 0 0 120px;
`;
export const LevelIconText = styled.i`
  font-size: medium;
  text-shadow: 1px 1px 1px #fff;
  display: flex;
  align-items: center;
`;
export const HpWrapper = styled.div`
  padding: 0 0 5px 43px;
`;
export const EffectWrapper = styled.div`
  margin: -8px 0 0 142px;
`;
export const OpponentNameWrapper = styled.div`
  padding: 5px 0 0 10px;
`;
export const OpponentName = styled.i`
  font-size: medium;
  text-shadow: 1px 1px 1px #fff;
  display: flex;
  align-items: center;
`;
export const PokeBallWrapper = styled.div`
  display: flex;
`;
export const OpponentPokemonImage = styled.img`
  margin: 100px 0 0 60%;
  filter: drop-shadow(0px 4px 2px) invert(8%);
`;
export const PokemonImage = styled.img`
  margin: 40px 0 0 150px;
  filter: drop-shadow(0px 4px 2px) invert(8%);
`;

export const MyPokemonHpWrapper = styled.div`
  padding: 100px 0 0 150px;
`;
export const MyPokemonBar = styled("div")(() => ({
  backgroundImage: `url(${require(`../../../assets/images/attack/new_bar.png`)})`,
  backgroundRepeat: "no-repeat",
  width: 240,
  height: 90,
  float: "right",
  position: "relative",
}));

export const MyPokemonNameWrapper = styled.div`
  padding: 16px 0 0 10px;
`;
export const MyPokemonName = styled.i`
  font-size: medium;
  text-shadow: 1px 1px 1px #fff;
  display: flex;
  align-items: center;
`;

export const ExpWrapper = styled.div`
  padding: 0px 0 0px 70px;
`;
export const AttackWrapper = styled.td`
  width: 100%;
  background: url(${require("../../../assets/images/layout/battle/action-content.png")})
    no-repeat;
  padding: 10px 0;
  background-size: 100% 100%;
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
  marginTop: 7,
 width: '95%',
 height: 168,
 color: '#fff',
 textAlign: 'left'
}));
