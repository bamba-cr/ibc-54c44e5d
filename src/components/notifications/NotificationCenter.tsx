import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Check, X, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Simulando notificações por enquanto - pode ser conectado a uma tabela real depois
  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "info",
      title: "Novo aluno cadastrado",
      message: "João Silva foi cadastrado no sistema",
      read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      type: "warning",
      title: "Baixa frequência",
      message: "Maria Santos tem presença inferior a 75%",
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "3",
      type: "success",
      title: "Backup concluído",
      message: "Backup automático realizado com sucesso",
      read: true,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const markAsRead = (id: string) => {
    // Implementar lógica para marcar como lida
    console.log("Marking notification as read:", id);
  };

  const markAllAsRead = () => {
    // Implementar lógica para marcar todas como lidas
    console.log("Marking all notifications as read");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <TooltipWrapper content={`${unreadCount > 0 ? `${unreadCount} notificações não lidas` : 'Nenhuma notificação nova'}`}>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </TooltipWrapper>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Notificações</h4>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {mockNotifications.length > 0 ? (
                mockNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      notification.read 
                        ? "bg-muted/30" 
                        : "bg-background hover:bg-muted/50"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-2">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            notification.read ? "text-muted-foreground" : ""
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(notification.created_at), "dd/MM 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};