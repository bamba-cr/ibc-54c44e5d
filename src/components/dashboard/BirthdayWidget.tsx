import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Cake, Gift, Sparkles, Calendar, User, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface BirthdayPerson {
  id: string;
  name: string;
  birth_date: string;
  day: number;
  type: 'student' | 'staff';
  role?: string;
  polo_name?: string | null;
}

export const BirthdayWidget = () => {
  const [birthdays, setBirthdays] = useState<BirthdayPerson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const currentMonth = new Date().getMonth() + 1;
        const results: BirthdayPerson[] = [];
        
        // Fetch students birthdays using the RPC function
        const { data: studentsData, error: studentsError } = await supabase
          .rpc('get_birthday_students', { month_param: currentMonth });

        if (studentsError) {
          console.error("Error fetching student birthdays:", studentsError);
        } else if (studentsData) {
          studentsData.forEach((student: any) => {
            const birthDate = new Date(student.birth_date);
            results.push({
              id: student.id,
              name: student.name,
              birth_date: student.birth_date,
              day: birthDate.getDate(),
              type: 'student',
              polo_name: student.polo_name
            });
          });
        }

        // Fetch staff (coordinators, instructors) birthdays from profiles
        const { data: staffData, error: staffError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            birth_date,
            role_id,
            roles:role_id (name)
          `)
          .not('birth_date', 'is', null)
          .eq('status', 'approved');

        if (staffError) {
          console.error("Error fetching staff birthdays:", staffError);
        } else if (staffData) {
          staffData.forEach((profile: any) => {
            if (profile.birth_date) {
              const birthDate = new Date(profile.birth_date);
              const birthMonth = birthDate.getMonth() + 1;
              
              // Only include if birth month matches current month
              if (birthMonth === currentMonth) {
                results.push({
                  id: profile.id,
                  name: profile.full_name || 'Usuário',
                  birth_date: profile.birth_date,
                  day: birthDate.getDate(),
                  type: 'staff',
                  role: profile.roles?.name || 'Equipe'
                });
              }
            }
          });
        }

        // Sort by day of month
        results.sort((a, b) => a.day - b.day);
        setBirthdays(results);
      } catch (error) {
        console.error("Error fetching birthdays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, []);

  const isBirthdayToday = (birthDate: string) => {
    const today = new Date();
    const birthday = new Date(birthDate);
    return birthday.getDate() === today.getDate() && 
           birthday.getMonth() === today.getMonth();
  };

  const currentMonth = format(new Date(), "MMMM", { locale: ptBR });

  if (loading) {
    return (
      <Card className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border-border overflow-hidden">
      {/* Decorative header */}
      <div className="h-2 bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400" />
      
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cake className="h-5 w-5 text-pink-500" />
          Aniversariantes
          <Badge variant="secondary" className="ml-auto capitalize">
            {currentMonth}
          </Badge>
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Gift className="h-3 w-3" />
          {birthdays.length} {birthdays.length === 1 ? "aniversariante" : "aniversariantes"} este mês
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {birthdays.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum aniversariante este mês</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-2">
            <AnimatePresence>
              <div className="space-y-2">
                {birthdays.map((person, index) => {
                  const isToday = isBirthdayToday(person.birth_date);
                  
                  return (
                    <motion.div
                      key={`${person.type}-${person.id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg transition-all
                        ${isToday 
                          ? "bg-gradient-to-r from-pink-500/10 via-orange-400/10 to-yellow-400/10 border border-pink-500/30 shadow-sm" 
                          : "bg-muted/30 hover:bg-muted/50"
                        }
                      `}
                    >
                      {/* Day badge */}
                      <div className={`
                        flex flex-col items-center justify-center w-12 h-12 rounded-lg shrink-0
                        ${isToday 
                          ? "bg-gradient-to-br from-pink-500 to-orange-400 text-white" 
                          : "bg-primary/10 text-primary"
                        }
                      `}>
                        <span className="text-lg font-bold leading-none">
                          {person.day}
                        </span>
                        <span className="text-[10px] uppercase opacity-80">
                          {format(new Date(person.birth_date), "MMM", { locale: ptBR })}
                        </span>
                      </div>

                      {/* Person info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground truncate">
                            {person.name}
                          </span>
                          {isToday && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            >
                              <Sparkles className="h-4 w-4 text-yellow-500" />
                            </motion.div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {person.type === 'student' ? (
                            <>
                              <User className="h-3 w-3" />
                              <span>Aluno</span>
                              {person.polo_name && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{person.polo_name}</span>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <Users className="h-3 w-3" />
                              <span className="capitalize">{person.role}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Today indicator */}
                      {isToday && (
                        <Badge className="bg-gradient-to-r from-pink-500 to-orange-400 text-white border-0 shrink-0">
                          Hoje! 🎉
                        </Badge>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
