import { Navbar } from "@/components/layout/Navbar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, Calendar, BookOpen, Activity } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bem-vindo ao IBC CONNECT
            </h1>
            <p className="mt-1 text-gray-500">
              Confira as principais informações do sistema
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total de Alunos"
              value="150"
              description="Ativos no sistema"
              icon={<Users size={24} />}
            />
            <StatsCard
              title="Projetos Ativos"
              value="7"
              description="Em andamento"
              icon={<Calendar size={24} />}
            />
            <StatsCard
              title="Frequência Média"
              value="85%"
              description="Últimos 30 dias"
              icon={<Activity size={24} />}
            />
            <StatsCard
              title="Disciplinas"
              value="5"
              description="Em andamento"
              icon={<BookOpen size={24} />}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;