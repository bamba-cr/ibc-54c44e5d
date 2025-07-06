
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";

export const AuthCard = () => {
  const [activeTab, setActiveTab] = useState("signin");

  return (
    <Card className="w-full max-w-md animate-fadeIn">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold text-primary-dark">
          IBC CONNECT
        </CardTitle>
        <CardDescription>
          Sistema de Gestão Acadêmica
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Login</TabsTrigger>
            <TabsTrigger value="signup">Cadastro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="mt-6">
            <SignInForm onSwitchToSignUp={() => setActiveTab("signup")} />
          </TabsContent>
          
          <TabsContent value="signup" className="mt-6">
            <SignUpForm onSwitchToSignIn={() => setActiveTab("signin")} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
