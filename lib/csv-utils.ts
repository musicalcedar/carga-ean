import type { Product } from "./types"

export function exportToCSV(products: Product[]): void {
  const headers = ["Código", "Descripción", "EAN Principal", "EAN Secundario", "Fecha Creación", "Última Actualización"]
  const rows = products.map((p) => [
    p.code,
    p.description,
    p.eanPrimary,
    p.eanSecondary,
    new Date(p.createdAt).toLocaleString("es-ES"),
    new Date(p.updatedAt).toLocaleString("es-ES"),
  ])

  const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `productos_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function parseCSV(csvText: string): Omit<Product, "id" | "createdAt" | "updatedAt">[] {
  const lines = csvText.split("\n").filter((line) => line.trim())
  if (lines.length < 2) return []

  // Skip header
  const dataLines = lines.slice(1)

  return dataLines
    .map((line) => {
      // Simple CSV parser (handles quoted fields)
      const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || []
      const fields = matches.map((field) => field.replace(/^"|"$/g, "").trim())

      return {
        code: fields[0] || "",
        description: fields[1] || "",
        eanPrimary: fields[2] || "",
        eanSecondary: fields[3] || "",
      }
    })
    .filter((p) => p.code && p.eanPrimary)
}
