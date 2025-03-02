
import { supabase } from "@/integrations/supabase/client";

export type HistoricoResponse = {
  id: string;
  period: string;
  grade: number;
  observations?: string;
  student: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
    code: string;
  };
};

/**
 * Busca o histórico de notas dos alunos pelo nome
 */
export async function buscarHistorico(searchTerm: string): Promise<HistoricoResponse[]> {
  console.log("Iniciando busca com termo:", searchTerm);
  
  if (!searchTerm.trim()) {
    console.log("Termo de busca vazio, retornando array vazio");
    return [];
  }

  try {
    console.log("Executando query no Supabase...");
    const { data, error } = await supabase
      .from("grades")
      .select(`
        id, 
        period,
        grade,
        observations,
        student:student_id(id, name), 
        project:project_id(id, name, code)
      `)
      .or(`student.name.ilike.%${searchTerm}%,student.name.ilike.${searchTerm}%,student.name.ilike.%${searchTerm}`)
      .order('period', { ascending: true })
      .order('student.name', { ascending: true });

    if (error) {
      console.error("Erro na query do Supabase:", error);
      throw error;
    }

    // Transformar os dados no formato esperado
    const resultados = data?.map(item => ({
      id: item.id,
      period: item.period,
      grade: item.grade,
      observations: item.observations,
      student: item.student,
      project: item.project
    })) || [];

    console.log("Dados transformados:", resultados);
    return resultados;
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    throw error;
  }
}

/**
 * Busca os registros de frequência por data e projeto
 */
export type FrequenciaResponse = {
  id: string;
  date: string;
  status: string;
  observations?: string;
  student: {
    id: string;
    name: string;
  };
};

export async function buscarFrequenciaPorData(date: string, projectId: string): Promise<FrequenciaResponse[]> {
  console.log(`Buscando frequência para data ${date} e projeto ${projectId}`);
  
  if (!date || !projectId) {
    console.log("Data ou projeto não informados, retornando array vazio");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("attendance")
      .select(`
        id,
        date,
        status,
        observations,
        student:student_id(id, name)
      `)
      .eq('date', date)
      .eq('project_id', projectId)
      .order('student.name', { ascending: true });

    if (error) {
      console.error("Erro na query do Supabase:", error);
      throw error;
    }

    const resultados = data?.map(item => ({
      id: item.id,
      date: item.date,
      status: item.status,
      observations: item.observations,
      student: item.student
    })) || [];

    console.log("Registros de frequência encontrados:", resultados.length);
    return resultados;
  } catch (error) {
    console.error("Erro ao buscar frequência:", error);
    throw error;
  }
}
