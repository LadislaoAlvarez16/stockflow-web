import { useState, useEffect } from 'react';
import { physicalInventoryApi } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../components/ui/sheet';
import { useNavigate } from 'react-router-dom';

export default function PhysicalInventoryList() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorLogData, setErrorLogData] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await physicalInventoryApi.getSessions();
      setSessions(data);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error al cargar inventarios",
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleViewError = (errorLog: any) => {
    setErrorLogData(errorLog);
    setIsSheetOpen(true);
  };

  const handleDownloadReport = async (sessionId: string) => {
    try {
      await physicalInventoryApi.downloadSessionReport(sessionId);
      toast({
        title: "Reporte Generado",
        description: "La descarga ha comenzado.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error al descargar",
        description: err.response?.data?.message || err.message,
      });
    }
  };

  const renderStatus = (status: string) => {
    switch(status) {
      case 'processing': return <Badge variant="outline" className="bg-blue-100 text-blue-800">Procesando</Badge>;
      case 'completed': return <Badge variant="outline" className="bg-green-100 text-green-800">Completado</Badge>;
      case 'completed_with_differences': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Con Diferencias</Badge>;
      case 'completed_with_errors': return <Badge variant="outline" className="bg-red-100 text-red-800">Con Errores</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario Físico</h1>
          <p className="text-muted-foreground">Historial de cargas de inventario y reconciliación.</p>
        </div>
        <Button onClick={() => navigate('/physical-inventory/upload')}>
          Subir Inventario Físico
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Depósito</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total Ítems</TableHead>
              <TableHead className="text-right">Diferencias</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center h-24">Cargando...</TableCell></TableRow>
            ) : sessions.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center h-24">No hay sesiones registradas.</TableCell></TableRow>
            ) : (
              sessions.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{s.warehouse?.name || 'Desconocido'}</TableCell>
                  <TableCell>{renderStatus(s.status)}</TableCell>
                  <TableCell className="text-right">{s.totalItems}</TableCell>
                  <TableCell className="text-right">{s.adjustedItems}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {s.status !== 'processing' && (
                        <Button variant="outline" size="sm" onClick={() => handleDownloadReport(s.id)}>
                          Descargar PDF
                        </Button>
                      )}
                      {s.status === 'completed_with_errors' && (
                        <Button variant="destructive" size="sm" onClick={() => handleViewError(s.errorLog)}>
                          Ver Errores
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Log de Errores</SheetTitle>
            <SheetDescription>
              Detalle de las filas que no pudieron ser procesadas.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-x-auto">
              {JSON.stringify(errorLogData, null, 2)}
            </pre>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
