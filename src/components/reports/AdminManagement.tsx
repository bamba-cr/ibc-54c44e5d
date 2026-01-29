
import { useState } from "react";
import { RegisterAdminForm } from "./admin/RegisterAdminForm";
import { AdminList } from "./admin/AdminList";
import { UserManagement } from "./admin/UserManagement";
import { CitiesManagement } from "./admin/CitiesManagement";
import { PolosManagement } from "./admin/PolosManagement";
import { AuditLogs } from "./admin/AuditLogs";
import { RoleManagement } from "./admin/RoleManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, UserPlus, MapPin, Building2, FileText, UserCog } from "lucide-react";

export const AdminManagement = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdminAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 lg:w-[1200px]">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Funções
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Administradores
          </TabsTrigger>
          <TabsTrigger value="cities" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Cidades
          </TabsTrigger>
          <TabsTrigger value="polos" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Polos
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="roles">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="admins">
          <div className="space-y-6">
            <RegisterAdminForm onAdminAdded={handleAdminAdded} />
            <AdminList refreshTrigger={refreshTrigger} />
          </div>
        </TabsContent>

        <TabsContent value="cities">
          <CitiesManagement />
        </TabsContent>

        <TabsContent value="polos">
          <PolosManagement />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};
