
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trophy, UserCheck } from "lucide-react";
import RankingCard from "./RankingCard";

interface Project {
  id: string;
  name: string;
}

interface ProjectRanking {
  student_id: string;
  student_name: string;
  average_grade: number;
  attendance_rate: number;
  grade_rank: number;
  attendance_rank: number;
}

interface ProjectRankingsProps {
  projects: Project[] | undefined;
  rankings: ProjectRanking[] | undefined;
  selectedProject: string;
  onProjectSelect: (value: string) => void;
  isLoading: boolean;
}

const ProjectRankings = ({
  projects,
  rankings,
  selectedProject,
  onProjectSelect,
  isLoading,
}: ProjectRankingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rankings por Projeto</CardTitle>
        <CardDescription>
          Visualize o desempenho dos alunos em cada projeto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Select value={selectedProject} onValueChange={onProjectSelect}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Selecione um projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Projetos</SelectLabel>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {rankings && (
            <div className="grid md:grid-cols-2 gap-6">
              <RankingCard
                title="Melhores Notas"
                icon={Trophy}
                iconColor="text-yellow-500"
                rankings={rankings}
                type="grade"
              />
              <RankingCard
                title="Maior Frequência"
                icon={UserCheck}
                iconColor="text-green-500"
                rankings={rankings}
                type="attendance"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectRankings;
