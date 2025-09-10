import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Plus, Trash2 } from "lucide-react";

interface City {
  id: string;
  name: string;
  state: string;
}

interface Polo {
  id: string;
  name: string;
  address: string;
  phone: string;
  coordinator_name: string;
  coordinator_email: string;
  city_id: string;
  cities: {
    name: string;
    state: string;
  };
  created_at: string;
}

export const PolosManagement = () => {
  const { toast } = useToast();
  const [cities, setCities] = useState<City[]>([]);
  const [polos, setPolos] = useState<Polo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city_id: "",
    address: "",
    phone: "",
    coordinator_name: "",
    coordinator_email: ""
  });

  const fetchCities = async () => {
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
    }
  };

  const fetchPolos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("polos")
        .select(`
          *,
          cities (
            name,
            state
          )
        `)
        .order("name");

      if (error) throw error;
      setPolos(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar polos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
    fetchPolos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.city_id) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha pelo menos o nome e a cidade",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("polos")
        .insert([{
          name: formData.name.trim(),
          city_id: formData.city_id,
          address: formData.address.trim() || null,
          phone: formData.phone.trim() || null,
          coordinator_name: formData.coordinator_name.trim() || null,
          coordinator_email: formData.coordinator_email.trim() || null
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Polo adicionado com sucesso",
      });

      setFormData({
        name: "",
        city_id: "",
        address: "",
        phone: "",
        coordinator_name: "",
        coordinator_email: ""
      });
      fetchPolos();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar polo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (poloId: string, poloName: string) => {
    try {
      const { error } = await supabase
        .from("polos")
        .delete()
        .eq("id", poloId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Polo ${poloName} removido com sucesso`,
      });

      fetchPolos();
    } catch (error: any) {
      toast({
        title: "Erro ao remover polo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Gerenciar Polos</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Novo Polo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="poloName">Nome do Polo *</Label>
                <Input
                  id="poloName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Polo Central"
                  required
                />
              </div>
              <div>
                <Label htmlFor="citySelect">Cidade *</Label>
                <Select
                  value={formData.city_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, city_id: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name} - {city.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ex: (11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="coordinator_name">Nome do Coordenador</Label>
                <Input
                  id="coordinator_name"
                  value={formData.coordinator_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, coordinator_name: e.target.value }))}
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <Label htmlFor="coordinator_email">Email do Coordenador</Label>
                <Input
                  id="coordinator_email"
                  type="email"
                  value={formData.coordinator_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, coordinator_email: e.target.value }))}
                  placeholder="Ex: joao@exemplo.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Ex: Rua das Flores, 123 - Centro"
                rows={3}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adicionando..." : "Adicionar Polo"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Polos Cadastrados</CardTitle>
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Coordenador</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {polos.map((polo) => (
                  <TableRow key={polo.id}>
                    <TableCell className="font-medium">{polo.name}</TableCell>
                    <TableCell>
                      {polo.cities?.name} - {polo.cities?.state}
                    </TableCell>
                    <TableCell>{polo.coordinator_name || "-"}</TableCell>
                    <TableCell>{polo.phone || "-"}</TableCell>
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
                              Tem certeza que deseja excluir o polo "{polo.name}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(polo.id, polo.name)}
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
                {polos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum polo cadastrado
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