
import { supabase } from "@/integrations/supabase/client";

export async function buscarHistorico(searchTerm: string) {
  if (!searchTerm.trim()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("grades")
      .select(
        `id, 
         period,
         grade,
         observations,
         student:students(id, name), 
         project:projects(id, name, code)`
      )
      .ilike("student.name", `%${searchTerm}%`);

    if (error) {
      console.error("Erro ao buscar histórico:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return [];
  }
}
