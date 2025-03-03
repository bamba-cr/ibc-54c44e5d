
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Calendar, BookOpen, Award, Heart, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Decorative elements */}
      <div className="blob-shape w-[500px] h-[500px] bg-primary/10 top-[-200px] right-[-100px]"></div>
      <div className="blob-shape w-[400px] h-[400px] bg-secondary/15 bottom-[-100px] left-[-100px]"></div>
      <div className="wave-pattern absolute inset-0 z-0 opacity-20"></div>
      <div className="dot-pattern absolute inset-0 z-0 opacity-30"></div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <div className="inline-block relative mb-4">
            <h1 className="text-5xl md:text-7xl font-bold text-primary-dark">
              IBC <span className="text-secondary relative">
                CONNECT
                <div className="absolute -bottom-2 left-0 w-full h-3 bg-primary/20 rounded-full"></div>
              </span>
            </h1>
            <div className="absolute -bottom-3 left-0 w-1/3 h-3 bg-secondary/30 rounded-full"></div>
          </div>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Sistema integrado de gestão educacional para um futuro mais conectado e brilhante
          </p>
          <div className="pt-8 flex justify-center gap-4">
            <Link to="/login">
              <Button className="btn-primary text-lg px-8 py-6 rounded-full hover:scale-105 transition-transform flex items-center gap-2 shimmer">
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
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Feature cards - using the same pattern for all */}
          {[
            {
              icon: <BookOpen className="w-8 h-8 text-primary" />,
              title: "Gestão Acadêmica",
              description: "Acompanhamento completo do desempenho e progresso dos alunos"
            },
            {
              icon: <Users className="w-8 h-8 text-primary" />,
              title: "Comunidade",
              description: "Integração entre alunos, professores e responsáveis"
            },
            {
              icon: <Calendar className="w-8 h-8 text-primary" />,
              title: "Agenda Integrada",
              description: "Organização de eventos, aulas e atividades em um só lugar"
            },
            {
              icon: <Award className="w-8 h-8 text-primary" />,
              title: "Conquistas",
              description: "Acompanhamento de metas e celebração de resultados"
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="glass-card card-gradient scale-in-effect p-6 relative"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full"></div>
              <div className="p-6 text-center space-y-4 relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-primary-dark">{feature.title}</h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Values Section */}
      <div className="container mx-auto px-4 py-16 my-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="content-section text-center space-y-12"
        >
          <div className="relative inline-block">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-dark">
              Nossos Valores
            </h2>
            <div className="absolute -bottom-2 left-0 w-full h-2 bg-secondary/30 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="w-12 h-12 text-primary mx-auto" />,
                title: "Compromisso",
                description: "Dedicação total ao desenvolvimento dos alunos"
              },
              {
                icon: <Sparkles className="w-12 h-12 text-primary mx-auto" />,
                title: "Inovação",
                description: "Métodos modernos de ensino e gestão"
              },
              {
                icon: <Star className="w-12 h-12 text-primary mx-auto" />,
                title: "Excelência",
                description: "Busca constante pela qualidade em tudo que fazemos"
              }
            ].map((value, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * index }}
                className="scale-in-effect relative p-4"
              >
                <div className="space-y-4">
                  {value.icon}
                  <h3 className="text-xl font-semibold relative inline-block">
                    {value.title}
                    <div className="absolute -bottom-1 left-0 w-full h-1 bg-secondary/30 rounded-full"></div>
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="container mx-auto px-4 py-16 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark relative inline-block">
            Comece a transformar a gestão educacional hoje
            <div className="absolute -bottom-2 left-0 w-full h-2 bg-secondary/30 rounded-full"></div>
          </h2>
          <p className="text-lg text-gray-600">
            Junte-se a nós e faça parte dessa revolução na educação
          </p>
          <Link to="/login">
            <Button className="btn-secondary text-lg px-8 py-6 rounded-full hover:scale-105 transition-transform shimmer">
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
