import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Search, User, Calendar, ClipboardList, BookOpen, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const RelatorioAluno = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [aluno, setAluno] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Função para buscar o relatório individual do aluno
  const buscarRelatorio = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setAluno(null);

    const { data, error } = await supabase
      .from("students")
      .select(
        `id, name, city, guardian_name, guardian_phone, guardian_email, 
        student_projects:student_projects ( project:projects(name, code) ), 
        grades ( period, grade, observations, project:projects(name) ), 
        attendance ( date, status, observations, project:projects(name) )`
      )
      .or(`id.eq.${searchTerm}, name.ilike.%${searchTerm}%`)
      .single();

    if (error) {
      setErro("Nenhum aluno encontrado.");
      console.error("Erro ao buscar aluno:", error);
    } else {
      setAluno(data);
    }
    
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-6">📚 Relatório Individual do Aluno</h1>

      <form onSubmit={buscarRelatorio} className="mb-6">
        <div className="flex gap-4 items-center">
          <Input
            type="text"
            placeholder="🔍 Buscar por nome ou matrícula"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 text-lg"
          />
          <Button type="submit" disabled={loading} className="text-lg">
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
          </Button>
        </div>
      </form>

      {erro && <p className="text-red-500 text-center mt-4">{erro}</p>}

      {aluno && (
        <div className="space-y-6">
          {/* Dados do Aluno */}
          <Card className="p-4 shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <User className="text-blue-500" /> Dados Pessoais
            </h3>
            <p><strong>👤 Nome:</strong> {aluno.name}</p>
            <p><strong>📍 Cidade:</strong> {aluno.city}</p>
            <p><strong>👨‍👩‍👦 Responsável:</strong> {aluno.guardian_name}</p>
            <p><strong>📞 Contato:</strong> {aluno.guardian_phone} | {aluno.guardian_email}</p>
          </Card>

          {/* Projetos Inscritos */}
          <Card className="p-4 shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <ClipboardList className="text-green-500" /> Projetos Inscritos
            </h3>
            {aluno.student_projects.length > 0 ? (
              <ul className="list-disc ml-6 space-y-1">
                {aluno.student_projects.map((proj: any, index: number) => (
                  <li key={index}>🎯 <strong>{proj.project.name}</strong> ({proj.project.code})</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nenhum projeto inscrito.</p>
            )}
          </Card>

          {/* Notas e Desempenho */}
          <Card className="p-4 shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen className="text-purple-500" /> Notas e Desempenho
            </h3>
            {aluno.grades.length > 0 ? (
              <ul className="list-none space-y-2">
                {aluno.grades.map((nota: any, index: number) => (
                  <li key={index} className="border p-2 rounded-md">
                    <p>📌 <strong>{nota.project.name}</strong> ({nota.period})</p>
                    <p>🎓 <strong>Nota:</strong> {nota.grade}</p>
                    <p>📝 <strong>Observação:</strong> {nota.observations || "Nenhuma"}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nenhuma nota registrada.</p>
            )}
          </Card>

          {/* Histórico de Presença */}
          <Card className="p-4 shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="text-orange-500" /> Histórico de Presença
            </h3>
            {aluno.attendance.length > 0 ? (
              <ul className="list-none space-y-2">
                {aluno.attendance.map((freq: any, index: number) => (
                  <li key={index} className="border p-2 rounded-md flex items-center gap-2">
                    {freq.status === "Presente" ? (
                      <CheckCircle className="text-green-500" />
                    ) : (
                      <XCircle className="text-red-500" />
                    )}
                    <div>
                      <p>📅 <strong>{freq.date}</strong> - <strong>{freq.project.name}</strong></p>
                      <p>📝 <strong>Observação:</strong> {freq.observations || "Nenhuma"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nenhum registro de presença.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default RelatorioAluno;
