
import { useState } from "react";
import { PendingUsers } from "./PendingUsers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserCheck, Shield } from "lucide-react";

export const UserManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
      </div>
      
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 lg:grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Aprovações Pendentes
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Administradores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PendingUsers />
        </TabsContent>

        <TabsContent value="admins">
          {/* Aqui podemos adicionar a lista de administradores existente */}
          <div className="text-center py-8 text-muted-foreground">
            Lista de administradores será implementada aqui
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
