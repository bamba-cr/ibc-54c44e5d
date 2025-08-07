import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, Award } from "lucide-react";

interface ProjectStatsProps {
  projectId?: string;
}

export const ProjectStats = ({ projectId }: ProjectStatsProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["projectStats", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const [students, attendance, grades] = await Promise.all([
        supabase
          .from("student_projects")
          .select("student_id", { count: "exact" })
          .eq("project_id", projectId),
        supabase
          .from("attendance")
          .select("status")
          .eq("project_id", projectId),
        supabase
          .from("grades")
          .select("grade")
          .eq("project_id", projectId)
          .not("grade", "is", null),
      ]);

      const totalStudents = students.count || 0;
      const totalAttendance = attendance.data?.length || 0;
      const presentCount = attendance.data?.filter(a => a.status === "presente").length || 0;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;
      
      const averageGrade = grades.data?.length > 0 
        ? grades.data.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.data.length
        : 0;

      return {
        totalStudents,
        attendanceRate,
        averageGrade: Math.round(averageGrade * 10) / 10,
        totalGrades: grades.data?.length || 0,
      };
    },
    enabled: !!projectId,
  });

  if (!projectId) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alunos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : stats?.totalStudents || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Total de alunos inscritos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Presença</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : `${stats?.attendanceRate || 0}%`}
          </div>
          <p className="text-xs text-muted-foreground">
            Taxa de presença média
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : stats?.averageGrade || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Nota média do projeto
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : stats?.totalGrades || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Total de notas lançadas
          </p>
        </CardContent>
      </Card>
    </div>
  );
};