"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Product } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { deleteProduct } from "@/lib/db-actions"

interface DeleteProductDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteProductDialog({ product, open, onOpenChange, onConfirm }: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    if (!product) return
    setIsDeleting(true)
    try {
      await deleteProduct(product.id, product.code, product.description)
      onConfirm()
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!product) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el producto:
            <div className="mt-3 rounded-md bg-muted p-3">
              <p className="font-semibold text-foreground">{product.description}</p>
              <p className="text-sm text-muted-foreground">Código: {product.code}</p>
              <p className="text-sm font-mono text-muted-foreground">EAN: {product.eanPrimary}</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
