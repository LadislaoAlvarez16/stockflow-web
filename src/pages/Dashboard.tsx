import { useEffect, useState } from 'react';
import { dashboardApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, Warehouse, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SummaryData {
  activeProducts: number;
  activeWarehouses: number;
  todayMovements: number;
  lowStockCount: number;
}

interface RecentMovement {
  id: string;
  type: 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: string;
  createdAt: string;
  product: { sku: string; name: string };
  warehouse: { name: string };
  createdBy: { name: string };
}

interface LowStockItem {
  currentQuantity: string;
  minStock: string;
  productName: string;
  sku: string;
  warehouseName: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [movements, setMovements] = useState<RecentMovement[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, movementsRes, lowStockRes] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getRecentMovements(),
          dashboardApi.getLowStock(),
        ]);
        
        setSummary(summaryRes);
        setMovements(movementsRes);
        setLowStock(lowStockRes);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error de carga',
          description: 'No se pudieron cargar las métricas del dashboard.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'INBOUND': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'OUTBOUND': return 'bg-rose-500 hover:bg-rose-600';
      case 'TRANSFER': return 'bg-blue-500 hover:bg-blue-600';
      case 'ADJUSTMENT': return 'bg-amber-500 hover:bg-amber-600';
      default: return 'bg-slate-500 hover:bg-slate-600';
    }
  };

  const getProgressWidth = (current: string | number, min: string | number) => {
    const c = Number(current);
    const m = Number(min);
    if (m === 0) return '0%';
    const pct = Math.min((c / m) * 100, 100);
    return `${pct}%`;
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-50"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Productos Activos</CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.activeProducts || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Depósitos Activos</CardTitle>
            <Warehouse className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.activeWarehouses || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Stock Crítico</CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-500">{summary?.lowStockCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Movimientos Hoy</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.todayMovements || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
        {/* Tabla Movimientos Recientes */}
        <Card className="md:col-span-4 lg:col-span-5 overflow-hidden">
          <CardHeader>
            <CardTitle>Últimos Movimientos</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Depósito</TableHead>
                  <TableHead className="text-right">Cant.</TableHead>
                  <TableHead className="hidden md:table-cell">Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-6">
                      No hay movimientos recientes
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="whitespace-nowrap font-medium text-slate-600 dark:text-slate-400">
                        {new Date(movement.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getBadgeColor(movement.type)} text-white border-transparent`}>
                          {movement.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{movement.product.sku}</div>
                      </TableCell>
                      <TableCell>{movement.warehouse.name}</TableCell>
                      <TableCell className="text-right font-semibold">{movement.quantity}</TableCell>
                      <TableCell className="hidden md:table-cell text-slate-500">{movement.createdBy.name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Lista de Stock Crítico */}
        <Card className="md:col-span-3 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-rose-600 dark:text-rose-500">Alertas de Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {lowStock.length === 0 ? (
                <div className="text-center text-sm text-slate-500 py-4">No hay productos en estado crítico.</div>
              ) : (
                lowStock.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-medium text-slate-900 dark:text-slate-100 truncate pr-2" title={item.productName}>
                        {item.sku}
                      </div>
                      <span className="font-bold text-rose-600 dark:text-rose-500">{item.currentQuantity} / {item.minStock}</span>
                    </div>
                    <div className="text-xs text-slate-500">{item.warehouseName}</div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div 
                        className="h-full rounded-full bg-rose-500 transition-all duration-500" 
                        style={{ width: getProgressWidth(item.currentQuantity, item.minStock) }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
