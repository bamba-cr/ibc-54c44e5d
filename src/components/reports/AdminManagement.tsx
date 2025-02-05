import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, UserPlus } from "lucide-react";

export const AdminManagement = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddAdmin = async () => {
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First check if the user exists
      const { data: userData, error: userError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("role", "admin");

      if (userError) throw userError;

      // Add admin role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert([
          {
            user_id: userData?.id,
            role: "admin",
          },
        ]);

      if (roleError) throw roleError;

      toast({
        title: "Administrador adicionado",
        description: `${email} agora é um administrador.`,
      });
      setEmail("");
    } catch (error: any) {
      console.error("Error adding admin:", error);
      toast({
        title: "Erro ao adicionar administrador",
        description: "Verifique se o usuário existe e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Gerenciar Administradores
        </CardTitle>
        <CardDescription>Adicione novos administradores ao sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Email do novo administrador"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleAddAdmin}
            disabled={isLoading}
            className="whitespace-nowrap"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {isLoading ? "Adicionando..." : "Adicionar Admin"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};