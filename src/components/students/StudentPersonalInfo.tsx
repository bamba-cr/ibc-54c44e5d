import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CitySelection } from "./CitySelection";

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
          <Label htmlFor="age">Idade</Label>
          <Input
            id="age"
            name="age"
            type="number"
            value={values.age}
            onChange={onChange}
            placeholder="Idade"
            min="0"
            max="120"
          />
        </div>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rg">RG</Label>
          <Input
            id="rg"
            name="rg"
            value={values.rg}
            onChange={onChange}
            placeholder="RG"
          />
        </div>
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            name="cpf"
            value={values.cpf}
            onChange={onChange}
            placeholder="000.000.000-00"
          />
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