import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Calendar, Award } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-secondary/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center space-y-6 animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-bold text-primary-dark">
            IBC CONNECT
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Sistema integrado de gestão educacional para um futuro mais conectado
          </p>
          <div className="pt-4">
            <Link to="/login">
              <Button className="btn-primary text-lg px-8 py-6 rounded-full hover:scale-105 transition-transform">
                Acessar Sistema
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="card hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary-dark">Gestão Acadêmica</h3>
              <p className="text-gray-600">
                Acompanhamento completo do desempenho e progresso dos alunos
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="card hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary-dark">Comunidade</h3>
              <p className="text-gray-600">
                Integração entre alunos, professores e responsáveis
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="card hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary-dark">Agenda Integrada</h3>
              <p className="text-gray-600">
                Organização de eventos, aulas e atividades em um só lugar
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="card hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary-dark">Conquistas</h3>
              <p className="text-gray-600">
                Acompanhamento de metas e celebração de resultados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark">
            Comece a transformar a gestão educacional hoje
          </h2>
          <p className="text-lg text-gray-600">
            Junte-se a nós e faça parte dessa revolução na educação
          </p>
          <Link to="/login">
            <Button className="btn-secondary text-lg px-8 py-6 rounded-full hover:scale-105 transition-transform">
              Começar Agora
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;