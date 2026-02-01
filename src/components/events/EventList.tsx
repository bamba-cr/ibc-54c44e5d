import { format, isToday, isTomorrow, isPast, isThisWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';
import { EVENT_TYPE_COLORS, EventType } from './EventTypeColors';

interface Event {
  id: string;
  title: string;
  date: Date;
  type: EventType;
  description?: string;
}

interface EventListProps {
  events: Event[];
  onDelete: (eventId: string) => void;
}

const groupEventsByDate = (events: Event[]) => {
  const sorted = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  const groups: { label: string; events: Event[]; isPast: boolean }[] = [];
  const today: Event[] = [];
  const tomorrow: Event[] = [];
  const thisWeek: Event[] = [];
  const upcoming: Event[] = [];
  const past: Event[] = [];

  sorted.forEach(event => {
    const eventDate = event.date;
    if (isToday(eventDate)) {
      today.push(event);
    } else if (isTomorrow(eventDate)) {
      tomorrow.push(event);
    } else if (isPast(eventDate)) {
      past.push(event);
    } else if (isThisWeek(eventDate)) {
      thisWeek.push(event);
    } else {
      upcoming.push(event);
    }
  });

  if (today.length > 0) {
    groups.push({ label: 'Hoje', events: today, isPast: false });
  }
  if (tomorrow.length > 0) {
    groups.push({ label: 'Amanhã', events: tomorrow, isPast: false });
  }
  if (thisWeek.length > 0) {
    groups.push({ label: 'Esta Semana', events: thisWeek, isPast: false });
  }
  if (upcoming.length > 0) {
    groups.push({ label: 'Próximos', events: upcoming, isPast: false });
  }
  if (past.length > 0) {
    groups.push({ label: 'Passados', events: past, isPast: true });
  }

  return groups;
};

export const EventList = ({ events, onDelete }: EventListProps) => {
  const groupedEvents = groupEventsByDate(events);

  if (events.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p>Nenhum evento cadastrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
      <AnimatePresence>
        {groupedEvents.map((group, groupIndex) => (
          <motion.div
            key={group.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={`text-xs font-medium ${group.isPast ? 'opacity-60' : ''}`}
              >
                {group.label}
              </Badge>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-2">
              {group.events.map((event, index) => {
                const typeConfig = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.meeting;
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-all ${
                      group.isPast ? 'opacity-60' : ''
                    }`}
                    style={{ borderLeft: `4px solid ${typeConfig.bg}` }}
                  >
                    <div className="flex-shrink-0 text-xl">
                      {typeConfig.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{event.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {format(event.date, "dd 'de' MMM", { locale: ptBR })}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs border ${typeConfig.className}`}
                        >
                          {typeConfig.label}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {event.description}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-8 w-8"
                      onClick={() => onDelete(event.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
