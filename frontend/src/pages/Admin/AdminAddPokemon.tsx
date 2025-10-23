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
import {
  Button,
  CheckboxGrid,
  CheckboxLabel,
  Form,
  FormRow,
  Input,
  LevelMoveRow,
  Message,
  Note,
  Page,
  Section,
  SectionTitle,
  Select,
  Title,
} from "./styles/AdminAddPokemon.styled";
import { useAdminAddPokemon } from "./hooks/useAdminAddPokemon";

const AdminCreatePokemonPage: React.FC = () => {
  const {
    LOCATIONS,
    POKEMON_TYPES,
    REGIONS,
    formData,
    handleChange,
    handleSubmit,
    handleLevelMoveChange,
    handleTMToggle,
    handleTutorToggle,
    levelMoves,
    tmList,
    selectedTMs,
    loading,
    message,
    tutorList,
    selectedTutors
  } = useAdminAddPokemon();

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
            <Select
              name="zona"
              value={formData.zona || ""}
              onChange={handleChange}
              required
            >
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
            <Select
              name="raridade"
              value={formData.raridade}
              onChange={handleChange}
            >
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
            <Select
              name="type1"
              value={formData.type1}
              onChange={handleChange}
              required
            >
              {POKEMON_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </FormRow>

          <FormRow>
            <label>טיפוס 2</label>
            <Select
              name="type2"
              value={formData.type2 || ""}
              onChange={handleChange}
            >
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
            <Select
              name="local"
              value={formData.local || ""}
              onChange={handleChange}
            >
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
            <Select
              name="aparece"
              value={formData.aparece}
              onChange={handleChange}
            >
              <option value="sim">כן</option>
              <option value="nao">לא</option>
            </Select>
          </FormRow>

          <FormRow>
            <label>אגדי/נדיר?</label>
            <Select
              name="lendario"
              value={formData.lendario}
              onChange={handleChange}
            >
              <option value="1">כן</option>
              <option value="0">לא</option>
            </Select>
          </FormRow>

          <FormRow>
            <label>סוחרים?</label>
            <Select
              name="comerciantes"
              value={formData.comerciantes}
              onChange={handleChange}
            >
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
                onChange={(e) =>
                  handleLevelMoveChange(index, "level", Number(e.target.value))
                }
                min="0"
              />
              <Input
                type="text"
                placeholder="שם המתקפה"
                value={move.attack}
                onChange={(e) =>
                  handleLevelMoveChange(index, "attack", e.target.value)
                }
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
