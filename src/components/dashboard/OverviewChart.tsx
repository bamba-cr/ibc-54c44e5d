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

const data = [
  { month: "Jan", alunos: 65 },
  { month: "Fev", alunos: 75 },
  { month: "Mar", alunos: 85 },
  { month: "Abr", alunos: 90 },
  { month: "Mai", alunos: 95 },
  { month: "Jun", alunos: 100 },
];

export const OverviewChart = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Evolução de Alunos</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="alunos"
              stroke="#6a1b9a"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};