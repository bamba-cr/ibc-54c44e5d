import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PerformanceChartProps {
  studentId?: string;
  projectId?: string;
}

export const PerformanceChart = ({ studentId, projectId }: PerformanceChartProps) => {
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ["performanceData", studentId, projectId],
    queryFn: async () => {
      let query = supabase
        .from("grades")
        .select(`
          grade,
          subject,
          period,
          created_at,
          students!inner(name)
        `)
        .order("created_at");

      if (studentId) {
        query = query.eq("student_id", studentId);
      }
      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Agrupar dados por período e disciplina
      const groupedData = data.reduce((acc, grade) => {
        const key = `${grade.period}-${grade.subject}`;
        if (!acc[key]) {
          acc[key] = {
            period: grade.period,
            subject: grade.subject,
            grades: [],
            averageGrade: 0,
          };
        }
        acc[key].grades.push(grade.grade);
        return acc;
      }, {});

      // Calcular médias
      Object.values(groupedData).forEach((item: any) => {
        item.averageGrade = item.grades.reduce((sum, grade) => sum + grade, 0) / item.grades.length;
      });

      return Object.values(groupedData);
    },
    enabled: !!(studentId || projectId),
  });

  const { data: attendanceData } = useQuery({
    queryKey: ["attendanceData", studentId, projectId],
    queryFn: async () => {
      let query = supabase
        .from("attendance")
        .select(`
          status,
          date,
          students!inner(name)
        `)
        .order("date");

      if (studentId) {
        query = query.eq("student_id", studentId);
      }
      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Agrupar por mês
      const monthlyAttendance = data.reduce((acc, record) => {
        const month = new Date(record.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        if (!acc[month]) {
          acc[month] = { month, present: 0, total: 0 };
        }
        acc[month].total++;
        if (record.status === 'presente') {
          acc[month].present++;
        }
        return acc;
      }, {});

      return Object.values(monthlyAttendance).map((item: any) => ({
        ...item,
        rate: Math.round((item.present / item.total) * 100),
      }));
    },
    enabled: !!(studentId || projectId),
  });

  if (!studentId && !projectId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">Selecione um aluno ou projeto para ver o desempenho</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Desempenho</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="grades" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grades">Notas</TabsTrigger>
            <TabsTrigger value="attendance">Frequência</TabsTrigger>
          </TabsList>

          <TabsContent value="grades">
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip
                      formatter={(value: number) => [value.toFixed(1), "Nota"]}
                    />
                    <Bar dataKey="averageGrade" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>

          <TabsContent value="attendance">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Taxa de Presença"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--secondary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};