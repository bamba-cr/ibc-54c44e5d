import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Polo {
  id: string;
  name: string;
  city_id: string;
  cities: {
    name: string;
    state: string;
  };
}

interface PoloSelectionProps {
  selectedPolo: string;
  onPoloChange: (poloId: string) => void;
}

export const PoloSelection = ({ selectedPolo, onPoloChange }: PoloSelectionProps) => {
  const { toast } = useToast();
  const [polos, setPolos] = useState<Polo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPolos = async () => {
      try {
        const { data, error } = await supabase
          .from("polos")
          .select(`
            id,
            name,
            city_id,
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

    fetchPolos();
  }, [toast]);

  return (
    <div className="space-y-2">
      <Label htmlFor="polo">Polo *</Label>
      <Select value={selectedPolo} onValueChange={onPoloChange} disabled={isLoading}>
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Carregando polos..." : "Selecione um polo"} />
        </SelectTrigger>
        <SelectContent>
          {polos.map((polo) => (
            <SelectItem key={polo.id} value={polo.id}>
              {polo.name} - {polo.cities?.name}/{polo.cities?.state}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};