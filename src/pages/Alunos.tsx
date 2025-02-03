import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const projects = [
  { id: "capoeira", label: "Capoeira" },
  { id: "futebol", label: "Futebol" },
  { id: "judo", label: "Judô" },
  { id: "musica", label: "Música" },
  { id: "informatica", label: "Informática" },
  { id: "zumba", label: "Zumba" },
  { id: "reforco", label: "Reforço Escolar" },
] as const;

const formSchema = z.object({
  photo: z.any().optional(),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  age: z.string().min(1, "Idade é obrigatória"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  rg: z.string().min(1, "RG é obrigatório"),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos"),
  address: z.string().min(1, "Endereço é obrigatório"),
  city: z.enum(["Laranjal do Jari", "Vitória do Jari"], {
    required_error: "Cidade é obrigatória",
  }),
  guardianName: z.string().min(2, "Nome do responsável é obrigatório"),
  relationship: z.string().min(1, "Grau de parentesco é obrigatório"),
  guardianCpf: z.string().length(11, "CPF deve ter 11 dígitos"),
  guardianRg: z.string().min(1, "RG do responsável é obrigatório"),
  guardianPhone: z.string().min(1, "Telefone é obrigatório"),
  guardianEmail: z.string().email("Email inválido"),
  projects: z.array(z.string()).min(1, "Selecione pelo menos um projeto"),
  notes: z.string().optional(),
});

export default function AlunosPage() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projects: [],
      notes: "",
    },
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para cadastrar alunos.",
        variant: "destructive",
      });
      navigate("/login");
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para cadastrar alunos.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Insert student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
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
        .select()
        .single();

      if (studentError) {
        console.error('Error saving student:', studentError);
        throw new Error('Erro ao salvar dados do aluno');
      }

      if (!studentData) {
        throw new Error('Nenhum dado retornado ao criar aluno');
      }

      // Insert project relationships
      if (values.projects.length > 0) {
        const { error: projectError } = await supabase
          .from('student_projects')
          .insert(
            values.projects.map(projectId => ({
              student_id: studentData.id,
              project_id: projectId
            }))
          );

        if (projectError) {
          console.error('Error saving student projects:', projectError);
          throw new Error('Erro ao vincular projetos ao aluno');
        }
      }

      toast({
        title: "Sucesso!",
        description: "Aluno cadastrado com sucesso!",
      });
      
      form.reset();
      setPhotoPreview(null);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao cadastrar o aluno. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ... keep existing code (form JSX for the student registration form)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Cadastro de Alunos</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Photo Upload Section */}
          <div className="space-y-4">
            <FormLabel>Foto do Aluno (Opcional)</FormLabel>
            <div className="flex items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={photoPreview || ""} />
                <AvatarFallback>
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="max-w-[300px]"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Student Data */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Dados do Aluno</h2>
              
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

              <FormField
                control={form.control}
                name="rg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl>
                      <Input placeholder="RG" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="CPF (apenas números)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Endereço completo" {...field} />
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
            </div>

            {/* Guardian Data */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Dados do Responsável</h2>
              
              <FormField
                control={form.control}
                name="guardianName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Responsável</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
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
                      <Input placeholder="Ex: Pai, Mãe, Avó" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guardianCpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF do Responsável</FormLabel>
                    <FormControl>
                      <Input placeholder="CPF (apenas números)" {...field} />
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
                      <Input placeholder="RG" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guardianPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Projects Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Projetos</h2>
            <FormField
              control={form.control}
              name="projects"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Observações</h2>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais (opcional)"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
            {isSubmitting ? "Cadastrando..." : "Cadastrar Aluno"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
