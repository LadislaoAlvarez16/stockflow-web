import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type ImportType = 'products' | 'initial-stock' | 'movements';

interface Warehouse {
  id: string;
  name: string;
  isActive: boolean;
}

interface ImportError {
  row: number;
  reason: string;
}

interface ImportResult {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  errors?: ImportError[];
}

export default function Imports() {
  const [importType, setImportType] = useState<ImportType>('products');
  const [warehouseId, setWarehouseId] = useState('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (importType === 'initial-stock') {
      axios.get('http://localhost:3000/warehouses').then(res => setWarehouses(res.data));
    }
  }, [importType]);

  const handleProcess = async () => {
    if (!file) {
      toast({ title: 'Error', description: 'Selecciona un archivo CSV primero', variant: 'destructive' });
      return;
    }
    
    if (importType === 'initial-stock' && !warehouseId) {
      toast({ title: 'Error', description: 'Selecciona un depósito destino', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (importType === 'initial-stock') {
      formData.append('warehouseId', warehouseId);
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const { data } = await axios.post(`http://localhost:3000/imports/${importType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult(data);
      
      if (data.errorCount > 0) {
        toast({ title: 'Proceso con Errores', description: `Se procesaron ${data.totalProcessed} filas, ${data.errorCount} fallaron.`, variant: 'destructive' });
      } else {
        toast({ title: 'Éxito', description: `Se procesaron ${data.totalProcessed} filas exitosamente.` });
      }
      
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFile(null);
      
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || 'Error de red o de servidor';
        toast({ title: 'Error Crítico', description: Array.isArray(msg) ? msg.join(', ') : msg, variant: 'destructive' });
      } else {
        toast({ title: 'Error Crítico', description: 'Ocurrió un error inesperado', variant: 'destructive' });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Importación Masiva de Datos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border p-6 rounded-md shadow-sm space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Importación</Label>
            <Select value={importType} onValueChange={(val: ImportType) => setImportType(val)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar tipo..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="products">Productos (Upsert por SKU)</SelectItem>
                <SelectItem value="initial-stock">Stock Inicial (INBOUND)</SelectItem>
                <SelectItem value="movements">Movimientos Históricos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {importType === 'initial-stock' && (
            <div className="space-y-2">
              <Label>Depósito Destino</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar depósito..." /></SelectTrigger>
                <SelectContent>
                  {warehouses.filter(w => w.isActive).map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Archivo CSV</Label>
            <Input 
              type="file" 
              accept=".csv,text/csv" 
              ref={fileInputRef}
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button 
            onClick={handleProcess} 
            disabled={isProcessing || !file || (importType === 'initial-stock' && !warehouseId)} 
            className="w-full mt-4"
          >
            {isProcessing ? 'Procesando...' : 'Procesar Importación'}
          </Button>
        </div>

        {/* Instucciones */}
        <div className="border p-6 rounded-md bg-slate-50 text-sm">
          <h3 className="font-semibold mb-2">Formato Esperado (CSV)</h3>
          {importType === 'products' && (
            <ul className="list-disc pl-4 space-y-1">
              <li><b>sku</b> (obligatorio): Código único.</li>
              <li><b>name</b> (obligatorio): Nombre del producto.</li>
              <li><b>costPrice</b> (obligatorio): Precio de costo (ej: 15.50).</li>
              <li><b>minStock</b> (opcional): Stock mínimo.</li>
              <li><b>category</b> (opcional): Categoría.</li>
            </ul>
          )}
          {importType === 'initial-stock' && (
            <ul className="list-disc pl-4 space-y-1">
              <li><b>sku</b> (obligatorio): Debe existir en el sistema.</li>
              <li><b>quantity</b> (obligatorio): Cantidad positiva a ingresar.</li>
              <li><b>reference</b> (opcional): Ej. "AJUSTE_2026". Si se omite se usa "INITIAL_STOCK_IMPORT".</li>
            </ul>
          )}
          {importType === 'movements' && (
            <ul className="list-disc pl-4 space-y-1">
              <li><b>sku</b>, <b>warehouseCode</b>, <b>type</b> (INBOUND, OUTBOUND, TRANSFER, ADJUSTMENT)</li>
              <li><b>quantity</b>, <b>reference</b>, <b>notes</b></li>
            </ul>
          )}
        </div>
      </div>

      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Resultado de Importación</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-md text-center bg-slate-50">
              <div className="text-sm text-slate-500">Total Filas</div>
              <div className="text-2xl font-bold">{result.totalProcessed}</div>
            </div>
            <div className="p-4 border rounded-md text-center bg-green-50">
              <div className="text-sm text-green-700">Éxitos</div>
              <div className="text-2xl font-bold text-green-700">{result.successCount}</div>
            </div>
            <div className="p-4 border rounded-md text-center bg-red-50">
              <div className="text-sm text-red-700">Fallos</div>
              <div className="text-2xl font-bold text-red-700">{result.errorCount}</div>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <div className="border rounded-md border-red-200">
              <div className="bg-red-50 px-4 py-2 border-b border-red-200 font-medium text-red-800">
                Detalle de Errores
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Fila (CSV)</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.errors.map((e: ImportError, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{e.row}</TableCell>
                      <TableCell className="text-red-600">{e.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
