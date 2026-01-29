import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CitySelection } from "./CitySelection";
import InputMask from "react-input-mask";
import { validateCPF, validateRG, validateBirthDate } from "@/utils/validateCPF";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

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

interface FieldValidation {
  touched: boolean;
  valid: boolean;
  message?: string;
}

export const StudentPersonalInfo = ({ values, onChange, onCityChange }: StudentPersonalInfoProps) => {
  const [validations, setValidations] = useState<Record<string, FieldValidation>>({
    cpf: { touched: false, valid: true },
    rg: { touched: false, valid: true },
    birthDate: { touched: false, valid: true },
  });

  // Validar campos quando valores mudam
  useEffect(() => {
    if (validations.cpf.touched && values.cpf) {
      const isValid = validateCPF(values.cpf);
      setValidations(prev => ({
        ...prev,
        cpf: { touched: true, valid: isValid, message: isValid ? undefined : "CPF inválido" }
      }));
    }
  }, [values.cpf]);

  useEffect(() => {
    if (validations.rg.touched && values.rg) {
      const isValid = validateRG(values.rg);
      setValidations(prev => ({
        ...prev,
        rg: { touched: true, valid: isValid, message: isValid ? undefined : "RG inválido (7-9 dígitos)" }
      }));
    }
  }, [values.rg]);

  useEffect(() => {
    if (validations.birthDate.touched && values.birthDate) {
      const result = validateBirthDate(values.birthDate);
      setValidations(prev => ({
        ...prev,
        birthDate: { touched: true, valid: result.valid, message: result.message }
      }));
    }
  }, [values.birthDate]);

  const handleBlur = (field: string) => {
    let isValid = true;
    let message: string | undefined;

    if (field === 'cpf' && values.cpf) {
      isValid = validateCPF(values.cpf);
      message = isValid ? undefined : "CPF inválido";
    } else if (field === 'rg' && values.rg) {
      isValid = validateRG(values.rg);
      message = isValid ? undefined : "RG inválido (7-9 dígitos)";
    } else if (field === 'birthDate' && values.birthDate) {
      const result = validateBirthDate(values.birthDate);
      isValid = result.valid;
      message = result.message;
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
          <div className="relative">
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              value={values.birthDate}
              onChange={onChange}
              onBlur={() => handleBlur('birthDate')}
              required
              className={cn(getFieldClasses('birthDate', !!values.birthDate), "pr-10")}
            />
            <ValidationIcon field="birthDate" hasValue={!!values.birthDate} />
          </div>
          {validations.birthDate.touched && !validations.birthDate.valid && values.birthDate && (
            <p className="text-xs text-red-500 mt-1">{validations.birthDate.message}</p>
          )}
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
          <div className="relative">
            <InputMask
              mask="99.999.999-9"
              value={values.rg}
              onChange={onChange}
              onBlur={() => handleBlur('rg')}
            >
              {/* @ts-ignore */}
              {(inputProps: any) => (
                <Input
                  {...inputProps}
                  id="rg"
                  name="rg"
                  placeholder="00.000.000-0"
                  className={cn(getFieldClasses('rg', !!values.rg), "pr-10")}
                />
              )}
            </InputMask>
            <ValidationIcon field="rg" hasValue={!!values.rg} />
          </div>
          {validations.rg.touched && !validations.rg.valid && values.rg && (
            <p className="text-xs text-red-500 mt-1">{validations.rg.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <div className="relative">
            <InputMask
              mask="999.999.999-99"
              value={values.cpf}
              onChange={onChange}
              onBlur={() => handleBlur('cpf')}
            >
              {/* @ts-ignore */}
              {(inputProps: any) => (
                <Input
                  {...inputProps}
                  id="cpf"
                  name="cpf"
                  placeholder="000.000.000-00"
                  className={cn(getFieldClasses('cpf', !!values.cpf), "pr-10")}
                />
              )}
            </InputMask>
            <ValidationIcon field="cpf" hasValue={!!values.cpf} />
          </div>
          {validations.cpf.touched && !validations.cpf.valid && values.cpf && (
            <p className="text-xs text-red-500 mt-1">{validations.cpf.message}</p>
          )}
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