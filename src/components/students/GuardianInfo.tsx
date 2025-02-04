import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GuardianInfoProps {
  values: {
    guardianName: string;
    guardianRelationship: string;
    guardianCpf: string;
    guardianRg: string;
    guardianPhone: string;
    guardianEmail: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GuardianInfo = ({ values, onChange }: GuardianInfoProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Dados do Responsável</h2>
      
      <div>
        <Label htmlFor="guardianName">Nome do Responsável*</Label>
        <Input
          id="guardianName"
          name="guardianName"
          value={values.guardianName}
          onChange={onChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="guardianRelationship">Grau de Parentesco*</Label>
        <Input
          id="guardianRelationship"
          name="guardianRelationship"
          value={values.guardianRelationship}
          onChange={onChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="guardianCpf">CPF do Responsável</Label>
        <Input
          id="guardianCpf"
          name="guardianCpf"
          value={values.guardianCpf}
          onChange={onChange}
        />
      </div>

      <div>
        <Label htmlFor="guardianRg">RG do Responsável</Label>
        <Input
          id="guardianRg"
          name="guardianRg"
          value={values.guardianRg}
          onChange={onChange}
        />
      </div>

      <div>
        <Label htmlFor="guardianPhone">Telefone do Responsável*</Label>
        <Input
          id="guardianPhone"
          name="guardianPhone"
          value={values.guardianPhone}
          onChange={onChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="guardianEmail">Email do Responsável</Label>
        <Input
          id="guardianEmail"
          name="guardianEmail"
          type="email"
          value={values.guardianEmail}
          onChange={onChange}
        />
      </div>
    </div>
  );
};