import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  name: string;
  code: string;
  logo_url?: string | null;
}

interface ProjectLogoUploadProps {
  projects: Project[];
  onSuccess?: () => void;
}

export const ProjectLogoUpload = ({ projects, onSuccess }: ProjectLogoUploadProps) => {
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 2MB');
        return;
      }
      setFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg']
    },
    maxFiles: 1,
    disabled: !selectedProject || uploading
  });

  const handleUpload = async () => {
    if (!file || !selectedProject) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `project-logos/${selectedProject}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('student-photos')
        .getPublicUrl(fileName);

      // Update project with logo URL
      const { error: updateError } = await supabase
        .from('projects')
        .update({ logo_url: urlData.publicUrl })
        .eq('id', selectedProject);

      if (updateError) throw updateError;

      toast.success('Logomarca atualizada com sucesso!');
      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Erro ao fazer upload da logomarca');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedProject('');
    setFile(null);
    setPreviewUrl(null);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ImageIcon className="h-4 w-4" />
          Logomarcas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Gerenciar Logomarcas dos Projetos
          </DialogTitle>
          <DialogDescription>
            Adicione ou atualize a logomarca de um projeto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label>Selecione o Projeto</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      {project.logo_url && (
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={project.logo_url} />
                          <AvatarFallback className="text-[8px]">
                            {project.code.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Logo Preview */}
          {selectedProjectData?.logo_url && !previewUrl && (
            <div className="space-y-2">
              <Label>Logomarca Atual</Label>
              <div className="flex justify-center p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedProjectData.logo_url} />
                  <AvatarFallback>
                    {selectedProjectData.code.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          )}

          {/* Dropzone */}
          {selectedProject && (
            <div className="space-y-2">
              <Label>{previewUrl ? 'Nova Logomarca' : 'Upload de Logomarca'}</Label>
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                  transition-colors duration-200
                  ${isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }
                  ${uploading ? 'opacity-50 pointer-events-none' : ''}
                `}
              >
                <input {...getInputProps()} />
                
                {previewUrl ? (
                  <div className="relative inline-block">
                    <Avatar className="h-20 w-20 mx-auto">
                      <AvatarImage src={previewUrl} />
                      <AvatarFallback>
                        <ImageIcon className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setPreviewUrl(null);
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
                        <p className="text-sm text-foreground">
                          Arraste ou clique para selecionar
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, WEBP ou SVG (máx. 2MB)
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {file && (
            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Salvar Logomarca
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
