
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Table, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  cpf?: string;
  city: string;
  address: string;
  birth_date: string;
  age?: number;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  student_projects?: Array<{
    project_id: string;
    projects: {
      name: string;
      code: string;
    };
  }>;
}

interface ExportSectionProps {
  students?: Student[];
}

export const ExportSection = ({ students = [] }: ExportSectionProps) => {
  const [exportFormat, setExportFormat] = useState<string>('excel');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToExcel = () => {
    try {
      const exportData = students.map(student => ({
        'Nome': student.name,
        'CPF': student.cpf || 'N/A',
        'Cidade': student.city,
        'Endereço': student.address,
        'Data de Nascimento': student.birth_date,
        'Idade': student.age || 'N/A',
        'Responsável': student.guardian_name || 'N/A',
        'Telefone do Responsável': student.guardian_phone || 'N/A',
        'Email do Responsável': student.guardian_email || 'N/A',
        'Projetos': student.student_projects?.map(sp => sp.projects.name).join(', ') || 'Nenhum'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Alunos');
      
      XLSX.writeFile(wb, `alunos_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`);
      
      toast({
        title: "Exportação concluída",
        description: "Dados exportados com sucesso para Excel",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Relatório de Alunos', 20, 20);
      
      let yPosition = 40;
      
      students.forEach((student) => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.text(`Nome: ${student.name}`, 20, yPosition);
        yPosition += 7;
        doc.text(`CPF: ${student.cpf || 'N/A'}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Cidade: ${student.city}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Responsável: ${student.guardian_name || 'N/A'}`, 20, yPosition);
        yPosition += 10;
      });
      
      doc.save(`alunos_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast({
        title: "Exportação concluída",
        description: "Dados exportados com sucesso para PDF",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      switch (exportFormat) {
        case 'excel':
          exportToExcel();
          break;
        case 'pdf':
          exportToPDF();
          break;
        default:
          toast({
            title: "Formato não suportado",
            description: "Selecione um formato de exportação válido",
            variant: "destructive",
          });
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Relatórios
          </CardTitle>
          <CardDescription>
            Exporte os dados dos alunos em diferentes formatos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Formato de Exportação</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <Table className="h-4 w-4" />
                      Excel (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleExport}
                disabled={isExporting || students.length === 0}
                className="w-full"
              >
                {isExporting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Exportando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Exportar ({students.length} alunos)
                  </div>
                )}
              </Button>
            </div>
          </div>

          {students.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dado disponível para exportação</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
