import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputMask from "react-input-mask";

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
        <InputMask
          mask="999.999.999-99"
          value={values.guardianCpf}
          onChange={onChange}
        >
          {/* @ts-ignore */}
          {(inputProps: any) => (
            <Input
              {...inputProps}
              id="guardianCpf"
              name="guardianCpf"
              placeholder="000.000.000-00"
            />
          )}
        </InputMask>
      </div>

      <div>
        <Label htmlFor="guardianRg">RG do Responsável</Label>
        <InputMask
          mask="99.999.999-9"
          value={values.guardianRg}
          onChange={onChange}
        >
          {/* @ts-ignore */}
          {(inputProps: any) => (
            <Input
              {...inputProps}
              id="guardianRg"
              name="guardianRg"
              placeholder="00.000.000-0"
            />
          )}
        </InputMask>
      </div>

      <div>
        <Label htmlFor="guardianPhone">Telefone do Responsável*</Label>
        <InputMask
          mask="(99) 99999-9999"
          value={values.guardianPhone}
          onChange={onChange}
        >
          {/* @ts-ignore */}
          {(inputProps: any) => (
            <Input
              {...inputProps}
              id="guardianPhone"
              name="guardianPhone"
              placeholder="(00) 00000-0000"
              required
            />
          )}
        </InputMask>
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