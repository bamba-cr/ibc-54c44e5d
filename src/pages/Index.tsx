import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, BarChart3, Calendar, LogIn, Sparkles, ArrowRight, Shield, Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion } from 'framer-motion';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent neon-glow"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Users,
      title: "Gestão de Alunos",
      description: "Cadastre e gerencie informações completas dos estudantes com facilidade"
    },
    {
      icon: Calendar,
      title: "Controle de Frequência",
      description: "Registre e acompanhe a presença dos alunos em tempo real"
    },
    {
      icon: BarChart3,
      title: "Notas e Avaliações",
      description: "Sistema completo de lançamento e controle de notas"
    },
    {
      icon: Shield,
      title: "Segurança Avançada",
      description: "Proteção de dados com criptografia e controle de acesso"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      
      {/* Noise texture for dark mode */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} 
      />

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="font-manrope font-bold text-xl text-foreground">IBC CONNECT</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <motion.section 
        className="relative z-10 container mx-auto px-4 pt-16 pb-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 border border-primary/20"
          >
            <Sparkles className="h-4 w-4" />
            <span>Sistema de Gestão Acadêmica</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-manrope font-bold mb-6 text-foreground leading-tight"
          >
            Transforme a{' '}
            <span className="text-gradient bg-gradient-to-r from-primary via-fuchsia to-primary bg-clip-text text-transparent">
              gestão educacional
            </span>
            {' '}da sua instituição
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Plataforma completa para gerenciar alunos, frequência, notas e muito mais. 
            Simplifique processos e potencialize resultados.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              onClick={() => navigate('/auth')} 
              size="lg"
              className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl neon-glow transition-all duration-300 hover:scale-105"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Acessar Sistema
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg rounded-xl border-border hover:bg-secondary/10 transition-all duration-300"
            >
              <Zap className="mr-2 h-5 w-5 text-primary" />
              Saiba Mais
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="relative z-10 container mx-auto px-4 pb-24"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h2 
          variants={itemVariants}
          className="text-2xl md:text-3xl font-manrope font-bold text-center mb-12 text-foreground"
        >
          Tudo o que você precisa em{' '}
          <span className="text-primary">um só lugar</span>
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <Card className="group h-full bg-card/50 dark:bg-card/30 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors duration-300">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-manrope text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="relative z-10 container mx-auto px-4 pb-24"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div variants={itemVariants}>
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 via-card to-accent/5 dark:from-primary/20 dark:via-card dark:to-accent/10 backdrop-blur-sm border-primary/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
            <CardHeader className="relative text-center pt-10">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 neon-glow">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-manrope text-foreground">
                Pronto para começar?
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-2">
                Acesse o sistema agora e simplifique sua gestão acadêmica
              </CardDescription>
            </CardHeader>
            <CardContent className="relative pb-10">
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-xl neon-glow transition-all duration-300 hover:scale-[1.02]"
                size="lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Fazer Login / Cadastrar
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-manrope font-semibold text-foreground">IBC CONNECT</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 IBC Connect. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
