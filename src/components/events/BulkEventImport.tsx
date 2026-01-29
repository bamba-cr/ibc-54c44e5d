import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Download,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import * as XLSX from "xlsx";
import { format, parse, isValid } from "date-fns";

interface ParsedEvent {
  title: string;
  date: string;
  type: string;
  description?: string;
  isValid: boolean;
  errors: string[];
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export const BulkEventImport = () => {
  const { user, profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [parsedEvents, setParsedEvents] = useState<ParsedEvent[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  // Check access
  const hasAccess = profile?.is_admin || profile?.role === "coordenador";

  const parseDate = (dateValue: any): { date: string; isValid: boolean } => {
    if (!dateValue) return { date: "", isValid: false };

    // Handle Excel serial date number
    if (typeof dateValue === "number") {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
      if (isValid(date)) {
        return { date: format(date, "yyyy-MM-dd"), isValid: true };
      }
    }

    // Handle string dates
    if (typeof dateValue === "string") {
      // Try common formats
      const formats = ["dd/MM/yyyy", "yyyy-MM-dd", "MM/dd/yyyy", "dd-MM-yyyy"];
      for (const fmt of formats) {
        try {
          const parsed = parse(dateValue, fmt, new Date());
          if (isValid(parsed)) {
            return { date: format(parsed, "yyyy-MM-dd"), isValid: true };
          }
        } catch {}
      }
    }

    // Handle Date object
    if (dateValue instanceof Date && isValid(dateValue)) {
      return { date: format(dateValue, "yyyy-MM-dd"), isValid: true };
    }

    return { date: String(dateValue), isValid: false };
  };

  const parseFile = async (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const events: ParsedEvent[] = jsonData.map((row: any, index) => {
          const errors: string[] = [];
          
          // Get title
          const title = row.titulo || row.Titulo || row.TITULO || 
                       row.title || row.Title || row.TITLE ||
                       row.nome || row.Nome || row.NOME || "";
          
          if (!title.trim()) {
            errors.push("Título é obrigatório");
          }

          // Get and parse date
          const rawDate = row.data || row.Data || row.DATA || 
                         row.date || row.Date || row.DATE || "";
          const { date, isValid: dateIsValid } = parseDate(rawDate);
          
          if (!dateIsValid) {
            errors.push("Data inválida (use dd/MM/yyyy)");
          }

          // Get type
          const rawType = row.tipo || row.Tipo || row.TIPO || 
                         row.type || row.Type || row.TYPE || "meeting";
          const typeMap: Record<string, string> = {
            reuniao: "meeting", reunião: "meeting", meeting: "meeting",
            tarefa: "task", task: "task",
            lembrete: "reminder", reminder: "reminder"
          };
          const type = typeMap[rawType.toLowerCase()] || "meeting";

          // Get description
          const description = row.descricao || row.Descricao || row.DESCRICAO ||
                             row.descrição || row.Descrição || row.DESCRIÇÃO ||
                             row.description || row.Description || "";

          return {
            title: String(title).trim(),
            date,
            type,
            description: String(description).trim(),
            isValid: errors.length === 0,
            errors
          };
        });

        setParsedEvents(events);
        
        const validCount = events.filter(e => e.isValid).length;
        const invalidCount = events.length - validCount;
        
        if (invalidCount > 0) {
          toast.warning(`${validCount} eventos válidos, ${invalidCount} com erros`);
        } else {
          toast.success(`${validCount} eventos prontos para importar`);
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        toast.error("Erro ao ler o arquivo. Verifique o formato.");
      }
    };

    reader.readAsBinaryString(file);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      setResult(null);
      parseFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"]
    },
    maxFiles: 1,
    disabled: !hasAccess
  });

  const handleImport = async () => {
    if (!user) return;
    
    const validEvents = parsedEvents.filter(e => e.isValid);
    if (validEvents.length === 0) {
      toast.error("Nenhum evento válido para importar");
      return;
    }

    setImporting(true);
    setProgress(0);

    const results: ImportResult = { success: 0, failed: 0, errors: [] };
    const batchSize = 10;

    for (let i = 0; i < validEvents.length; i += batchSize) {
      const batch = validEvents.slice(i, i + batchSize);
      
      const eventsToInsert = batch.map(event => ({
        title: event.title,
        date: event.date,
        type: event.type,
        description: event.description || null,
        user_id: user.id
      }));

      const { error } = await supabase
        .from("events")
        .insert(eventsToInsert);

      if (error) {
        results.failed += batch.length;
        results.errors.push(`Lote ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        results.success += batch.length;
      }

      setProgress(Math.min(100, ((i + batch.length) / validEvents.length) * 100));
    }

    setResult(results);
    setImporting(false);

    if (results.failed === 0) {
      toast.success(`${results.success} eventos importados com sucesso!`);
    } else {
      toast.warning(`${results.success} importados, ${results.failed} falharam`);
    }
  };

  const handleClear = () => {
    setFile(null);
    setParsedEvents([]);
    setResult(null);
    setProgress(0);
  };

  const downloadTemplate = () => {
    const template = [
      { titulo: "Reunião de equipe", data: "15/02/2026", tipo: "reuniao", descricao: "Reunião semanal da equipe" },
      { titulo: "Entrega do projeto", data: "20/02/2026", tipo: "tarefa", descricao: "Prazo final para entrega" },
      { titulo: "Aniversário João", data: "25/02/2026", tipo: "lembrete", descricao: "" }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Eventos");
    XLSX.writeFile(wb, "modelo_eventos.xlsx");
  };

  if (!hasAccess) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border">
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Apenas Administradores e Coordenadores podem importar eventos em massa.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Importação em Massa
        </CardTitle>
        <CardDescription>
          Importe eventos através de planilha CSV ou Excel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download template button */}
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Baixar Modelo
        </Button>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50 hover:bg-muted/50"
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-primary font-medium">Solte o arquivo aqui...</p>
          ) : (
            <>
              <p className="text-foreground font-medium">
                Arraste um arquivo ou clique para selecionar
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Formatos aceitos: CSV, XLS, XLSX
              </p>
            </>
          )}
        </div>

        {/* File info and parsed events */}
        {file && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {parsedEvents.length} registros encontrados
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Preview list */}
            {parsedEvents.length > 0 && (
              <ScrollArea className="h-[200px] border rounded-lg p-3">
                <div className="space-y-2">
                  {parsedEvents.map((event, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded-md ${
                        event.isValid ? "bg-muted/30" : "bg-destructive/10"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {event.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                        )}
                        <span className="text-sm truncate">{event.title || "Sem título"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {event.date}
                        </Badge>
                        {!event.isValid && (
                          <span className="text-xs text-destructive">
                            {event.errors.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Progress bar */}
            {importing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Importando... {Math.round(progress)}%
                </p>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className={`p-4 rounded-lg ${
                result.failed === 0 ? "bg-green-500/10" : "bg-yellow-500/10"
              }`}>
                <div className="flex items-center gap-2">
                  {result.failed === 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className="font-medium">
                    {result.success} eventos importados
                    {result.failed > 0 && `, ${result.failed} falharam`}
                  </span>
                </div>
              </div>
            )}

            {/* Import button */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClear} disabled={importing}>
                Limpar
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={importing || parsedEvents.filter(e => e.isValid).length === 0}
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar {parsedEvents.filter(e => e.isValid).length} eventos
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
