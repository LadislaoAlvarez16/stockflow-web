import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [isOpen, setIsOpen] = useState(false);
  
  // Create PO form state
  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costPrice, setCostPrice] = useState('');

  // Dropdown data
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  useEffect(() => {
    if (isOpen) {
      axios.get('http://localhost:3000/suppliers').then(res => setSuppliers(res.data));
      axios.get('http://localhost:3000/warehouses').then(res => setWarehouses(res.data));
      axios.get('http://localhost:3000/products').then(res => setProducts(res.data));
    }
  }, [isOpen]);

  const fetchOrders = async () => {
    try {
      let url = 'http://localhost:3000/purchase-orders';
      // Mapeo simple de tabs a backend status
      if (filter === 'PENDING') {
        // Asumiendo que el backend soporta arrays o filtramos en memoria. Si no, hacemos 2 requests o filtramos.
        // Vamos a pedir todos y filtrar en memoria para simplificar como dijo el prompt.
      } else if (filter === 'PARTIAL') {
        url += '?status=PARTIAL';
      } else if (filter === 'COMPLETED') {
        url += '?status=RECEIVED';
      }
      
      const { data } = await axios.get(url);
      
      if (filter === 'PENDING') {
        setOrders(data.filter((o: any) => o.status === 'DRAFT' || o.status === 'SENT'));
      } else {
        setOrders(data);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch orders', variant: 'destructive' });
    }
  };

  const addItem = () => {
    if (!selectedProduct || !quantity || !costPrice) return;
    if (items.some(i => i.productId === selectedProduct)) {
      toast({ title: 'Error', description: 'Product already added', variant: 'destructive' });
      return;
    }
    const product = products.find(p => p.id === selectedProduct);
    setItems([...items, { 
      productId: selectedProduct, 
      productName: product?.name,
      quantity: parseInt(quantity), 
      costPrice: parseFloat(costPrice) 
    }]);
    setSelectedProduct('');
    setQuantity('');
    setCostPrice('');
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({ title: 'Error', description: 'Add at least one item', variant: 'destructive' });
      return;
    }
    try {
      await axios.post('http://localhost:3000/purchase-orders', {
        supplierId,
        warehouseId,
        items: items.map(({ productName, ...rest }) => rest)
      });
      toast({ title: 'Success', description: 'Order created' });
      setIsOpen(false);
      setSupplierId('');
      setWarehouseId('');
      setItems([]);
      fetchOrders();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create order', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Órdenes de Compra</h1>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button>Nueva Orden</Button>
          </SheetTrigger>
          <SheetContent className="min-w-[600px]">
            <SheetHeader>
              <SheetTitle>Nueva Orden de Compra</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Proveedor</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {suppliers.filter(s => s.isActive).map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Depósito Destino</Label>
                  <Select value={warehouseId} onValueChange={setWarehouseId}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {warehouses.filter(w => w.isActive).map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border p-4 rounded-md space-y-4">
                <h3 className="font-medium">Agregar Ítem</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger><SelectValue placeholder="Producto" /></SelectTrigger>
                    <SelectContent>
                      {products.filter(p => p.isActive).map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="Cant." value={quantity} onChange={e => setQuantity(e.target.value)} min="1" />
                  <Input type="number" placeholder="Precio $" value={costPrice} onChange={e => setCostPrice(e.target.value)} min="0.01" step="0.01" />
                </div>
                <Button type="button" variant="secondary" onClick={addItem} className="w-full">Añadir a la lista</Button>
              </div>

              {items.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cant.</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(i => (
                      <TableRow key={i.productId}>
                        <TableCell>{i.productName}</TableCell>
                        <TableCell>{i.quantity}</TableCell>
                        <TableCell>${i.costPrice}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => removeItem(i.productId)}>X</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              <Button onClick={handleSubmit} className="w-full mt-4" disabled={!supplierId || !warehouseId || items.length === 0}>Guardar OC</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Tabs defaultValue="ALL" onValueChange={setFilter} className="mb-4">
        <TabsList>
          <TabsTrigger value="ALL">Todas</TabsTrigger>
          <TabsTrigger value="PENDING">Pendientes</TabsTrigger>
          <TabsTrigger value="PARTIAL">Parciales</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completadas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID / Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Depósito</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map(o => (
              <TableRow key={o.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/purchase-orders/${o.id}`)}>
                <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{o.supplier.name}</TableCell>
                <TableCell>{o.warehouse.name}</TableCell>
                <TableCell>{o.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
