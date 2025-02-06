
import { supabase } from "@/integrations/supabase/client";

export async function buscarHistorico(searchTerm: string) {
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
      .ilike("student.name", `%${searchTerm}%`);

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
