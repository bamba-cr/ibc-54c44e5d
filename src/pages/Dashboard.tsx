import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const fetchStudentPerformance = async () => {
  const { data, error } = await supabase
    .from("student_performance")
    .select("*")
    .order("average_grade", { ascending: false });

  if (error) throw new Error("Erro ao carregar desempenho dos alunos");
  return data;
};

export const StudentPerformance = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["studentPerformance"],
    queryFn: fetchStudentPerformance,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar desempenho dos alunos. Tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Aluno</TableHead>
          <TableHead>Média</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((student) => (
          <TableRow key={student.id}>
            <TableCell>{student.name}</TableCell>
            <TableCell>{student.average_grade.toFixed(1)}</TableCell>
            <TableCell>
              {student.average_grade >= 7 ? (
                <span className="text-green-600">Aprovado</span>
              ) : (
                <span className="text-red-600">Reprovado</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
