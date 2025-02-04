import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StudentForm } from "@/components/students/StudentForm";
import { supabase } from "@/integrations/supabase/client";

const Alunos = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
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
        .from("students") // Substitua "students" pelo nome da sua tabela no Supabase
        .select("*");

      if (error) throw error;
      setStudents(data);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
  };

  const handleUpdate = async (updatedStudent) => {
    try {
      const { data, error } = await supabase
        .from("students")
        .update(updatedStudent)
        .eq("id", updatedStudent.id);

      if (error) throw error;
      setEditingStudent(null);
      fetchStudents(); // Atualiza a lista de alunos após a edição
    } catch (error) {
      console.error("Erro ao atualizar aluno:", error);
    }
  };

  const handleDelete = async (studentId) => {
    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", studentId);

      if (error) throw error;
      fetchStudents(); // Atualiza a lista de alunos após a exclusão
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Lista de Alunos</h1>
      {editingStudent ? (
        <StudentForm
          initialData={editingStudent}
          onSubmit={handleUpdate}
          onCancel={() => setEditingStudent(null)}
        />
      ) : (
        <>
          <button
            onClick={() => setEditingStudent({})}
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Adicionar Novo Aluno
          </button>
          <ul>
            {students.map((student) => (
              <li key={student.id} className="mb-4 p-4 border rounded">
                <p><strong>Nome:</strong> {student.name}</p>
                <p><strong>Email:</strong> {student.email}</p>
                <p><strong>Idade:</strong> {student.age}</p>
                <button
                  onClick={() => handleEdit(student)}
                  className="mr-2 bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Alunos;
