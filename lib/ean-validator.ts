export function validateEAN13(ean: string): boolean {
  // Remove any whitespace
  const cleaned = ean.replace(/\s/g, "")

  // Check if it's exactly 13 digits
  if (!/^\d{13}$/.test(cleaned)) {
    return false
  }

  // Calculate checksum
  let sum = 0
  for (let i = 0; i < 12; i++) {
    const digit = Number.parseInt(cleaned[i])
    sum += i % 2 === 0 ? digit : digit * 3
  }

  const checksum = (10 - (sum % 10)) % 10
  return checksum === Number.parseInt(cleaned[12])
}

export function formatEAN(ean: string): string {
  const cleaned = ean.replace(/\s/g, "")
  if (cleaned.length !== 13) return ean
  return cleaned
}

export function getEANError(ean: string): string | null {
  if (!ean) return "EAN es requerido"

  const cleaned = ean.replace(/\s/g, "")

  if (!/^\d+$/.test(cleaned)) {
    return "EAN debe contener solo números"
  }

  if (cleaned.length !== 13) {
    return "EAN debe tener exactamente 13 dígitos"
  }

  if (!validateEAN13(cleaned)) {
    return "EAN inválido (checksum incorrecto)"
  }

  return null
}
