import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { batchesApi } from '@/services/api';
import { ArrowLeft, Package, Clock, MapPin, Hash, ArrowRightLeft, User } from 'lucide-react';
import { format } from 'date-fns';

export default function BatchDetail() {
  const { id } = useParams<{ id: string }>();
  const [batch, setBatch] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [serialNumbers, setSerialNumbers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [movPage, setMovPage] = useState(1);
  const [movTotalPages, setMovTotalPages] = useState(1);

  const [snPage, setSnPage] = useState(1);
  const [snTotalPages, setSnTotalPages] = useState(1);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchMovements();
  }, [id, movPage]);

  useEffect(() => {
    if (id) fetchSerialNumbers();
  }, [id, snPage]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await batchesApi.getBatchDetails(id!);
      setBatch(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar detalles del lote');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const res = await batchesApi.getBatchMovements(id!, { page: movPage, limit: 10 });
      setMovements(res.data);
      setMovTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSerialNumbers = async () => {
    try {
      const res = await batchesApi.getBatchSerialNumbers(id!, { page: snPage, limit: 10 });
      setSerialNumbers(res.data);
      setSnTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Cargando trazabilidad...</div>;
  if (error || !batch) return <div className="p-8 text-center text-red-500">{error || 'Lote no encontrado'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/batches" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lote: {batch.batchNumber}</h1>
          <p className="text-sm text-slate-500">{batch.product?.name}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Package className="h-5 w-5 text-slate-500" /> Detalle del Lote
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Stock Total (Sistema):</span>
              <span className="font-medium text-slate-900">{batch.totalStock} unidades</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Vencimiento:</span>
              <span className="font-medium text-slate-900">{batch.expiryDate ? format(new Date(batch.expiryDate), 'dd/MM/yyyy') : 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Fecha de Fabricación:</span>
              <span className="font-medium text-slate-900">{batch.manufacturingDate ? format(new Date(batch.manufacturingDate), 'dd/MM/yyyy') : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <MapPin className="h-5 w-5 text-slate-500" /> Distribución Física
          </h2>
          <div className="space-y-3 text-sm">
            {batch.batchStocks?.map((bs: any) => (
              <div key={bs.warehouseId} className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">{bs.warehouse?.name}</span>
                <span className="font-medium text-slate-900">{bs.quantity}</span>
              </div>
            ))}
            {(!batch.batchStocks || batch.batchStocks.length === 0) && (
              <div className="text-slate-400">Sin inventario físico.</div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <ArrowRightLeft className="h-5 w-5 text-slate-500" /> Historial de Movimientos
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium">Depósito</th>
                <th className="px-6 py-4 font-medium text-right">Cantidad</th>
                <th className="px-6 py-4 font-medium">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {movements.map((mov) => (
                <tr key={mov.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {format(new Date(mov.createdAt), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{mov.type}</td>
                  <td className="px-6 py-4">{mov.warehouse?.name}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={mov.type === 'INBOUND' ? 'text-emerald-600 font-semibold' : mov.type === 'OUTBOUND' ? 'text-red-600 font-semibold' : 'text-slate-900 font-semibold'}>
                      {mov.type === 'OUTBOUND' ? '-' : '+'}{mov.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {mov.createdBy?.name || 'Sistema'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="text-sm text-slate-500">
            Página <span className="font-medium text-slate-900">{movPage}</span> de <span className="font-medium text-slate-900">{movTotalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMovPage(p => Math.max(1, p - 1))}
              disabled={movPage === 1}
              className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setMovPage(p => Math.min(movTotalPages, p + 1))}
              disabled={movPage === movTotalPages}
              className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Hash className="h-5 w-5 text-slate-500" /> Números de Serie
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Serial Number</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Fecha Creación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {serialNumbers.map((sn) => (
                <tr key={sn.id}>
                  <td className="px-6 py-4 font-medium text-slate-900">{sn.serialNumber}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sn.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                      {sn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{format(new Date(sn.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                </tr>
              ))}
              {serialNumbers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron series para este lote.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="text-sm text-slate-500">
            Página <span className="font-medium text-slate-900">{snPage}</span> de <span className="font-medium text-slate-900">{snTotalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSnPage(p => Math.max(1, p - 1))}
              disabled={snPage === 1}
              className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setSnPage(p => Math.min(snTotalPages, p + 1))}
              disabled={snPage === snTotalPages}
              className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
