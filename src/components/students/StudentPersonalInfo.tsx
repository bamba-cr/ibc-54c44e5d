import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CitySelection } from "./CitySelection";
import InputMask from "react-input-mask";

interface StudentPersonalInfoProps {
  values: {
    name: string;
    age: string;
    birthDate: string;
    rg: string;
    cpf: string;
    address: string;
    cityId: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCityChange: (cityId: string) => void;
}

export const StudentPersonalInfo = ({ values, onChange, onCityChange }: StudentPersonalInfoProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Informações Pessoais</h3>
      
      <div>
        <Label htmlFor="name">Nome Completo *</Label>
        <Input
          id="name"
          name="name"
          value={values.name}
          onChange={onChange}
          placeholder="Nome completo do aluno"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="birthDate">Data de Nascimento *</Label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            value={values.birthDate}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="age">Idade</Label>
          <Input
            id="age"
            name="age"
            type="number"
            value={values.age}
            onChange={onChange}
            placeholder="Calculada automaticamente"
            readOnly
            className="bg-muted"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rg">RG</Label>
          <InputMask
            mask="99.999.999-9"
            value={values.rg}
            onChange={onChange}
          >
            {/* @ts-ignore */}
            {(inputProps: any) => (
              <Input
                {...inputProps}
                id="rg"
                name="rg"
                placeholder="00.000.000-0"
              />
            )}
          </InputMask>
        </div>
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <InputMask
            mask="999.999.999-99"
            value={values.cpf}
            onChange={onChange}
          >
            {/* @ts-ignore */}
            {(inputProps: any) => (
              <Input
                {...inputProps}
                id="cpf"
                name="cpf"
                placeholder="000.000.000-00"
              />
            )}
          </InputMask>
        </div>
      </div>

      <div>
        <Label htmlFor="address">Endereço *</Label>
        <Input
          id="address"
          name="address"
          value={values.address}
          onChange={onChange}
          placeholder="Endereço completo"
          required
        />
      </div>

      <CitySelection
        selectedCity={values.cityId}
        onCityChange={onCityChange}
      />
    </div>
  );
};