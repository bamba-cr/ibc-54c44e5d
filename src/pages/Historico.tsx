import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

    // Consulta os dados do aluno + projetos + notas + frequência + presença
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
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Relatório Individual do Aluno</h1>

      <form onSubmit={buscarRelatorio} className="mb-6">
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Buscar por nome ou matrícula"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </Button>
        </div>
      </form>

      {erro && <p className="text-red-500 text-center mt-4">{erro}</p>}

      {aluno && (
        <div className="space-y-6">
          {/* Dados do Aluno */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold">Dados Pessoais</h3>
            <p><strong>Nome:</strong> {aluno.name}</p>
            <p><strong>Cidade:</strong> {aluno.city}</p>
            <p><strong>Responsável:</strong> {aluno.guardian_name}</p>
            <p><strong>Contato:</strong> {aluno.guardian_phone} | {aluno.guardian_email}</p>
          </Card>

          {/* Projetos Inscritos */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold">Projetos Inscritos</h3>
            {aluno.student_projects.length > 0 ? (
              <ul>
                {aluno.student_projects.map((proj: any, index: number) => (
                  <li key={index}>🔹 {proj.project.name} ({proj.project.code})</li>
                ))}
              </ul>
            ) : (
              <p>Nenhum projeto inscrito.</p>
            )}
          </Card>

          {/* Notas e Frequência */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold">Notas e Desempenho</h3>
            {aluno.grades.length > 0 ? (
              <ul>
                {aluno.grades.map((nota: any, index: number) => (
                  <li key={index}>
                     <strong>{nota.project.name}</strong> ({nota.period})  
                    <br /> Nota: {nota.grade}  
                    <br /> Observação: {nota.observations || "Nenhuma"}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhuma nota registrada.</p>
            )}
          </Card>

          {/* Histórico de Presença */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold">Histórico de Presença</h3>
            {aluno.attendance.length > 0 ? (
              <ul>
                {aluno.attendance.map((freq: any, index: number) => (
                  <li key={index}>
                     {freq.date} - <strong>{freq.project.name}</strong>  
                    <br /> Status: {freq.status}  
                    <br /> Observação: {freq.observations || "Nenhuma"}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum registro de presença.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default RelatorioAluno;
