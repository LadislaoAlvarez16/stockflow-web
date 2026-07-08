import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { 
  webhooksService, 
  WebhookSubscription, 
  WebhookEvent, 
  WebhookDelivery 
} from '@/services/webhooks.service';

export const useWebhooks = () => {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
  const [currentWebhook, setCurrentWebhook] = useState<WebhookSubscription | null>(null);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDeliveries, setIsFetchingDeliveries] = useState(false);

  const fetchWebhooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await webhooksService.getWebhooks();
      setWebhooks(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al cargar webhooks",
        description: error.response?.data?.message || "No se pudieron cargar las suscripciones.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchWebhook = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const data = await webhooksService.getWebhook(id);
      setCurrentWebhook(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al cargar el webhook",
        description: error.response?.data?.message || "No se pudo cargar la suscripción.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await webhooksService.getEvents();
      setEvents(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al cargar eventos",
        description: "No se pudieron cargar los eventos disponibles.",
      });
    }
  }, [toast]);

  const createWebhook = async (url: string, selectedEvents: string[]): Promise<WebhookSubscription | null> => {
    setIsLoading(true);
    try {
      const data = await webhooksService.createWebhook(url, selectedEvents);
      setWebhooks((prev) => [data, ...prev]);
      return data; // Retorna el webhook con el secret
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al crear webhook",
        description: error.response?.data?.message || "Ocurrió un error al crear la suscripción.",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateWebhook = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await webhooksService.deactivateWebhook(id);
      setWebhooks((prev) => prev.map((w) => (w.id === id ? data : w)));
      if (currentWebhook?.id === id) {
        setCurrentWebhook(data);
      }
      toast({
        title: "Webhook desactivado",
        description: "La suscripción ha sido desactivada exitosamente.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "No se pudo desactivar el webhook.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testWebhook = async (id: string) => {
    try {
      await webhooksService.testWebhook(id);
      toast({
        title: "Prueba encolada",
        description: "Se ha disparado un evento de prueba en BullMQ.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al probar webhook",
        description: error.response?.data?.message || "No se pudo enviar el evento de prueba.",
      });
    }
  };

  const fetchDeliveries = useCallback(async (id: string, isLoadMore = false) => {
    if (isFetchingDeliveries) return;
    
    setIsFetchingDeliveries(true);
    try {
      const cursor = isLoadMore ? nextCursor : undefined;
      const response = await webhooksService.getDeliveries(id, cursor || undefined);
      
      if (isLoadMore) {
        setDeliveries((prev) => {
          // Filtrar duplicados por si acaso el cursor devuelve algo repetido
          const existingIds = new Set(prev.map(d => d.id));
          const newDeliveries = response.data.filter(d => !existingIds.has(d.id));
          return [...prev, ...newDeliveries];
        });
      } else {
        setDeliveries(response.data);
      }
      
      setNextCursor(response.nextCursor);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al cargar entregas",
        description: "No se pudo cargar el historial de entregas.",
      });
    } finally {
      setIsFetchingDeliveries(false);
    }
  }, [nextCursor, isFetchingDeliveries, toast]);

  return {
    webhooks,
    currentWebhook,
    events,
    deliveries,
    nextCursor,
    isLoading,
    isFetchingDeliveries,
    fetchWebhooks,
    fetchWebhook,
    fetchEvents,
    createWebhook,
    deactivateWebhook,
    testWebhook,
    fetchDeliveries,
  };
};
