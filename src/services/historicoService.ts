
import { supabase } from "@/integrations/supabase/client";

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
    console.log(`Executando query de frequência para data ${date} e projeto ${projectId}`);
    
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
      .order('student(name)', { ascending: true });

    if (error) {
      console.error("Erro na query do Supabase:", error);
      throw error;
    }

    console.log("Dados brutos de frequência:", data);

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
