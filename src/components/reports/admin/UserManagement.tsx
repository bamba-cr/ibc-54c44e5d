import { PendingUsers } from "./PendingUsers";
import { AllUsersList } from "./AllUsersList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserCheck, Shield } from "lucide-react";

export const UserManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
      </div>
      
      <Tabs defaultValue="all-users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 lg:grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="all-users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Todos os Usuários
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Aprovações Pendentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-users">
          <AllUsersList />
        </TabsContent>

        <TabsContent value="pending">
          <PendingUsers />
        </TabsContent>
      </Tabs>
    </div>
  );
};
