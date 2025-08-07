import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, GraduationCap, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const RecentActivity = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["recentActivity"],
    queryFn: async () => {
      try {
        const [students, grades, attendance] = await Promise.all([
          supabase
            .from("students")
            .select("name, created_at")
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("grades")
            .select("student_id, subject, grade, created_at, students!inner(name)")
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("attendance")
            .select("student_id, date, status, students!inner(name)")
            .order("date", { ascending: false })
            .limit(3),
        ]);

        const activities = [];

        // Adicionar novos alunos
        students.data?.forEach(student => {
          activities.push({
            type: "student",
            title: "Novo aluno cadastrado",
            description: student.name,
            date: student.created_at,
            icon: Users,
          });
        });

        // Adicionar notas
        grades.data?.forEach(grade => {
          activities.push({
            type: "grade",
            title: "Nova nota lançada",
            description: `${grade.students.name} - ${grade.subject}: ${grade.grade}`,
            date: grade.created_at,
            icon: GraduationCap,
          });
        });

        // Adicionar presenças
        attendance.data?.forEach(att => {
          activities.push({
            type: "attendance",
            title: "Presença registrada",
            description: `${att.students.name} - ${att.status}`,
            date: att.date,
            icon: Calendar,
          });
        });

        // Ordenar por data
        return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
      } catch (error) {
        console.error("Erro ao buscar atividades recentes:", error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities?.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(activity.date), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma atividade recente encontrada.
          </p>
        )}
      </CardContent>
    </Card>
  );
};