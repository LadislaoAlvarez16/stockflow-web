import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { batchesApi } from '@/services/api';
import { Package, Search, Calendar, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Batches() {
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const data = await batchesApi.getBatches();
      setBatches(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar lotes');
    } finally {
      setIsLoading(false);
    }
  };

  const getExpiryBadge = (expiryDate: string | null) => {
    if (!expiryDate) return <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">Sin vencimiento</span>;
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          <Calendar className="h-3 w-3" />
          Vencido ({format(expiry, 'dd/MM/yyyy')})
        </span>
      );
    }
    if (diffDays <= 15) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
          <AlertTriangle className="h-3 w-3" />
          Crítico ({format(expiry, 'dd/MM/yyyy')})
        </span>
      );
    }
    if (diffDays <= 30) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
          <Info className="h-3 w-3" />
          Precaución ({format(expiry, 'dd/MM/yyyy')})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
        <CheckCircle2 className="h-3 w-3" />
        Seguro ({format(expiry, 'dd/MM/yyyy')})
      </span>
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Cargando lotes...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lotes (Batches)</h1>
          <p className="text-sm text-slate-500">Gestión y trazabilidad FEFO de lotes.</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Lote / Producto</th>
                <th className="px-6 py-4 font-medium">Vencimiento (FEFO)</th>
                <th className="px-6 py-4 font-medium">Ubicaciones (Stock)</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <Package className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{batch.batchNumber}</div>
                        <div className="text-xs text-slate-500">{batch.product?.name || 'Producto Desconocido'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getExpiryBadge(batch.expiryDate)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {batch.batchStocks && batch.batchStocks.length > 0 ? (
                        batch.batchStocks.map((bs: any) => (
                          <div key={bs.warehouseId} className="text-xs">
                            <span className="font-medium text-slate-900">{bs.quantity}</span> en {bs.warehouse?.name}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">Sin stock físico</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/batches/${batch.id}`}
                      className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                    >
                      <Search className="h-4 w-4" />
                      Trazabilidad
                    </Link>
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron lotes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
