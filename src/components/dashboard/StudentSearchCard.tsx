import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, Eye, Loader2 } from "lucide-react";
import { StudentProfile } from "@/components/student/StudentProfile";
import { motion, AnimatePresence } from "framer-motion";
import type { Database } from "@/integrations/supabase/types";

type Student = Database["public"]["Tables"]["students"]["Row"];

export const StudentSearchCard = () => {
  const [searchName, setSearchName] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { data: students, isLoading } = useQuery({
    queryKey: ["students-search", searchName],
    queryFn: async () => {
      let query = supabase
        .from("students")
        .select("*, cities(name, state)")
        .order("name")
        .limit(10);

      if (searchName) {
        query = query.ilike("name", `%${searchName}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: searchName.length >= 2
  });

  return (
    <>
      <Card className="shadow-lg h-full bg-card/60 dark:bg-card/40 backdrop-blur-sm border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Buscar Alunos
          </CardTitle>
          <CardDescription>
            Pesquise e visualize perfis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Digite o nome do aluno (mín. 2 caracteres)..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-10"
              />
            </div>

            <AnimatePresence>
              {isLoading && searchName.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center p-4"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </motion.div>
              )}

              {students && students.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2 max-h-[300px] overflow-y-auto"
                >
                  {students.map((student) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.cities?.name || "Cidade não informada"} •{" "}
                          {student.age ? `${student.age} anos` : "Idade não informada"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedStudentId(student.id);
                          setIsProfileOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 text-primary" />
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {students && students.length === 0 && searchName.length >= 2 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-muted-foreground py-4"
                >
                  Nenhum aluno encontrado
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {selectedStudentId && (
        <StudentProfile 
          studentId={selectedStudentId} 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
        />
      )}
    </>
  );
};
