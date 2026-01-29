import { SignInForm } from "./SignInForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export const LoginForm = () => {
  return (
    <Card className="w-full max-w-md animate-fadeIn bg-card/80 dark:bg-card/60 backdrop-blur-lg border-border shadow-xl">
      <CardHeader className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto neon-glow">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-manrope font-bold text-gradient">
          IBC CONNECT
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Acesse sua conta para continuar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
    </Card>
  );
};
