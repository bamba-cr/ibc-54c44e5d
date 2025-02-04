import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ProjectSelectionProps {
  selectedProjects: string[];
  onProjectChange: (projectId: string, checked: boolean) => void;
}

export const ProjectSelection = ({
  selectedProjects,
  onProjectChange,
}: ProjectSelectionProps) => {
  const projects = [
    { id: 'capoeira', label: 'Capoeira' },
    { id: 'futebol', label: 'Futebol' },
    { id: 'judo', label: 'Judô' },
    { id: 'musica', label: 'Música' },
    { id: 'informatica', label: 'Informática' },
    { id: 'zumba', label: 'Zumba' },
    { id: 'reforco', label: 'Reforço Escolar' },
  ];

  return (
    <div className="space-y-2">
      <Label>Projetos</Label>
      <div className="grid grid-cols-2 gap-2">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center space-x-2">
            <Checkbox
              id={project.id}
              checked={selectedProjects.includes(project.id)}
              onCheckedChange={(checked) => onProjectChange(project.id, checked as boolean)}
            />
            <Label htmlFor={project.id} className="capitalize">
              {project.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};