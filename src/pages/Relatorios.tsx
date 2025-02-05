import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar as CalendarIcon, 
  Loader2, 
  Trash2, 
  Edit2, 
  Search,
  UserPlus,
  Download,
  Filter,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminManagement } from '@/components/reports/AdminManagement';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import type { Database } from '@/integrations/supabase/types';

type Student = Database['public']['Tables']['students']['Row'];

interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'meeting' | 'task' | 'reminder';
  description?: string;
  color?: string;
}

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

const Relatorios = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    age: "",
    city: "",
    birth_date: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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
  const itemsPerPage = 10;

  const { data: students, isLoading, refetch: fetchStudents } = useQuery({
    queryKey: ["students", filters],
    queryFn: async () => {
      let query = supabase.from("students").select("*");
      if (filters.name) query = query.ilike("name", `%${filters.name}%`);
      if (filters.age) query = query.eq("age", parseInt(filters.age));
      if (filters.city) query = query.ilike("city", `%${filters.city}%`);
      if (filters.birth_date) query = query.eq("birth_date", filters.birth_date);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const handleEditStudent = async () => {
    if (!selectedStudent) return;

    try {
      let photoUrl = selectedStudent.photo_url;
      
      if (editForm.photo) {
        const fileExt = editForm.photo.name.split('.').pop();
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
        age: parseInt(editForm.age),
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

      toast({
        title: "Sucesso",
        description: "Dados do aluno atualizados com sucesso!"
      });

      setIsEditDialogOpen(false);
      fetchStudents();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados do aluno.",
        variant: "destructive"
      });
    }
  };

  const handleAddEvent = (newEvent: Omit<Event, 'id'>) => {
    const event: Event = {
      ...newEvent,
      id: Math.random().toString(36).substr(2, 9),
      color: ['#4CAF50', '#2196F3', '#FFC107', '#E91E63'][Math.floor(Math.random() * 4)]
    };
    setEvents(prev => [...prev, event]);
    toast({
      title: "Evento adicionado",
      description: `${event.title} foi adicionado ao calendário.`
    });
  };

  const handleExportExcel = (data: any[]) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados");
    XLSX.writeFile(wb, `relatorio_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportSQL = (data: any[]) => {
    let sql = `INSERT INTO students (id, name, age, city, birth_date, email, phone) VALUES\n`;
    data.forEach((student, index) => {
      sql += `(${student.id}, '${student.name}', ${student.age}, '${student.city}', '${student.birth_date}', '${student.email || ''}', '${student.phone || ''}')${index !== data.length - 1 ? "," : ""}\n`;
    });
    const blob = new Blob([sql], { type: "text/sql" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${new Date().toISOString().split('T')[0]}.sql`;
    link.click();
  };

  const handleExportPDF = (data: any[]) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório de Alunos", 14, 22);
    
    doc.setFontSize(12);
    doc.text("Data do relatório: " + new Date().toLocaleDateString(), 14, 32);
    doc.text("Total de alunos: " + data.length, 14, 42);
    
    let y = 60;
    data.forEach((student) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(10);
      doc.text(`Nome: ${student.name}`, 14, y);
      doc.text(`Idade: ${student.age}`, 14, y + 5);
      doc.text(`Cidade: ${student.city}`, 14, y + 10);
      y += 20;
    });
    
    doc.save(`relatorio_alunos_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExport = (type: string) => {
    if (!students) return;
    
    switch (type) {
      case "excel":
        handleExportExcel(students);
        break;
      case "sql":
        handleExportSQL(students);
        break;
      case "pdf":
        handleExportPDF(students);
        break;
      default:
        break;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      // First delete attendance records
      const { error: attendanceError } = await supabase
        .from('attendance')
        .delete()
        .eq('student_id', id);
      
      if (attendanceError) throw attendanceError;

      // Then delete student_projects records
      const { error: projectsError } = await supabase
        .from('student_projects')
        .delete()
        .eq('student_id', id);
      
      if (projectsError) throw projectsError;

      // Then delete grades records
      const { error: gradesError } = await supabase
        .from('grades')
        .delete()
        .eq('student_id', id);
      
      if (gradesError) throw gradesError;

      // Finally delete the student
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Aluno removido",
        description: "O aluno foi removido com sucesso."
      });
      
      fetchStudents();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o aluno. " + (error.message || ''),
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/login");
    };
    checkSession();
  }, [navigate]);

  const paginatedStudents = students?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil((students?.length || 0) / itemsPerPage);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 min-h-screen bg-gray-50">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-4xl font-bold mb-8 text-primary border-b pb-4"
      >
        Sistema de Gestão Acadêmica
      </motion.h1>
      
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-[800px] bg-white shadow-sm">
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="admin">Administração</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    Calendário de Atividades
                  </CardTitle>
                  <CardDescription>Gerencie eventos e compromissos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar 
                    mode="single" 
                    selected={date} 
                    onSelect={setDate} 
                    className="rounded-md border" 
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    Eventos
                  </CardTitle>
                  <CardDescription>Atividades programadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {events.map((event, index) => (
                        <motion.div 
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-all"
                          style={{ borderLeft: `4px solid ${event.color}` }}
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-gray-500">
                              {event.date.toLocaleDateString()}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setEvents(prev => prev.filter(e => e.id !== event.id));
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 transition-colors" 
                      onClick={() => handleAddEvent({ 
                        date: new Date(), 
                        title: "Novo Evento", 
                        type: "meeting",
                        description: "Descrição do evento"
                      })}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar Evento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Gerenciamento de Alunos
              </CardTitle>
              <CardDescription>Pesquise e gerencie informações dos alunos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                    <Input 
                      placeholder="Nome" 
                      value={filters.name} 
                      onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                      className="bg-white"
                    />
                    <Input 
                      placeholder="Idade" 
                      value={filters.age} 
                      onChange={(e) => setFilters({ ...filters, age: e.target.value })}
                      type="number"
                      className="bg-white"
                    />
                    <Input 
                      placeholder="Cidade" 
                      value={filters.city} 
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      className="bg-white"
                    />
                    <Input 
                      placeholder="Data de Nascimento" 
                      value={filters.birth_date} 
                      onChange={(e) => setFilters({ ...filters, birth_date: e.target.value })}
                      type="date"
                      className="bg-white"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ name: "", age: "", city: "", birth_date: "" })}
                  >
                    Limpar
                  </Button>
                </div>

                <AnimatePresence>
                  {isLoading ? (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }} 
                      className="flex items-center justify-center p-8"
                    >
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        {paginatedStudents?.map((student) => (
                          <motion.div 
                            key={student.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <h3 className="font-medium text-lg">{student.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>{student.city}</span>
                                  <span>{student.age} anos</span>
                                  <span>{new Date(student.birth_date).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setEditForm({
                                      name: student.name,
                                      age: student.age.toString(),
                                      birthDate: student.birth_date,
                                      rg: student.rg || "",
                                      cpf: student.cpf || "",
                                      address: student.address || "",
                                      city: student.city,
                                      guardianName: student.guardian_name || "",
                                      guardianRelationship: student.guardian_relationship || "",
                                      guardianCpf: student.guardian_cpf || "",
                                      guardianRg: student.guardian_rg || "",
                                      guardianPhone: student.guardian_phone || "",
                                      guardianEmail: student.guardian_email || "",
                                      projects: student.projects || [],
                                      observations: student.notes || "",
                                      photo: null
                                    });
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="icon"
                                  onClick={() => deleteStudent(student.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    // Add view details functionality
                                  }}
                                >
                                  <Eye className="h-4 w-4 text-green-500" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <Button 
                          variant="outline" 
                          disabled={currentPage === 1} 
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Anterior
                        </Button>
                        <span className="text-sm text-gray-500">
                          Página {currentPage} de {totalPages}
                        </span>
                        <Button 
                          variant="outline" 
                          disabled={currentPage === totalPages} 
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Próximo
                        </Button>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Editar Aluno</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Nome</label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="age" className="text-sm font-medium">Idade</label>
                  <Input
                    id="age"
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="birthDate" className="text-sm font-medium">Data de Nascimento</label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={editForm.birthDate}
                    onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="rg" className="text-sm font-medium">RG</label>
                  <Input
                    id="rg"
                    value={editForm.rg}
                    onChange={(e) => setEditForm({ ...editForm, rg: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="cpf" className="text-sm font-medium">CPF</label>
                  <Input
                    id="cpf"
                    value={editForm.cpf}
                    onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="address" className="text-sm font-medium">Endereço</label>
                  <Input
                    id="address"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="city" className="text-sm font-medium">Cidade</label>
                  <Input
                    id="city"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="guardianName" className="text-sm font-medium">Nome do Responsável</label>
                  <Input
                    id="guardianName"
                    value={editForm.guardianName}
                    onChange={(e) => setEditForm({ ...editForm, guardianName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="guardianRelationship" className="text-sm font-medium">Parentesco</label>
                  <Input
                    id="guardianRelationship"
                    value={editForm.guardianRelationship}
                    onChange={(e) => setEditForm({ ...editForm, guardianRelationship: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="guardianPhone" className="text-sm font-medium">Telefone do Responsável</label>
                  <Input
                    id="guardianPhone"
                    value={editForm.guardianPhone}
                    onChange={(e) => setEditForm({ ...editForm, guardianPhone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="guardianEmail" className="text-sm font-medium">Email do Responsável</label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    value={editForm.guardianEmail}
                    onChange={(e) => setEditForm({ ...editForm, guardianEmail: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="observations" className="text-sm font-medium">Observações</label>
                  <Input
                    id="observations"
                    value={editForm.observations}
                    onChange={(e) => setEditForm({ ...editForm, observations: e.target.value })}
                  />
                </div>
              </div>
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
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Exportar Dados
              </CardTitle>
              <CardDescription>Escolha o formato de exportação desejado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => handleExport("excel")}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar para Excel
                </Button>
                <Button 
                  onClick={() => handleExport("sql")}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar para SQL
                </Button>
                <Button 
                  onClick={() => handleExport("pdf")}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar para PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <AdminManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
