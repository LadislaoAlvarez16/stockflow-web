import React, { useState, useEffect } from 'react';
import { physicalInventoryApi, warehousesApi } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function PhysicalInventoryUpload() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouseId, setWarehouseId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const data = await warehousesApi.getWarehouses();
        setWarehouses(data);
        if (data.length > 0) setWarehouseId(data[0].id);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error al cargar depósitos",
          description: err.message,
        });
      }
    };
    fetchWarehouses();
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId || !file) {
      toast({
        variant: "destructive",
        title: "Faltan datos",
        description: "Debe seleccionar un depósito y un archivo.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await physicalInventoryApi.uploadSession(warehouseId, file);
      
      const isError = res.status === 'completed_with_errors';
      
      toast({
        title: isError ? "Procesado con Errores" : "Inventario procesado",
        description: `Procesados: \${res.matchedItems} exactos, \${res.adjustedItems} ajustados, \${res.skippedItems} omitidos.`,
        variant: isError ? "destructive" : "default"
      });
      
      navigate('/physical-inventory');
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error al subir inventario",
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subir Inventario Físico</h1>
          <p className="text-muted-foreground">Sincronice el conteo físico de un depósito mediante CSV/Excel.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/physical-inventory')}>
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carga de Archivo</CardTitle>
          <CardDescription>
            Asegúrese de que el archivo tenga al menos las columnas "SKU" y "Cantidad".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="warehouse">Depósito</Label>
              <select
                id="warehouse"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Archivo (CSV / Excel)</Label>
              <Input 
                id="file" 
                type="file" 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" disabled={isSubmitting || !file} className="w-full">
              {isSubmitting ? "Procesando inventario..." : "Procesar Inventario"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
