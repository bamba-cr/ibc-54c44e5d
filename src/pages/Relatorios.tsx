import { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import Papa from 'papaparse';

const StudentsManagement = () => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 10;

    useEffect(() => {
        setFilteredStudents(
            students.filter(student => 
                student.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, students]);

    const exportToCSV = () => {
        const csv = Papa.unparse(students);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'students.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Lista de Alunos", 10, 10);
        doc.autoTable({
            head: [['Nome', 'Idade', 'Turma']],
            body: students.map(student => [student.name, student.age, student.class])
        });
        doc.save("students.pdf");
    };

    return (
        <div>
            <input 
                type="text" 
                placeholder="Buscar aluno..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={exportToCSV}>Exportar CSV</button>
            <button onClick={exportToPDF}>Exportar PDF</button>
            <ul>
                {filteredStudents.slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage).map(student => (
                    <li key={student.id}>{student.name} - {student.age} anos - {student.class}</li>
                ))}
            </ul>
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Anterior</button>
            <button onClick={() => setCurrentPage(prev => prev + 1)}>Próximo</button>
        </div>
    );
};

export default StudentsManagement;
