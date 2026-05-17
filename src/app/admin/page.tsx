"use client"

import React, { useEffect, useState } from "react"
import { DollarSign, ShoppingBag, Users, Package, ArrowUpRight, Loader2, Clock, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

interface Stats {
  totalOrders: number
  totalProducts: number
  totalUsers: number
  totalRevenue: number
  pendingOrders: number
  recentOrders: {
    id: string
    status: string
    total_amount: number
    created_at: string
    payment_method: string
    profiles: { full_name: string } | null
  }[]
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: "قيد المراجعة", color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock },
  approved: { label: "مكتمل", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2 },
  rejected: { label: "مرفوض", color: "text-destructive", bg: "bg-destructive/10", icon: XCircle },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats")
        const json = await res.json()
        if (json.success) {
          setStats(json.data)
        } else {
          setError(json.error || "حدث خطأ")
        }
      } catch {
        setError("فشل الاتصال بالخادم")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-destructive">
        <p>{error || "حدث خطأ غير متوقع"}</p>
      </div>
    )
  }

  const statCards = [
    { title: "إجمالي الإيرادات", value: `${stats.totalRevenue.toLocaleString()} د.ع`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "الطلبات", value: stats.totalOrders.toString(), icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500/10", badge: stats.pendingOrders > 0 ? `${stats.pendingOrders} بانتظار` : null },
    { title: "العملاء", value: stats.totalUsers.toString(), icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "المنتجات النشطة", value: stats.totalProducts.toString(), icon: Package, color: "text-amber-500", bg: "bg-amber-500/10" },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              {stat.badge && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
                  {stat.badge}
                </span>
              )}
            </div>
            <h3 className="text-muted-foreground text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Summary */}
        <div className="xl:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">ملخص الطلبات</h3>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-4">
            {[
              { label: "بانتظار المراجعة", count: stats.pendingOrders, color: "border-amber-500", bg: "bg-amber-500/5", textColor: "text-amber-500" },
              { label: "مكتملة", count: stats.totalOrders - stats.pendingOrders, color: "border-emerald-500", bg: "bg-emerald-500/5", textColor: "text-emerald-500" },
              { label: "إجمالي", count: stats.totalOrders, color: "border-primary", bg: "bg-primary/5", textColor: "text-primary" },
            ].map((item, i) => (
              <div key={i} className={`${item.bg} border-2 ${item.color} rounded-2xl p-6 flex flex-col items-center justify-center text-center`}>
                <p className={`text-4xl font-bold ${item.textColor} mb-2`}>{item.count}</p>
                <p className="text-sm text-muted-foreground font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-6">أحدث الطلبات</h3>
          <div className="space-y-4 flex-1">
            {stats.recentOrders.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                لا توجد طلبات بعد
              </div>
            ) : (
              stats.recentOrders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending
                return (
                  <Link key={order.id} href={`/admin/orders/${order.id}`} className="block">
                    <div className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0 hover:bg-secondary/20 -mx-2 px-2 py-2 rounded-lg transition-colors">
                      <div>
                        <p className="font-bold text-sm">{order.profiles?.full_name || "عميل"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("ar-IQ")}
                        </p>
                      </div>
                      <div className="text-left">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                        <p className="text-xs font-bold text-primary mt-1">{Number(order.total_amount).toLocaleString()} د.ع</p>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
          <Link href="/admin/orders" className="w-full mt-6 py-2 text-sm font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center gap-2">
            عرض كل الطلبات
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
