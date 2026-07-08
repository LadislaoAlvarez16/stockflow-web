import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { WebhookEvent } from '@/services/webhooks.service'
import { Loader2 } from "lucide-react"

interface CreateWebhookSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, selectedEvents: string[]) => Promise<void>;
  events: WebhookEvent[];
  isLoading: boolean;
}

export const CreateWebhookSheet = ({
  isOpen,
  onClose,
  onSubmit,
  events,
  isLoading
}: CreateWebhookSheetProps) => {
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setUrl('')
      setSelectedEvents([])
    }
  }, [isOpen])

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url || selectedEvents.length === 0) return;
    await onSubmit(url, selectedEvents);
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto sm:max-w-md bg-slate-50 dark:bg-slate-950">
        <SheetHeader className="mb-6">
          <SheetTitle>Nueva Suscripción a Webhooks</SheetTitle>
          <SheetDescription>
            Ingresá la URL destino y seleccioná los eventos que querés recibir. El Secret se generará automáticamente.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">URL Destino</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://tu-sistema.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="bg-white dark:bg-slate-900"
            />
          </div>

          <div className="space-y-3">
            <Label>Eventos Suscritos</Label>
            <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              {events.map((event) => (
                <div key={event.id} className="flex items-start space-x-3">
                  <Checkbox 
                    id={`event-${event.id}`}
                    checked={selectedEvents.includes(event.id)}
                    onCheckedChange={() => toggleEvent(event.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={`event-${event.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {event.id}
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-sm text-slate-500">Cargando eventos...</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !url || selectedEvents.length === 0}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Suscripción
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
