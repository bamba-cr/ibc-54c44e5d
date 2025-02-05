import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Calendar, BookOpen, Award, Heart, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-secondary/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-primary-dark">
            IBC <span className="text-secondary">CONNECT</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Sistema integrado de gestão educacional para um futuro mais conectado e brilhante
          </p>
          <div className="pt-8 flex justify-center gap-4">
            <Link to="/login">
              <Button className="btn-primary text-lg px-8 py-6 rounded-full hover:scale-105 transition-transform flex items-center gap-2">
                Acessar Sistema
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" className="text-lg px-8 py-6 rounded-full hover:scale-105 transition-transform">
                Saiba Mais
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Feature 1 */}
          <div className="card hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur group">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary-dark">Gestão Acadêmica</h3>
              <p className="text-gray-600">
                Acompanhamento completo do desempenho e progresso dos alunos
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="card hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur group">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary-dark">Comunidade</h3>
              <p className="text-gray-600">
                Integração entre alunos, professores e responsáveis
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="card hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur group">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary-dark">Agenda Integrada</h3>
              <p className="text-gray-600">
                Organização de eventos, aulas e atividades em um só lugar
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="card hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur group">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary-dark">Conquistas</h3>
              <p className="text-gray-600">
                Acompanhamento de metas e celebração de resultados
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Values Section */}
      <div className="container mx-auto px-4 py-16 bg-white/50 backdrop-blur rounded-3xl my-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center space-y-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark">
            Nossos Valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Heart className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Compromisso</h3>
              <p className="text-gray-600">Dedicação total ao desenvolvimento dos alunos</p>
            </div>
            <div className="space-y-4">
              <Sparkles className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Inovação</h3>
              <p className="text-gray-600">Métodos modernos de ensino e gestão</p>
            </div>
            <div className="space-y-4">
              <Star className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Excelência</h3>
              <p className="text-gray-600">Busca constante pela qualidade em tudo que fazemos</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-3xl mx-auto space-y-6"
        >
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
        </motion.div>
      </div>
    </div>
  );
};

export default Index;