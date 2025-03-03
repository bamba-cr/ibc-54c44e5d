
import { supabase } from "@/integrations/supabase/client";

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
  date: string;
  status: string;
  observations?: string;
}

export const buscarHistorico = async (searchTerm: string): Promise<HistoricoResponse[]> => {
  try {
    // Instead of using student_history which doesn't exist, we'll use grades and join related data
    const { data, error } = await supabase
      .from('grades')
      .select(`
        id,
        grade,
        period,
        observations,
        student:student_id (id, name),
        project:project_id (id, name, code)
      `)
      .or(`student.name.ilike.%${searchTerm}%`)
      .order('period', { ascending: false });

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      throw new Error(`Erro ao buscar histórico: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    console.error('Erro inesperado ao buscar histórico:', err);
    throw err;
  }
};

export const buscarFrequenciaPorData = async (date: string): Promise<FrequenciaResponse[]> => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        id,
        date,
        status,
        observations,
        student:student_id (id, name)
      `)
      .eq('date', date)
      .order('student(name)', { ascending: true });

    if (error) {
      console.error('Erro ao buscar frequência:', error);
      throw new Error(`Erro ao buscar frequência: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    console.error('Erro inesperado ao buscar frequência:', err);
    throw err;
  }
};

