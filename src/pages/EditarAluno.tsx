"use client"; // Adicione isso no topo do arquivo se estiver usando Next.js

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

// Definição dos projetos disponíveis
const projects = [
  { id: "capoeira", label: "Capoeira" },
  { id: "musica", label: "Música" },
  { id: "danca", label: "Dança" },
  { id: "teatro", label: "Teatro" },
];

// Schema de validação do formulário
const formSchema = z.object({
  id: z.string().optional(), // Adicionado para identificar o aluno no banco de dados
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  age: z.string().min(1, "Idade é obrigatória"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  rg: z.string().min(1, "RG é obrigatório"),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos"),
  address: z.string().min(1, "Endereço é obrigatório"),
  city: z.enum(["Laranjal do Jari", "Vitória do Jari"]),
  guardianName: z.string().min(2, "Nome do responsável é obrigatório"),
  relationship: z.string().min(1, "Grau de parentesco é obrigatório"),
  guardianCpf: z.string().length(11, "CPF deve ter 11 dígitos"),
  guardianRg: z.string().min(1, "RG do responsável é obrigatório"),
  guardianPhone: z.string().min(1, "Telefone é obrigatório"),
  guardianEmail: z.string().email("Email inválido"),
  projects: z.array(z.string()).min(1, "Selecione pelo menos um projeto"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const EditarAluno = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projects: [],
      notes: "",
    },
  });

  // Função para buscar aluno no Supabase
  const handleSearch = async () => {
    try {
      const { data, error } = await supabase
        .from("students") // Nome da tabela no Supabase
        .select("*")
        .or(`name.eq.${searchTerm},cpf.eq.${searchTerm},rg.eq.${searchTerm}`)
        .single(); // Busca um único registro

      if (error) {
        throw error;
      }

      if (data) {
        setSelectedStudent(data);
        form.reset(data); // Preenche o formulário com os dados do aluno
      } else {
        toast({
          title: "Aluno não encontrado",
          description: "Nenhum aluno foi encontrado com os critérios de busca.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar aluno:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar o aluno.",
        variant: "destructive",
      });
    }
  };

  // Função para salvar as alterações no Supabase
  const onSubmit = async (values: FormValues) => {
    try {
      if (!selectedStudent?.id) {
        throw new Error("ID do aluno não encontrado.");
      }

      const { error } = await supabase
        .from("students") // Nome da tabela no Supabase
        .update(values)
        .eq("id", selectedStudent.id); // Atualiza o aluno com o ID correspondente

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Cadastro atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao atualizar aluno:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o cadastro do aluno.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Editar Cadastro de Aluno</h1>

      {/* Campo de busca */}
      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Buscar por nome, CPF ou RG"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          Buscar
        </Button>
      </div>

      {/* Formulário de edição */}
      {selectedStudent && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Campos do formulário */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idade</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Outros campos do formulário... */}

            {/* Botões de ação */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedStudent(null);
                  form.reset();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default EditarAluno;
