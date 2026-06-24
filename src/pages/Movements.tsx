import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { stockApi, productsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Product {
  id: string;
  sku: string;
  name: string;
}

interface Movement {
  id: string;
  createdAt: string;
  type: 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: string;
  reference: string;
  transactionId: string | null;
  product: {
    sku: string;
    name: string;
  };
  warehouse: {
    name: string;
  };
  createdBy: {
    name: string;
    email: string;
  };
}

export default function Movements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Filtros desde URL
  const dateFromStr = searchParams.get('dateFrom') || '';
  const dateToStr = searchParams.get('dateTo') || '';
  const type = searchParams.get('type') || '';
  const productId = searchParams.get('productId') || '';
  const transactionId = searchParams.get('transactionId') || '';

  const fetchProducts = async () => {
    try {
      const res = await productsApi.getProducts({ limit: 1000 });
      setProducts(Array.isArray(res.data) ? res.data : res);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchMovements = async (cursor?: string) => {
    if (!cursor) setLoading(true);
    else setLoadingMore(true);

    try {
      const params: any = { limit: 50 };
      
      if (dateFromStr) {
        const date = new Date(dateFromStr);
        if (!isNaN(date.getTime())) params.dateFrom = date.toISOString();
      }
      
      if (dateToStr) {
        const date = new Date(dateToStr);
        if (!isNaN(date.getTime())) params.dateTo = date.toISOString();
      }
      
      if (type) params.type = type;
      if (productId) params.productId = productId;
      if (transactionId) params.transactionId = transactionId;
      if (cursor) params.cursor = cursor;

      const res = await stockApi.getMovements(params);
      
      if (cursor) {
        setMovements(prev => [...prev, ...res.data]);
      } else {
        setMovements(res.data);
      }
      
      setNextCursor(res.meta.nextCursor);
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFromStr, dateToStr, type, productId, transactionId]);

  const updateSearchParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const getTypeBadge = (mType: string) => {
    switch (mType) {
      case 'INBOUND': return <Badge className="bg-emerald-500 hover:bg-emerald-600">INBOUND</Badge>;
      case 'OUTBOUND': return <Badge variant="destructive">OUTBOUND</Badge>;
      case 'TRANSFER': return <Badge className="bg-blue-500 hover:bg-blue-600">TRANSFER</Badge>;
      case 'ADJUSTMENT': return <Badge className="bg-amber-500 hover:bg-amber-600">ADJUSTMENT</Badge>;
      default: return <Badge variant="outline">{mType}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Historial de Movimientos</h1>
        <p className="text-muted-foreground">Registro inmutable de auditoría del inventario.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtros de Auditoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Desde</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFromStr}
                onChange={(e) => updateSearchParam('dateFrom', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Hasta</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateToStr}
                onChange={(e) => updateSearchParam('dateTo', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                value={type}
                onChange={(e) => updateSearchParam('type', e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="INBOUND">Ingreso</option>
                <option value="OUTBOUND">Egreso</option>
                <option value="TRANSFER">Transferencia</option>
                <option value="ADJUSTMENT">Ajuste</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="productId">Producto</Label>
              <select
                id="productId"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                value={productId}
                onChange={(e) => updateSearchParam('productId', e.target.value)}
              >
                <option value="">Todos los productos</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>[{p.sku}] {p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="w-full" onClick={clearFilters}>
                Limpiar
              </Button>
            </div>
          </div>
          {transactionId && (
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-md">
              <span>Filtrando por Transacción ID: <strong>{transactionId}</strong></span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100" onClick={() => updateSearchParam('transactionId', '')}>
                Quitar Filtro
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Depósito</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Referencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Cargando movimientos...</TableCell>
                  </TableRow>
                ) : movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron movimientos.
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell>{getTypeBadge(item.type)}</TableCell>
                      <TableCell>
                        <span className="font-medium">[{item.product.sku}]</span> {item.product.name}
                      </TableCell>
                      <TableCell>{item.warehouse.name}</TableCell>
                      <TableCell className="text-right font-bold">
                        {item.type === 'OUTBOUND' || (item.type === 'ADJUSTMENT' && item.quantity.toString().includes('-')) ? '-' : '+'}{Math.abs(Number(item.quantity))}
                      </TableCell>
                      <TableCell>{item.createdBy.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[150px]" title={item.reference}>{item.reference}</span>
                          {item.transactionId && (
                            <Badge 
                              variant="outline" 
                              className="cursor-pointer hover:bg-slate-100 border-blue-200 text-blue-700 bg-blue-50"
                              onClick={() => updateSearchParam('transactionId', item.transactionId!)}
                              title="Ver movimientos enlazados"
                            >
                              TRF
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {nextCursor && (
            <div className="p-4 border-t flex justify-center bg-slate-50/50">
              <Button 
                variant="outline" 
                onClick={() => fetchMovements(nextCursor)} 
                disabled={loadingMore}
              >
                {loadingMore ? 'Cargando...' : 'Cargar más movimientos'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
