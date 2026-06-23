import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Package, Lock, User } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Por favor, ingresa tu usuario/email y contraseña.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const credentials = {
        password,
        ...(isEmail ? { email: identifier } : { username: identifier }),
      };

      await login(credentials);
      toast({
        title: "¡Bienvenido a StockFlow!",
        description: "Has iniciado sesión exitosamente.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: error.response?.data?.message || "Credenciales inválidas. Por favor, intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200 via-slate-50 to-slate-50 dark:from-slate-800 dark:via-slate-950 dark:to-slate-950"></div>
      <Card className="z-10 w-full max-w-md border-slate-200/60 shadow-xl shadow-slate-200/50 backdrop-blur-xl dark:border-slate-800/60 dark:shadow-slate-900/50">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-inner dark:bg-slate-50">
            <Package className="h-7 w-7 text-slate-50 dark:text-slate-900" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">StockFlow</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Ingresa tus credenciales para continuar
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 text-left">
              <Label htmlFor="identifier" className="text-slate-700 dark:text-slate-300">Usuario o Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="admin@stockflow.com"
                  className="pl-10 transition-colors focus-visible:ring-slate-400"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Contraseña</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 transition-colors focus-visible:ring-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-50 border-t-transparent dark:border-slate-900 dark:border-t-transparent" />
                  <span>Autenticando...</span>
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 py-4 dark:border-slate-800/50">
          <p className="text-xs text-slate-500">
            Protegido por políticas de seguridad estrictas.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
