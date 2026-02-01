import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  name: string;
  code: string;
  description: string | null;
  logo_url?: string | null;
}

interface ProjectFormProps {
  project?: Project | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProjectForm = ({ project, onSuccess, onCancel }: ProjectFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    name: "",
    code: "",
    description: "",
  });

  const isEditing = !!project;

  useEffect(() => {
    if (project) {
      setFormValues({
        name: project.name,
        code: project.code,
        description: project.description || "",
      });
      if (project.logo_url) {
        setLogoPreview(project.logo_url);
      }
    }
  }, [project]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 2MB",
          variant: "destructive",
        });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg'] },
    maxFiles: 1,
    disabled: isLoading || uploadingLogo
  });

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(project?.logo_url || null);
  };

  const uploadLogo = async (projectId: string): Promise<string | null> => {
    if (!logoFile) return project?.logo_url || null;

    setUploadingLogo(true);
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `project-logos/${projectId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(fileName, logoFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('student-photos')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formValues.name || !formValues.code) {
      toast({
        title: "Erro de validação",
        description: "Nome e código do projeto são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing) {
        let logoUrl = project.logo_url;
        if (logoFile) {
          logoUrl = await uploadLogo(project.id);
        }

        const { error } = await supabase
          .from("projects")
          .update({ ...formValues, logo_url: logoUrl })
          .eq("id", project.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Projeto atualizado com sucesso",
        });
      } else {
        const { data: newProject, error } = await supabase
          .from("projects")
          .insert([formValues])
          .select()
          .single();

        if (error) throw error;

        if (logoFile && newProject) {
          const logoUrl = await uploadLogo(newProject.id);
          if (logoUrl) {
            await supabase
              .from("projects")
              .update({ logo_url: logoUrl })
              .eq("id", newProject.id);
          }
        }

        toast({
          title: "Sucesso!",
          description: "Projeto cadastrado com sucesso",
        });
      }

      if (onSuccess) {
        onSuccess();
      }

      setFormValues({
        name: "",
        code: "",
        description: "",
      });
    } catch (error: any) {
      toast({
        title: isEditing ? "Erro ao atualizar projeto" : "Erro ao cadastrar projeto",
        description: error.message || "Ocorreu um erro ao salvar o projeto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Editar Projeto" : "Novo Projeto"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Logomarca do Projeto</Label>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
              transition-colors duration-200
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
              ${isLoading || uploadingLogo ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            <input {...getInputProps()} />
            {logoPreview ? (
              <div className="relative inline-block">
                <Avatar className="h-20 w-20 mx-auto">
                  <AvatarImage src={logoPreview} />
                  <AvatarFallback>
                    {formValues.code.substring(0, 2).toUpperCase() || 'PJ'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLogo();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                {isDragActive ? (
                  <p className="text-primary text-sm">Solte a imagem aqui</p>
                ) : (
                  <>
                    <p className="text-sm text-foreground">Arraste ou clique para selecionar</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP ou SVG (máx. 2MB)</p>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="name">Nome do Projeto</Label>
          <Input
            id="name"
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            placeholder="Nome do projeto"
            required
          />
        </div>

        <div>
          <Label htmlFor="code">Código do Projeto</Label>
          <Input
            id="code"
            name="code"
            value={formValues.code}
            onChange={handleInputChange}
            placeholder="Código do projeto"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            value={formValues.description}
            onChange={handleInputChange}
            placeholder="Descrição do projeto (opcional)"
            className="h-32"
          />
        </div>

        <div className="flex gap-4 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading || uploadingLogo}>
            {isLoading || uploadingLogo ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : isEditing ? "Salvar Alterações" : "Cadastrar Projeto"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
