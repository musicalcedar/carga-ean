import type { Product, ProductChange } from "./types"

const STORAGE_KEY = "products"
const HISTORY_KEY = "product_history"

export const productStorage = {
  getAll(): Product[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  },

  save(products: Product[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  },

  add(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Product {
    const products = this.getAll()
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    products.push(newProduct)
    this.save(products)
    this.addToHistory({
      id: crypto.randomUUID(),
      productId: newProduct.id,
      action: "created",
      timestamp: new Date().toISOString(),
      changes: newProduct,
    })
    return newProduct
  },

  update(id: string, updates: Partial<Product>): Product | null {
    const products = this.getAll()
    const index = products.findIndex((p) => p.id === id)
    if (index === -1) return null

    const previousValues = { ...products[index] }
    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.save(products)
    this.addToHistory({
      id: crypto.randomUUID(),
      productId: id,
      action: "updated",
      timestamp: new Date().toISOString(),
      changes: updates,
      previousValues,
    })
    return products[index]
  },

  delete(id: string): boolean {
    const products = this.getAll()
    const product = products.find((p) => p.id === id)
    if (!product) return false

    const filtered = products.filter((p) => p.id !== id)
    this.save(filtered)
    this.addToHistory({
      id: crypto.randomUUID(),
      productId: id,
      action: "deleted",
      timestamp: new Date().toISOString(),
      changes: product,
    })
    return true
  },

  findDuplicate(eanPrimary: string, excludeId?: string): Product | null {
    const products = this.getAll()
    return products.find((p) => p.eanPrimary === eanPrimary && p.id !== excludeId) || null
  },

  getHistory(): ProductChange[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(HISTORY_KEY)
    return data ? JSON.parse(data) : []
  },

  addToHistory(change: ProductChange): void {
    if (typeof window === "undefined") return
    const history = this.getHistory()
    history.unshift(change)
    // Keep only last 100 changes
    if (history.length > 100) {
      history.splice(100)
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  },

  clearHistory(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(HISTORY_KEY)
  },
}
