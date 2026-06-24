import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { alertsApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface Alert {
  id: string;
  createdAt: string;
  type: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  message: string;
  resolvedAt: string | null;
  product: {
    sku: string;
    name: string;
  };
  warehouse: {
    name: string;
  };
  resolvedBy: {
    name: string;
    email: string;
  } | null;
}

export default function Alerts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Paginación Offset simple
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filtros desde URL
  const status = searchParams.get('status') || '';

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (status) params.status = status;

      const res = await alertsApi.getAlerts(params);
      setAlerts(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const updateStatusFilter = (newStatus: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (!newStatus) newParams.delete('status');
    else newParams.set('status', newStatus);
    
    setPage(1); // Reset page on filter change
    setSearchParams(newParams);
  };

  const handleResolve = async (id: string) => {
    try {
      await alertsApi.resolveAlert(id);
      toast({ title: 'Éxito', description: 'Alerta marcada como resuelta.' });
      
      // Actualización optimista local
      setAlerts(prev => prev.map(a => 
        a.id === id ? { ...a, status: 'RESOLVED', resolvedAt: new Date().toISOString() } : a
      ));
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo resolver la alerta.',
      });
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'ACTIVE': return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1"/> Activa</Badge>;
      case 'ACKNOWLEDGED': return <Badge className="bg-amber-500 hover:bg-amber-600"><Clock className="w-3 h-3 mr-1"/> En Revisión</Badge>;
      case 'RESOLVED': return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle2 className="w-3 h-3 mr-1"/> Resuelta</Badge>;
      default: return <Badge variant="outline">{s}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Alertas</h1>
          <p className="text-muted-foreground">Gestión de quiebres de stock y anomalías.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Filtros</CardTitle>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${status === '' ? 'bg-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                onClick={() => updateStatusFilter('')}
              >
                Todas
              </button>
              <button 
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${status === 'ACTIVE' ? 'bg-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                onClick={() => updateStatusFilter('ACTIVE')}
              >
                Pendientes
              </button>
              <button 
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${status === 'RESOLVED' ? 'bg-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                onClick={() => updateStatusFilter('RESOLVED')}
              >
                Resueltas
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 border-t">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Depósito</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Cargando alertas...</TableCell>
                  </TableRow>
                ) : alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron alertas en esta vista.
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((item) => (
                    <TableRow key={item.id} className={item.status === 'ACTIVE' ? 'bg-red-50/30' : ''}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">[{item.product.sku}]</span> {item.product.name}
                      </TableCell>
                      <TableCell>{item.warehouse.name}</TableCell>
                      <TableCell className="max-w-xs truncate" title={item.message}>{item.message}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        {item.status !== 'RESOLVED' && user?.role !== 'VIEWER' ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                            onClick={() => handleResolve(item.id)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Resolver
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {item.status === 'RESOLVED' ? `Resuelto por ${item.resolvedBy?.name || 'Sistema'}` : '-'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="p-4 border-t flex justify-center gap-2 items-center bg-slate-50/50 text-sm">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1 || loading}
              >
                Anterior
              </Button>
              <span className="text-muted-foreground px-4">Página {page} de {totalPages}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages || loading}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
