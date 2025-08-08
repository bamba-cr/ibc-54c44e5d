import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/resetar-senha`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) throw error;
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir a senha.",
      });
    } catch (err: any) {
      toast({
        title: "Erro ao enviar email",
        description: err.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark to-primary p-4">
      <Card className="w-full max-w-md animate-fadeIn">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-primary-dark">Recuperar senha</CardTitle>
          <CardDescription>Informe seu email para receber o link de redefinição</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecuperarSenha;
