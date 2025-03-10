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
import { Search, User, Edit, Trash2, Loader2, Eye } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Database } from "@/integrations/supabase/types";

type Student = Database['public']['Tables']['students']['Row'];

interface StudentFormValues {
  name: string;
  age: string;
  birthDate: string;
  rg: string;
  cpf: string;
  address: string;
  city: string;
  guardianName: string;
  guardianRelationship: string;
  guardianCpf: string;
  guardianRg: string;
  guardianPhone: string;
  guardianEmail: string;
  projects: string[];
  observations: string;
  photo: File | null;
}

const Alunos = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { toast } = useToast();
  
  const [editForm, setEditForm] = useState<StudentFormValues>({
    name: "",
    age: "",
    birthDate: "",
    rg: "",
    cpf: "",
    address: "",
    city: "",
    guardianName: "",
    guardianRelationship: "",
    guardianCpf: "",
    guardianRg: "",
    guardianPhone: "",
    guardianEmail: "",
    projects: [],
    observations: "",
    photo: null
  });

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

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    }
  });

  const { data: studentProjects } = useQuery({
    queryKey: ["studentProjects", selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent?.id) return [];
      const { data, error } = await supabase
        .from("student_projects")
        .select("project_id")
        .eq("student_id", selectedStudent.id);
      
      if (error) throw error;
      return data.map(sp => sp.project_id);
    },
    enabled: !!selectedStudent?.id,
    meta: {
      onSuccess: (data: string[]) => {
        setEditForm(prev => ({
          ...prev,
          projects: data || []
        }));
      }
    }
  });

  useEffect(() => {
    if (studentProjects) {
      setEditForm(prev => ({
        ...prev,
        projects: studentProjects || []
      }));
    }
  }, [studentProjects]);

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

  const handleStudentSubmit = async (data: any) => {
    console.log("Dados do aluno recebidos:", data);

    try {
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

      const { data: insertedData, error } = await supabase
        .from("students")
        .insert([studentData])
        .select();

      if (error) {
        console.error("Erro ao cadastrar aluno:", error);
        throw error;
      }

      console.log("Aluno cadastrado com sucesso:", insertedData);

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

  const handleProjectChange = (projectId: string, checked: boolean) => {
    setEditForm(prev => {
      if (checked) {
        return { ...prev, projects: [...prev.projects, projectId] };
      }
      return { ...prev, projects: prev.projects.filter(id => id !== projectId) };
    });
  };

  const handleEditStudent = async () => {
    if (!selectedStudent) return;

    try {
      let photoUrl = selectedStudent.photo_url;
      
      if (editForm.photo) {
        const fileExt = editForm.photo.name.split('.').pop() || '';
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('student-photos')
          .upload(fileName, editForm.photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('student-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      const studentData = {
        name: editForm.name,
        age: editForm.age ? parseInt(editForm.age) : null,
        birth_date: editForm.birthDate,
        rg: editForm.rg,
        cpf: editForm.cpf,
        address: editForm.address,
        city: editForm.city,
        guardian_name: editForm.guardianName,
        guardian_relationship: editForm.guardianRelationship,
        guardian_cpf: editForm.guardianCpf,
        guardian_rg: editForm.guardianRg,
        guardian_phone: editForm.guardianPhone,
        guardian_email: editForm.guardianEmail,
        notes: editForm.observations,
        photo_url: photoUrl
      };

      const { error } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', selectedStudent.id);

      if (error) throw error;

      await supabase
        .from('student_projects')
        .delete()
        .eq('student_id', selectedStudent.id);
      
      if (editForm.projects.length > 0) {
        const projectMappings = editForm.projects.map(projectId => ({
          student_id: selectedStudent.id,
          project_id: projectId,
        }));

        const { error: projectError } = await supabase
          .from("student_projects")
          .insert(projectMappings);

        if (projectError) throw projectError;
      }

      toast({
        title: "Sucesso",
        description: "Dados do aluno atualizados com sucesso!"
      });

      setIsEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error("Erro ao atualizar aluno:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados do aluno: " + (error.message || ""),
        variant: "destructive"
      });
    }
  };

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
                              onClick={() => {
                                setSelectedStudent(student);
                                setEditForm({
                                  name: student.name,
                                  age: student.age?.toString() || "",
                                  birthDate: student.birth_date || "",
                                  rg: student.rg || "",
                                  cpf: student.cpf || "",
                                  address: student.address || "",
                                  city: student.city || "",
                                  guardianName: student.guardian_name || "",
                                  guardianRelationship: student.guardian_relationship || "",
                                  guardianCpf: student.guardian_cpf || "",
                                  guardianRg: student.guardian_rg || "",
                                  guardianPhone: student.guardian_phone || "",
                                  guardianEmail: student.guardian_email || "",
                                  projects: [],
                                  observations: student.notes || "",
                                  photo: null
                                });
                                setIsEditDialogOpen(true);
                              }}
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
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/consulta-individual/${student.id}`)}
                            >
                              <Eye className="h-4 w-4" />
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Editar Aluno</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-sm font-medium">Nome</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="age" className="text-sm font-medium">Idade</Label>
                    <Input
                      id="age"
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="birthDate" className="text-sm font-medium">Data de Nascimento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={editForm.birthDate}
                      onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="rg" className="text-sm font-medium">RG</Label>
                    <Input
                      id="rg"
                      value={editForm.rg}
                      onChange={(e) => setEditForm({ ...editForm, rg: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cpf" className="text-sm font-medium">CPF</Label>
                    <Input
                      id="cpf"
                      value={editForm.cpf}
                      onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="address" className="text-sm font-medium">Endereço</Label>
                    <Input
                      id="address"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="city" className="text-sm font-medium">Cidade</Label>
                    <Input
                      id="city"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guardianName" className="text-sm font-medium">Nome do Responsável</Label>
                    <Input
                      id="guardianName"
                      value={editForm.guardianName}
                      onChange={(e) => setEditForm({ ...editForm, guardianName: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guardianPhone" className="text-sm font-medium">Telefone do Responsável</Label>
                    <Input
                      id="guardianPhone"
                      value={editForm.guardianPhone}
                      onChange={(e) => setEditForm({ ...editForm, guardianPhone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guardianEmail" className="text-sm font-medium">Email do Responsável</Label>
                    <Input
                      id="guardianEmail"
                      type="email"
                      value={editForm.guardianEmail}
                      onChange={(e) => setEditForm({ ...editForm, guardianEmail: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-2">
                <Label className="text-sm font-medium">Projetos</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border rounded-md p-3 bg-gray-50">
                  {projects?.map((project) => (
                    <div key={project.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`project-${project.id}`}
                        checked={editForm.projects.includes(project.id)}
                        onCheckedChange={(checked) => 
                          handleProjectChange(project.id, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`project-${project.id}`} 
                        className="text-sm capitalize cursor-pointer"
                      >
                        {project.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="observations" className="text-sm font-medium">Observações</Label>
                <Input
                  id="observations"
                  value={editForm.observations}
                  onChange={(e) => setEditForm({ ...editForm, observations: e.target.value })}
                />
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditStudent}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Alunos;
