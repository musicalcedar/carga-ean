export interface Product {
  id: string
  code: string
  description: string
  eanPrimary: string
  eanSecondary: string
  createdAt: string
  updatedAt: string
}

export interface ProductChange {
  id: string
  productId: string
  action: "created" | "updated" | "deleted"
  timestamp: string
  changes: Partial<Product>
  previousValues?: Partial<Product>
}

export interface ProductStats {
  total: number
  withSecondaryEAN: number
  recentlyAdded: number
  recentlyUpdated: number
}

// Additional interfaces or types can be added here if necessary
