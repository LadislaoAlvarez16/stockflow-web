import { useState } from 'react';
import { AxiosError } from 'axios';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  sku: z.string().min(1, "El SKU es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  unit: z.string().min(1, "La unidad es requerida"),
  price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  minStock: z.coerce.number().min(0, "El stock mínimo no puede ser negativo"),
  tracksSerialNumbers: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ProductDrawer({ open, onOpenChange, onSuccess }: ProductDrawerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as unknown as Resolver<ProductFormData>,
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      unit: '',
      price: 0,
      minStock: 0,
      tracksSerialNumbers: false,
    }
  });

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const payload = {
        sku: data.sku,
        name: data.name,
        category: data.category,
        unit: data.unit,
        costPrice: data.price,
        minStock: data.minStock,
        tracksSerialNumbers: data.tracksSerialNumbers,
      };

      await productsApi.createProduct(payload);
      
      toast({ title: 'Éxito', description: 'Producto creado correctamente.' });
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast({
          variant: 'destructive',
          title: 'Error al crear producto',
          description: error.response?.data?.message || 'Revisa los datos e intenta de nuevo.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Nuevo Producto</SheetTitle>
          <SheetDescription>
            Registra un nuevo producto en el catálogo maestro.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input id="sku" placeholder="Ej. PROD-001" {...register('sku')} />
            {errors.sku && <p className="text-sm text-red-500">{errors.sku.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" placeholder="Ej. Teclado Mecánico" {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Input id="category" placeholder="Ej. Periféricos" {...register('category')} />
            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unidad *</Label>
            <Input id="unit" placeholder="Ej. Unidades, Kg, Lts" {...register('unit')} />
            {errors.unit && <p className="text-sm text-red-500">{errors.unit.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio de Costo *</Label>
            <Input id="price" type="number" min="0" step="0.01" placeholder="Ej. 1500.50" {...register('price')} />
            {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="minStock">Stock Mínimo (Opcional)</Label>
            <Input id="minStock" type="number" min="0" placeholder="Ej. 10" {...register('minStock')} />
            {errors.minStock && <p className="text-sm text-red-500">{errors.minStock.message}</p>}
            <p className="text-xs text-muted-foreground">Si el stock cae por debajo de este valor, se generará una alerta automáticamente.</p>
          </div>

          <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <Controller
              name="tracksSerialNumbers"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="tracksSerialNumbers"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="tracksSerialNumbers">Rastrear por Número de Serie</Label>
              <p className="text-sm text-muted-foreground">
                Habilita esta opción si necesitas hacer seguimiento individual de cada unidad física.
              </p>
            </div>
            {errors.tracksSerialNumbers && <p className="text-sm text-red-500">{errors.tracksSerialNumbers.message}</p>}
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
