import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import TICKET_ICON from "../../../assets/images/icons/ticket.png";
import styled from "styled-components";
import { updateTickets } from "../../../api/system.api";
import { useGame } from "../../../contexts/GameContext";

// Images 1-6 for the reels
// Adjust the paths if your images are located elsewhere
const SLOT_IMAGES = [
  require("../../../assets/images/slots/1.png"),
  require("../../../assets/images/slots/2.png"),
  require("../../../assets/images/slots/3.png"),
  require("../../../assets/images/slots/4.png"),
  require("../../../assets/images/slots/5.png"),
  require("../../../assets/images/slots/6.png"),
];



const Page = styled.div``;

const Header = styled.div`
  margin-bottom: 7px;
  h3 {
    margin: 0;
    font-weight: 600;
  }
  img {
    width: 20px;
    height: 20px;
    vertical-align: middle;
    margin: 0 6px;
  }
`;

const Box = styled.div`
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #fff;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  thead th {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 14px;
    text-align: center;
  }
  tfoot td {
    text-align: center;
    padding: 10px;
  }
`;

const ReelsRow = styled.div`
  display: flex;
  gap: 0;
  padding: 10px;
  justify-content: center;
`;

const ReelBox = styled.div`
  width: 33.33%;
  max-width: 240px;
  height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #34465f url("/public/images/layout/starProfile.png") center
    no-repeat;
  border-left: 1px solid #577599;
  &:first-child {
    border-left: none;
    border-right: 1px solid #577599;
  }
  &:nth-child(2) {
    border-right: 0;
    border-left: 0;
  }
`;

const ReelImage = styled.img`
  width: 60px;
  height: 60px;
`;

const PlayButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Alert = styled.div<{ kind: "success" | "error" }>`
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  font-weight: 600;
  color: ${(p) => (p.kind === "success" ? "#155724" : "#721c24")};
  background: ${(p) => (p.kind === "success" ? "#d4edda" : "#f8d7da")};
  border: 1px solid ${(p) => (p.kind === "success" ? "#c3e6cb" : "#f5c6cb")};
`;

const CombHeader = styled.th`
  cursor: pointer;
`;

const CombTable = styled.table`
  width: 100%;
  font-size: 13px;
  font-weight: 600;
  td {
    padding: 6px 10px;
  }
`;

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function calculatePrize(results: number[]): number {
  // Port of the PHP rules
  // values are 0..5 mapped to images 1..6
  const a = [150, 200, 250, 400, 300, 325];

  // Count duplicates like PHP logic
  // Build index -> occurrences
  const counts: Record<number, number> = {};
  for (const r of results) counts[r] = (counts[r] || 0) + 1;
  // indices that appear more than once
  const dupIndices = Object.keys(counts)
    .map(Number)
    .filter((k) => counts[k] > 1);

  let ticket = 0;
  if (dupIndices.length === 1 && counts[dupIndices[0]] === 3) {
    // triple match
    ticket = a[dupIndices[0]];
  } else if (dupIndices.length === 1 && counts[dupIndices[0]] === 2) {
    // exactly a pair, special cases for 0,3,4
    if (dupIndices[0] === 0) ticket = 100;
    else if (dupIndices[0] === 3) ticket = 200;
    else if (dupIndices[0] === 4) ticket = 150;
  }

  // Bonus if all different and includes 0 (image 1)
  if (dupIndices.length === 0 && results.includes(0)) {
    ticket += 50;
  }

  return ticket;
}

const Slots: React.FC = () => {
  const { selectedCharacter, setSelectedCharacter } = useGame();
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultIndices, setResultIndices] = useState<[number, number, number]>([
    randomInt(6),
    randomInt(6),
    randomInt(6),
  ]);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [combOpen, setCombOpen] = useState(true);

  // simple interval refs per reel
  const intervals = useRef<Array<number | undefined>>([]);

  const images = useMemo(() => SLOT_IMAGES, []);

  const stopReel = useCallback((reel: 0 | 1 | 2, finalIndex: number) => {
    setResultIndices((prev) => {
      const next = [...prev] as [number, number, number];
      next[reel] = finalIndex;
      return next;
    });
  }, []);

  const clearAllIntervals = () => {
    intervals.current.forEach((id) => {
      if (id !== undefined) window.clearInterval(id);
    });
    intervals.current = [];
  };

  const spin = async () => {
    if (isSpinning) return;
    if (selectedCharacter?.tickets! < 150) {
      setMessage({
        kind: "error",
        text: "אין לך מספיק Tickets! בקר בחנות הקזינו או שחק מיני-משחקים אחרים.",
      });
      return;
    }
    const { tickets } = await updateTickets(-150, selectedCharacter?.user_id!);
    // take cost

    const newCharacter = selectedCharacter;
    if(newCharacter) {
        newCharacter.tickets = tickets;
        setSelectedCharacter(newCharacter);
    }

    setMessage(null);
    setIsSpinning(true);

    // pre-decide results like PHP
    const v0 = randomInt(6);
    const v1 = randomInt(6);
    const v2 = randomInt(6);

    // spin each reel with interval, stop staggered
    const durations = [1200, 2000, 2800];

    for (let r = 0 as 0 | 1 | 2; r < 3; r = (r + 1) as 0 | 1 | 2) {
      let cur = randomInt(6);
      const id = window.setInterval(() => {
        cur = (cur + 1) % 6;
        setResultIndices((prev) => {
          const next = [...prev] as [number, number, number];
          next[r] = cur;
          return next;
        });
      }, 60);
      intervals.current.push(id);
    }

    window.setTimeout(() => {
      clearAllIntervals();
      stopReel(0, v0);
    }, durations[0]);

    window.setTimeout(() => {
      stopReel(1, v1);
    }, durations[1]);

    window.setTimeout(() => {
      stopReel(2, v2);
      const prize = calculatePrize([v0, v1, v2]);
      if (prize > 0) {
        setMessage({
          kind: "success",
          text: `השגת קומבינציה וזכית ב-${prize} Tickets!`,
        });
        updateTickets(prize, selectedCharacter?.user_id!).then(({tickets}) => {
            const newCharacter = selectedCharacter;
            if(newCharacter) {
                newCharacter.tickets = tickets;
                setSelectedCharacter(newCharacter);
            }
        });
      } else {
        setMessage({ kind: "error", text: "לא הושגה קומבינציה." });
      }
      setIsSpinning(false);
    }, durations[2]);
  };

  useEffect(() => () => clearAllIntervals(), []);

  return (
    <Page>
      <Header>
        <h3>
          Tickets במלאי:
          <img src={TICKET_ICON} alt="Tickets" />
          {selectedCharacter?.tickets.toLocaleString()}
        </h3>
      </Header>

      <Box>
        <Table>
          <thead>
            <tr>
              <th>Caça-Níqueis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <ReelsRow>
                  <ReelBox>
                    <ReelImage
                      src={images[resultIndices[0]]}
                      alt={`reel-1-${resultIndices[0] + 1}`}
                    />
                  </ReelBox>
                  <ReelBox>
                    <ReelImage
                      src={images[resultIndices[1]]}
                      alt={`reel-2-${resultIndices[1] + 1}`}
                    />
                  </ReelBox>
                  <ReelBox>
                    <ReelImage
                      src={images[resultIndices[2]]}
                      alt={`reel-3-${resultIndices[2] + 1}`}
                    />
                  </ReelBox>
                </ReelsRow>
                {message && <Alert kind={message.kind}>{message.text}</Alert>}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>
                <PlayButton onClick={spin} disabled={isSpinning}>
                  {isSpinning ? "מסתובב…" : "שחק (150 Tickets)"}
                </PlayButton>
              </td>
            </tr>
          </tfoot>
        </Table>
      </Box>

      <div style={{ marginTop: 7, textAlign: "center" }}>
        <Table>
          <thead>
            <tr onClick={() => setCombOpen((o) => !o)}>
              <CombHeader>
                <b>
                  {combOpen
                    ? "Combinações (Clique para comprimir):"
                    : "Combinações (Clique para expandir):"}
                </b>
              </CombHeader>
            </tr>
          </thead>
          {combOpen && (
            <tbody>
              <tr>
                <td style={{ padding: 0 }}>
                  <CombTable>
                    <tbody>
                      <tr>
                        <td>Combinações:</td>
                        <td>Prêmio:</td>
                      </tr>
                      <tr>
                        <td>
                          <img src={SLOT_IMAGES[3]} alt="4" />{" "}
                          <img src={SLOT_IMAGES[3]} alt="4" />{" "}
                          <img src={SLOT_IMAGES[3]} alt="4" />
                        </td>
                        <td>400</td>
                      </tr>
                      <tr>
                        <td>
                          <img src={SLOT_IMAGES[5]} alt="6" />{" "}
                          <img src={SLOT_IMAGES[5]} alt="6" />{" "}
                          <img src={SLOT_IMAGES[5]} alt="6" />
                        </td>
                        <td>325</td>
                      </tr>
                      <tr>
                        <td>
                          <img src={SLOT_IMAGES[4]} alt="5" />{" "}
                          <img src={SLOT_IMAGES[4]} alt="5" />{" "}
                          <img src={SLOT_IMAGES[4]} alt="5" />
                        </td>
                        <td>300</td>
                      </tr>
                      <tr>
                        <td>
                          <img src={SLOT_IMAGES[2]} alt="3" />{" "}
                          <img src={SLOT_IMAGES[2]} alt="3" />{" "}
                          <img src={SLOT_IMAGES[2]} alt="3" />
                        </td>
                        <td>250</td>
                      </tr>
                      <tr>
                        <td>
                          <img src={SLOT_IMAGES[3]} alt="4" />{" "}
                          <img src={SLOT_IMAGES[3]} alt="4" />
                        </td>
                        <td>200</td>
                      </tr>
                      <tr>
                        <td>
                          <img src={SLOT_IMAGES[1]} alt="2" />{" "}
                          <img src={SLOT_IMAGES[1]} alt="2" />{" "}
                          <img src={SLOT_IMAGES[1]} alt="2" />
                        </td>
                        <td>200</td>
                      </tr>
                      <tr>
                        <td>
                          <img src={SLOT_IMAGES[4]} alt="5" />{" "}
                          <img src={SLOT_IMAGES[4]} alt="5" />
                        </td>
                        <td>150</td>
                      </tr>
                      <tr>
                        <td>
                          <img src={SLOT_IMAGES[0]} alt="1" />{" "}
                          <img src={SLOT_IMAGES[0]} alt="1" />{" "}
                          <img src={SLOT_IMAGES[0]} alt="1" />
                        </td>
                        <td>150</td>
                      </tr>
                      <tr>
                        <td>
                          <img src={SLOT_IMAGES[0]} alt="1" />{" "}
                          <img src={SLOT_IMAGES[0]} alt="1" />
                        </td>
                        <td>100</td>
                      </tr>
                      <tr>
                        <td>
                          <img src={SLOT_IMAGES[0]} alt="1" />
                        </td>
                        <td>50</td>
                      </tr>
                    </tbody>
                  </CombTable>
                </td>
              </tr>
            </tbody>
          )}
        </Table>
      </div>
    </Page>
  );
};

export default Slots;
