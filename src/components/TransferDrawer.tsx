import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { stockApi, productsApi } from '@/services/api';

interface Warehouse {
  id: string;
  name: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
}

interface TransferDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  warehouses: Warehouse[];
}

export function TransferDrawer({ isOpen, onClose, onSuccess, warehouses }: TransferDrawerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [formData, setFormData] = useState({
    productId: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    quantity: '',
    reference: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      productsApi.getProducts({ limit: 1000 }).then(res => setProducts(res.data)).catch(console.error);
      setFormData({
        productId: '',
        fromWarehouseId: '',
        toWarehouseId: '',
        quantity: '',
        reference: '',
        notes: '',
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(formData.quantity) <= 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'La cantidad debe ser mayor a 0' });
      return;
    }
    
    if (formData.fromWarehouseId === formData.toWarehouseId) {
      toast({ variant: 'destructive', title: 'Error', description: 'El depósito origen y destino deben ser distintos' });
      return;
    }

    setLoading(true);
    try {
      await stockApi.createTransfer({
        ...formData,
        quantity: Number(formData.quantity),
      });
      toast({ title: 'Éxito', description: 'Transferencia registrada correctamente.' });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Ocurrió un error al registrar la transferencia.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Transferir Stock</SheetTitle>
          <SheetDescription>
            Mueve inventario entre dos depósitos de forma atómica.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="productId">Producto</Label>
            <select
              id="productId"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              required
            >
              <option value="" disabled>Seleccione un producto...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>[{p.sku}] {p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromWarehouseId">Depósito Origen</Label>
            <select
              id="fromWarehouseId"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
              value={formData.fromWarehouseId}
              onChange={(e) => setFormData({ ...formData, fromWarehouseId: e.target.value })}
              required
            >
              <option value="" disabled>Seleccione origen...</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toWarehouseId">Depósito Destino</Label>
            <select
              id="toWarehouseId"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
              value={formData.toWarehouseId}
              onChange={(e) => setFormData({ ...formData, toWarehouseId: e.target.value })}
              required
            >
              <option value="" disabled>Seleccione destino...</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Referencia</Label>
            <Input
              id="reference"
              type="text"
              placeholder="Ej: Traspaso Interno N° 99"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Input
              id="notes"
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <SheetFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading || (formData.fromWarehouseId === formData.toWarehouseId && formData.fromWarehouseId !== '')}>
              {loading ? 'Transfiriendo...' : 'Transferir'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
