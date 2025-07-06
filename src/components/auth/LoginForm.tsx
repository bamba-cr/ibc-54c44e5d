
import { SignInForm } from "./SignInForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const LoginForm = () => {
  return (
    <Card className="w-full max-w-md animate-fadeIn">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold text-primary-dark">
          IBC CONNECT
        </CardTitle>
        <CardDescription>
          Acesse sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm onSwitchToSignUp={() => {}} />
      </CardContent>
    </Card>
  );
};
