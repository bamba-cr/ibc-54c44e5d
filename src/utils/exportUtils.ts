import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Dados') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (title: string, data: any[], columns: string[], filename: string) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(16);
  doc.text(title, 20, 20);
  
  // Data de geração
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
  
  // Tabela
  let yPosition = 50;
  const rowHeight = 8;
  const colWidth = 180 / columns.length;
  
  // Cabeçalhos
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  columns.forEach((col, index) => {
    doc.text(col, 20 + (index * colWidth), yPosition);
  });
  
  // Linha abaixo dos cabeçalhos
  yPosition += rowHeight;
  doc.line(20, yPosition - 2, 200, yPosition - 2);
  
  // Dados
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  data.forEach((row, rowIndex) => {
    if (yPosition > 270) { // Nova página se necessário
      doc.addPage();
      yPosition = 20;
    }
    
    columns.forEach((col, colIndex) => {
      const value = row[col] || '';
      doc.text(String(value).substring(0, 20), 20 + (colIndex * colWidth), yPosition);
    });
    
    yPosition += rowHeight;
  });
  
  doc.save(`${filename}.pdf`);
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar vírgulas e aspas duplas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const formatDataForExport = (data: any[], type: 'student' | 'grade' | 'attendance') => {
  switch (type) {
    case 'student':
      return data.map(student => ({
        'Nome': student.name,
        'CPF': student.cpf,
        'Idade': student.age,
        'Cidade': student.city,
        'Endereço': student.address,
        'Responsável': student.guardian_name,
        'Telefone': student.guardian_phone,
        'Email': student.guardian_email,
        'Data de Cadastro': new Date(student.created_at).toLocaleDateString('pt-BR'),
      }));
    
    case 'grade':
      return data.map(grade => ({
        'Aluno': grade.students?.name,
        'Disciplina': grade.subject,
        'Período': grade.period,
        'Nota': grade.grade,
        'Observações': grade.observations,
        'Data': new Date(grade.created_at).toLocaleDateString('pt-BR'),
      }));
    
    case 'attendance':
      return data.map(attendance => ({
        'Aluno': attendance.students?.name,
        'Data': new Date(attendance.date).toLocaleDateString('pt-BR'),
        'Status': attendance.status,
        'Observações': attendance.observations,
      }));
    
    default:
      return data;
  }
};