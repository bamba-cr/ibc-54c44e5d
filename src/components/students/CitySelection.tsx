import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface City {
  id: string;
  name: string;
  state: string;
}

interface CitySelectionProps {
  selectedCity: string;
  onCityChange: (cityId: string) => void;
}

export const CitySelection = ({ selectedCity, onCityChange }: CitySelectionProps) => {
  const { toast } = useToast();
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, [toast]);

  return (
    <div className="space-y-2">
      <Label htmlFor="city">Cidade *</Label>
      <Select value={selectedCity} onValueChange={onCityChange} disabled={isLoading}>
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Carregando cidades..." : "Selecione uma cidade"} />
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
  );
};