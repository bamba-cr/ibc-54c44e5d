
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
        student:students(id, name), 
        project:projects(id, name, code)
      `)
      .ilike("student.name", `%${searchTerm}%`)
      .order('period', { ascending: true })
      .order('student(name)', { ascending: true });

    if (error) {
      console.error("Erro na query do Supabase:", error);
      throw error;
    }

    console.log("Dados retornados:", data);
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    throw error;
  }
}
