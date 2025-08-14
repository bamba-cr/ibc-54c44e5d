import { useState } from "react";
import { Search, User, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";

interface GradeSearchFormProps {
  projects: Array<{ id: string; name: string; code: string }>;
  students: Array<{ id: string; name: string }>;
  selectedProject: string;
  selectedStudent: string;
  searchTerm: string;
  onProjectChange: (value: string) => void;
  onStudentChange: (value: string) => void;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export const GradeSearchForm = ({
  projects,
  students,
  selectedProject,
  selectedStudent,
  searchTerm,
  onProjectChange,
  onStudentChange,
  onSearchTermChange,
  onSearch,
  isLoading = false
}: GradeSearchFormProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Buscar Aluno para Editar Notas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Projeto
            </label>
            <TooltipWrapper content="Selecione o projeto para filtrar os alunos matriculados">
              <Select value={selectedProject} onValueChange={onProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} ({project.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TooltipWrapper>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar Aluno
            </label>
            <TooltipWrapper content="Digite o nome do aluno ou número de matrícula para buscar">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome ou matrícula..."
                  value={searchTerm}
                  onChange={(e) => onSearchTermChange(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === "Enter" && onSearch()}
                />
              </div>
            </TooltipWrapper>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aluno
            </label>
            <TooltipWrapper content="Selecione o aluno específico para editar as notas">
              <Select 
                value={selectedStudent} 
                onValueChange={onStudentChange}
                disabled={!selectedProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedProject 
                      ? "Selecione um projeto primeiro" 
                      : "Selecione o aluno"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {students?.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TooltipWrapper>
          </div>
        </div>

        <TooltipWrapper content="Clique para buscar alunos com base nos filtros selecionados">
          <Button
            onClick={onSearch}
            disabled={isLoading || !selectedProject}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Search className="h-4 w-4 animate-spin mr-2" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Buscar Alunos
              </>
            )}
          </Button>
        </TooltipWrapper>
      </CardContent>
    </Card>
  );
};