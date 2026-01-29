import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Cake, Gift, Sparkles, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface BirthdayStudent {
  id: string;
  name: string;
  birth_date: string;
  age: number | null;
  polo_name: string | null;
  city_name: string | null;
}

export const BirthdayWidget = () => {
  const [students, setStudents] = useState<BirthdayStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const currentMonth = new Date().getMonth() + 1;
        
        const { data, error } = await supabase
          .rpc('get_birthday_students', { month_param: currentMonth });

        if (error) throw error;
        setStudents(data || []);
      } catch (error) {
        console.error("Error fetching birthday students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const isBirthdayToday = (birthDate: string) => {
    const today = new Date();
    const birthday = new Date(birthDate);
    return birthday.getDate() === today.getDate() && 
           birthday.getMonth() === today.getMonth();
  };

  const getDayFromDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
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
          {students.length} {students.length === 1 ? "aniversariante" : "aniversariantes"} este mês
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum aniversariante este mês</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-2">
            <AnimatePresence>
              <div className="space-y-2">
                {students
                  .sort((a, b) => getDayFromDate(a.birth_date) - getDayFromDate(b.birth_date))
                  .map((student, index) => {
                    const isToday = isBirthdayToday(student.birth_date);
                    
                    return (
                      <motion.div
                        key={student.id}
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
                            {getDayFromDate(student.birth_date)}
                          </span>
                          <span className="text-[10px] uppercase opacity-80">
                            {format(new Date(student.birth_date), "MMM", { locale: ptBR })}
                          </span>
                        </div>

                        {/* Student info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground truncate">
                              {student.name}
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
                            {student.age && (
                              <span>
                                {isToday ? `Faz ${student.age + 1} anos hoje!` : `${student.age} anos`}
                              </span>
                            )}
                            {student.polo_name && (
                              <>
                                <span>•</span>
                                <span className="truncate">{student.polo_name}</span>
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
