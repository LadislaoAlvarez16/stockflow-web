import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Eye } from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  metadata: any;
  createdAt: string;
}

export default function AuditLogs() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  
  // Filtros
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [entity, setEntity] = useState('');
  const [userId, setUserId] = useState('');

  const fetchLogs = async (cursor?: string, reset: boolean = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (entity) params.append('entity', entity);
      if (userId) params.append('userId', userId);
      if (cursor) params.append('cursor', cursor);

      const response = await axios.get(`http://localhost:3000/audit-logs?${params.toString()}`);
      
      const { data, nextCursor: newCursor } = response.data;
      
      setLogs(prev => reset ? data : [...prev, ...data]);
      setNextCursor(newCursor);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los registros de auditoría',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(undefined, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(undefined, true);
  };

  const handleLoadMore = () => {
    if (nextCursor) {
      fetchLogs(nextCursor, false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-6 text-red-500 font-bold">Acceso Denegado. Solo administradores.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Trazabilidad de Auditoría</h1>

      <form onSubmit={handleFilter} className="bg-white p-4 rounded-md shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <Label>Desde</Label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <Label>Hasta</Label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div>
          <Label>Entidad</Label>
          <Input placeholder="Ej: PurchaseOrder" value={entity} onChange={e => setEntity(e.target.value)} />
        </div>
        <div>
          <Label>Usuario ID</Label>
          <Input placeholder="UUID del usuario" value={userId} onChange={e => setUserId(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading}>Filtrar</Button>
      </form>

      <div className="bg-white border rounded-md shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Entidad</TableHead>
              <TableHead>Registro (ID)</TableHead>
              <TableHead>Detalles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  {loading ? 'Cargando...' : 'No se encontraron registros.'}
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-mono">{log.userId}</TableCell>
                  <TableCell>
                    <span className="font-semibold bg-slate-100 px-2 py-1 rounded text-xs">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell>{log.entity || '-'}</TableCell>
                  <TableCell className="text-xs font-mono">{log.entityId || '-'}</TableCell>
                  <TableCell>
                    {log.metadata && Object.keys(log.metadata).length > 0 ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver JSON
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Metadata del Evento</DialogTitle>
                          </DialogHeader>
                          <pre className="bg-slate-950 text-green-400 p-4 rounded overflow-auto max-h-96 text-xs">
                            <code>{JSON.stringify(log.metadata, null, 2)}</code>
                          </pre>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Sin metadata</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {nextCursor && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Cargando...' : 'Cargar más registros'}
          </Button>
        </div>
      )}
    </div>
  );
}
