"use client";

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
//este codigo deve buscar os aluinos cadastrados no banco de dados para possiveius alteraçoes no registro
const projects = [
  { id: "capoeira", label: "Capoeira" },
  { id: "musica", label: "Música" },
  { id: "danca", label: "Dança" },
  { id: "teatro", label: "Teatro" },
];

const formSchema = z.object({
  id: z.string().optional(),
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
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projects: [],
      notes: "",
    },
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, insira um termo de busca",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const searchTermLower = searchTerm.toLowerCase();
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .or(`name.ilike.%${searchTermLower}%,cpf.ilike.%${searchTermLower}%,rg.ilike.%${searchTermLower}%`)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        toast({
          title: "Aluno não encontrado",
          description: "Nenhum aluno foi encontrado com os critérios de busca.",
          variant: "destructive",
        });
        setSelectedStudent(null);
        return;
      }

      // Transform the data to match the form schema
      const formattedStudent = {
        id: data.id,
        name: data.name,
        age: data.age?.toString() || "",
        birthDate: data.birth_date || "",
        rg: data.rg || "",
        cpf: data.cpf || "",
        address: data.address || "",
        city: data.city as "Laranjal do Jari" | "Vitória do Jari",
        guardianName: data.guardian_name || "",
        relationship: data.guardian_relationship || "",
        guardianCpf: data.guardian_cpf || "",
        guardianRg: data.guardian_rg || "",
        guardianPhone: data.guardian_phone || "",
        guardianEmail: data.guardian_email || "",
        projects: [], // We'll need to fetch this separately
        notes: data.notes || "",
      };

      // Fetch the student's projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("student_projects")
        .select("project_id")
        .eq("student_id", data.id);

      if (projectsError) {
        throw projectsError;
      }

      formattedStudent.projects = projectsData.map(p => p.project_id);
      
      setSelectedStudent(formattedStudent);
      form.reset(formattedStudent);
      
      toast({
        title: "Sucesso!",
        description: "Aluno encontrado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao buscar aluno:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao buscar o aluno.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!selectedStudent?.id) {
      toast({
        title: "Erro",
        description: "ID do aluno não encontrado.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update student data
      const { error: updateError } = await supabase
        .from("students")
        .update({
          name: values.name,
          age: parseInt(values.age),
          birth_date: values.birthDate,
          rg: values.rg,
          cpf: values.cpf,
          address: values.address,
          city: values.city,
          guardian_name: values.guardianName,
          guardian_relationship: values.relationship,
          guardian_cpf: values.guardianCpf,
          guardian_rg: values.guardianRg,
          guardian_phone: values.guardianPhone,
          guardian_email: values.guardianEmail,
          notes: values.notes,
        })
        .eq("id", selectedStudent.id);

      if (updateError) throw updateError;

      // Update student projects
      // First, remove all existing project associations
      const { error: deleteError } = await supabase
        .from("student_projects")
        .delete()
        .eq("student_id", selectedStudent.id);

      if (deleteError) throw deleteError;

      // Then, add the new project associations
      if (values.projects.length > 0) {
        const projectMappings = values.projects.map(projectId => ({
          student_id: selectedStudent.id,
          project_id: projectId,
        }));

        const { error: insertError } = await supabase
          .from("student_projects")
          .insert(projectMappings);

        if (insertError) throw insertError;
      }

      toast({
        title: "Sucesso!",
        description: "Cadastro atualizado com sucesso!",
      });

      // Reset form and selected student
      setSelectedStudent(null);
      form.reset();
      setSearchTerm("");
    } catch (error: any) {
      console.error("Erro ao atualizar aluno:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao atualizar o cadastro do aluno.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Editar Cadastro de Aluno</h1>

      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Buscar por nome, CPF ou RG"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          <Search className="mr-2 h-4 w-4" />
          {isLoading ? "Buscando..." : "Buscar"}
        </Button>
      </div>

      {selectedStudent && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Laranjal do Jari">Laranjal do Jari</SelectItem>
                      <SelectItem value="Vitória do Jari">Vitória do Jari</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Dados do Responsável</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="guardianName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Responsável</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grau de Parentesco</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="guardianCpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF do Responsável</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guardianRg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG do Responsável</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="guardianPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone do Responsável</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guardianEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Responsável</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="projects"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Projetos</FormLabel>
                  </div>
                  {projects.map((project) => (
                    <FormField
                      key={project.id}
                      control={form.control}
                      name="projects"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={project.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(project.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, project.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== project.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {project.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre o aluno"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedStudent(null);
                  form.reset();
                  setSearchTerm("");
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default EditarAluno;
