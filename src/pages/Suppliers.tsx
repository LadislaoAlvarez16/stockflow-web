import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', taxId: '', email: '', phone: '', address: '' });
  const { toast } = useToast();

  const fetchSuppliers = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/suppliers');
      setSuppliers(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch suppliers', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/suppliers', formData);
      toast({ title: 'Success', description: 'Supplier created successfully' });
      setIsOpen(false);
      setFormData({ name: '', taxId: '', email: '', phone: '', address: '' });
      fetchSuppliers();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast({ title: 'Error', description: 'El CUIT ya existe', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: 'Failed to create supplier', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button>Nuevo Proveedor</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Nuevo Proveedor</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">CUIT</Label>
                <Input id="taxId" required value={formData.taxId} onChange={e => setFormData({ ...formData, taxId: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">Guardar</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>CUIT</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map(s => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.taxId}</TableCell>
                <TableCell>{s.email || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
