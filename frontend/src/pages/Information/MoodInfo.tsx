import React from "react";
import styled from "styled-components";
import { useGame } from "../../contexts/GameContext";

const Green = styled.td`
  background-color: #a9fa46;
  color: #4b800a;
`;

const Red = styled.td`
  background-color: #fa4d59;
  color: #73030b;
`;

const Normal = styled.td``;

const BoxContent = styled.div`
  position: relative;
  padding: 0;
  background-color: #34465f;
  border-bottom: 2px solid #27374e;
  border-right: 1px solid #27374e;
  border-radius: 4px;
  vertical-align: middle;
  overflow: hidden;
`;

const TableGeneral = styled.table`
  border-spacing: 0;
  background: #34465f;
  color: #eeeeee;
  vertical-align: middle;
  width: 100%;
  thead > tr {
    background: url(/images/layout/line.png) no-repeat;
    background-position: bottom;
    background-size: 70%;
    th {
      font-size: 13px;
      padding: 10px;
      padding-left: 4px;
      font-weight: bold;
      text-transform: uppercase;
      color: #9eadcd;
    }
  }
  tbody > tr:nth-child(odd) {
    background-color: #2e3d53;
  }
  tbody > tr > td {
    border-bottom: 1px solid #577599;
    padding: 10px;
  }
`;

const Seperator = styled.div`
  background: url(/images/layout/sep-b.png) center;
  width: 100%;
  height: 2px;
  margin-top: 3px;
  margin-bottom: 2px;
  background-size: 100% 100%;
`;

const MoodInfo: React.FC = () => {
  const { karakters } = useGame();
  return (
    <>
      <BoxContent>
        <TableGeneral>
          <thead>
            <tr>
              <th colSpan={6}>הומור לפי סטטוס</th>
            </tr>
            <tr>
              <th>#</th>
              <th>- התקפה</th>
              <th>- הגנה</th>
              <th>- התקפה מיוחדת</th>
              <th>- הגנה מיוחדת</th>
              <th>- מהירות</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>+ התקפה</td>
              <td align="center">Hardy</td>
              <Green align="center">Lonely</Green>
              <Green align="center">Adamant</Green>
              <Green align="center">Naughty</Green>
              <Green align="center">Brave</Green>
            </tr>
            <tr>
              <td>+ הגנה</td>
              <Red align="center">Bold</Red>
              <td align="center">Docile</td>
              <Green align="center">Impish</Green>
              <Green align="center">Lax</Green>
              <Green align="center">Relaxed</Green>
            </tr>
            <tr>
              <td>+ התקפה מיוחדת</td>
              <Red align="center">Modest</Red>
              <Red align="center">Mild</Red>
              <td align="center">Bashful</td>
              <Green align="center">Rash</Green>
              <Green align="center">Quiet</Green>
            </tr>
            <tr>
              <td>+ הגנה מיוחדת</td>
              <Red align="center">Calm</Red>
              <Red align="center">Gentle</Red>
              <Red align="center">Careful</Red>
              <td align="center">Quirky</td>
              <Green align="center">Sassy</Green>
            </tr>
            <tr>
              <td>+ מהירות</td>
              <Red align="center">Timid</Red>
              <Red align="center">Hasty</Red>
              <Red align="center">Jolly</Red>
              <Red align="center">Naive</Red>
              <td align="center">Serious</td>
            </tr>
          </tbody>
        </TableGeneral>
      </BoxContent>
      <Seperator />
      <BoxContent>
        <TableGeneral>
          <thead>
            <tr>
              <th colSpan={6}>הומור לפי שם</th>
            </tr>
            <tr>
              <th style={{ width: "16.6%" }}>#</th>
              <th style={{ width: "16.6%" }}>- התקפה</th>
              <th style={{ width: "16.6%" }}>- הגנה</th>
              <th style={{ width: "16.6%" }}>- מהירות</th>
              <th style={{ width: "16.6%" }}>- התקפה מיוחדת</th>
              <th style={{ width: "16.6%" }}>- הגנה מיוחדת</th>
            </tr>
          </thead>
          <tbody>
            {karakters.map(karakter => {
              const {attack_add,defence_add,karakter_id,karakter_naam,speed_add} = karakter;
              const AttackTd = attack_add === '1.1' ? Green : attack_add === '0.9' ? Red : Normal;
              const DefenceTd = defence_add === '1.1' ? Green : defence_add === '0.9' ? Red : Normal;
              const SpeedTd = speed_add === '1.1' ? Green : speed_add === '0.9' ? Red : Normal;
              const SpcAttackTd = karakter["spc.attack_add"] === '1.1' ? Green : karakter["spc.attack_add"] === '0.9' ? Red : Normal;
              const SpcDefenceTd = karakter["spc.defence_add"] === '1.1' ? Green : karakter["spc.defence_add"] === '0.9' ? Red : Normal;
              return <tr key={karakter_id}>
                <td>{karakter_naam}</td>
                <AttackTd align="center">{attack_add === '1.1' ? 'מגדיל' : attack_add === '0.9' ? 'יורד' : 'ניטרלי'}</AttackTd>
                <DefenceTd align="center">{defence_add === '1.1' ? 'מגדיל' : defence_add === '0.9' ? 'יורד' : 'ניטרלי'}</DefenceTd>
                <SpeedTd align="center">{speed_add === '1.1' ? 'מגדיל' : speed_add === '0.9' ? 'יורד' : 'ניטרלי'}</SpeedTd>
                <SpcAttackTd align="center">{karakter["spc.attack_add"] === '1.1' ? 'מגדיל' : karakter["spc.attack_add"] === '0.9' ? 'יורד' : 'ניטרלי'}</SpcAttackTd>
                <SpcDefenceTd align="center">{karakter["spc.defence_add"] === '1.1' ? 'מגדיל' : karakter["spc.defence_add"] === '0.9' ? 'יורד' : 'ניטרלי'}</SpcDefenceTd>
              </tr>
            })}
          </tbody>
        </TableGeneral>
      </BoxContent>
    </>
  );
};

export default MoodInfo;
