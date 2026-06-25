import { useState } from 'react';
import { warehousesApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WarehouseDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function WarehouseDrawer({ open, onOpenChange, onSuccess }: WarehouseDrawerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    manager: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        location: formData.location,
        manager: formData.manager || undefined,
      };

      await warehousesApi.createWarehouse(payload);
      
      toast({ title: 'Éxito', description: 'Depósito creado correctamente.' });
      onSuccess();
      onOpenChange(false);
      setFormData({ name: '', code: '', location: '', manager: '' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al crear depósito',
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
          <SheetTitle>Nuevo Depósito</SheetTitle>
          <SheetDescription>
            Registra una nueva ubicación física o virtual en la red.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input 
              id="name" 
              required 
              placeholder="Ej. Depósito Central"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Código Interno *</Label>
            <Input 
              id="code" 
              required 
              placeholder="Ej. WH-CEN-01"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación Física *</Label>
            <Input 
              id="location" 
              required 
              placeholder="Ej. Av. Siempreviva 742"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager">Responsable (Opcional)</Label>
            <Input 
              id="manager" 
              placeholder="Ej. Juan Pérez"
              value={formData.manager}
              onChange={e => setFormData({ ...formData, manager: e.target.value })}
            />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Guardando...' : 'Crear Depósito'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
