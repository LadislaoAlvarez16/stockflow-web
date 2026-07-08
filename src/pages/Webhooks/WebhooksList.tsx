import { useEffect, useState } from 'react';
import { useWebhooks } from '@/hooks/useWebhooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Settings, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CreateWebhookSheet } from './components/CreateWebhookSheet';
import { SecretRevealModal } from './components/SecretRevealModal';
import { Link } from 'react-router-dom';

export default function WebhooksList() {
  const { 
    webhooks, 
    events, 
    isLoading, 
    fetchWebhooks, 
    fetchEvents, 
    createWebhook 
  } = useWebhooks();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);

  useEffect(() => {
    fetchWebhooks();
    fetchEvents();
  }, [fetchWebhooks, fetchEvents]);

  const handleCreateSubmit = async (url: string, selectedEvents: string[]) => {
    const newWebhook = await createWebhook(url, selectedEvents);
    if (newWebhook && newWebhook.secret) {
      setIsSheetOpen(false); // Close the sheet immediately
      setRevealedSecret(newWebhook.secret); // Open the secret modal
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Webhooks
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Administrá las suscripciones para notificaciones en tiempo real.
          </p>
        </div>
        <Button onClick={() => setIsSheetOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Nueva Suscripción
        </Button>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 bg-white/50 backdrop-blur-sm dark:bg-slate-950/50">
        <CardHeader>
          <CardTitle>Suscripciones Activas</CardTitle>
          <CardDescription>Listado de endpoints registrados en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>URL Destino</TableHead>
                  <TableHead>Eventos</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && webhooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Cargando webhooks...
                    </TableCell>
                  </TableRow>
                ) : webhooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No hay suscripciones activas.
                    </TableCell>
                  </TableRow>
                ) : (
                  webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <Badge variant={webhook.isActive ? "default" : "secondary"} className={webhook.isActive ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                          {webhook.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm max-w-[200px] truncate" title={webhook.url}>
                        {webhook.url}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs bg-slate-50 dark:bg-slate-900">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {format(new Date(webhook.createdAt), "d MMM yyyy", { locale: es })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/webhooks/${webhook.id}`}>
                          <Button variant="ghost" size="sm">
                            <Settings className="mr-2 h-4 w-4" /> Detalle
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreateWebhookSheet 
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSubmit={handleCreateSubmit}
        events={events}
        isLoading={isLoading}
      />

      <SecretRevealModal 
        isOpen={!!revealedSecret}
        secret={revealedSecret || ''}
        onClose={() => setRevealedSecret(null)}
      />
    </div>
  );
}
