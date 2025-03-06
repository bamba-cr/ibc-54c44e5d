
import { supabase } from "@/integrations/supabase/client";

// Tipos para resposta do histórico
export interface HistoricoResponse {
  id: string;
  student: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
    code: string;
  };
  grade: number;
  period: string;
  observations?: string;
}

export interface FrequenciaResponse {
  id: string;
  student: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
    code: string;
  };
  date: string;
  status: "presente" | "ausente";
  observations?: string;
}

// Função para buscar histórico de notas por nome do aluno
export const buscarHistorico = async (searchTerm: string): Promise<HistoricoResponse[]> => {
  console.log("Buscando histórico para:", searchTerm);

  try {
    // Primeiro busca o ID do aluno pelo nome
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("id, name")
      .ilike("name", `%${searchTerm}%`);

    if (studentError) {
      console.error("Erro ao buscar alunos:", studentError);
      throw new Error("Erro ao buscar alunos: " + studentError.message);
    }

    if (!studentData || studentData.length === 0) {
      console.log("Nenhum aluno encontrado com esse nome");
      return [];
    }

    // Coleta todos os IDs de alunos encontrados
    const studentIds = studentData.map(student => student.id);

    // Busca os registros de notas para esses alunos
    const { data: gradesData, error: gradesError } = await supabase
      .from("grades")
      .select(`
        id, 
        grade, 
        period, 
        observations, 
        students:student_id (id, name), 
        projects:project_id (id, name, code)
      `)
      .in("student_id", studentIds);

    if (gradesError) {
      console.error("Erro ao buscar notas:", gradesError);
      throw new Error("Erro ao buscar notas: " + gradesError.message);
    }

    // Formata os dados para o tipo HistoricoResponse
    const formattedResults: HistoricoResponse[] = gradesData ? gradesData.map(item => ({
      id: item.id,
      student: {
        id: item.students.id,
        name: item.students.name
      },
      project: {
        id: item.projects.id,
        name: item.projects.name,
        code: item.projects.code
      },
      grade: item.grade,
      period: item.period,
      observations: item.observations
    })) : [];

    return formattedResults;
  } catch (error) {
    console.error("Erro na busca de histórico:", error);
    throw error;
  }
};

// Função para buscar frequência por data
export const buscarFrequenciaPorData = async (date: string): Promise<FrequenciaResponse[]> => {
  console.log("Buscando frequência para a data:", date);

  try {
    const { data, error } = await supabase
      .from("attendance")
      .select(`
        id, 
        date, 
        status, 
        observations, 
        students:student_id (id, name), 
        projects:project_id (id, name, code)
      `)
      .eq("date", date);

    if (error) {
      console.error("Erro ao buscar frequência:", error);
      throw new Error("Erro ao buscar frequência: " + error.message);
    }

    // Formata os dados para o tipo FrequenciaResponse
    const formattedResults: FrequenciaResponse[] = data ? data.map(item => ({
      id: item.id,
      student: {
        id: item.students.id,
        name: item.students.name
      },
      project: {
        id: item.projects.id,
        name: item.projects.name,
        code: item.projects.code
      },
      date: item.date,
      status: item.status,
      observations: item.observations
    })) : [];

    return formattedResults;
  } catch (error) {
    console.error("Erro na busca de frequência:", error);
    throw error;
  }
};
