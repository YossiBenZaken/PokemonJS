import {
  CreatePokemonRequest,
  LevelMove,
  MoveTutor,
  TMHM,
  createPokemon,
  getMoveTutorList,
  getTMHMList,
} from "../../api/admin.api";
import React, { useEffect, useState } from "react";

import styled from "styled-components";

const Page = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h3`
  color: #495057;
  margin-bottom: 20px;
`;

const Form = styled.form`
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Section = styled.div`
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h4`
  color: #667eea;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 15px;
  align-items: center;
  margin-bottom: 15px;

  label {
    font-weight: 600;
    color: #495057;
  }
`;

const Input = styled.input`
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Note = styled.span`
  font-size: 12px;
  color: #6c757d;
  display: block;
  margin-top: 5px;
`;

const LevelMoveRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 10px;
  margin-bottom: 10px;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
  margin-top: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #f8f9fa;
  }

  input {
    cursor: pointer;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  margin-top: 20px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ kind: "success" | "error" }>`
  margin-top: 20px;
  padding: 15px;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
  color: ${(p) => (p.kind === "success" ? "#155724" : "#721c24")};
  background: ${(p) => (p.kind === "success" ? "#d4edda" : "#f8d7da")};
  border: 1px solid ${(p) => (p.kind === "success" ? "#c3e6cb" : "#f5c6cb")};
`;

const POKEMON_TYPES = [
  "Normal", "Fire", "Fighting", "Water", "Flying", "Grass",
  "Poison", "Electric", "Ground", "Psychic", "Rock", "Ice",
  "Bug", "Dragon", "Ghost", "Dark", "Steel", "Fairy"
];

const REGIONS = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos", "Alola","Galar","Hisui","Paldea"];

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

const AdminCreatePokemonPage: React.FC = () => {
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
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const [tmRes, tutorRes] = await Promise.all([getTMHMList(), getMoveTutorList()]);
      if (tmRes.success) setTmList(tmRes.tmList);
      if (tutorRes.success) setTutorList(tutorRes.tutorList);
    } catch (error) {
      console.error("Error loading lists:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleLevelMoveChange = (index: number, field: "level" | "attack", value: string | number) => {
    const newMoves = [...levelMoves];
    newMoves[index] = { ...newMoves[index], [field]: value };
    setLevelMoves(newMoves);
  };

  const handleTMToggle = (tmName: string) => {
    setSelectedTMs((prev) =>
      prev.includes(tmName) ? prev.filter((t) => t !== tmName) : [...prev, tmName]
    );
  };

  const handleTutorToggle = (tutorName: string) => {
    setSelectedTutors((prev) =>
      prev.includes(tutorName) ? prev.filter((t) => t !== tutorName) : [...prev, tutorName]
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
        setLevelMoves(Array.from({ length: 20 }, () => ({ level: 0, attack: "" })));
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

  return (
    <Page>
      <Title>הוספת פוקימון</Title>

      <Form onSubmit={handleSubmit}>
        <Section>
          <SectionTitle>מידע בסיסי</SectionTitle>
          
          <FormRow>
            <label>ID *</label>
            <Input
              type="number"
              name="id"
              value={formData.id || ""}
              onChange={handleChange}
              required
            />
          </FormRow>

          <FormRow>
            <label>אזור *</label>
            <Select name="zona" value={formData.zona || ""} onChange={handleChange} required>
              <option value="">בחר אזור</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </Select>
          </FormRow>

          <FormRow>
            <label>שם *</label>
            <Input
              type="text"
              name="nome"
              value={formData.nome || ""}
              onChange={handleChange}
              required
            />
          </FormRow>

          <FormRow>
            <label>נדירות</label>
            <Select name="raridade" value={formData.raridade} onChange={handleChange}>
              <option value="1">רגיל</option>
              <option value="2">לא שכיח</option>
              <option value="3">נדיר</option>
            </Select>
          </FormRow>

          <FormRow>
            <label>מספר שלב אבולוציה</label>
            <div>
              <Input
                type="number"
                name="evolutie"
                value={formData.evolutie || ""}
                onChange={handleChange}
              />
              <Note>מספר בשרשרת האבולוציה של הפוקימון</Note>
            </div>
          </FormRow>

          <FormRow>
            <label>טיפוס 1 *</label>
            <Select name="type1" value={formData.type1} onChange={handleChange} required>
              {POKEMON_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </FormRow>

          <FormRow>
            <label>טיפוס 2</label>
            <Select name="type2" value={formData.type2 || ""} onChange={handleChange}>
              <option value="">ללא</option>
              {POKEMON_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </FormRow>

          <FormRow>
            <label>מיקום</label>
            <Select name="local" value={formData.local || ""} onChange={handleChange}>
              {LOCATIONS.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </Select>
          </FormRow>

          <FormRow>
            <label>% לכידה *</label>
            <Input
              type="number"
              name="captura"
              value={formData.captura || ""}
              onChange={handleChange}
              min="0"
              max="100"
              required
            />
          </FormRow>

          <FormRow>
            <label>קבוצת EXP *</label>
            <div>
              <Input
                type="text"
                name="exp"
                value={formData.exp || ""}
                onChange={handleChange}
                placeholder="Medium Slow / Slow"
                required
              />
              <Note>לדוגמה: Medium Slow או Slow</Note>
            </div>
          </FormRow>

          <FormRow>
            <label>Base EXP *</label>
            <Input
              type="number"
              name="baseexp"
              value={formData.baseexp || ""}
              onChange={handleChange}
              required
            />
          </FormRow>

          <FormRow>
            <label>מופיע במידע?</label>
            <Select name="aparece" value={formData.aparece} onChange={handleChange}>
              <option value="sim">כן</option>
              <option value="nao">לא</option>
            </Select>
          </FormRow>

          <FormRow>
            <label>אגדי/נדיר?</label>
            <Select name="lendario" value={formData.lendario} onChange={handleChange}>
              <option value="1">כן</option>
              <option value="0">לא</option>
            </Select>
          </FormRow>

          <FormRow>
            <label>סוחרים?</label>
            <Select name="comerciantes" value={formData.comerciantes} onChange={handleChange}>
              <option value="sim">כן</option>
              <option value="nao">לא</option>
            </Select>
          </FormRow>
        </Section>

        <Section>
          <SectionTitle>מתקפות התחלה</SectionTitle>
          
          <FormRow>
            <label>מתקפה 1 *</label>
            <Input
              type="text"
              name="atack1"
              value={formData.atack1 || ""}
              onChange={handleChange}
              required
            />
          </FormRow>

          <FormRow>
            <label>מתקפה 2 *</label>
            <Input
              type="text"
              name="atack2"
              value={formData.atack2 || ""}
              onChange={handleChange}
              required
            />
          </FormRow>

          <FormRow>
            <label>מתקפה 3 *</label>
            <Input
              type="text"
              name="atack3"
              value={formData.atack3 || ""}
              onChange={handleChange}
              required
            />
          </FormRow>

          <FormRow>
            <label>מתקפה 4 *</label>
            <Input
              type="text"
              name="atack4"
              value={formData.atack4 || ""}
              onChange={handleChange}
              required
            />
          </FormRow>
        </Section>

        <Section>
          <SectionTitle>סטטיסטיקות בסיס</SectionTitle>
          
          <FormRow>
            <label>ATK Base *</label>
            <Input
              type="number"
              name="atkbase"
              value={formData.atkbase || ""}
              onChange={handleChange}
              required
            />
          </FormRow>

          <FormRow>
            <label>DEF Base *</label>
            <Input
              type="number"
              name="defbase"
              value={formData.defbase || ""}
              onChange={handleChange}
              required
            />
          </FormRow>

          <FormRow>
            <label>SP.ATK Base *</label>
            <Input
              type="number"
              name="spatkbase"
              value={formData.spatkbase || ""}
              onChange={handleChange}
              required
            />
          </FormRow>

          <FormRow>
            <label>SP.DEF Base *</label>
            <Input
              type="number"
              name="spdefbase"
              value={formData.spdefbase || ""}
              onChange={handleChange}
              required
            />
          </FormRow>

          <FormRow>
            <label>SPEED Base *</label>
            <Input
              type="number"
              name="speedbase"
              value={formData.speedbase || ""}
              onChange={handleChange}
              required
            />
          </FormRow>

          <FormRow>
            <label>HP Base *</label>
            <Input
              type="number"
              name="hpbase"
              value={formData.hpbase || ""}
              onChange={handleChange}
              required
            />
          </FormRow>
        </Section>

        <Section>
          <SectionTitle>EVs (Effort Values)</SectionTitle>
          
          <FormRow>
            <label>Effort ATK *</label>
            <Input
              type="number"
              name="effortatk"
              value={formData.effortatk || ""}
              onChange={handleChange}
              min="0"
              required
            />
          </FormRow>

          <FormRow>
            <label>Effort DEF *</label>
            <Input
              type="number"
              name="effortdef"
              value={formData.effortdef || ""}
              onChange={handleChange}
              min="0"
              required
            />
          </FormRow>

          <FormRow>
            <label>Effort SP.ATK *</label>
            <Input
              type="number"
              name="effortspatk"
              value={formData.effortspatk || ""}
              onChange={handleChange}
              min="0"
              required
            />
          </FormRow>

          <FormRow>
            <label>Effort SP.DEF *</label>
            <Input
              type="number"
              name="effortspdef"
              value={formData.effortspdef || ""}
              onChange={handleChange}
              min="0"
              required
            />
          </FormRow>

          <FormRow>
            <label>Effort SPEED *</label>
            <Input
              type="number"
              name="effortspeed"
              value={formData.effortspeed || ""}
              onChange={handleChange}
              min="0"
              required
            />
          </FormRow>

          <FormRow>
            <label>Effort HP *</label>
            <Input
              type="number"
              name="efforthp"
              value={formData.efforthp || ""}
              onChange={handleChange}
              min="0"
              required
            />
          </FormRow>
        </Section>

        <Section>
          <SectionTitle>מתקפות לפי רמה (Level-Up Moves)</SectionTitle>
          
          {levelMoves.map((move, index) => (
            <LevelMoveRow key={index}>
              <Input
                type="number"
                placeholder="רמה"
                value={move.level || ""}
                onChange={(e) => handleLevelMoveChange(index, "level", Number(e.target.value))}
                min="0"
              />
              <Input
                type="text"
                placeholder="שם המתקפה"
                value={move.attack}
                onChange={(e) => handleLevelMoveChange(index, "attack", e.target.value)}
              />
            </LevelMoveRow>
          ))}
        </Section>

        <Section>
          <SectionTitle>TM/HM קשורים</SectionTitle>
          
          <CheckboxGrid>
            {tmList.map((tm) => (
              <CheckboxLabel key={tm.naam}>
                <input
                  type="checkbox"
                  checked={selectedTMs.includes(tm.naam)}
                  onChange={() => handleTMToggle(tm.naam)}
                />
                <span>
                  {tm.naam} ({tm.omschrijving})
                </span>
              </CheckboxLabel>
            ))}
          </CheckboxGrid>
        </Section>

        <Section>
          <SectionTitle>Move Tutor</SectionTitle>
          
          <CheckboxGrid>
            {tutorList.map((tutor) => (
              <CheckboxLabel key={tutor.naam}>
                <input
                  type="checkbox"
                  checked={selectedTutors.includes(tutor.naam)}
                  onChange={() => handleTutorToggle(tutor.naam)}
                />
                <span>{tutor.naam}</span>
              </CheckboxLabel>
            ))}
          </CheckboxGrid>
        </Section>

        <Button type="submit" disabled={loading}>
          {loading ? "שומר..." : "הוסף פוקימון"}
        </Button>

        {message && <Message kind={message.kind}>{message.text}</Message>}
      </Form>
    </Page>
  );
};

export default AdminCreatePokemonPage;