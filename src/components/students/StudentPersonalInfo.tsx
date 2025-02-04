import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudentPersonalInfoProps {
  values: {
    name: string;
    age: string;
    birthDate: string;
    rg: string;
    cpf: string;
    address: string;
    city: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCityChange: (value: string) => void;
}

export const StudentPersonalInfo = ({
  values,
  onChange,
  onCityChange,
}: StudentPersonalInfoProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Dados do Aluno</h2>
      
      <div>
        <Label htmlFor="name">Nome*</Label>
        <Input
          id="name"
          name="name"
          value={values.name}
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
        />
      </div>

      <div>
        <Label htmlFor="birthDate">Data de Nascimento*</Label>
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
        <Label htmlFor="rg">RG</Label>
        <Input
          id="rg"
          name="rg"
          value={values.rg}
          onChange={onChange}
        />
      </div>

      <div>
        <Label htmlFor="cpf">CPF</Label>
        <Input
          id="cpf"
          name="cpf"
          value={values.cpf}
          onChange={onChange}
        />
      </div>

      <div>
        <Label htmlFor="address">Endereço*</Label>
        <Input
          id="address"
          name="address"
          value={values.address}
          onChange={onChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="city">Cidade*</Label>
        <Select
          value={values.city}
          onValueChange={onCityChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Laranjal do Jari">Laranjal do Jari</SelectItem>
            <SelectItem value="Vitória do Jari">Vitória do Jari</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};