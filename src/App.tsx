import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { PrivateRoute } from '@/components/PrivateRoute';
import { Login } from '@/pages/Login';
import { Toaster } from '@/components/ui/toaster';

const Dashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Dashboard</h1></div>;
const Stock = () => <div className="p-8"><h1 className="text-2xl font-bold">Stock</h1></div>;
const Movements = () => <div className="p-8"><h1 className="text-2xl font-bold">Movements</h1></div>;
const Alerts = () => <div className="p-8"><h1 className="text-2xl font-bold">Alerts</h1></div>;

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/movements" element={<Movements />} />
          <Route path="/alerts" element={<Alerts />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
