"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import type { Product } from "@/lib/types"
import { createProduct, updateProduct } from "@/lib/db-actions"

interface ProductFormProps {
  onSuccess?: (product: Product) => void
  editProduct?: Product | null
  onCancel?: () => void
}

export function ProductForm({ onSuccess, editProduct, onCancel }: ProductFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    code: editProduct?.code || "",
    description: editProduct?.description || "",
    eanPrimary: editProduct?.eanPrimary || "",
    eanSecondary: editProduct?.eanSecondary || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let product: Product | null
      if (editProduct) {
        product = await updateProduct(editProduct.id, formData)
        if (product) {
          toast({
            title: "Producto actualizado",
            description: `${product.description} se actualizó correctamente`,
          })
        }
      } else {
        product = await createProduct(formData)
        if (product) {
          toast({
            title: "Producto creado",
            description: `${product.description} se agregó correctamente`,
          })
        }
      }

      if (!product) {
        throw new Error("Error al guardar el producto")
      }

      // Reset form
      setFormData({
        code: "",
        description: "",
        eanPrimary: "",
        eanSecondary: "",
      })

      onSuccess?.(product)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editProduct ? "Editar Producto" : "Nuevo Producto"}</CardTitle>
        <CardDescription>
          {editProduct
            ? "Actualiza la información del producto"
            : "Completa los datos para registrar un nuevo producto"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Código de Producto</Label>
              <Input id="code" name="code" value={formData.code} onChange={handleChange} placeholder="Ej: PROD-001" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción del producto"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eanPrimary">EAN Principal</Label>
              <Input
                id="eanPrimary"
                name="eanPrimary"
                value={formData.eanPrimary}
                onChange={handleChange}
                placeholder="Código de barras"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eanSecondary">EAN Secundario</Label>
              <Input
                id="eanSecondary"
                name="eanSecondary"
                value={formData.eanSecondary}
                onChange={handleChange}
                placeholder="Código de barras (opcional)"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editProduct ? "Actualizar" : "Crear"} Producto
            </Button>
            {editProduct && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
