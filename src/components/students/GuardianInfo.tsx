import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputMask from "react-input-mask";
import { validateCPF, validateRG, validateEmail } from "@/utils/validateCPF";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

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

interface FieldValidation {
  touched: boolean;
  valid: boolean;
  message?: string;
}

export const GuardianInfo = ({ values, onChange }: GuardianInfoProps) => {
  const [validations, setValidations] = useState<Record<string, FieldValidation>>({
    guardianCpf: { touched: false, valid: true },
    guardianRg: { touched: false, valid: true },
    guardianEmail: { touched: false, valid: true },
    guardianPhone: { touched: false, valid: true },
  });

  // Validar campos quando valores mudam
  useEffect(() => {
    if (validations.guardianCpf.touched && values.guardianCpf) {
      const isValid = validateCPF(values.guardianCpf);
      setValidations(prev => ({
        ...prev,
        guardianCpf: { touched: true, valid: isValid, message: isValid ? undefined : "CPF inválido" }
      }));
    }
  }, [values.guardianCpf]);

  useEffect(() => {
    if (validations.guardianRg.touched && values.guardianRg) {
      const isValid = validateRG(values.guardianRg);
      setValidations(prev => ({
        ...prev,
        guardianRg: { touched: true, valid: isValid, message: isValid ? undefined : "RG inválido" }
      }));
    }
  }, [values.guardianRg]);

  useEffect(() => {
    if (validations.guardianEmail.touched && values.guardianEmail) {
      const isValid = validateEmail(values.guardianEmail);
      setValidations(prev => ({
        ...prev,
        guardianEmail: { touched: true, valid: isValid, message: isValid ? undefined : "Email inválido" }
      }));
    }
  }, [values.guardianEmail]);

  useEffect(() => {
    if (validations.guardianPhone.touched && values.guardianPhone) {
      const cleanPhone = values.guardianPhone.replace(/\D/g, '');
      const isValid = cleanPhone.length >= 10;
      setValidations(prev => ({
        ...prev,
        guardianPhone: { touched: true, valid: isValid, message: isValid ? undefined : "Telefone incompleto" }
      }));
    }
  }, [values.guardianPhone]);

  const handleBlur = (field: string) => {
    let isValid = true;
    let message: string | undefined;

    if (field === 'guardianCpf' && values.guardianCpf) {
      isValid = validateCPF(values.guardianCpf);
      message = isValid ? undefined : "CPF inválido";
    } else if (field === 'guardianRg' && values.guardianRg) {
      isValid = validateRG(values.guardianRg);
      message = isValid ? undefined : "RG inválido";
    } else if (field === 'guardianEmail' && values.guardianEmail) {
      isValid = validateEmail(values.guardianEmail);
      message = isValid ? undefined : "Email inválido";
    } else if (field === 'guardianPhone' && values.guardianPhone) {
      const cleanPhone = values.guardianPhone.replace(/\D/g, '');
      isValid = cleanPhone.length >= 10;
      message = isValid ? undefined : "Telefone incompleto";
    }

    setValidations(prev => ({
      ...prev,
      [field]: { touched: true, valid: isValid, message }
    }));
  };

  const getFieldClasses = (field: string, hasValue: boolean) => {
    const validation = validations[field];
    if (!validation?.touched || !hasValue) return "";
    return validation.valid 
      ? "border-green-500 focus-visible:ring-green-500" 
      : "border-red-500 focus-visible:ring-red-500";
  };

  const ValidationIcon = ({ field, hasValue }: { field: string; hasValue: boolean }) => {
    const validation = validations[field];
    if (!validation?.touched || !hasValue) return null;
    return validation.valid 
      ? <CheckCircle2 className="h-4 w-4 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
      : <XCircle className="h-4 w-4 text-red-500 absolute right-3 top-1/2 -translate-y-1/2" />;
  };

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
        <div className="relative">
          <InputMask
            mask="999.999.999-99"
            value={values.guardianCpf}
            onChange={onChange}
            onBlur={() => handleBlur('guardianCpf')}
          >
            {/* @ts-ignore */}
            {(inputProps: any) => (
              <Input
                {...inputProps}
                id="guardianCpf"
                name="guardianCpf"
                placeholder="000.000.000-00"
                className={cn(getFieldClasses('guardianCpf', !!values.guardianCpf), "pr-10")}
              />
            )}
          </InputMask>
          <ValidationIcon field="guardianCpf" hasValue={!!values.guardianCpf} />
        </div>
        {validations.guardianCpf.touched && !validations.guardianCpf.valid && values.guardianCpf && (
          <p className="text-xs text-red-500 mt-1">{validations.guardianCpf.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="guardianRg">RG do Responsável</Label>
        <div className="relative">
          <InputMask
            mask="99.999.999-9"
            value={values.guardianRg}
            onChange={onChange}
            onBlur={() => handleBlur('guardianRg')}
          >
            {/* @ts-ignore */}
            {(inputProps: any) => (
              <Input
                {...inputProps}
                id="guardianRg"
                name="guardianRg"
                placeholder="00.000.000-0"
                className={cn(getFieldClasses('guardianRg', !!values.guardianRg), "pr-10")}
              />
            )}
          </InputMask>
          <ValidationIcon field="guardianRg" hasValue={!!values.guardianRg} />
        </div>
        {validations.guardianRg.touched && !validations.guardianRg.valid && values.guardianRg && (
          <p className="text-xs text-red-500 mt-1">{validations.guardianRg.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="guardianPhone">Telefone do Responsável*</Label>
        <div className="relative">
          <InputMask
            mask="(99) 99999-9999"
            value={values.guardianPhone}
            onChange={onChange}
            onBlur={() => handleBlur('guardianPhone')}
          >
            {/* @ts-ignore */}
            {(inputProps: any) => (
              <Input
                {...inputProps}
                id="guardianPhone"
                name="guardianPhone"
                placeholder="(00) 00000-0000"
                required
                className={cn(getFieldClasses('guardianPhone', !!values.guardianPhone), "pr-10")}
              />
            )}
          </InputMask>
          <ValidationIcon field="guardianPhone" hasValue={!!values.guardianPhone} />
        </div>
        {validations.guardianPhone.touched && !validations.guardianPhone.valid && values.guardianPhone && (
          <p className="text-xs text-red-500 mt-1">{validations.guardianPhone.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="guardianEmail">Email do Responsável</Label>
        <div className="relative">
          <Input
            id="guardianEmail"
            name="guardianEmail"
            type="email"
            value={values.guardianEmail}
            onChange={onChange}
            onBlur={() => handleBlur('guardianEmail')}
            className={cn(getFieldClasses('guardianEmail', !!values.guardianEmail), "pr-10")}
          />
          <ValidationIcon field="guardianEmail" hasValue={!!values.guardianEmail} />
        </div>
        {validations.guardianEmail.touched && !validations.guardianEmail.valid && values.guardianEmail && (
          <p className="text-xs text-red-500 mt-1">{validations.guardianEmail.message}</p>
        )}
      </div>
    </div>
  );
};