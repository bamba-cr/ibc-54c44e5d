import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { validateCPF } from "@/utils/validateCPF";
import { supabase } from "@/integrations/supabase/client";

interface StudentFormValues {
  name: string;
  age: string;
  birthDate: string;
  rg: string;
  cpf: string;
  address: string;
  city: string;
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

export const StudentForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [formValues, setFormValues] = useState<StudentFormValues>({
    name: "",
    age: "",
    birthDate: "",
    rg: "",
    cpf: "",
    address: "",
    city: "",
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormValues((prev) => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    if (!formValues.name || !formValues.birthDate || !formValues.address) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios",
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

      const studentData = {
        name: formValues.name,
        age: parseInt(formValues.age),
        birth_date: formValues.birthDate,
        rg: formValues.rg,
        cpf: formValues.cpf,
        address: formValues.address,
        city: formValues.city,
        guardian_name: formValues.guardianName,
        guardian_relationship: formValues.guardianRelationship,
        guardian_cpf: formValues.guardianCpf,
        guardian_rg: formValues.guardianRg,
        guardian_phone: formValues.guardianPhone,
        guardian_email: formValues.guardianEmail,
        notes: formValues.observations,
        photo_url: photoUrl,
      };

      const { data: student, error: studentError } = await supabase
        .from("students")
        .insert(studentData)
        .select()
        .single();

      if (studentError) throw studentError;

      if (selectedProjects.length > 0) {
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
        city: "",
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
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
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
      <h1 className="text-2xl font-bold mb-6">Cadastro de Aluno</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Dados do Aluno</h2>
            
            <div>
              <Label htmlFor="photo">Foto (opcional)</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                ref={fileInputRef}
              />
              {photoPreview && (
                <div className="mt-2">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="name">Nome*</Label>
              <Input
                id="name"
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formValues.age}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="birthDate">Data de Nascimento*</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formValues.birthDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                name="rg"
                value={formValues.rg}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                value={formValues.cpf}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="address">Endereço*</Label>
              <Input
                id="address"
                name="address"
                value={formValues.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="city">Cidade*</Label>
              <Select
                value={formValues.city}
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, city: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laranjal do Jari">Laranjal do Jari</SelectItem>
                  <SelectItem value="Vitória do Jari">Vitória do Jari</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Dados do Responsável</h2>
            
            <div>
              <Label htmlFor="guardianName">Nome do Responsável*</Label>
              <Input
                id="guardianName"
                name="guardianName"
                value={formValues.guardianName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="guardianRelationship">Grau de Parentesco*</Label>
              <Input
                id="guardianRelationship"
                name="guardianRelationship"
                value={formValues.guardianRelationship}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="guardianCpf">CPF do Responsável</Label>
              <Input
                id="guardianCpf"
                name="guardianCpf"
                value={formValues.guardianCpf}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="guardianRg">RG do Responsável</Label>
              <Input
                id="guardianRg"
                name="guardianRg"
                value={formValues.guardianRg}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="guardianPhone">Telefone do Responsável*</Label>
              <Input
                id="guardianPhone"
                name="guardianPhone"
                value={formValues.guardianPhone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="guardianEmail">Email do Responsável</Label>
              <Input
                id="guardianEmail"
                name="guardianEmail"
                type="email"
                value={formValues.guardianEmail}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Projetos</Label>
              <div className="grid grid-cols-2 gap-2">
                {['capoeira', 'futebol', 'judo', 'musica', 'informatica', 'zumba', 'reforco'].map((projectId) => (
                  <div key={projectId} className="flex items-center space-x-2">
                    <Checkbox
                      id={projectId}
                      checked={selectedProjects.includes(projectId)}
                      onCheckedChange={(checked) => handleProjectChange(projectId, checked as boolean)}
                    />
                    <Label htmlFor={projectId} className="capitalize">
                      {projectId === 'reforco' ? 'Reforço Escolar' : projectId}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="observations">Observações</Label>
              <Input
                id="observations"
                name="observations"
                value={formValues.observations}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Cadastrando..." : "Cadastrar Aluno"}
        </Button>
      </form>
    </Card>
  );
};