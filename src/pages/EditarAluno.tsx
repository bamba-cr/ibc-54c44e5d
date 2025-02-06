
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StudentForm } from "@/components/students/StudentForm";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Student = Database['public']['Tables']['students']['Row'];

const EditarAluno = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      } else {
        fetchStudents();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      } else {
        fetchStudents();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*");

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
  };

  const handleUpdate = async (updatedStudent: Partial<Student>) => {
    try {
      const { error } = await supabase
        .from("students")
        .update(updatedStudent)
        .eq("id", updatedStudent.id);

      if (error) throw error;
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      console.error("Erro ao atualizar aluno:", error);
    }
  };

  const handleDelete = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", studentId);

      if (error) throw error;
      fetchStudents();
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-primary">Lista de Alunos</h1>
        {editingStudent ? (
          <StudentForm
            initialValues={editingStudent}
            onSubmit={handleUpdate}
            onCancel={() => setEditingStudent(null)}
          />
        ) : (
          <>
            <button
              onClick={() => setEditingStudent({} as Student)}
              className="mb-6 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Adicionar Novo Aluno
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <div 
                  key={student.id} 
                  className="bg-card text-card-foreground p-4 rounded-lg border shadow-sm hover:shadow-md transition-all space-y-3"
                >
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">{student.name}</p>
                    <p className="text-sm text-muted-foreground">Idade: {student.age}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditarAluno;
