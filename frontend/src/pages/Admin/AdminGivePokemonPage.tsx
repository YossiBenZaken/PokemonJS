import {
  GivePokemonRequest,
  PokemonDetails,
  getPokemons,
  givePokemon,
} from "../../api/admin.api";
import React, { useEffect, useState } from "react";

import styled from "styled-components";
import { useSearchParams } from "react-router-dom";

const Page = styled.div`
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
`;

const Container = styled.div`
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
`;

const Title = styled.h2`
  color: #667eea;
  margin-bottom: 10px;
  text-align: center;
`;

const Subtitle = styled.p`
  color: #6c757d;
  text-align: center;
  margin-bottom: 30px;
  font-size: 14px;
  line-height: 1.6;
`;

const Form = styled.form``;

const FormGroup = styled.div`
  margin-bottom: 25px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;

  &:hover {
    border-color: #667eea;
    background: #f8f9fa;
  }

  input {
    cursor: pointer;
    width: 18px;
    height: 18px;
  }

  input:checked + span {
    font-weight: 600;
    color: #667eea;
  }
`;

const Select = styled.select`
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
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

const PokemonInfo = styled.div`
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #667eea;

  h4 {
    margin: 0 0 10px 0;
    color: #667eea;
    font-size: 16px;
  }

  p {
    margin: 5px 0;
    color: #495057;
    font-size: 14px;

    strong {
      color: #212529;
    }
  }
`;

const EGG_TYPES = [
  { value: "y", label: "ביצה" },
  { value: "n", label: "לא ביצה" },
];

const AdminGivePokemonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [userId, setUserId] = useState(searchParams.get("player") || "");
  const [isEgg, setIsEgg] = useState<string>("n");
  const [level, setLevel] = useState<number>(100);
  const [minIV, setMinIV] = useState<number>(0);
  const [maxIV, setMaxIV] = useState<number>(31);
  const [wildId, setWildId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
    pokemon?: any;
  } | null>(null);
  const [pokemons, setPokemons] = useState<PokemonDetails[]>([]);

  useEffect(() => {
    loadPokemons();
  }, []);

  const loadPokemons = async () => {
    const response = await getPokemons();
    setPokemons(response);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!userId || wildId === 0) {
      setMessage({
        kind: "error",
        text: "אנא מלא את כל השדות",
      });
      return;
    }

    console.log({
      isEgg,
      userId,
      level,
      minIV,
      maxIV,
      wildId,
    });

    setLoading(true);
    try {
      const payload: GivePokemonRequest = {
        userId: Number(userId),
        isEgg,
        level,
        maxIV,
        minIV,
        wildId,
      };
      const res = await givePokemon(payload);
      if (res.success) {
        setMessage({
          kind: "success",
          text: res.message,
          pokemon: res.pokemon,
        });
        // Reset form
        setIsEgg('n');
        setLevel(100);
        setMaxIV(31);
        setMinIV(0);
        setWildId(0);
        setUserId('');
      } else {
        setMessage({
          kind: "error",
          text: res.message,
        });
      }
    } catch (error: any) {
      setMessage({
        kind: "error",
        text: error.response?.data?.message || "שגיאה במתן ביצה",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Container>
        <Title>מתן פוקימון</Title>
        <Subtitle>
          אתה יכול לתת למישהו פוקימון.
          <br />* שים לב, אם למאמן כבר יש 6 פוקימונים איתו, לא יהיה אפשר לשלוח!
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>ID מאמן *</Label>
            <Input
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="הזן ID של המאמן"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>פוקימון *</Label>
            <Select
              name="pokemon"
              value={wildId}
              onChange={(e) => setWildId(Number(e.target.value))}
              required
            >
              <option value="0">בחר פוקימון</option>
              {pokemons.map((p) => (
                <option value={p.wild_id} key={p.wild_id}>
                  {p.naam} - {p.type1}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>רמה</Label>
            <Input
              type="number"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              placeholder="הזן רמה"
              max={100}
              min={5}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>MinIV</Label>
            <Input
              type="number"
              value={minIV}
              onChange={(e) => setMinIV(Number(e.target.value))}
              max={31}
              min={0}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>MaxIV</Label>
            <Input
              type="number"
              value={maxIV}
              onChange={(e) => setMaxIV(Number(e.target.value))}
              max={31}
              min={0}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>בחר סוג ביצה *</Label>
            <RadioGroup>
              {EGG_TYPES.map((egg) => (
                <RadioLabel key={egg.value}>
                  <input
                    type="radio"
                    name="eggType"
                    value={egg.value}
                    checked={isEgg === egg.value}
                    onChange={() => setIsEgg(egg.value)}
                  />
                  <span>{egg.label} </span>
                </RadioLabel>
              ))}
            </RadioGroup>
          </FormGroup>

          <Button type="submit" disabled={loading}>
            {loading ? "שולח..." : "תן ביצה! 🥚"}
          </Button>
        </Form>

        {message && (
          <>
            <Message kind={message.kind}>{message.text}</Message>
            {message.pokemon && (
              <PokemonInfo>
                <h4>פרטי הפוקימון שנשלח:</h4>
                <p>
                  <strong>שם:</strong> {message.pokemon.name}
                </p>
                <p>
                  <strong>רמה:</strong> {message.pokemon.level}
                </p>
                <p>
                  <strong>אופי:</strong> {message.pokemon.character}
                </p>
              </PokemonInfo>
            )}
          </>
        )}
      </Container>
    </Page>
  );
};

export default AdminGivePokemonPage;
