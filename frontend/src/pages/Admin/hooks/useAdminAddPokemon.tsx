import { useEffect, useState } from "react";
import {
  createPokemon,
  CreatePokemonRequest,
  getMoveTutorList,
  getTMHMList,
  LevelMove,
  MoveTutor,
  TMHM,
} from "../../../api/admin.api";

export const useAdminAddPokemon = () => {
  const POKEMON_TYPES = [
    "Normal",
    "Fire",
    "Fighting",
    "Water",
    "Flying",
    "Grass",
    "Poison",
    "Electric",
    "Ground",
    "Psychic",
    "Rock",
    "Ice",
    "Bug",
    "Dragon",
    "Ghost",
    "Dark",
    "Steel",
    "Fairy",
  ];

  const REGIONS = [
    "Kanto",
    "Johto",
    "Hoenn",
    "Sinnoh",
    "Unova",
    "Kalos",
    "Alola",
    "Galar",
    "Hisui",
    "Paldea",
  ];

  const LOCATIONS = [
    { value: "", label: "בחר מיקום" },
    { value: "Gras", label: "גראס (דשא)" },
    { value: "Grot", label: "מערה" },
    { value: "Lavagrot", label: "לבה" },
    { value: "Strand", label: "חול/חוף" },
    { value: "Spookhuis", label: "מגדל רפאים" },
    { value: "Vechtschool", label: "דוג'ו" },
    { value: "Water", label: "מים" },
    { value: "Promo", label: "פרומו" },
    { value: "Mega", label: "מגה" },
    { value: "Primal", label: "פרימל" },
  ];

  const [formData, setFormData] = useState<Partial<CreatePokemonRequest>>({
    raridade: 1,
    evolutie: 1,
    type1: "Normal",
    type2: "",
    local: "",
    aparece: "sim",
    lendario: 0,
    comerciantes: "sim",
  });

  const [levelMoves, setLevelMoves] = useState<LevelMove[]>(
    Array.from({ length: 20 }, () => ({ level: 0, attack: "" }))
  );

  const [tmList, setTmList] = useState<TMHM[]>([]);
  const [tutorList, setTutorList] = useState<MoveTutor[]>([]);
  const [selectedTMs, setSelectedTMs] = useState<string[]>([]);
  const [selectedTutors, setSelectedTutors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const [tmRes, tutorRes] = await Promise.all([
        getTMHMList(),
        getMoveTutorList(),
      ]);
      if (tmRes.success) setTmList(tmRes.tmList);
      if (tutorRes.success) setTutorList(tutorRes.tutorList);
    } catch (error) {
      console.error("Error loading lists:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleLevelMoveChange = (
    index: number,
    field: "level" | "attack",
    value: string | number
  ) => {
    const newMoves = [...levelMoves];
    newMoves[index] = { ...newMoves[index], [field]: value };
    setLevelMoves(newMoves);
  };

  const handleTMToggle = (tmName: string) => {
    setSelectedTMs((prev) =>
      prev.includes(tmName)
        ? prev.filter((t) => t !== tmName)
        : [...prev, tmName]
    );
  };

  const handleTutorToggle = (tutorName: string) => {
    setSelectedTutors((prev) =>
      prev.includes(tutorName)
        ? prev.filter((t) => t !== tutorName)
        : [...prev, tutorName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.id || !formData.nome) {
      setMessage({ kind: "error", text: "ID ושם הם שדות חובה" });
      return;
    }

    setLoading(true);
    try {
      const filteredMoves = levelMoves.filter((m) => m.level > 0 && m.attack);

      const payload: CreatePokemonRequest = {
        ...formData,
        levelMoves: filteredMoves,
        movetutor: selectedTutors,
        relacionados: selectedTMs,
      } as CreatePokemonRequest;

      const res = await createPokemon(payload);
      if (res.success) {
        setMessage({ kind: "success", text: res.message });
        setFormData({
          raridade: 1,
          evolutie: 1,
          type1: "Normal",
          type2: "",
          local: "",
          aparece: "sim",
          lendario: 0,
          comerciantes: "sim",
        });
        setLevelMoves(
          Array.from({ length: 20 }, () => ({ level: 0, attack: "" }))
        );
        setSelectedTMs([]);
        setSelectedTutors([]);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setMessage({ kind: "error", text: res.message });
      }
    } catch (error: any) {
      setMessage({
        kind: "error",
        text: error.response?.data?.message || "שגיאה ביצירת פוקימון",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSubmit,
    formData,
    handleChange,
    REGIONS,
    POKEMON_TYPES,
    LOCATIONS,
    levelMoves,
    handleLevelMoveChange,
    tmList,
    selectedTMs,
    handleTMToggle,
    tutorList,
    handleTutorToggle,
    loading,
    message,
    selectedTutors
  };
};
