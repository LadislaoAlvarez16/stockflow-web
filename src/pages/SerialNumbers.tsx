import { useState } from 'react';
import { serialNumbersApi } from '@/services/api';
import { Search, Hash, Box, ArrowRightLeft, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function SerialNumbers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setHistory(null);
      const data = await serialNumbersApi.getHistory(searchTerm.trim());
      setHistory(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Número de serie no encontrado o error de red');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Buscador de Series</h1>
        <p className="text-sm text-slate-500">Consulta la trazabilidad unitaria de un número de serie.</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6"
              placeholder="Ingrese el número de serie (ej: SN-123456)..."
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 disabled:opacity-50"
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Búsqueda fallida</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {history && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Hash className="h-5 w-5 text-slate-500" /> Detalle del Serial
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Serial Number:</span>
                  <span className="font-bold text-slate-900">{history.serialNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Producto:</span>
                  <span className="font-medium text-slate-900">{history.product?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Lote (Batch):</span>
                  <span className="font-medium text-slate-900">{history.batch?.batchNumber || 'Sin Lote'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Estado Actual:</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${history.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                    {history.status}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Ubicación Física:</span>
                  <span className="font-medium text-slate-900">{history.warehouse?.name || 'Desconocida (Consumido)'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Clock className="h-5 w-5 text-slate-500" /> Línea de Tiempo (Eventos)
              </h2>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {/* Evento de Ingreso */}
                  {history.inboundMovement && (
                    <li>
                      <div className="relative pb-8">
                        {history.outboundMovement ? (
                          <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center ring-8 ring-white">
                              <ArrowRightLeft className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-slate-500">
                                <span className="font-medium text-slate-900">Ingreso (INBOUND)</span> originado por {history.inboundMovement.createdBy?.name || 'Sistema'} en {history.inboundMovement.warehouse?.name}
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-slate-500">
                              {format(new Date(history.inboundMovement.createdAt), 'dd/MM/yyyy HH:mm')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}
                  {/* Evento de Salida */}
                  {history.outboundMovement && (
                    <li>
                      <div className="relative pb-8">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center ring-8 ring-white">
                              <Box className="h-4 w-4 text-red-600" aria-hidden="true" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-slate-500">
                                <span className="font-medium text-slate-900">Salida (OUTBOUND / TRANSFER)</span> ejecutado por {history.outboundMovement.createdBy?.name || 'Sistema'}
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-slate-500">
                              {format(new Date(history.outboundMovement.createdAt), 'dd/MM/yyyy HH:mm')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
