import { createClient } from "@/lib/supabase/client"
import type { Product } from "./types"

export async function getAllProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching products:", error)
    return []
  }

  return (data || []).map((row) => ({
    id: row.id,
    code: row.code,
    description: row.description,
    eanPrimary: row.ean_primary,
    eanSecondary: row.ean_secondary || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function createProduct(productData: {
  code: string
  description: string
  eanPrimary: string
  eanSecondary: string
}): Promise<Product | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("products")
    .insert({
      code: productData.code,
      description: productData.description,
      ean_primary: productData.eanPrimary,
      ean_secondary: productData.eanSecondary || null,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating product:", error)
    return null
  }

  // Log activity
  await logActivity("created", productData.code, productData.description)

  return {
    id: data.id,
    code: data.code,
    description: data.description,
    eanPrimary: data.ean_primary,
    eanSecondary: data.ean_secondary || "",
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function updateProduct(
  id: string,
  productData: {
    code: string
    description: string
    eanPrimary: string
    eanSecondary: string
  },
): Promise<Product | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("products")
    .update({
      code: productData.code,
      description: productData.description,
      ean_primary: productData.eanPrimary,
      ean_secondary: productData.eanSecondary || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating product:", error)
    return null
  }

  // Log activity
  await logActivity("updated", productData.code, productData.description)

  return {
    id: data.id,
    code: data.code,
    description: data.description,
    eanPrimary: data.ean_primary,
    eanSecondary: data.ean_secondary || "",
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function deleteProduct(id: string, code: string, description: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting product:", error)
    return false
  }

  // Log activity
  await logActivity("deleted", code, description)

  return true
}

export async function getActivityHistory() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("activity_history")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(100)

  if (error) {
    console.error("[v0] Error fetching activity history:", error)
    return []
  }

  return (data || []).map((row) => ({
    id: row.id,
    productId: row.id,
    action: row.action as "created" | "updated" | "deleted",
    timestamp: row.timestamp,
    changes: {
      code: row.product_code,
      description: row.product_description,
    },
  }))
}

async function logActivity(action: string, code: string, description: string) {
  const supabase = createClient()

  await supabase.from("activity_history").insert({
    action,
    product_code: code,
    product_description: description,
  })
}
