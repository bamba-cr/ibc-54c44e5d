import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Award,
  Users,
  FileText,
  GraduationCap,
  TrendingUp
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

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

  const getGradesBySubject = () => {
    if (!grades) return {};
    return grades.reduce((acc, grade) => {
      if (!acc[grade.subject]) {
        acc[grade.subject] = [];
      }
      acc[grade.subject].push(grade.grade);
      return acc;
    }, {} as Record<string, number[]>);
  };

  const getSubjectAverage = (subject: string) => {
    const subjectGrades = getGradesBySubject()[subject];
    if (!subjectGrades || subjectGrades.length === 0) return 0;
    return subjectGrades.reduce((sum, grade) => sum + grade, 0) / subjectGrades.length;
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
      <DialogContent className="sm:max-w-4xl sm:max-h-[90vh] max-w-[100vw] max-h-[100dvh] h-[100dvh] sm:h-auto overflow-y-auto rounded-none sm:rounded-lg p-0 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 p-4 sm:p-0">
            <User className="h-5 w-5" />
            Perfil do Estudante
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-0">
          {loadingStudent ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : student ? (
            <div className="space-y-6">
              {/* Header do perfil aprimorado */}
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <TooltipWrapper content="Foto do estudante">
                      <Avatar className="h-24 w-24 border-4 border-primary/20">
                        <AvatarImage src={student.photo_url} />
                        <AvatarFallback className="text-xl bg-primary/10">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipWrapper>
                    
                    <div className="flex-1 space-y-3">
                      <h3 className="text-3xl font-bold text-primary">{student.name}</h3>
                      <div className="flex flex-wrap gap-3">
                        <TooltipWrapper content="Idade do estudante">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {student.age} anos
                          </Badge>
                        </TooltipWrapper>
                        <TooltipWrapper content="Data de nascimento">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(student.birth_date)}
                          </Badge>
                        </TooltipWrapper>
                        <TooltipWrapper content="Cidade onde reside">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {student.city}
                          </Badge>
                        </TooltipWrapper>
                      </div>
                      
                      {/* Indicadores de performance */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <TooltipWrapper content="Média geral de todas as disciplinas">
                          <div className="text-center p-3 bg-primary/5 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <GraduationCap className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">Média Geral</span>
                            </div>
                            <p className="text-2xl font-bold text-primary">{calculateAverageGrade()}</p>
                          </div>
                        </TooltipWrapper>
                        
                        <TooltipWrapper content="Percentual de presença nas atividades">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">Frequência</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{calculateAttendanceRate()}%</p>
                          </div>
                        </TooltipWrapper>
                        
                        <TooltipWrapper content="Total de projetos em que está inscrito">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">Projetos</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{projects?.length || 0}</p>
                          </div>
                        </TooltipWrapper>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="academic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="academic">Acadêmico</TabsTrigger>
                  <TabsTrigger value="personal">Pessoal</TabsTrigger>
                  <TabsTrigger value="guardian">Responsável</TabsTrigger>
                  <TabsTrigger value="notes">Observações</TabsTrigger>
                </TabsList>

                <TabsContent value="academic" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Projetos Inscritos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loadingProjects ? (
                          <Skeleton className="h-20 w-full" />
                        ) : projects && projects.length > 0 ? (
                          <div className="space-y-3">
                            {projects.map((project, index) => (
                              <TooltipWrapper key={index} content={`Projeto: ${project.name}`}>
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                  <span className="font-medium">{project.name}</span>
                                  <Badge variant="outline">{project.code}</Badge>
                                </div>
                              </TooltipWrapper>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">Nenhum projeto encontrado</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Desempenho por Disciplina
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loadingGrades ? (
                          <Skeleton className="h-32 w-full" />
                        ) : grades && grades.length > 0 ? (
                          <div className="space-y-4">
                            {Object.keys(getGradesBySubject()).map((subject) => {
                              const average = getSubjectAverage(subject);
                              return (
                                <TooltipWrapper key={subject} content={`Média em ${subject}: ${average.toFixed(1)}`}>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium">{subject}</span>
                                      <Badge variant={average >= 7 ? "default" : average >= 5 ? "secondary" : "destructive"}>
                                        {average.toFixed(1)}
                                      </Badge>
                                    </div>
                                    <Progress 
                                      value={average * 10} 
                                      className="h-2"
                                    />
                                  </div>
                                </TooltipWrapper>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma nota registrada</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Histórico de Notas Detalhado
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingGrades ? (
                        <Skeleton className="h-40 w-full" />
                      ) : grades && grades.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Disciplina</TableHead>
                                <TableHead>Período</TableHead>
                                <TableHead>Nota</TableHead>
                                <TableHead>Observações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {grades.map((grade, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{grade.subject}</TableCell>
                                  <TableCell>{grade.period}</TableCell>
                                  <TableCell>
                                    <TooltipWrapper content={`Nota: ${grade.grade.toFixed(1)}`}>
                                      <Badge variant={grade.grade >= 7 ? "default" : grade.grade >= 5 ? "secondary" : "destructive"}>
                                        {grade.grade.toFixed(1)}
                                      </Badge>
                                    </TooltipWrapper>
                                  </TableCell>
                                  <TableCell className="max-w-xs">
                                    <span className="text-sm text-muted-foreground truncate block">
                                      {grade.observations || "—"}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhuma nota encontrada</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="personal" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Informações Pessoais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                          <p className="text-base font-medium">{student.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Idade</label>
                          <p className="text-base">{student.age} anos</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                          <p className="text-base">{formatDate(student.birth_date)}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">CPF</label>
                          <p className="text-base">{student.cpf || "Não informado"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">RG</label>
                          <p className="text-base">{student.rg || "Não informado"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Endereço Completo</label>
                          <p className="text-base">{student.address}, {student.city}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="guardian" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Dados do Responsável
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Nome</label>
                          <p className="text-base font-medium">{student.guardian_name || "Não informado"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Relacionamento</label>
                          <p className="text-base">{student.guardian_relationship || "Não informado"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">CPF</label>
                          <p className="text-base">{student.guardian_cpf || "Não informado"}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                          <TooltipWrapper content={student.guardian_email ? "Clique para enviar email" : "Email não informado"}>
                            <p className="text-base flex items-center gap-2">
                              {student.guardian_email ? (
                                <>
                                  <Mail className="h-4 w-4 text-primary" />
                                  <a href={`mailto:${student.guardian_email}`} className="text-primary hover:underline">
                                    {student.guardian_email}
                                  </a>
                                </>
                              ) : (
                                "Não informado"
                              )}
                            </p>
                          </TooltipWrapper>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                          <TooltipWrapper content={student.guardian_phone ? "Clique para ligar" : "Telefone não informado"}>
                            <p className="text-base flex items-center gap-2">
                              {student.guardian_phone ? (
                                <>
                                  <Phone className="h-4 w-4 text-green-600" />
                                  <a href={`tel:${student.guardian_phone}`} className="text-green-600 hover:underline">
                                    {student.guardian_phone}
                                  </a>
                                </>
                              ) : (
                                "Não informado"
                              )}
                            </p>
                          </TooltipWrapper>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">RG</label>
                          <p className="text-base">{student.guardian_rg || "Não informado"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Observações e Anotações
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {student.notes ? (
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{student.notes}</p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-sm text-muted-foreground">Nenhuma observação registrada</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Estudante não encontrado</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
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