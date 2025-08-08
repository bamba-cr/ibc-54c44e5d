import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ResetarSenha = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast({ title: "Senha inválida", description: "Use pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Senhas não conferem", description: "As senhas devem ser iguais.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: "Senha atualizada", description: "Faça login novamente." });
      navigate("/login");
    } catch (err: any) {
      toast({ title: "Erro ao atualizar senha", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark to-primary p-4">
      <Card className="w-full max-w-md animate-fadeIn">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-primary-dark">Definir nova senha</CardTitle>
          <CardDescription>Escolha uma nova senha para sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetarSenha;
