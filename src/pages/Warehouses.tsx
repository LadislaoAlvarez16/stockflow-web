import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { warehousesApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Ban, PackageSearch } from 'lucide-react';
import WarehouseDrawer from '@/components/WarehouseDrawer';

interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  manager: string | null;
  isActive: boolean;
}

export default function Warehouses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await warehousesApi.getWarehouses();
      setWarehouses(res.data || res); // Dependiendo si devuelve metadata o array directo
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas desactivar el depósito ${name}? Ya no recibirá movimientos.`)) {
      return;
    }

    try {
      await warehousesApi.deactivateWarehouse(id);
      toast({ title: 'Desactivado', description: `El depósito ${name} fue desactivado correctamente.` });
      fetchWarehouses();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de permisos o servidor',
        description: error.response?.data?.message || 'No se pudo desactivar el depósito.',
      });
    }
  };

  const Skeletons = () => (
    <>
      {[1, 2, 3].map(i => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Depósitos y Sucursales</h1>
          <p className="text-muted-foreground">Administra las ubicaciones físicas o virtuales de tu red de inventario.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Depósito
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Listado de Depósitos</CardTitle>
        </CardHeader>
        <CardContent className="p-0 border-t">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <Skeletons />
                ) : warehouses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No hay depósitos registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  warehouses.map((item) => (
                    <TableRow key={item.id} className={!item.isActive ? 'bg-slate-50 opacity-60' : ''}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{item.manager || '-'}</TableCell>
                      <TableCell className="text-center">
                        {item.isActive ? (
                          <Badge className="bg-emerald-500">Activo</Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => navigate(`/stock?warehouseId=${item.id}`)}
                          >
                            <PackageSearch className="w-4 h-4 mr-2" />
                            Ver Inventario
                          </Button>

                          {user?.role === 'ADMIN' && item.isActive && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeactivate(item.id, item.name)}
                              title="Desactivar depósito"
                            >
                              <Ban className="h-4 w-4" />
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
        </CardContent>
      </Card>

      <WarehouseDrawer 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen} 
        onSuccess={fetchWarehouses} 
      />
    </div>
  );
}
