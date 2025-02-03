import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface StudentFormValues {
  name: string;
  birthDate: string;
  address: string;
  parentName: string;
  parentPhone: string;
  observations: string;
}

export const StudentForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState<StudentFormValues>({
    name: "",
    birthDate: "",
    address: "",
    parentName: "",
    parentPhone: "",
    observations: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const studentData = {
        name: formValues.name,
        birth_date: formValues.birthDate,
        address: formValues.address,
        guardian_name: formValues.parentName,
        guardian_phone: formValues.parentPhone,
        notes: formValues.observations,
      };

      const { error: studentError } = await supabase
        .from("students")
        .insert(studentData);

      if (studentError) throw studentError;

      toast({
        title: "Sucesso!",
        description: "Aluno cadastrado com sucesso",
      });

      setFormValues({
        name: "",
        birthDate: "",
        address: "",
        parentName: "",
        parentPhone: "",
        observations: "",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar aluno",
        description: error.message || "Ocorreu um erro ao cadastrar o aluno",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Aluno</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Aluno</Label>
          <Input
            id="name"
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="birthDate">Data de Nascimento</Label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            value={formValues.birthDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            name="address"
            value={formValues.address}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="parentName">Nome do Responsável</Label>
          <Input
            id="parentName"
            name="parentName"
            value={formValues.parentName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="parentPhone">Telefone do Responsável</Label>
          <Input
            id="parentPhone"
            name="parentPhone"
            value={formValues.parentPhone}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="observations">Observações</Label>
          <Input
            id="observations"
            name="observations"
            value={formValues.observations}
            onChange={handleInputChange}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Cadastrando..." : "Cadastrar Aluno"}
        </Button>
      </form>
    </Card>
  );
};