import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const mockData = [
  { month: "Jan", alunos: 65 },
  { month: "Fev", alunos: 75 },
  { month: "Mar", alunos: 85 },
  { month: "Abr", alunos: 90 },
  { month: "Mai", alunos: 95 },
  { month: "Jun", alunos: 100 },
];

export const OverviewChart = () => {
  const { data: realData, isLoading } = useQuery({
    queryKey: ["studentsOverview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("created_at")
        .order("created_at");
      
      if (error) throw error;
      
      // Agrupar por mês
      const monthlyData = {};
      data.forEach(student => {
        const date = new Date(student.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthName, alunos: 0 };
        }
        monthlyData[monthKey].alunos++;
      });
      
      return Object.values(monthlyData).slice(-6); // Últimos 6 meses
    },
    staleTime: 5 * 60 * 1000,
  });

  const chartData = isLoading ? mockData : (realData?.length > 0 ? realData : mockData);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Evolução de Alunos</h3>
      {isLoading && (
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      {!isLoading && (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="alunos"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};