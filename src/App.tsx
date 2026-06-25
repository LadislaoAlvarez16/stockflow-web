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
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
