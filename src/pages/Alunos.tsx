import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StudentForm } from "@/components/students/StudentForm";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, Edit, Trash2, Loader2, Eye, UserPlus, MapPin, Phone, Mail, Filter, Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { StudentProfile } from "@/components/student/StudentProfile";
import { motion, AnimatePresence } from "framer-motion";
import type { Database } from "@/integrations/supabase/types";

type Student = Database['public']['Tables']['students']['Row'] & {
  cities?: { name: string; state: string } | null;
  polos?: { name: string } | null;
};

interface StudentFormValues {
  name: string;
  age: string;
  birthDate: string;
  rg: string;
  cpf: string;
  address: string;
  cityId: string;
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
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [editForm, setEditForm] = useState<StudentFormValues>({
    name: "",
    age: "",
    birthDate: "",
    rg: "",
    cpf: "",
    address: "",
    cityId: "",
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
    queryKey: ["students-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, cities(name, state), polos(name)")
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

  const { data: studentProjectsData } = useQuery({
    queryKey: ["all-student-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_projects")
        .select("student_id, project_id");
      
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
  });

  useEffect(() => {
    if (studentProjects) {
      setEditForm(prev => ({
        ...prev,
        projects: studentProjects || []
      }));
    }
  }, [studentProjects]);

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", studentToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: "Aluno removido com sucesso.",
      });
      
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
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
    try {
      const studentData = {
        name: data.name,
        age: data.age ? parseInt(data.age) : null,
        birth_date: data.birth_date,
        rg: data.rg || null,
        cpf: data.cpf || null,
        address: data.address,
        city_id: data.city_id || null,
        polo_id: data.polo_id || null,
        guardian_name: data.guardian_name || null,
        guardian_relationship: data.guardian_relationship || null,
        guardian_cpf: data.guardian_cpf || null,
        guardian_rg: data.guardian_rg || null,
        guardian_phone: data.guardian_phone || null,
        guardian_email: data.guardian_email || null,
        notes: data.notes || null,
        photo_url: data.photo_url
      };

      const { data: insertedData, error } = await supabase
        .from("students")
        .insert([studentData])
        .select();

      if (error) throw error;

      if (data.projects && data.projects.length > 0 && insertedData?.[0]?.id) {
        const studentId = insertedData[0].id;
        const projectRelations = data.projects.map((projectId: string) => ({
          student_id: studentId,
          project_id: projectId
        }));

        const { error: projectError } = await supabase
          .from("student_projects")
          .insert(projectRelations);

        if (projectError) {
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
      console.error("Erro ao cadastrar aluno:", error);
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
        rg: editForm.rg || null,
        cpf: editForm.cpf || null,
        address: editForm.address,
        city_id: editForm.cityId || null,
        polo_id: selectedStudent.polo_id,
        guardian_name: editForm.guardianName || null,
        guardian_relationship: editForm.guardianRelationship || null,
        guardian_cpf: editForm.guardianCpf || null,
        guardian_rg: editForm.guardianRg || null,
        guardian_phone: editForm.guardianPhone || null,
        guardian_email: editForm.guardianEmail || null,
        notes: editForm.observations || null,
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

  // Filter students by search and project
  const filteredStudents = students?.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.guardian_email && student.guardian_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.cpf && student.cpf.includes(searchTerm));
    
    if (selectedProject === "all") return matchesSearch;
    
    const studentProjectIds = studentProjectsData
      ?.filter(sp => sp.student_id === student.id)
      .map(sp => sp.project_id) || [];
    
    return matchesSearch && studentProjectIds.includes(selectedProject);
  });

  const getStudentInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getStudentProjects = (studentId: string) => {
    const projectIds = studentProjectsData
      ?.filter(sp => sp.student_id === studentId)
      .map(sp => sp.project_id) || [];
    
    return projects?.filter(p => projectIds.includes(p.id)) || [];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {fetchError && (
          <Alert variant="destructive">
            <AlertTitle>Erro ao carregar alunos</AlertTitle>
            <AlertDescription>
              {fetchError.message || "Não foi possível carregar a lista de alunos."}
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="lista" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestão de Alunos</h1>
                <p className="text-sm text-muted-foreground">
                  {students?.length || 0} alunos cadastrados
                </p>
              </div>
            </div>
            
            <TabsList className="bg-muted">
              <TabsTrigger value="lista" className="data-[state=active]:bg-background">
                <Users className="h-4 w-4 mr-2" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="cadastro" className="data-[state=active]:bg-background">
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastro
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="lista" className="space-y-4">
            {/* Filters */}
            <Card className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, email ou CPF..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background"
                    />
                  </div>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-background">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os projetos</SelectItem>
                      {projects?.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => refetch()}>
                    Atualizar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Students Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredStudents?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredStudents.map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border-border hover:shadow-lg transition-all duration-200 group">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 border-2 border-primary/20">
                              <AvatarImage src={student.photo_url || undefined} alt={student.name} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {getStudentInitials(student.name)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">
                                {student.name}
                              </h3>
                              
                              {student.cities && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">
                                    {student.cities.name}, {student.cities.state}
                                  </span>
                                </div>
                              )}
                              
                              {student.age && (
                                <p className="text-sm text-muted-foreground">
                                  {student.age} anos
                                </p>
                              )}
                              
                              {/* Projects badges */}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {getStudentProjects(student.id).slice(0, 2).map((project) => (
                                  <Badge key={project.id} variant="secondary" className="text-xs">
                                    {project.name}
                                  </Badge>
                                ))}
                                {getStudentProjects(student.id).length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{getStudentProjects(student.id).length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Contact info */}
                          <div className="mt-4 pt-3 border-t border-border space-y-1">
                            {student.guardian_phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span className="truncate">{student.guardian_phone}</span>
                              </div>
                            )}
                            {student.guardian_email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{student.guardian_email}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStudentId(student.id);
                                setIsProfileOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="ghost"
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
                                  cityId: student.city_id || "",
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
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setStudentToDelete(student);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <Card className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border-border">
                <CardContent className="py-12">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <p className="mt-4 text-lg font-medium text-foreground">
                      {searchTerm ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm 
                        ? "Tente ajustar os filtros de busca" 
                        : "Comece cadastrando um novo aluno"
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="cadastro">
            <StudentForm onSubmit={handleStudentSubmit} />
          </TabsContent>
        </Tabs>

        {/* Student Profile Modal */}
        {selectedStudentId && (
          <StudentProfile 
            studentId={selectedStudentId} 
            isOpen={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)} 
          />
        )}

        {/* Edit Dialog */}
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
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="age">Idade</Label>
                      <Input
                        id="age"
                        type="number"
                        value={editForm.age}
                        onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={editForm.birthDate}
                        onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={editForm.cpf}
                        onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="rg">RG</Label>
                      <Input
                        id="rg"
                        value={editForm.rg}
                        onChange={(e) => setEditForm({ ...editForm, rg: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="guardianName">Nome do Responsável</Label>
                      <Input
                        id="guardianName"
                        value={editForm.guardianName}
                        onChange={(e) => setEditForm({ ...editForm, guardianName: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="guardianPhone">Telefone do Responsável</Label>
                      <Input
                        id="guardianPhone"
                        value={editForm.guardianPhone}
                        onChange={(e) => setEditForm({ ...editForm, guardianPhone: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="guardianEmail">Email do Responsável</Label>
                      <Input
                        id="guardianEmail"
                        type="email"
                        value={editForm.guardianEmail}
                        onChange={(e) => setEditForm({ ...editForm, guardianEmail: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="photo">Foto</Label>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditForm({ ...editForm, photo: e.target.files?.[0] || null })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Projetos</Label>
                  <div className="grid grid-cols-2 gap-2 p-3 border rounded-md bg-muted/50">
                    {projects?.map((project) => (
                      <div key={project.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`project-${project.id}`}
                          checked={editForm.projects.includes(project.id)}
                          onCheckedChange={(checked) => handleProjectChange(project.id, checked as boolean)}
                        />
                        <Label htmlFor={`project-${project.id}`} className="text-sm font-normal">
                          {project.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditStudent}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o aluno <strong>{studentToDelete?.name}</strong>? 
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteStudent}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bottom spacing for mobile nav */}
        <div className="h-20 md:hidden" />
      </main>
    </div>
  );
};

export default Alunos;
