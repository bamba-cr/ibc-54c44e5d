import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./button";

interface BackToDashboardProps {
  className?: string;
}

export const BackToDashboard = ({ className = "" }: BackToDashboardProps) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate("/dashboard")}
      className={`gap-2 text-muted-foreground hover:text-foreground ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar ao Dashboard
    </Button>
  );
};
