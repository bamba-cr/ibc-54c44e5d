
import { useState } from "react";
import { AddAdminForm } from "./admin/AddAdminForm";
import { AdminList } from "./admin/AdminList";
import { UserManagement } from "./admin/UserManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, UserPlus } from "lucide-react";

export const AdminManagement = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdminAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 lg:grid-cols-2 lg:w-[500px]">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gerenciar Usuários
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Gerenciar Administradores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="admins">
          <div className="space-y-6">
            <AddAdminForm onAdminAdded={handleAdminAdded} />
            <AdminList refreshTrigger={refreshTrigger} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
