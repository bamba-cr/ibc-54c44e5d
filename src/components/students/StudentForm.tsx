
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { validateCPF } from "@/utils/validateCPF";
import { supabase } from "@/integrations/supabase/client";
import { PhotoUpload } from "./PhotoUpload";
import { StudentPersonalInfo } from "./StudentPersonalInfo";
import { GuardianInfo } from "./GuardianInfo";
import { ProjectSelection } from "./ProjectSelection";
import { PoloSelection } from "./PoloSelection";
import type { Database } from "@/integrations/supabase/types";

type Student = Database['public']['Tables']['students']['Row'];

interface StudentFormProps {
  initialValues?: Student;
  onSubmit?: (student: Partial<Student> & {projects?: string[]}) => Promise<void>;
  onCancel?: () => void;
}

interface StudentFormValues {
  name: string;
  age: string;
  birthDate: string;
  rg: string;
  cpf: string;
  address: string;
  cityId: string;
  poloId: string;
  guardianName: string;
  guardianRelationship: string;
  guardianCpf: string;
  guardianRg: string;
  guardianPhone: string;
  guardianEmail: string;
  projects: string[];
  observations: string;
  photo: File | null;
}

export const StudentForm = ({ initialValues, onSubmit, onCancel }: StudentFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]); 
  
  const [formValues, setFormValues] = useState<StudentFormValues>({
    name: initialValues?.name || "",
    age: initialValues?.age?.toString() || "",
    birthDate: initialValues?.birth_date || "",
    rg: initialValues?.rg || "",
    cpf: initialValues?.cpf || "",
    address: initialValues?.address || "",
    cityId: initialValues?.city_id || "",
    poloId: initialValues?.polo_id || "",
    guardianName: initialValues?.guardian_name || "",
    guardianRelationship: initialValues?.guardian_relationship || "",
    guardianCpf: initialValues?.guardian_cpf || "",
    guardianRg: initialValues?.guardian_rg || "",
    guardianPhone: initialValues?.guardian_phone || "",
    guardianEmail: initialValues?.guardian_email || "",
    projects: [],
    observations: initialValues?.notes || "",
    photo: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProjectChange = (projectId: string, checked: boolean) => {
    setSelectedProjects(prev => {
      if (checked) {
        return [...prev, projectId];
      }
      return prev.filter(id => id !== projectId);
    });
  };

  const validateForm = () => {
    if (!formValues.name || !formValues.birthDate || !formValues.address || !formValues.cityId || !formValues.poloId) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios incluindo cidade e polo",
        variant: "destructive",
      });
      return false;
    }

    if (formValues.cpf && !validateCPF(formValues.cpf)) {
      toast({
        title: "CPF inválido",
        description: "Por favor, insira um CPF válido",
        variant: "destructive",
      });
      return false;
    }

    if (formValues.guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.guardianEmail)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      let photoUrl = null;
      
      if (formValues.photo) {
        const fileExt = formValues.photo.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('student-photos')
          .upload(fileName, formValues.photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('student-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      // Format data properly for submission
      const studentData = {
        name: formValues.name,
        age: formValues.age ? parseInt(formValues.age) : null,
        birth_date: formValues.birthDate,
        rg: formValues.rg,
        cpf: formValues.cpf,
        address: formValues.address,
        city_id: formValues.cityId,
        polo_id: formValues.poloId,
        guardian_name: formValues.guardianName,
        guardian_relationship: formValues.guardianRelationship,
        guardian_cpf: formValues.guardianCpf,
        guardian_rg: formValues.guardianRg,
        guardian_phone: formValues.guardianPhone,
        guardian_email: formValues.guardianEmail,
        notes: formValues.observations,
        photo_url: photoUrl || initialValues?.photo_url,
        projects: selectedProjects
      };

      if (onSubmit) {
        await onSubmit(studentData);
        return;
      }

      const { data: student, error: studentError } = await supabase
        .from("students")
        .insert({
          name: studentData.name,
          age: studentData.age,
          birth_date: studentData.birth_date,
          rg: studentData.rg,
          cpf: studentData.cpf,
          address: studentData.address,
          city_id: studentData.city_id,
          polo_id: studentData.polo_id,
          guardian_name: studentData.guardian_name,
          guardian_relationship: studentData.guardian_relationship,
          guardian_cpf: studentData.guardian_cpf,
          guardian_rg: studentData.guardian_rg,
          guardian_phone: studentData.guardian_phone,
          guardian_email: studentData.guardian_email,
          notes: studentData.notes,
          photo_url: studentData.photo_url
        })
        .select()
        .single();

      if (studentError) throw studentError;

      if (selectedProjects.length > 0 && student) {
        const projectMappings = selectedProjects.map(projectId => ({
          student_id: student.id,
          project_id: projectId,
        }));

        const { error: projectError } = await supabase
          .from("student_projects")
          .insert(projectMappings);

        if (projectError) throw projectError;
      }

      toast({
        title: "Sucesso!",
        description: "Aluno cadastrado com sucesso",
      });

      setFormValues({
        name: "",
        age: "",
        birthDate: "",
        rg: "",
        cpf: "",
        address: "",
        cityId: "",
        poloId: "",
        guardianName: "",
        guardianRelationship: "",
        guardianCpf: "",
        guardianRg: "",
        guardianPhone: "",
        guardianEmail: "",
        projects: [],
        observations: "",
        photo: null,
      });
      setSelectedProjects([]);
    } catch (error: any) {
      console.error("Erro ao processar o cadastro:", error);
      toast({
        title: "Erro ao cadastrar aluno",
        description: error.message || "Ocorreu um erro ao cadastrar o aluno",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {initialValues ? "Editar Aluno" : "Cadastro de Aluno"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <PhotoUpload
              onPhotoChange={(file) => setFormValues(prev => ({ ...prev, photo: file }))}
            />
            
            <StudentPersonalInfo
              values={formValues}
              onChange={handleInputChange}
              onCityChange={(cityId) => setFormValues(prev => ({ ...prev, cityId }))}
            />
          </div>

          <div className="space-y-4">
            <GuardianInfo
              values={formValues}
              onChange={handleInputChange}
            />

            <PoloSelection
              selectedPolo={formValues.poloId}
              onPoloChange={(poloId) => setFormValues(prev => ({ ...prev, poloId }))}
            />

            <ProjectSelection
              selectedProjects={selectedProjects}
              onProjectChange={handleProjectChange}
            />

            <div>
              <Input
                id="observations"
                name="observations"
                placeholder="Observações (opcional)"
                value={formValues.observations}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : initialValues ? "Salvar Alterações" : "Cadastrar Aluno"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
