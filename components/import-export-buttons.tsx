"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { exportToCSV, parseCSV } from "@/lib/csv-utils"
import type { Product } from "@/lib/types"
import { Download, Upload, Loader2, FileSpreadsheet } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createProduct } from "@/lib/db-actions"

interface ImportExportButtonsProps {
  products: Product[]
  onImportComplete?: () => void
}

export function ImportExportButtons({ products, onImportComplete }: ImportExportButtonsProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = () => {
    if (products.length === 0) {
      toast({
        title: "No hay productos",
        description: "No hay productos para exportar",
        variant: "destructive",
      })
      return
    }

    try {
      exportToCSV(products)
      toast({
        title: "Exportación exitosa",
        description: `Se exportaron ${products.length} productos`,
      })
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudo exportar el archivo CSV",
        variant: "destructive",
      })
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    try {
      const text = await file.text()
      const parsedProducts = parseCSV(text)

      if (parsedProducts.length === 0) {
        toast({
          title: "Archivo vacío",
          description: "No se encontraron productos válidos en el archivo",
          variant: "destructive",
        })
        return
      }

      let imported = 0

      for (const product of parsedProducts) {
        const result = await createProduct(product)
        if (result) {
          imported++
        }
      }

      toast({
        title: "Importación completada",
        description: `${imported} productos importados`,
      })

      onImportComplete?.()
    } catch (error) {
      toast({
        title: "Error al importar",
        description: "No se pudo procesar el archivo CSV",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleExportTemplate = () => {
    const template = [
      {
        id: crypto.randomUUID(),
        code: "EJEMPLO-001",
        description: "Producto de ejemplo",
        eanPrimary: "1234567890128",
        eanSecondary: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    exportToCSV(template)
    toast({
      title: "Plantilla descargada",
      description: "Usa esta plantilla como referencia para importar productos",
    })
  }

  return (
    <>
      <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />

      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isImporting}>
              {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Importar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleImportClick}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Importar CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Descargar Plantilla
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" onClick={handleExport} disabled={products.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>
    </>
  )
}
