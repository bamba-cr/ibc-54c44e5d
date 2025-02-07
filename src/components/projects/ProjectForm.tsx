
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface ProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProjectForm = ({ onSuccess, onCancel }: ProjectFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    code: "",
    description: "",
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
    
    if (!formValues.name || !formValues.code) {
      toast({
        title: "Erro de validação",
        description: "Nome e código do projeto são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("projects")
        .insert([formValues]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Projeto cadastrado com sucesso",
      });

      if (onSuccess) {
        onSuccess();
      }

      setFormValues({
        name: "",
        code: "",
        description: "",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar projeto",
        description: error.message || "Ocorreu um erro ao cadastrar o projeto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Novo Projeto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Projeto</Label>
          <Input
            id="name"
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            placeholder="Nome do projeto"
            required
          />
        </div>

        <div>
          <Label htmlFor="code">Código do Projeto</Label>
          <Input
            id="code"
            name="code"
            value={formValues.code}
            onChange={handleInputChange}
            placeholder="Código do projeto"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            value={formValues.description}
            onChange={handleInputChange}
            placeholder="Descrição do projeto (opcional)"
            className="h-32"
          />
        </div>

        <div className="flex gap-4 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Cadastrar Projeto"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
