import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

interface ProjectSelectionProps {
  selectedProjects: string[];
  onProjectChange: (projectId: string, checked: boolean) => void;
}

export const ProjectSelection = ({
  selectedProjects,
  onProjectChange,
}: ProjectSelectionProps) => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Carregando projetos...</div>;
  }

  return (
    <div className="space-y-2">
      <Label>Projetos</Label>
      <div className="grid grid-cols-2 gap-2">
        {projects?.map((project) => (
          <div key={project.id} className="flex items-center space-x-2">
            <Checkbox
              id={project.id}
              checked={selectedProjects.includes(project.id)}
              onCheckedChange={(checked) => onProjectChange(project.id, checked as boolean)}
            />
            <Label htmlFor={project.id} className="capitalize">
              {project.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};