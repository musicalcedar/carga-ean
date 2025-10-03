"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Camera, X, Loader2 } from "lucide-react"
import { validateEAN13 } from "@/lib/ean-validator"

interface BarcodeScannerProps {
  onScan: (ean: string) => void
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()

  const startCamera = async () => {
    setError(null)
    setIsScanning(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err) {
      setError("No se pudo acceder a la cámara. Verifica los permisos.")
      setIsScanning(false)
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Verifica los permisos del navegador.",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      stopCamera()
    }
  }

  const handleManualInput = () => {
    const input = prompt("Ingresa el código EAN manualmente:")
    if (input) {
      if (validateEAN13(input)) {
        onScan(input)
        setIsOpen(false)
        toast({
          title: "EAN capturado",
          description: `Código: ${input}`,
        })
      } else {
        toast({
          title: "EAN inválido",
          description: "El código ingresado no es un EAN-13 válido",
          variant: "destructive",
        })
      }
    }
  }

  useEffect(() => {
    if (isOpen && !isScanning) {
      startCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Camera className="mr-2 h-4 w-4" />
        Escanear Código
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escanear Código de Barras</DialogTitle>
            <DialogDescription>
              Coloca el código de barras frente a la cámara o ingresa el código manualmente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              {isScanning ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                  onLoadedMetadata={() => {
                    // Video is ready
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-4 text-center">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-48 border-2 border-primary rounded-lg" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleManualInput} variant="outline" className="flex-1 bg-transparent">
                Ingresar Manualmente
              </Button>
              <Button onClick={() => handleOpenChange(false)} variant="outline" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Nota: El escaneo automático requiere una librería adicional. Por ahora, usa la entrada manual.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
