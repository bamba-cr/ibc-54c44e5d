import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Plus, Trash2 } from "lucide-react";

interface City {
  id: string;
  name: string;
  state: string;
  created_at: string;
}

export const CitiesManagement = () => {
  const { toast } = useToast();
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    state: ""
  });

  const fetchCities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .order("name");

      if (error) throw error;
      setCities(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar cidades",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.state.trim()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("cities")
        .insert([{
          name: formData.name.trim(),
          state: formData.state.trim().toUpperCase()
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Cidade adicionada com sucesso",
      });

      setFormData({ name: "", state: "" });
      fetchCities();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar cidade",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cityId: string, cityName: string) => {
    try {
      const { error } = await supabase
        .from("cities")
        .delete()
        .eq("id", cityId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Cidade ${cityName} removida com sucesso`,
      });

      fetchCities();
    } catch (error: any) {
      toast({
        title: "Erro ao remover cidade",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MapPin className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Gerenciar Cidades</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Nova Cidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cityName">Nome da Cidade</Label>
                <Input
                  id="cityName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: São Paulo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">Estado (UF)</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="Ex: SP"
                  maxLength={2}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adicionando..." : "Adicionar Cidade"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cidades Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cities.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell className="font-medium">{city.name}</TableCell>
                    <TableCell>{city.state}</TableCell>
                    <TableCell>
                      {new Date(city.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a cidade "{city.name}"? 
                              Esta ação não pode ser desfeita e todos os polos relacionados também serão removidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(city.id, city.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                {cities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhuma cidade cadastrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};