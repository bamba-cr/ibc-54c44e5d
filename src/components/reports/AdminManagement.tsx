
import { useState } from "react";
import { AddAdminForm } from "./admin/AddAdminForm";
import { AdminList } from "./admin/AdminList";
import { UserManagement } from "./admin/UserManagement";
import { CitiesManagement } from "./admin/CitiesManagement";
import { PolosManagement } from "./admin/PolosManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, UserPlus, MapPin, Building2 } from "lucide-react";

export const AdminManagement = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdminAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-[800px]">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
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

        <TabsContent value="cities">
          <CitiesManagement />
        </TabsContent>

        <TabsContent value="polos">
          <PolosManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
