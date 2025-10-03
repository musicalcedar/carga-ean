"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Product, ProductChange } from "@/lib/types"
import { Package, PackageCheck, TrendingUp, History } from "lucide-react"

interface DashboardStatsProps {
  products: Product[]
  history: ProductChange[]
}

export function DashboardStats({ products, history }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    return {
      total: products.length,
      withSecondaryEAN: products.filter((p) => p.eanSecondary).length,
      recentlyAdded: products.filter((p) => new Date(p.createdAt) > last7Days).length,
      recentlyUpdated: products.filter((p) => new Date(p.updatedAt) > last7Days && p.createdAt !== p.updatedAt).length,
      last30DaysActivity: history.filter((h) => new Date(h.timestamp) > last30Days).length,
    }
  }, [products, history])

  const statCards = [
    {
      title: "Total Productos",
      value: stats.total,
      icon: Package,
      description: "Productos registrados",
      color: "text-primary",
    },
    {
      title: "Con EAN Secundario",
      value: stats.withSecondaryEAN,
      icon: PackageCheck,
      description: `${stats.total > 0 ? Math.round((stats.withSecondaryEAN / stats.total) * 100) : 0}% del total`,
      color: "text-accent",
    },
    {
      title: "Agregados (7 días)",
      value: stats.recentlyAdded,
      icon: TrendingUp,
      description: "Nuevos productos",
      color: "text-chart-2",
    },
    {
      title: "Actividad (30 días)",
      value: stats.last30DaysActivity,
      icon: History,
      description: "Cambios registrados",
      color: "text-chart-3",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
