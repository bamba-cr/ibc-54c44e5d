
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import type { Database } from '@/integrations/supabase/types';

type Student = Database['public']['Tables']['students']['Row'];

interface ExportSectionProps {
  students: Student[] | null;
}

export const ExportSection = ({ students }: ExportSectionProps) => {
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
    
    const exportData = students.map(student => ({
      id: student.id,
      name: student.name,
      age: student.age || '',
      city: student.city || '',
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
  );
};
