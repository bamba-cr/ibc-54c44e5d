
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Users, FileText, BookOpen, Settings, Shield } from "lucide-react";
import { LogoDisplay } from "@/components/layout/LogoDisplay";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark to-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <LogoDisplay className="text-white text-4xl md:text-6xl" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Sistema de Gestão Acadêmica
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Gerencie alunos, frequência, notas e relatórios de forma eficiente
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
              <Link to="/login">
                Fazer Login
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              <Link to="/auth">
                Criar Conta
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center text-white">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Gestão de Alunos</h3>
            <p className="text-sm text-white/80">Cadastre e gerencie informações dos alunos</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center text-white">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Controle de Frequência</h3>
            <p className="text-sm text-white/80">Registre presenças e ausências</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center text-white">
            <BookOpen className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Notas e Avaliações</h3>
            <p className="text-sm text-white/80">Gerencie notas e acompanhe desempenho</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center text-white">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Relatórios</h3>
            <p className="text-sm text-white/80">Gere relatórios detalhados</p>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
            <Shield className="h-8 w-8 mx-auto mb-3 text-white" />
            <h3 className="text-lg font-semibold mb-2 text-white">Configuração do Sistema</h3>
            <p className="text-sm text-white/80 mb-4">Configure o administrador local do sistema</p>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              <Link to="/setup-admin">
                Configurar Admin
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
