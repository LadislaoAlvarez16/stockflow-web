import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // Reception state
  const [reference, setReference] = useState('');
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3000/purchase-orders/${id}`);
      setOrder(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch order details', variant: 'destructive' });
      navigate('/purchase-orders');
    }
  };

  const handleQuantityChange = (productId: string, value: string, max: number) => {
    const numValue = parseInt(value || '0');
    if (numValue > max) return; // UI block (backend also blocks)
    setReceiveQuantities(prev => ({ ...prev, [productId]: value }));
  };

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference) {
      toast({ title: 'Error', description: 'Reference is required', variant: 'destructive' });
      return;
    }

    const itemsToReceive = Object.entries(receiveQuantities)
      .map(([productId, qty]) => ({ productId, quantityReceived: parseInt(qty || '0') }))
      .filter(item => item.quantityReceived > 0);

    if (itemsToReceive.length === 0) {
      toast({ title: 'Error', description: 'Add at least one quantity to receive', variant: 'destructive' });
      return;
    }

    try {
      await axios.patch(`http://localhost:3000/purchase-orders/${id}/receive`, {
        warehouseId: order.warehouse.id,
        reference,
        items: itemsToReceive,
      });
      toast({ title: 'Success', description: 'Items received successfully' });
      setIsOpen(false);
      setReference('');
      setReceiveQuantities({});
      fetchOrder();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to receive items';
      toast({ title: 'Error', description: Array.isArray(msg) ? msg.join(', ') : msg, variant: 'destructive' });
    }
  };

  if (!order) return <div className="p-6">Loading...</div>;

  const canReceive = order.status === 'SENT' || order.status === 'PARTIAL';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="outline" onClick={() => navigate('/purchase-orders')} className="mb-4">← Volver</Button>
          <h1 className="text-2xl font-bold">Orden de Compra {id?.substring(0, 8)}</h1>
          <p className="text-gray-500">
            Proveedor: {order.supplier.name} | Depósito: {order.warehouse.name} | Estado: <span className="font-semibold">{order.status}</span>
          </p>
        </div>

        {canReceive && (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button>Recepcionar Ítems</Button>
            </SheetTrigger>
            <SheetContent className="min-w-[600px]">
              <SheetHeader>
                <SheetTitle>Recepción de Mercadería</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleReceive} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Referencia / Remito (Obligatorio)</Label>
                  <Input required value={reference} onChange={e => setReference(e.target.value)} placeholder="Ej. REM-1234" />
                </div>

                <div className="border rounded-md mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Pendiente</TableHead>
                        <TableHead>A Recibir</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items
                        .filter((item: any) => item.quantityOrdered - item.quantityReceived > 0)
                        .map((item: any) => {
                          const pending = item.quantityOrdered - item.quantityReceived;
                          return (
                            <TableRow key={item.productId}>
                              <TableCell>{item.product.name}</TableCell>
                              <TableCell>{pending}</TableCell>
                              <TableCell>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  max={pending}
                                  value={receiveQuantities[item.productId] || ''}
                                  onChange={e => handleQuantityChange(item.productId, e.target.value, pending)}
                                />
                              </TableCell>
                            </TableRow>
                          );
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                <Button type="submit" className="w-full">Confirmar Recepción e Inbound</Button>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Costo Unit.</TableHead>
              <TableHead>Ordenado</TableHead>
              <TableHead>Recibido</TableHead>
              <TableHead>Pendiente</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item: any) => {
              const pending = item.quantityOrdered - item.quantityReceived;
              return (
                <TableRow key={item.productId}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>${item.costPrice}</TableCell>
                  <TableCell>{item.quantityOrdered}</TableCell>
                  <TableCell>{item.quantityReceived}</TableCell>
                  <TableCell className={pending > 0 ? "text-amber-600 font-semibold" : "text-green-600"}>
                    {pending}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
