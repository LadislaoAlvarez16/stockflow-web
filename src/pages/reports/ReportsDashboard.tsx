import { useState, useEffect } from 'react';
import axios from 'axios';
import { reportsApi, warehousesApi } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/use-toast';

export default function ReportsDashboard() {
  const [reports, setReports] = useState<{ id?: string, name?: string, description?: string, url?: string, filters?: { name: string, description: string, required?: boolean, type?: string }[] }[]>([]);
  const [warehouses, setWarehouses] = useState<{ id?: string, name?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Estados locales por reporte
  const [formData, setFormData] = useState<Record<string, Record<string, string | number>>>({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [repData, whData] = await Promise.all([
          reportsApi.getDirectory(),
          warehousesApi.getWarehouses()
        ]);
        setReports(repData);
        setWarehouses(whData);
      } catch (err: unknown) {
        if(axios.isAxiosError(err)) {
          toast({
            variant: "destructive",
            title: "Error al cargar reportes",
            description: err.message,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [toast]);

  const handleInputChange = (reportId: string, fieldName: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [reportId]: {
        ...prev[reportId],
        [fieldName]: value
      }
    }));
  };

  const handleGenerate = async (report: { id?: string, url?: string }) => {
    try {
      if (report.id) setGeneratingId(report.id);
      const params = (report.id ? formData[report.id] : {}) || {};
      
      // Validación cliente (fechas requeridas en historial)
      if (report.id === 'movement-history') {
        if (!params.dateFrom || !params.dateTo) {
          throw new Error('Debe seleccionar fecha de inicio y fin.');
        }
      }

      await reportsApi.downloadReport(report.url as string, params);
      
      toast({
        title: "Reporte Generado",
        description: "La descarga ha comenzado.",
      });
    } catch (err: unknown) {
      if(axios.isAxiosError(err)) {
        toast({
          variant: "destructive",
          title: "Error al generar reporte",
          description: err.response?.data?.message || err.message,
        });
      }
    } finally {
      setGeneratingId(null);
    }
  };

  const renderFilterInput = (reportId: string, filter: { name: string, description?: string, required?: boolean, type?: string }) => {
    const value = formData[reportId]?.[filter.name as string] || '';

    if (filter.name === 'warehouseId') {
      return (
        <div key={filter.name} className="space-y-1">
          <Label className="text-xs">{filter.description} {filter.required ? '*' : ''}</Label>
          <select
            value={value}
            onChange={(e) => handleInputChange(reportId, filter.name, e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Todos los depósitos</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={filter.name} className="space-y-1">
        <Label className="text-xs">{filter.description} {filter.required ? '*' : ''}</Label>
        <Input 
          type={filter.type === 'date' ? 'date' : filter.type === 'number' ? 'number' : 'text'} 
          value={value}
          onChange={(e) => handleInputChange(reportId, filter.name, e.target.value)}
          className="h-9"
          placeholder={filter.description}
        />
      </div>
    );
  };

  if (loading) {
    return <div className="p-6">Cargando catálogo de reportes...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">Generación de documentos PDF financieros y operativos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{report.name}</CardTitle>
              <CardDescription className="h-10 line-clamp-2">{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {report.filters?.map((filter: { name: string, description?: string, required?: boolean, type?: string }) => renderFilterInput(report.id as string, filter))}
              {(!report.filters || report.filters.length === 0) && (
                <div className="text-sm text-muted-foreground py-2">
                  No requiere filtros adicionales.
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleGenerate(report)} 
                disabled={generatingId === report.id}
                className="w-full"
              >
                {generatingId === report.id ? "Generando PDF..." : "Descargar PDF"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
