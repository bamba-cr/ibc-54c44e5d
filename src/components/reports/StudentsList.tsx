
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Filter, Search, Edit2, Trash2, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';

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

const itemsPerPage = 10;

export const StudentsList = () => {
  const { toast } = useToast();
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
        age: parseInt(editForm.age || '0'),
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

  const deleteStudent = async (id: string) => {
    try {
      const { error: attendanceError } = await supabase
        .from('attendance')
        .delete()
        .eq('student_id', id);
      
      if (attendanceError) throw attendanceError;

      const { error: projectsError } = await supabase
        .from('student_projects')
        .delete()
        .eq('student_id', id);
      
      if (projectsError) throw projectsError;

      const { error: gradesError } = await supabase
        .from('grades')
        .delete()
        .eq('student_id', id);
      
      if (gradesError) throw gradesError;

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

  const paginatedStudents = students?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil((students?.length || 0) / itemsPerPage);

  return (
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
                            <span>{student.city || 'N/A'}</span>
                            <span>{student.age ? `${student.age} anos` : 'Idade não informada'}</span>
                            <span>{student.birth_date ? new Date(student.birth_date).toLocaleDateString() : 'Data não informada'}</span>
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
    </Card>
  );
};
