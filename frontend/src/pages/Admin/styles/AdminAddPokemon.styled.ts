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

export {
  Page,
  Title,
  Button,
  CheckboxGrid,
  CheckboxLabel,
  Form,
  FormRow,
  Input,
  LevelMoveRow,
  Message,
  Note,
  Section,
  SectionTitle,
  Select,
};
