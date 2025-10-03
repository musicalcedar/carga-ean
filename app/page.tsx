"use client"

import { useState, useEffect } from "react"
import { ProductForm } from "@/components/product-form"
import { ProductTable } from "@/components/product-table"
import { DashboardStats } from "@/components/dashboard-stats"
import { ActivityHistory } from "@/components/activity-history"
import { DeleteProductDialog } from "@/components/delete-product-dialog"
import { EditProductDialog } from "@/components/edit-product-dialog"
import { ImportExportButtons } from "@/components/import-export-buttons"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import { Package, LayoutDashboard, History, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAllProducts, getActivityHistory } from "@/lib/db-actions"

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState("products")
  const [showAddForm, setShowAddForm] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const productsData = await getAllProducts()
    const historyData = await getActivityHistory()
    setProducts(productsData)
    setHistory(historyData)
  }

  const handleDelete = async () => {
    await loadProducts()
    toast({
      title: "Producto eliminado",
      description: "El producto se eliminó correctamente",
    })
  }

  const handleScan = (ean: string) => {
    toast({
      title: "EAN escaneado",
      description: `Código: ${ean}`,
    })
    setShowAddForm(true)
    setActiveTab("products")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Gestión de Productos</h1>
          </div>
          <div className="flex items-center gap-2">
            <BarcodeScanner onScan={handleScan} />
            <ImportExportButtons products={products} onImportComplete={loadProducts} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats products={products} history={history} />
            <div className="grid gap-6 lg:grid-cols-2">
              <ActivityHistory history={history} limit={15} />
              <div className="space-y-4">
                <ProductForm onSuccess={loadProducts} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            {showAddForm && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Agregar Producto</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                    Ocultar
                  </Button>
                </div>
                <ProductForm onSuccess={loadProducts} />
              </div>
            )}

            {!showAddForm && (
              <Button onClick={() => setShowAddForm(true)} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Producto
              </Button>
            )}

            <ProductTable
              products={products}
              onEdit={(product) => setEditProduct(product)}
              onDelete={(product) => setDeleteProduct(product)}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <ActivityHistory history={history} limit={50} />
          </TabsContent>
        </Tabs>
      </main>

      <DeleteProductDialog
        product={deleteProduct}
        open={!!deleteProduct}
        onOpenChange={(open) => !open && setDeleteProduct(null)}
        onConfirm={handleDelete}
      />

      <EditProductDialog
        product={editProduct}
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
        onSuccess={loadProducts}
      />
    </div>
  )
}
