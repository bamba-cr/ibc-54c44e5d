import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StudentForm } from "@/components/students/StudentForm";
import { supabase } from "@/integrations/supabase/client";

const Alunos = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <StudentForm />
    </div>
  );
};

export default Alunos;