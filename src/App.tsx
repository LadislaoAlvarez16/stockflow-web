import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { PrivateRoute } from '@/components/PrivateRoute';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import { Toaster } from '@/components/ui/toaster';

import Stock from '@/pages/Stock';
import Movements from '@/pages/Movements';
import Alerts from '@/pages/Alerts';
import Products from '@/pages/Products';
import Warehouses from '@/pages/Warehouses';
import Batches from '@/pages/Batches';
import BatchDetail from '@/pages/BatchDetail';
import SerialNumbers from '@/pages/SerialNumbers';
import PhysicalInventoryList from '@/pages/physical-inventory/PhysicalInventoryList';
import PhysicalInventoryUpload from '@/pages/physical-inventory/PhysicalInventoryUpload';
import ReportsDashboard from '@/pages/reports/ReportsDashboard';
import WebhooksList from '@/pages/Webhooks/WebhooksList';
import WebhookDetail from '@/pages/Webhooks/WebhookDetail';
import Suppliers from '@/pages/Suppliers';
import PurchaseOrders from '@/pages/purchase-orders/PurchaseOrders';
import PurchaseOrderDetail from '@/pages/purchase-orders/PurchaseOrderDetail';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/movements" element={<Movements />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/products" element={<Products />} />
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/batches/:id" element={<BatchDetail />} />
            <Route path="/serial-numbers" element={<SerialNumbers />} />
            <Route path="/physical-inventory" element={<PhysicalInventoryList />} />
            <Route path="/physical-inventory/upload" element={<PhysicalInventoryUpload />} />
            <Route path="/reports" element={<ReportsDashboard />} />
            <Route path="/webhooks" element={<WebhooksList />} />
            <Route path="/webhooks/:id" element={<WebhookDetail />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/purchase-orders/:id" element={<PurchaseOrderDetail />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
