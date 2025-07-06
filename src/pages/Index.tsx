
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, BarChart3, Calendar, LogIn } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-blue-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <GraduationCap className="h-16 w-16 text-white mr-4" />
            <h1 className="text-5xl font-bold text-white">IBC CONNECT</h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Sistema completo de gestão acadêmica para instituições de ensino
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              icon: Users,
              title: "Gestão de Alunos",
              description: "Cadastre e gerencie informações completas dos estudantes"
            },
            {
              icon: Calendar,
              title: "Controle de Frequência",
              description: "Registre e acompanhe a presença dos alunos"
            },
            {
              icon: BarChart3,
              title: "Notas e Avaliações",
              description: "Sistema completo de lançamento e controle de notas"
            },
            {
              icon: GraduationCap,
              title: "Relatórios Completos",
              description: "Gere relatórios detalhados e análises de performance"
            }
          ].map((feature, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader className="text-center">
                <feature.icon className="h-12 w-12 mx-auto mb-4 text-white" />
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/80 text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Acesse o Sistema</CardTitle>
              <CardDescription>
                Faça login para começar a usar todas as funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full bg-primary hover:bg-primary-dark"
                size="lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Fazer Login / Cadastrar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
