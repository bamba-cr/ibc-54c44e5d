
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'color'>>({
    title: '',
    date: new Date(),
    type: 'meeting',
    description: ''
  });
  
  const { toast } = useToast();

  // Carregar eventos do banco de dados
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Aqui seria a chamada para obter eventos do usuário
        // Quando implementado com autenticação, deve usar o user.id real
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          const formattedEvents = data.map(event => ({
            id: event.id,
            title: event.title,
            date: new Date(event.date),
            type: event.type as 'meeting' | 'task' | 'reminder',
            description: event.description,
            color: ['#4CAF50', '#2196F3', '#FFC107', '#E91E63'][Math.floor(Math.random() * 4)]
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        toast({
          title: "Erro ao carregar eventos",
          description: "Não foi possível carregar seus eventos. Tente novamente mais tarde.",
          variant: "destructive"
        });
      }
    };
    
    fetchEvents();
  }, [toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setNewEvent(prev => ({ ...prev, type: value as 'meeting' | 'task' | 'reminder' }));
  };

  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O título do evento é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Criar evento no banco de dados
      // Quando implementado com autenticação, deve usar auth.user().id
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: newEvent.title,
          date: newEvent.date.toISOString(),
          type: newEvent.type,
          description: newEvent.description,
          user_id: '00000000-0000-0000-0000-000000000000' // Placeholder, será substituído pelo ID do usuário autenticado
        })
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        const newEventWithId: Event = {
          ...newEvent,
          id: data[0].id,
          color: ['#4CAF50', '#2196F3', '#FFC107', '#E91E63'][Math.floor(Math.random() * 4)]
        };
        
        setEvents(prev => [newEventWithId, ...prev]);
        
        toast({
          title: "Evento adicionado",
          description: `${newEvent.title} foi adicionado ao calendário.`
        });
        
        // Resetar formulário
        setNewEvent({
          title: '',
          date: new Date(),
          type: 'meeting',
          description: ''
        });
        
        setOpenDialog(false);
      }
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o evento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
        
      if (error) throw error;
      
      setEvents(prev => prev.filter(e => e.id !== eventId));
      
      toast({
        title: "Evento removido",
        description: "O evento foi removido com sucesso."
      });
    } catch (error) {
      console.error('Erro ao remover evento:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o evento. Tente novamente.",
        variant: "destructive"
      });
    }
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
              onSelect={(newDate) => newDate && setDate(newDate)} 
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
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Eventos
              </div>
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="ml-auto">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Novo Evento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Evento</DialogTitle>
                    <DialogDescription>
                      Preencha os detalhes do evento abaixo.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Título
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={newEvent.title}
                        onChange={handleInputChange}
                        className="col-span-3"
                        placeholder="Digite o título do evento"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        Tipo
                      </Label>
                      <Select
                        value={newEvent.type}
                        onValueChange={handleTypeChange}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="meeting">Reunião</SelectItem>
                          <SelectItem value="task">Tarefa</SelectItem>
                          <SelectItem value="reminder">Lembrete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        Data
                      </Label>
                      <div className="col-span-3">
                        <Input
                          id="date"
                          type="date"
                          value={format(newEvent.date, 'yyyy-MM-dd')}
                          onChange={(e) => setNewEvent(prev => ({ 
                            ...prev, 
                            date: new Date(e.target.value) 
                          }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Descrição
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={newEvent.description || ''}
                        onChange={handleInputChange}
                        className="col-span-3"
                        placeholder="Descreva o evento"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      onClick={handleAddEvent}
                      disabled={loading}
                    >
                      {loading ? "Adicionando..." : "Adicionar Evento"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>Atividades programadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              <AnimatePresence>
                {events.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Nenhum evento cadastrado
                  </div>
                ) : (
                  events.map((event, index) => (
                    <motion.div 
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-all"
                      style={{ borderLeft: `4px solid ${event.color}` }}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-gray-500">
                          {format(event.date, 'dd/MM/yyyy')}
                          {event.description && (
                            <span className="block mt-1 text-xs">
                              {event.description.substring(0, 60)}
                              {event.description.length > 60 ? '...' : ''}
                            </span>
                          )}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
