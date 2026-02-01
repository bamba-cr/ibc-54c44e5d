// Color scheme for event types
export const EVENT_TYPE_COLORS = {
  meeting: {
    bg: 'hsl(var(--primary))',
    label: 'Reunião',
    icon: '🤝',
    className: 'bg-primary/10 text-primary border-primary/30'
  },
  task: {
    bg: 'hsl(142, 76%, 36%)',
    label: 'Tarefa',
    icon: '✅',
    className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30'
  },
  reminder: {
    bg: 'hsl(38, 92%, 50%)',
    label: 'Lembrete',
    icon: '⏰',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
  }
} as const;

export type EventType = keyof typeof EVENT_TYPE_COLORS;

export const getEventColor = (type: EventType) => {
  return EVENT_TYPE_COLORS[type] || EVENT_TYPE_COLORS.meeting;
};
