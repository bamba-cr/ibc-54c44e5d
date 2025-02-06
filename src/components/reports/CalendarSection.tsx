
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Trash2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'meeting' | 'task' | 'reminder';
  description?: string;
  color?: string;
}

export const CalendarSection = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const { toast } = useToast();

  const handleAddEvent = (newEvent: Omit<Event, 'id'>) => {
    const event: Event = {
      ...newEvent,
      id: Math.random().toString(36).substr(2, 9),
      color: ['#4CAF50', '#2196F3', '#FFC107', '#E91E63'][Math.floor(Math.random() * 4)]
    };
    setEvents(prev => [...prev, event]);
    toast({
      title: "Evento adicionado",
      description: `${event.title} foi adicionado ao calendário.`
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Calendário de Atividades
            </CardTitle>
            <CardDescription>Gerencie eventos e compromissos</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar 
              mode="single" 
              selected={date} 
              onSelect={setDate} 
              className="rounded-md border" 
            />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Eventos
            </CardTitle>
            <CardDescription>Atividades programadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {events.map((event, index) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-all"
                    style={{ borderLeft: `4px solid ${event.color}` }}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-500">
                        {event.date.toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setEvents(prev => prev.filter(e => e.id !== event.id));
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <Button 
                className="w-full bg-primary hover:bg-primary/90 transition-colors" 
                onClick={() => handleAddEvent({ 
                  date: new Date(), 
                  title: "Novo Evento", 
                  type: "meeting",
                  description: "Descrição do evento"
                })}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Evento
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
