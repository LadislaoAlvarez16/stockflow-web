import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { stockApi, warehousesApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MovementDrawer } from '@/components/MovementDrawer';
import { TransferDrawer } from '@/components/TransferDrawer';
import { PackageSearch, ArrowRightLeft, Plus } from 'lucide-react';

interface Warehouse {
  id: string;
  name: string;
}

interface StockItem {
  productId: string;
  warehouseId: string;
  quantity: number;
  product: {
    sku: string;
    name: string;
    minStock: number;
  };
  warehouse: {
    name: string;
  };
}

export default function Stock() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [isMovementOpen, setIsMovementOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // Filtros desde URL
  const search = searchParams.get('search') || '';
  const warehouseId = searchParams.get('warehouseId') || '';
  const lowStock = searchParams.get('lowStock') === 'true';

  const fetchWarehouses = async () => {
    try {
      const res = await warehousesApi.getWarehouses();
      setWarehouses(res.data); // Asume que retorna { data: [...] } o [...] dependiendo de la respuesta.
      // Ajuste rápido por si el backend devuelve un array directamente
      if (Array.isArray(res)) {
        setWarehouses(res);
      } else if (res.data && Array.isArray(res.data)) {
        setWarehouses(res.data);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (warehouseId) params.warehouseId = warehouseId;
      if (lowStock) params.lowStock = true;

      const res = await stockApi.getStocks(params);
      setStocks(res.data || []);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [search, warehouseId, lowStock]);

  const updateSearchParam = (key: string, value: string | boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maestro de Stock</h1>
          <p className="text-muted-foreground">Consulta y gestiona el inventario en tiempo real.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsTransferOpen(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" /> Transferencia
          </Button>
          <Button onClick={() => setIsMovementOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Movimiento
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="search">Buscar (SKU o Nombre)</Label>
              <div className="relative">
                <PackageSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Ej: LAP-001"
                  className="pl-8"
                  value={search}
                  onChange={(e) => updateSearchParam('search', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="warehouse">Depósito</Label>
              <select
                id="warehouse"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                value={warehouseId}
                onChange={(e) => updateSearchParam('warehouseId', e.target.value)}
              >
                <option value="">Todos los depósitos</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2 h-10 px-2">
              <input
                type="checkbox"
                id="lowStock"
                className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-950"
                checked={lowStock}
                onChange={(e) => updateSearchParam('lowStock', e.target.checked)}
              />
              <Label htmlFor="lowStock" className="cursor-pointer">Solo stock crítico</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Depósito</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Mínimo</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Cargando stock...</TableCell>
                </TableRow>
              ) : stocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No se encontraron registros de stock que coincidan con los filtros.
                  </TableCell>
                </TableRow>
              ) : (
                stocks.map((item) => (
                  <TableRow key={`${item.productId}-${item.warehouseId}`}>
                    <TableCell className="font-medium">{item.product.sku}</TableCell>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>{item.warehouse.name}</TableCell>
                    <TableCell className="text-right font-bold">{Number(item.quantity)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{Number(item.product.minStock)}</TableCell>
                    <TableCell className="text-center">
                      {Number(item.quantity) <= Number(item.product.minStock) ? (
                        <Badge variant="destructive">Crítico</Badge>
                      ) : (
                        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white">OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MovementDrawer
        isOpen={isMovementOpen}
        onClose={() => setIsMovementOpen(false)}
        onSuccess={fetchStocks}
        warehouses={warehouses}
      />
      
      <TransferDrawer
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSuccess={fetchStocks}
        warehouses={warehouses}
      />
    </div>
  );
}
