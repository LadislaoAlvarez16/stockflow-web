import { useState } from 'react';
import { productsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ProductDrawer({ open, onOpenChange, onSuccess }: ProductDrawerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    costPrice: '',
    minStock: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        costPrice: Number(formData.costPrice),
        minStock: formData.minStock ? Number(formData.minStock) : 0,
      };

      await productsApi.createProduct(payload);
      
      toast({ title: 'Éxito', description: 'Producto creado correctamente.' });
      onSuccess();
      onOpenChange(false);
      setFormData({ sku: '', name: '', category: '', costPrice: '', minStock: '' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al crear producto',
        description: error.response?.data?.message || 'Revisa los datos e intenta de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Nuevo Producto</SheetTitle>
          <SheetDescription>
            Registra un nuevo producto en el catálogo maestro.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input 
              id="sku" 
              required 
              placeholder="Ej. PROD-001"
              value={formData.sku}
              onChange={e => setFormData({ ...formData, sku: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input 
              id="name" 
              required 
              placeholder="Ej. Teclado Mecánico"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Input 
              id="category" 
              required 
              placeholder="Ej. Periféricos"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="costPrice">Precio de Costo *</Label>
            <Input 
              id="costPrice" 
              type="number" 
              required 
              min="0"
              step="0.01"
              placeholder="Ej. 1500.50"
              value={formData.costPrice}
              onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minStock">Stock Mínimo (Opcional)</Label>
            <Input 
              id="minStock" 
              type="number" 
              min="0"
              placeholder="Ej. 10"
              value={formData.minStock}
              onChange={e => setFormData({ ...formData, minStock: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Si el stock cae por debajo de este valor, se generará una alerta automáticamente.</p>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Guardando...' : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
