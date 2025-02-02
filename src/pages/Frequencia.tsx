import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface Student {
  id: string;
  name: string;
  status: "presente" | "ausente";
  observations?: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  project_id: string;
  date: string;
  status: "presente" | "ausente";
  observations?: string;
}

const Frequencia = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<Student[]>([]);
  const [observations, setObservations] = useState<Record<string, string>>({});

  // Fetch projects
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch students for selected project
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students", selectedProject],
    queryFn: async () => {
      if (!selectedProject) return [];
      const { data, error } = await supabase
        .from("student_projects")
        .select("students(*)")
        .eq("project_id", selectedProject);
      if (error) throw error;
      return data.map((item) => ({
        id: item.students.id,
        name: item.students.name,
        status: "presente" as const,
      }));
    },
    enabled: !!selectedProject,
  });

  // Fetch existing attendance records
  const { data: existingAttendance } = useQuery({
    queryKey: ["attendance", selectedProject, selectedDate],
    queryFn: async () => {
      if (!selectedProject || !selectedDate) return null;
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("project_id", selectedProject)
        .eq("date", format(selectedDate, "yyyy-MM-dd"));
      if (error) throw error;
      return data;
    },
    enabled: !!selectedProject && !!selectedDate,
  });

  // Save attendance mutation
  const saveMutation = useMutation({
    mutationFn: async (records: Omit<AttendanceRecord, "id">[]) => {
      const { data, error } = await supabase
        .from("attendance")
        .upsert(records, { onConflict: "student_id,project_id,date" });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({
        title: "Sucesso!",
        description: "Frequência registrada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro!",
        description: "Erro ao registrar frequência: " + error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (students && existingAttendance) {
      const updatedAttendance = students.map((student) => {
        const existing = existingAttendance.find(
          (record) => record.student_id === student.id
        );
        return {
          ...student,
          status: (existing?.status as "presente" | "ausente") || "presente",
          observations: existing?.observations || "",
        };
      });
      setAttendance(updatedAttendance);

      const newObservations: Record<string, string> = {};
      existingAttendance.forEach((record) => {
        if (record.observations) {
          newObservations[record.student_id] = record.observations;
        }
      });
      setObservations(newObservations);
    } else if (students) {
      setAttendance(students);
      setObservations({});
    }
  }, [students, existingAttendance]);

  const handleProjectSelect = (value: string) => {
    setSelectedProject(value);
  };

  const handleAttendanceChange = (studentId: string, status: "presente" | "ausente") => {
    setAttendance((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const handleObservationChange = (studentId: string, value: string) => {
    setObservations((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleMarkAll = (status: "presente" | "ausente") => {
    setAttendance((prev) =>
      prev.map((student) => ({ ...student, status }))
    );
  };

  const handleSubmit = async () => {
    // Validate date
    if (selectedDate > new Date()) {
      toast({
        title: "Erro!",
        description: "Não é possível registrar frequência para datas futuras.",
        variant: "destructive",
      });
      return;
    }

    const records = attendance.map((student) => ({
      student_id: student.id,
      project_id: selectedProject,
      date: format(selectedDate, "yyyy-MM-dd"),
      status: student.status,
      observations: observations[student.id] || null,
    }));

    await saveMutation.mutateAsync(records);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Registro de Frequência</h1>

      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="w-64">
            <Select value={selectedProject} onValueChange={handleProjectSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {attendance.length > 0 && (
          <>
            <div className="flex gap-2 mb-4">
              <Button onClick={() => handleMarkAll("presente")}>
                Marcar Todos Presentes
              </Button>
              <Button
                variant="outline"
                onClick={() => handleMarkAll("ausente")}
              >
                Marcar Todos Ausentes
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Aluno</TableHead>
                  <TableHead>Presença</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={student.status === "presente"}
                            onCheckedChange={(checked) =>
                              handleAttendanceChange(
                                student.id,
                                checked ? "presente" : "ausente"
                              )
                            }
                          />
                          <span>Presente</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={observations[student.id] || ""}
                        onChange={(e) =>
                          handleObservationChange(student.id, e.target.value)
                        }
                        placeholder="Observações"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-8">
              <Button
                onClick={handleSubmit}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "Salvando..." : "Registrar Frequência"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Frequencia;