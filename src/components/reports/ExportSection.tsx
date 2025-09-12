
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
type Student = Database['public']['Tables']['students']['Row'] & {
  cities?: { name: string; state: string };
};

interface ExportSectionProps {
  students: Student[] | null;
}

export const ExportSection = ({ students }: ExportSectionProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const { toast } = useToast();

  // Buscar projetos para o select
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, code")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });
  const handleExportExcel = (data: any[]) => {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Dados");
      XLSX.writeFile(wb, `relatorio_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Exportação realizada",
        description: "Arquivo Excel exportado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Falha ao exportar arquivo Excel.",
        variant: "destructive",
      });
    }
  };

  const handleExportSQL = (data: any[]) => {
    try {
      let sql = `INSERT INTO students (id, name, age, city, birth_date, email, phone) VALUES\n`;
      data.forEach((student, index) => {
        const name = student.name?.replace(/'/g, "''") || '';
        const city = student.city?.replace(/'/g, "''") || '';
        const email = student.email?.replace(/'/g, "''") || '';
        const phone = student.phone?.replace(/'/g, "''") || '';
        sql += `('${student.id}', '${name}', ${student.age || 'NULL'}, '${city}', '${student.birth_date || ''}', '${email}', '${phone}')${index !== data.length - 1 ? "," : ""}\n`;
      });
      const blob = new Blob([sql], { type: "text/sql" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `relatorio_${new Date().toISOString().split('T')[0]}.sql`;
      link.click();
      
      toast({
        title: "Exportação realizada",
        description: "Arquivo SQL exportado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Falha ao exportar arquivo SQL.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = (data: any[]) => {
    try {
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
        doc.text(`Nome: ${student.name || ''}`, 14, y);
        doc.text(`Idade: ${student.age || ''}`, 14, y + 5);
        doc.text(`Cidade: ${student.city || ''}`, 14, y + 10);
        y += 20;
      });
      
      doc.save(`relatorio_alunos_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Exportação realizada",
        description: "Arquivo PDF exportado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Falha ao exportar arquivo PDF.",
        variant: "destructive",
      });
    }
  };

  // Busca os dados de alunos vinculados a projetos e prepara linhas para exportação
  const fetchStudentsByProject = async (projectId: string = "all") => {
    try {
      // Query base para student_projects
      let spQuery = supabase.from('student_projects').select('student_id,project_id');
      
      // Se um projeto específico foi selecionado, filtrar por ele
      if (projectId !== "all") {
        spQuery = spQuery.eq('project_id', projectId);
      }

      const [studentsRes, projectsRes, spRes] = await Promise.all([
        supabase.from('students').select('id,name,age,guardian_email,guardian_phone,created_at'),
        supabase.from('projects').select('id,name'),
        spQuery,
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (projectsRes.error) throw projectsRes.error;
      if (spRes.error) throw spRes.error;

      const students = studentsRes.data ?? [];
      const projects = projectsRes.data ?? [];
      const relations = spRes.data ?? [];

      const studentMap = new Map(students.map((s: any) => [s.id, s]));
      const projectMap = new Map(projects.map((p: any) => [p.id, p.name]));

      const rows = relations.flatMap((rel: any) => {
        const s = studentMap.get(rel.student_id);
        const projectName = projectMap.get(rel.project_id);
        if (!s || !projectName) return [] as any[];
        const contato = s.guardian_phone || s.guardian_email || '';
        const dataCadastro = s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR') : '';
        return [{
          'Nome': s.name,
          'Idade': s.age ?? '',
          'Contato': contato,
          'Projeto': projectName,
          'Data de Cadastro': dataCadastro,
        }];
      });

      return rows;
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Falha ao buscar dados dos alunos.",
        variant: "destructive",
      });
      return [];
    }
  };

  const handleExportStudentsByProjectXLSX = async () => {
    try {
      const rows = await fetchStudentsByProject(selectedProjectId);
      if (rows.length === 0) {
        toast({
          title: "Nenhum dado encontrado",
          description: "Não há alunos cadastrados no projeto selecionado.",
          variant: "destructive",
        });
        return;
      }
      
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Alunos por Projeto');
      
      const projectName = selectedProjectId === "all" ? "todos_projetos" : projects?.find(p => p.id === selectedProjectId)?.name?.replace(/\s+/g, '_') || "projeto";
      XLSX.writeFile(wb, `alunos_${projectName}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Exportação realizada",
        description: "Arquivo XLSX exportado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Falha ao exportar arquivo XLSX.",
        variant: "destructive",
      });
    }
  };

  const handleExportStudentsByProjectCSV = async () => {
    try {
      const rows = await fetchStudentsByProject(selectedProjectId);
      if (rows.length === 0) {
        toast({
          title: "Nenhum dado encontrado",
          description: "Não há alunos cadastrados no projeto selecionado.",
          variant: "destructive",
        });
        return;
      }
      
      const ws = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const projectName = selectedProjectId === "all" ? "todos_projetos" : projects?.find(p => p.id === selectedProjectId)?.name?.replace(/\s+/g, '_') || "projeto";
      link.download = `alunos_${projectName}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Exportação realizada",
        description: "Arquivo CSV exportado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Falha ao exportar arquivo CSV.",
        variant: "destructive",
      });
    }
  };

  const handleExport = (type: string) => {
    if (!students) return;
    
    const exportData = students.map(student => ({
      id: student.id,
      name: student.name,
      age: student.age || '',
      city: student.cities?.name || '',
      birth_date: student.birth_date || '',
      email: student.guardian_email || '',
      phone: student.guardian_phone || ''
    }));
    
    switch (type) {
      case "excel":
        handleExportExcel(exportData);
        break;
      case "sql":
        handleExportSQL(exportData);
        break;
      case "pdf":
        handleExportPDF(exportData);
        break;
      default:
        break;
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Exportar Dados
        </CardTitle>
        <CardDescription>Escolha o formato de exportação desejado</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seletor de projeto */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Filtrar por projeto:</label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Selecione um projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os projetos</SelectItem>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name} ({project.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          <Button 
            onClick={handleExportStudentsByProjectCSV}
            className="w-full flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            CSV: Alunos por Projeto
          </Button>
          <Button 
            onClick={handleExportStudentsByProjectXLSX}
            className="w-full flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            XLSX: Alunos por Projeto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
