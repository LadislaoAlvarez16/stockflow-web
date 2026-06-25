import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Ban } from 'lucide-react';
import ProductDrawer from '@/components/ProductDrawer';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  costPrice: string;
  minStock: string;
  isActive: boolean;
}

export default function Products() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;

      const res = await productsApi.getProducts(params);
      setProducts(res.data || res); // Dependiendo si el backend devuelve data + meta, o solo el array directo
      if (res.meta) setTotalPages(res.meta.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  const updateSearchParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value) newParams.delete(key);
    else newParams.set(key, value);
    
    if (key === 'search') newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas desactivar el producto ${name}? No se mostrará en las nuevas operaciones.`)) {
      return;
    }

    try {
      await productsApi.deactivateProduct(id);
      toast({ title: 'Desactivado', description: `El producto ${name} fue desactivado correctamente.` });
      fetchProducts();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de permisos o servidor',
        description: error.response?.data?.message || 'No se pudo desactivar el producto.',
      });
    }
  };

  const Skeletons = () => (
    <>
      {[1, 2, 3, 4, 5].map(i => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Productos</h1>
          <p className="text-muted-foreground">Administra los artículos, SKUs y precios de costo.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Listado de Productos</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Buscar por SKU o Nombre..."
                className="pl-9"
                value={search}
                onChange={(e) => updateSearchParam('search', e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 border-t">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Min. Stock</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <Skeletons />
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No se encontraron productos que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((item) => (
                    <TableRow key={item.id} className={!item.isActive ? 'bg-slate-50 opacity-60' : ''}>
                      <TableCell className="font-medium">{item.sku}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">${Number(item.costPrice).toFixed(2)}</TableCell>
                      <TableCell className="text-right">{Number(item.minStock)}</TableCell>
                      <TableCell className="text-center">
                        {item.isActive ? (
                          <Badge className="bg-emerald-500">Activo</Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {user?.role === 'ADMIN' && item.isActive && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeactivate(item.id, item.name)}
                            title="Desactivar producto"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
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
                onClick={() => updateSearchParam('page', (page - 1).toString())} 
                disabled={page <= 1 || loading}
              >
                Anterior
              </Button>
              <span className="text-muted-foreground px-4">Página {page} de {totalPages}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateSearchParam('page', (page + 1).toString())} 
                disabled={page >= totalPages || loading}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ProductDrawer 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen} 
        onSuccess={fetchProducts} 
      />
    </div>
  );
}
