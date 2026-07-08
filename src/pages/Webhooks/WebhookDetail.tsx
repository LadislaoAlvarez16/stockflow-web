import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { ArrowLeft, Send, Activity, Clock, ServerCrash, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function WebhookDetail() {
  const { id } = useParams<{ id: string }>();
  const { 
    currentWebhook, 
    deliveries, 
    isLoading, 
    isFetchingDeliveries,
    nextCursor,
    fetchWebhook, 
    fetchDeliveries,
    testWebhook,
    deactivateWebhook
  } = useWebhooks();

  useEffect(() => {
    if (id) {
      fetchWebhook(id);
      fetchDeliveries(id); // Initial fetch
    }
  }, [id, fetchWebhook, fetchDeliveries]);

  const handleLoadMore = () => {
    if (id) {
      fetchDeliveries(id, true);
    }
  };

  const handleTest = () => {
    if (id) {
      testWebhook(id);
    }
  };

  const handleDeactivate = () => {
    if (id && currentWebhook?.isActive) {
      deactivateWebhook(id);
    }
  };

  if (isLoading && !currentWebhook) {
    return <div className="p-8 text-center text-slate-500">Cargando detalles...</div>;
  }

  if (!currentWebhook) {
    return <div className="p-8 text-center text-red-500">Webhook no encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/webhooks">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-3">
              Detalle del Webhook
              <Badge variant={currentWebhook.isActive ? "default" : "secondary"} className={currentWebhook.isActive ? "bg-emerald-500" : ""}>
                {currentWebhook.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-mono text-sm mt-1">
              {currentWebhook.url}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {currentWebhook.isActive && (
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDeactivate}>
              Desactivar
            </Button>
          )}
          <Button onClick={handleTest} disabled={!currentWebhook.isActive}>
            <Send className="mr-2 h-4 w-4" /> Enviar Test
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-blue-500" />
              Eventos Suscritos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {currentWebhook.events.map(ev => (
                <Badge key={ev} variant="secondary" className="bg-slate-100 dark:bg-slate-900">
                  {ev}
                </Badge>
              ))}
            </div>
            <div className="mt-6 space-y-2 text-sm text-slate-500">
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span>Fecha de creación</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {format(new Date(currentWebhook.createdAt), "dd/MM/yyyy HH:mm")}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span>ID</span>
                <span className="font-mono text-xs">{currentWebhook.id.split('-')[0]}...</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-amber-500" />
              Historial de Entregas (Auditoría)
            </CardTitle>
            <CardDescription>
              Registro de los envíos HTTP realizados a este endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Intento</TableHead>
                    <TableHead className="text-right">Duración</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.length === 0 && !isFetchingDeliveries ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No hay registros de entregas para este webhook.
                      </TableCell>
                    </TableRow>
                  ) : (
                    deliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {format(new Date(delivery.deliveredAt), "dd/MM HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{delivery.event}</Badge>
                        </TableCell>
                        <TableCell>
                          {delivery.statusCode ? (
                            <Badge className={
                              delivery.statusCode >= 200 && delivery.statusCode < 300 
                                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" 
                                : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                            } variant="outline">
                              {delivery.statusCode >= 200 && delivery.statusCode < 300 ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <ServerCrash className="mr-1 h-3 w-3" />}
                              HTTP {delivery.statusCode}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-500 border-red-200">Timeout/Fail</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{delivery.attemptNumber}</TableCell>
                        <TableCell className="text-right text-slate-500 font-mono text-sm">
                          {delivery.duration}ms
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {nextCursor && (
              <div className="mt-4 flex justify-center">
                <Button 
                  variant="secondary" 
                  onClick={handleLoadMore} 
                  disabled={isFetchingDeliveries}
                >
                  {isFetchingDeliveries ? 'Cargando...' : 'Cargar Más'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
