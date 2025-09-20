import React, { useState } from "react";
import { getPokemonList, guessWhoIs, startWhoIs } from "../../../api/casino.api";

import TICKET_ICON from "../../../assets/images/icons/ticket.png";
import { useGame } from "../../../contexts/GameContext";

const WhoIs: React.FC = () => {
  const { selectedCharacter, setSelectedCharacter } = useGame();
  const [image, setImage] = useState<{ id: number; status: string } | null>(null);
  const [options, setOptions] = useState<{ id: number; name: string }[]>([]);
  const [correctId, setCorrectId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");

  const start = async () => {
    const data = await startWhoIs(selectedCharacter!.user_id);
    if (data.wait) {
      setMessage(`עליך להמתין עוד ${Math.ceil((data.countdown || 0) / 60)} דקות`);
      return;
    }
    if (data.success && data.image) {
      const { pokemons: list } = await getPokemonList();
      setOptions(list);
      setImage(data.image);
      setCorrectId(data.image.id);
      setMessage("");
    } else {
      setMessage(data.message || "שגיאה בהתחלה");
    }
  };

  const submit = async (guess: number) => {
    if (!correctId) return;
    const res = await guessWhoIs(selectedCharacter!.user_id, guess, correctId);
    setMessage(res.message);
    if (res.correct) {
      const newTickets = selectedCharacter!.tickets + 50; // -50 +100 = +50 נטו
      setSelectedCharacter({ ...selectedCharacter!, tickets: newTickets });
    } else {
      setSelectedCharacter({ ...selectedCharacter!, tickets: selectedCharacter!.tickets - 50 });
    }
    setImage(null);
  };

  return (
    <div>
      <h3>
        Tickets במלאי: <img src={TICKET_ICON} alt="tickets" />{" "}
        {selectedCharacter?.tickets}
      </h3>

      {!image && <button onClick={start}>התחל משחק (50 Tickets)</button>}

      {image && (
        <div>
          <img src={require(`../../../assets/images/${image.status}/${image.id}.gif`)} alt="whois" />
          <select onChange={(e) => submit(Number(e.target.value))}>
            <option>בחר פוקימון</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      )}

      {message && <div>{message}</div>}
    </div>
  );
};

export default WhoIs;