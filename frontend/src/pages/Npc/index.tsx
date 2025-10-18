import { initBattle, startRandomTrainer } from "../../api/battle.api";

import { BoxContent } from "../Attack/TrainerAttack/styled";
import React from "react";
import { useBattle } from "../../contexts/BattleContext";
import { useNavigate } from "react-router-dom";

const NpcPage: React.FC = () => {
  const { setChallengeData, setAttackLog, setComputerInfo, setPokemonInfo } =
    useBattle();
    const navigate = useNavigate();
  const trainer = [
    "Rival Barry",
    "Scientist Chip",
    "Jessie e James",
    "Team Aether Sara",
    "Team Rocket Butch",
    "Team Skull Guzma",
  ];
  const randomTrainer = trainer.at(Math.floor(Math.random() * trainer.length));

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await startRandomTrainer();
    if (response.success) {
      setChallengeData(response.data);
      const { aanval_log, computer_info, pokemon_info } = await initBattle(
        response.data.trainer.aanvalLogId
      );
      setAttackLog(aanval_log);
      setComputerInfo(computer_info);
      setPokemonInfo(pokemon_info);
      if (response.redirect) navigate(response.redirect);
      else alert("האתגר נוצר — הטעינה תתבצע כעת");
    }
  };
  return (
    <BoxContent style={{width: '100%', height: '100%'}}>
      <table
        style={{
          borderSpacing: 0,
          background: "#34465f",
          color: "#eee",
          verticalAlign: "middle",
        }}
        width={"100%"}
      >
        <thead>
          <tr>
            <th colSpan={6} style={{ textAlign: "center" }}>
              נלחם נגד מאמן אקראי
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ width: "100%", padding: 0, margin: "10px" }}>
              <div id="trainer-content">
                <img
                  src={require(`../../assets/images/trainers/${randomTrainer}.png`)}
                  alt="Random"
                  style={{
                    margin: "0 auto",
                    height: 100,
                    verticalAlign: "middle",
                    filter: "brightness(0%)",
                  }}
                />
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <center>
            <form onSubmit={handleOnSubmit}>
              <input
                type="submit"
                name="submit"
                value="הילחם"
                className="button"
                style={{ margin: 6 }}
              />
            </form>
          </center>
        </tfoot>
      </table>
    </BoxContent>
  );
};

export default NpcPage;
