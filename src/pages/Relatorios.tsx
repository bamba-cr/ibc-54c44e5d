import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminManagement } from '@/components/reports/AdminManagement';
import * as XLSX from 'xlsx'; // Para exportação em Excel
import { jsPDF } from 'jspdf'; // Para exportação em PDF
import type { Database } from '@/integrations/supabase/types';

type Student = Database['public']['Tables']['students']['Row'];

const Relatorios = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [date, setDate] = useState(new Date());
    const [filters, setFilters] = useState({
        name: "",
        age: "",
        city: "",
        birth_date: ""
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { data: students, isLoading, refetch: fetchStudents } = useQuery({
        queryKey: [
            "students",
            filters
        ],
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
    const paginatedStudents = students?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const handleExportExcel = (data, filename) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Dados");
        XLSX.writeFile(wb, filename);
    };
    const handleExportSQL = (data, filename) => {
        let sql = `INSERT INTO students (id, name, age, city, birth_date) VALUES\n`;
        data.forEach((student, index) => {
            sql += `(${student.id}, '${student.name}', ${student.age}, '${student.city}', '${student.birth_date}')${index !== data.length - 1 ? "," : ""}\n`;
        });
        const blob = new Blob([
            sql
        ], {
            type: "text/sql"
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };
    const handleExportPDF = (data) => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Relatório de Alunos", 14, 22);
        let y = 30;
        data.forEach((student) => {
            doc.text(`${student.name} - ${student.age} anos - ${student.city}`, 14, y);
            y += 10;
        });
        doc.save("relatorio_alunos.pdf");
    };
    const handleExport = (type, category) => {
        if (type === "excel") {
            const data = category === "all" ? students : students?.filter((student) => student.category === category);
            handleExportExcel(data, category ? `${category}_relatorio.xlsx` : "relatorio.xlsx");
        } else if (type === "sql") {
            const data = category === "all" ? students : students?.filter((student) => student.category === category);
            handleExportSQL(data, category ? `${category}_relatorio.sql` : "relatorio.sql");
        } else if (type === "pdf") {
            const data = category === "all" ? students : students?.filter((student) => student.category === category);
            handleExportPDF(data);
        }
    };
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) navigate("/login");
        };
        checkSession();
    }, [
        navigate
    ]);
    const totalPages = Math.ceil((students?.length || 0) / itemsPerPage);
    return (
        <div data-component-path="src/pages/Relatorios.tsx" data-component-name="div" data-component-line="114" data-component-file="Relatorios.tsx" data-component-content='{"className":"container mx-auto p-4 md:p-6 lg:p-8 min-h-screen"}' className="container mx-auto p-4 md:p-6 lg:p-8 min-h-screen">
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold mb-6 text-primary">Relatórios e Gestão</motion.h1>
            <Tabs defaultValue="calendar" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-[800px]">
                    <TabsTrigger value="calendar">Calendário</TabsTrigger>
                    <TabsTrigger value="students">Alunos</TabsTrigger>
                    <TabsTrigger value="reports">Relatórios</TabsTrigger>
                    <TabsTrigger value="admin">Administração</TabsTrigger>
                </TabsList>
                <TabsContent value="calendar" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Calendário de Atividades</CardTitle>
                                    <CardDescription>Visualize e gerencie eventos</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Eventos</CardTitle>
                                    <CardDescription>Atividades programadas</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {events.map((event, index) => (
                                            <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                                <CalendarIcon className="h-4 w-4 text-primary" />
                                                <span className="font-medium">{event.title}</span>
                                                <span className="text-sm text-muted-foreground ml-auto">{event.date.toLocaleDateString()}</span>
                                            </motion.div>
                                        ))}
                                        <Button className="w-full bg-primary hover:bg-primary-dark transition-colors" onClick={() => handleAddEvent({ date: new Date(), title: "Novo Evento", type: "meeting" })}>Adicionar Evento</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </TabsContent>
                <TabsContent value="students" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gerenciamento de Alunos</CardTitle>
                            <CardDescription>Pesquise e edite informações dos alunos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                                    <Input placeholder="Nome" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
                                    <Input placeholder="Idade" value={filters.age} onChange={(e) => setFilters({ ...filters, age: e.target.value })} />
                                    <Input placeholder="Cidade" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
                                    <Input placeholder="Data de Nascimento" value={filters.birth_date} onChange={(e) => setFilters({ ...filters, birth_date: e.target.value })} type="date" />
                                </div>
                                <Button variant="outline" onClick={() => setFilters({ name: "", age: "", city: "", birth_date: "" })} className="w-full md:w-auto">Limpar Filtros</Button>
                                <AnimatePresence>
                                    {isLoading ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center p-4">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        </motion.div>
                                    ) : (
                                        <div className="space-y-2">
                                            {paginatedStudents?.map((student) => (
                                                <motion.div key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                                    <span>{student.name}</span>
                                                    <span>{student.city}</span>
                                                    <span>{student.age}</span>
                                                    <div className="flex justify-end">
                                                        <Button variant="outline" className="mr-2" onClick={() => deleteStudent(student.id)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </AnimatePresence>
                                <div className="flex justify-between mt-4">
                                    <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Anterior</Button>
                                    <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Próximo</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="reports" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Exportar Dados</CardTitle>
                            <CardDescription>Escolha o formato de exportação</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Button onClick={() => handleExport("excel", "all")} className="w-full md:w-auto">Exportar para Excel</Button>
                                <Button onClick={() => handleExport("sql", "all")} className="w-full md:w-auto">Exportar para SQL</Button>
                                <Button onClick={() => handleExport("pdf")} className="w-full md:w-auto">Exportar para PDF</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="admin" className="space-y-4">
                    <AdminManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Relatorios;
