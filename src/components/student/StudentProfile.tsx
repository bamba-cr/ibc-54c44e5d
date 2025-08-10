import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Award,
  Users,
  FileText
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentProfileProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface StudentData {
  id: string;
  name: string;
  age: number;
  birth_date: string;
  city: string;
  address: string;
  cpf?: string;
  rg?: string;
  photo_url?: string;
  guardian_name?: string;
  guardian_email?: string;
  guardian_phone?: string;
  guardian_relationship?: string;
  guardian_cpf?: string;
  guardian_rg?: string;
  notes?: string;
  created_at: string;
}

interface ProjectData {
  name: string;
  code: string;
}

interface GradeData {
  grade: number;
  period: string;
  subject: string;
  observations?: string;
}

interface AttendanceData {
  date: string;
  status: string;
}

export const StudentProfile = ({ studentId, isOpen, onClose }: StudentProfileProps) => {
  // Buscar dados do estudante
  const { data: student, isLoading: loadingStudent } = useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();
      
      if (error) throw error;
      return data as StudentData;
    },
    enabled: isOpen && !!studentId,
  });

  // Buscar projetos do estudante
  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ["student-projects", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_projects")
        .select(`
          projects (name, code)
        `)
        .eq("student_id", studentId);
      
      if (error) throw error;
      return data.map(item => item.projects as ProjectData);
    },
    enabled: isOpen && !!studentId,
  });

  // Buscar notas do estudante
  const { data: grades, isLoading: loadingGrades } = useQuery({
    queryKey: ["student-grades", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grades")
        .select("grade, period, subject, observations")
        .eq("student_id", studentId)
        .order("period", { ascending: false });
      
      if (error) throw error;
      return data as GradeData[];
    },
    enabled: isOpen && !!studentId,
  });

  // Buscar frequência do estudante
  const { data: attendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ["student-attendance", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("date, status")
        .eq("student_id", studentId)
        .order("date", { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data as AttendanceData[];
    },
    enabled: isOpen && !!studentId,
  });

  const calculateAttendanceRate = () => {
    if (!attendance || attendance.length === 0) return 0;
    const present = attendance.filter(a => a.status === "presente").length;
    return Math.round((present / attendance.length) * 100);
  };

  const calculateAverageGrade = () => {
    if (!grades || grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade.grade, 0);
    return (sum / grades.length).toFixed(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil do Estudante
          </DialogTitle>
        </DialogHeader>

        {loadingStudent ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : student ? (
          <div className="space-y-6">
            {/* Header do perfil */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={student.photo_url} />
                    <AvatarFallback className="text-lg">
                      {getInitials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <h3 className="text-2xl font-bold">{student.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {student.age} anos
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(student.birth_date)}
                      </Badge>
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />
                        {student.city}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{calculateAverageGrade()}</p>
                      <p className="text-sm text-muted-foreground">Média Geral</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{calculateAttendanceRate()}%</p>
                      <p className="text-sm text-muted-foreground">Frequência</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Pessoal</TabsTrigger>
                <TabsTrigger value="academic">Acadêmico</TabsTrigger>
                <TabsTrigger value="guardian">Responsável</TabsTrigger>
                <TabsTrigger value="notes">Observações</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                      <p className="text-sm">{student.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Idade</label>
                      <p className="text-sm">{student.age} anos</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                      <p className="text-sm">{formatDate(student.birth_date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">CPF</label>
                      <p className="text-sm">{student.cpf || "Não informado"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">RG</label>
                      <p className="text-sm">{student.rg || "Não informado"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Cidade</label>
                      <p className="text-sm">{student.city}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                      <p className="text-sm">{student.address}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="academic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Projetos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingProjects ? (
                        <Skeleton className="h-20 w-full" />
                      ) : projects && projects.length > 0 ? (
                        <div className="space-y-2">
                          {projects.map((project, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="font-medium">{project.name}</span>
                              <Badge variant="outline">{project.code}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum projeto encontrado</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Notas Recentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingGrades ? (
                        <Skeleton className="h-20 w-full" />
                      ) : grades && grades.length > 0 ? (
                        <div className="space-y-2">
                          {grades.slice(0, 5).map((grade, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div>
                                <span className="font-medium">{grade.subject}</span>
                                <p className="text-xs text-muted-foreground">{grade.period}</p>
                              </div>
                              <Badge variant={grade.grade >= 7 ? "default" : "destructive"}>
                                {grade.grade.toFixed(1)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma nota encontrada</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="guardian" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Dados do Responsável
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome</label>
                      <p className="text-sm">{student.guardian_name || "Não informado"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Relacionamento</label>
                      <p className="text-sm">{student.guardian_relationship || "Não informado"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                      <p className="text-sm flex items-center gap-1">
                        {student.guardian_email ? (
                          <>
                            <Mail className="h-3 w-3" />
                            {student.guardian_email}
                          </>
                        ) : (
                          "Não informado"
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                      <p className="text-sm flex items-center gap-1">
                        {student.guardian_phone ? (
                          <>
                            <Phone className="h-3 w-3" />
                            {student.guardian_phone}
                          </>
                        ) : (
                          "Não informado"
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">CPF</label>
                      <p className="text-sm">{student.guardian_cpf || "Não informado"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">RG</label>
                      <p className="text-sm">{student.guardian_rg || "Não informado"}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Observações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {student.notes ? (
                      <p className="text-sm whitespace-pre-wrap">{student.notes}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma observação registrada</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Estudante não encontrado</p>
        )}
      </DialogContent>
    </Dialog>
  );
};