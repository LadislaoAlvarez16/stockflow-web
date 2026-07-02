import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { stockApi, productsApi, batchesApi } from '@/services/api';

interface Warehouse {
  id: string;
  name: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
}

interface MovementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  warehouses: Warehouse[];
}

export function MovementDrawer({ isOpen, onClose, onSuccess, warehouses }: MovementDrawerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [fefoBatchId, setFefoBatchId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '',
    type: 'INBOUND',
    quantity: '',
    reference: '',
    notes: '',
    batchId: '',
    serialNumbers: '',
  });

  useEffect(() => {
    if (isOpen) {
      productsApi.getProducts({ limit: 1000 }).then(res => setProducts(res.data)).catch(console.error);
      setFormData({
        productId: '',
        warehouseId: '',
        type: 'INBOUND',
        quantity: '',
        reference: '',
        notes: '',
        batchId: '',
        serialNumbers: '',
      });
      setBatches([]);
      setFefoBatchId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.productId) {
      batchesApi.getBatches({ productId: formData.productId }).then(res => setBatches(res)).catch(console.error);
    } else {
      setBatches([]);
    }
  }, [formData.productId]);

  useEffect(() => {
    if (formData.type === 'OUTBOUND' && formData.productId && formData.warehouseId && formData.quantity && Number(formData.quantity) > 0) {
      stockApi.getFefoSuggestion({ 
        productId: formData.productId, 
        warehouseId: formData.warehouseId, 
        quantity: Number(formData.quantity) 
      }).then(res => {
        if (res.suggestedBatch) {
          setFefoBatchId(res.suggestedBatch.id);
        } else {
          setFefoBatchId(null);
        }
      }).catch(console.error);
    } else {
      setFefoBatchId(null);
    }
  }, [formData.type, formData.productId, formData.warehouseId, formData.quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(formData.quantity) <= 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'La cantidad debe ser mayor a 0' });
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        ...formData,
        quantity: Number(formData.quantity),
      };
      
      if (formData.batchId) payload.batchId = formData.batchId;
      if (formData.serialNumbers) {
        payload.serialNumbers = formData.serialNumbers.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      }

      await stockApi.createMovement(payload);
      toast({ title: 'Éxito', description: 'Movimiento registrado correctamente.' });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Ocurrió un error al registrar el movimiento.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Registrar Movimiento</SheetTitle>
          <SheetDescription>
            Ingresa o retira stock de un depósito específico.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Movimiento</Label>
            <select
              id="type"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <option value="INBOUND">Ingreso (INBOUND)</option>
              <option value="OUTBOUND">Egreso (OUTBOUND)</option>
            </select>
          </div>

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
            <Label htmlFor="warehouseId">Depósito</Label>
            <select
              id="warehouseId"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
              value={formData.warehouseId}
              onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
              required
            >
              <option value="" disabled>Seleccione un depósito...</option>
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
            <Label htmlFor="batchId">Lote (Opcional)</Label>
            <select
              id="batchId"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
              value={formData.batchId}
              onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
            >
              <option value="">Sin Lote</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batchNumber} {fefoBatchId === b.id ? ' (Recomendado FEFO)' : ''}
                </option>
              ))}
            </select>
            {fefoBatchId && formData.batchId !== fefoBatchId && formData.type === 'OUTBOUND' && (
              <p className="text-xs text-orange-600 font-medium">Hay un lote sugerido por FEFO que vence antes.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumbers">Números de Serie (Opcional)</Label>
            <textarea
              id="serialNumbers"
              rows={3}
              className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
              placeholder="Ingresar separados por coma o salto de línea..."
              value={formData.serialNumbers}
              onChange={(e) => setFormData({ ...formData, serialNumbers: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Referencia</Label>
            <Input
              id="reference"
              type="text"
              placeholder="Ej: Remito N° 1234"
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Registrar'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
