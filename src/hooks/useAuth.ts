/**
 * @security ⚠️ TRADE-OFF DE ARQUITECTURA (TICKET-01)
 * Actualmente, los tokens JWT se almacenan en localStorage para facilitar el despliegue
 * headless durante la fase MVP. Somos conscientes de que esto expone la aplicación
 * a riesgos de XSS (Cross-Site Scripting). 
 * 
 * ROADMAP: Para entornos de producción estrictos, el backend debe ser actualizado
 * para emitir los tokens en cookies httpOnly y Secure, eliminando la necesidad
 * de gestionar los tokens manualmente en el cliente.
 */
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export * from '@/context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
