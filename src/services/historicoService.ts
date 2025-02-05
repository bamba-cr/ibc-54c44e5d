import { supabase } from "@/integrations/supabase/client";

export async function buscarHistorico(searchTerm: string) {
  if (!searchTerm) return [];

  const { data, error } = await supabase
    .from("grades")
    .select(
      `id, period, frequency, grade, status, 
       student:students(name), 
       project:projects(name)`
    )
    .ilike("student.name", `%${searchTerm}%`);

  if (error) {
    console.error("Erro ao buscar histórico:", error);
    return [];
  }

  return data || [];
}