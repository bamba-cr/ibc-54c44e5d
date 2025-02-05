import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText } from "lucide-react";

export const DataExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Fetch all data from relevant tables
      const [
        { data: students },
        { data: projects },
        { data: attendance },
        { data: grades },
      ] = await Promise.all([
        supabase.from("students").select("*"),
        supabase.from("projects").select("*"),
        supabase.from("attendance").select("*"),
        supabase.from("grades").select("*"),
      ]);

      // Create backup object
      const backupData = {
        timestamp: new Date().toISOString(),
        data: {
          students,
          projects,
          attendance,
          grades,
        },
      };

      // Convert to JSON and create download
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `escola-ana-neri-backup-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup realizado com sucesso",
        description: "Os dados foram exportados com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast({
        title: "Erro ao realizar backup",
        description: "Ocorreu um erro ao exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Exportar Dados
        </CardTitle>
        <CardDescription>Faça backup dos dados do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleExportData}
          disabled={isExporting}
          className="w-full sm:w-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exportando..." : "Exportar Dados"}
        </Button>
      </CardContent>
    </Card>
  );
};