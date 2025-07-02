
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserManagementTable } from './UserManagementTable';
import { SystemSettings } from './SystemSettings';
import { LogoSettings } from './LogoSettings';
import { Users, Settings, Image, Shield, BarChart3, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminDashboardImproved = () => {
  return (
    <div className="space-y-8">
      {/* Header com design moderno */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl shadow-lg"
      >
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="p-3 bg-white/20 rounded-full">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        </div>
        <p className="text-blue-100 text-lg">
          Controle total sobre usuários, configurações e personalização do sistema
        </p>
      </motion.div>

      {/* Estatísticas rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-blue-900">
              <Users className="h-5 w-5 mr-2" />
              Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-700">Gestão Completa</p>
            <p className="text-sm text-blue-600">Aprovar, rejeitar e promover</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-purple-900">
              <Image className="h-5 w-5 mr-2" />
              Personalização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-700">Visual</p>
            <p className="text-sm text-purple-600">Logo e identidade</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-green-900">
              <Settings className="h-5 w-5 mr-2" />
              Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">Configurações</p>
            <p className="text-sm text-green-600">Ajustes avançados</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger 
              value="users" 
              className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <Users className="h-4 w-4" />
              <span>Usuários</span>
            </TabsTrigger>
            <TabsTrigger 
              value="logo" 
              className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <Image className="h-4 w-4" />
              <span>Logomarca</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-0">
            <UserManagementTable />
          </TabsContent>

          <TabsContent value="logo" className="space-y-0">
            <LogoSettings />
          </TabsContent>

          <TabsContent value="settings" className="space-y-0">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};
