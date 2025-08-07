import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface StudentSearchProps {
  onSearch: (filters: {
    name: string;
    project: string;
    city: string;
  }) => void;
  projects: Array<{ id: string; name: string }>;
}

export const StudentSearch = ({ onSearch, projects }: StudentSearchProps) => {
  const [name, setName] = useState("");
  const [project, setProject] = useState("");
  const [city, setCity] = useState("");

  const handleSearch = () => {
    onSearch({ name, project, city });
  };

  const clearFilters = () => {
    setName("");
    setProject("");
    setCity("");
    onSearch({ name: "", project: "", city: "" });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nome do aluno..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="pl-10"
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-filter">Projeto</Label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger id="project-filter">
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os projetos</SelectItem>
                  {projects.map((proj) => (
                    <SelectItem key={proj.id} value={proj.id}>
                      {proj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="city-filter">Cidade</Label>
              <Input
                id="city-filter"
                placeholder="Filtrar por cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex-1">
                Aplicar Filtros
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Limpar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};