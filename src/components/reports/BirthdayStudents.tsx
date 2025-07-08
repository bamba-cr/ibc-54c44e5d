
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Cake, User } from 'lucide-react';
import { format, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const BirthdayStudents = () => {
  const { data: students, isLoading } = useQuery({
    queryKey: ["birthday-students"],
    queryFn: async () => {
      console.log('Fetching students for birthday check...');
      const { data, error } = await supabase
        .from("students")
        .select("id, name, birth_date, photo_url")
        .order("name");
      
      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }
      
      console.log('Students data fetched:', data);
      return data;
    }
  });

  const currentDate = new Date();
  const currentMonth = format(currentDate, 'MMMM', { locale: ptBR });
  
  const birthdayStudents = students?.filter(student => {
    if (!student.birth_date) return false;
    const birthDate = new Date(student.birth_date);
    return isSameMonth(birthDate, currentDate);
  }) || [];

  const getBirthdayDate = (birthDate: string) => {
    return format(new Date(birthDate), 'dd', { locale: ptBR });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-5 w-5 text-primary" />
            Aniversariantes do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cake className="h-5 w-5 text-primary" />
          Aniversariantes de {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}
          <Badge variant="secondary" className="ml-2">
            {birthdayStudents.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {birthdayStudents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
            <p className="text-muted-foreground">
              Nenhum aniversariante este mês
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {birthdayStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0">
                  {student.photo_url ? (
                    <img
                      src={student.photo_url}
                      alt={student.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">
                    {student.name}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Dia {getBirthdayDate(student.birth_date)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Cake className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
