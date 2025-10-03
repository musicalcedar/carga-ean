"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ProductChange } from "@/lib/types"
import { Plus, Edit, Trash2, Clock } from "lucide-react"

interface ActivityHistoryProps {
  history: ProductChange[]
  limit?: number
}

export function ActivityHistory({ history, limit = 10 }: ActivityHistoryProps) {
  const recentHistory = history.slice(0, limit)

  const getActionIcon = (action: ProductChange["action"]) => {
    switch (action) {
      case "created":
        return <Plus className="h-4 w-4" />
      case "updated":
        return <Edit className="h-4 w-4" />
      case "deleted":
        return <Trash2 className="h-4 w-4" />
    }
  }

  const getActionColor = (action: ProductChange["action"]) => {
    switch (action) {
      case "created":
        return "bg-accent text-accent-foreground"
      case "updated":
        return "bg-primary text-primary-foreground"
      case "deleted":
        return "bg-destructive text-destructive-foreground"
    }
  }

  const getActionText = (action: ProductChange["action"]) => {
    switch (action) {
      case "created":
        return "Creado"
      case "updated":
        return "Actualizado"
      case "deleted":
        return "Eliminado"
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return "Hace un momento"
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`
    return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historial de Actividad
        </CardTitle>
        <CardDescription>Últimos cambios en el inventario</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {recentHistory.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-center text-muted-foreground">
              <div>
                <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No hay actividad reciente</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentHistory.map((change) => (
                <div key={change.id} className="flex gap-3 pb-4 border-b last:border-0">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getActionColor(change.action)}`}
                  >
                    {getActionIcon(change.action)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getActionText(change.action)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(change.timestamp)}</span>
                    </div>
                    <p className="text-sm font-medium">
                      {change.changes.description || change.previousValues?.description || "Producto"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {change.changes.code || change.previousValues?.code}
                    </p>
                    {change.action === "updated" && change.previousValues && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {Object.keys(change.changes).map((key) => {
                          if (key === "updatedAt") return null
                          return (
                            <div key={key} className="flex gap-1">
                              <span className="capitalize">{key}:</span>
                              <span className="line-through opacity-60">
                                {String(change.previousValues?.[key as keyof typeof change.previousValues])}
                              </span>
                              <span>→</span>
                              <span className="font-medium">
                                {String(change.changes[key as keyof typeof change.changes])}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
