import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, PlusCircle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { BulkEventImport } from '@/components/events/BulkEventImport';
import { EventList } from '@/components/events/EventList';
import { EVENT_TYPE_COLORS, EventType } from '@/components/events/EventTypeColors';

interface Event {
  id: string;
  title: string;
  date: Date;
  type: EventType;
  description?: string;
}

export const CalendarSection = () => {
  const { profile } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    date: new Date(),
    type: 'meeting',
    description: ''
  });

  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      
      let query = supabase.from('events').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.order('date', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        const formattedEvents = data.map(event => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date),
          type: event.type as EventType,
          description: event.description
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setNewEvent(prev => ({ ...prev, type: value as EventType }));
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
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: newEvent.title,
          date: format(newEvent.date, 'yyyy-MM-dd'),
          type: newEvent.type,
          description: newEvent.description,
          user_id: userId || '00000000-0000-0000-0000-000000000000'
        })
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        const newEventWithId: Event = {
          ...newEvent,
          id: data[0].id
        };
        
        setEvents(prev => [...prev, newEventWithId].sort((a, b) => a.date.getTime() - b.date.getTime()));
        
        toast({
          title: "Evento adicionado",
          description: `${newEvent.title} foi adicionado ao calendário.`
        });
        
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

  const canBulkImport = profile?.is_admin || profile?.role === 'coordenador';

  return (
    <Tabs defaultValue="calendar" className="h-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <TabsList>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          {canBulkImport && (
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importar
            </TabsTrigger>
          )}
        </TabsList>
      </div>
      
      {/* Event Type Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(EVENT_TYPE_COLORS).map(([type, config]) => (
          <Badge key={type} variant="outline" className={`text-xs ${config.className}`}>
            {config.icon} {config.label}
          </Badge>
        ))}
      </div>

      <TabsContent value="calendar" className="mt-0">
        <div className="grid gap-4 md:grid-cols-2 h-full">
      <Card className="shadow-lg bg-card/60 dark:bg-card/40 backdrop-blur-sm border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Calendário
          </CardTitle>
          <CardDescription>Selecione uma data</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar 
            mode="single" 
            selected={date} 
            onSelect={(newDate) => newDate && setDate(newDate)} 
            className="rounded-md border border-border" 
          />
        </CardContent>
      </Card>

      <Card className="shadow-lg bg-card/60 dark:bg-card/40 backdrop-blur-sm border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Eventos
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="ml-auto">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Novo
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
                        name="date"
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
          <EventList events={events} onDelete={handleDeleteEvent} />
        </CardContent>
      </Card>
    </div>
      </TabsContent>

      {canBulkImport && (
        <TabsContent value="import" className="mt-0">
          <BulkEventImport />
        </TabsContent>
      )}
    </Tabs>
  );
};
