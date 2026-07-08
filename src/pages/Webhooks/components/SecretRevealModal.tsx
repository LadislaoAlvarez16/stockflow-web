import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Copy, AlertTriangle } from "lucide-react"

interface SecretRevealModalProps {
  secret: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SecretRevealModal = ({ secret, isOpen, onClose }: SecretRevealModalProps) => {
  const { toast } = useToast()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(secret)
      toast({
        title: "Copiado al portapapeles",
        description: "El secret ha sido copiado exitosamente.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error al copiar",
        description: "No se pudo copiar al portapapeles. Por favor, selecciona y copia el texto manualmente.",
      })
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="border-red-500/50 bg-slate-50 dark:bg-slate-950">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            ¡Atención! Secret Generado
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-700 dark:text-slate-300">
            Este es tu Webhook Secret. <strong>Guardalo ahora en un lugar seguro.</strong> Por motivos de seguridad estricta, no volverás a verlo. El sistema lo encriptará y nunca lo devolverá en texto plano.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 flex items-center justify-between rounded-md border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900">
          <code className="text-sm font-bold tracking-wider">{secret}</code>
          <button 
            onClick={copyToClipboard}
            className="rounded-md bg-slate-200 p-2 transition-colors hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
            title="Copiar al portapapeles"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Ya lo he guardado
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
