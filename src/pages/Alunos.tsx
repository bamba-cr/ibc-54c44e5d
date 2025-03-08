
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StudentForm } from "@/components/students/StudentForm";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Search, User, Edit, Trash2, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Alunos = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch students
  const { data: students, isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Erro ao buscar alunos:", error);
        throw error;
      }
      
      return data || [];
    },
  });

  // Delete student function
  const handleDeleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: "Aluno removido com sucesso.",
      });
      
      refetch();
    } catch (error: any) {
      console.error("Erro ao remover aluno:", error);
      toast({
        title: "Erro!",
        description: error.message || "Não foi possível remover o aluno.",
        variant: "destructive",
      });
    }
  };

  // Handle student registration
  const handleStudentSubmit = async (data: any) => {
    console.log("Dados do aluno recebidos:", data);

    try {
      // Verificar se os dados estão no formato correto
      const studentData = {
        name: data.name,
        age: data.age ? parseInt(data.age) : null,
        birth_date: data.birth_date,
        rg: data.rg,
        cpf: data.cpf,
        address: data.address,
        city: data.city,
        guardian_name: data.guardian_name,
        guardian_relationship: data.guardian_relationship,
        guardian_cpf: data.guardian_cpf,
        guardian_rg: data.guardian_rg,
        guardian_phone: data.guardian_phone,
        guardian_email: data.guardian_email,
        notes: data.notes,
        photo_url: data.photo_url
      };

      console.log("Dados formatados para inserção:", studentData);

      // Inserir o aluno no Supabase
      const { data: insertedData, error } = await supabase
        .from("students")
        .insert([studentData])
        .select();

      if (error) {
        console.error("Erro ao cadastrar aluno:", error);
        throw error;
      }

      console.log("Aluno cadastrado com sucesso:", insertedData);

      // Se tiver projetos selecionados, cadastrar a relação
      if (data.projects && data.projects.length > 0 && insertedData?.[0]?.id) {
        const studentId = insertedData[0].id;
        const projectRelations = data.projects.map((projectId: string) => ({
          student_id: studentId,
          project_id: projectId
        }));

        console.log("Relacionando aluno a projetos:", projectRelations);

        const { error: projectError } = await supabase
          .from("student_projects")
          .insert(projectRelations);

        if (projectError) {
          console.error("Erro ao relacionar aluno com projetos:", projectError);
          toast({
            title: "Atenção",
            description: "Aluno cadastrado, mas houve um erro ao relacionar com os projetos.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Sucesso!",
        description: "Aluno cadastrado com sucesso.",
      });

      refetch();
    } catch (error: any) {
      console.error("Erro completo ao cadastrar aluno:", error);
      toast({
        title: "Erro!",
        description: error.message || "Não foi possível cadastrar o aluno.",
        variant: "destructive",
      });
    }
  };

  // Filter students based on search term
  const filteredStudents = students?.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.guardian_email && student.guardian_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.cpf && student.cpf.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {fetchError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Erro ao carregar alunos</AlertTitle>
          <AlertDescription>
            {fetchError.message || "Não foi possível carregar a lista de alunos."}
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="lista" className="max-w-5xl mx-auto">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="lista">Lista de Alunos</TabsTrigger>
          <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lista">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Alunos Cadastrados</CardTitle>
              <div className="flex gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="default" onClick={() => refetch()}>
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredStudents?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email do Responsável</TableHead>
                      <TableHead>Telefone do Responsável</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.guardian_email || "-"}</TableCell>
                        <TableCell>{student.guardian_phone || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/editar-aluno/${student.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteStudent(student.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <User className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">
                    {searchTerm ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cadastro">
          <StudentForm onSubmit={handleStudentSubmit} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Alunos;
