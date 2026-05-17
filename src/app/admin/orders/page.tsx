"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Search, Eye, Loader2, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react"

interface Order {
  id: string
  status: "pending" | "approved" | "rejected"
  payment_method: string
  total_amount: number
  created_at: string
  payment_receipt_url: string | null
  profiles: { full_name: string; phone: string } | null
  order_items: { id: string; price: number; product: { title: string } | null }[]
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "قيد المراجعة", color: "text-amber-500", bg: "bg-amber-500/10" },
  approved: { label: "مكتمل", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  rejected: { label: "مرفوض", color: "text-destructive", bg: "bg-destructive/10" },
}

const paymentLabels: Record<string, string> = {
  zaincash: "زين كاش",
  fastpay: "فاست باي",
  fib: "FIB",
  mastercard: "ماستركارد",
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "15" })
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (searchQuery.trim()) params.set("search", searchQuery.trim())

      const res = await fetch(`/api/orders?${params}`)
      const json = await res.json()
      if (json.success) {
        setOrders(json.data.orders)
        setTotalPages(json.data.pagination.totalPages)
        setTotal(json.data.pagination.total)
      }
    } catch {
      console.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, searchQuery])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => { setPage(1) }, 300)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  const statusTabs = [
    { key: "all", label: "الكل" },
    { key: "pending", label: "قيد المراجعة" },
    { key: "approved", label: "مكتمل" },
    { key: "rejected", label: "مرفوض" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">إدارة الطلبات</h1>
        <p className="text-muted-foreground text-sm">متابعة وإدارة جميع طلبات العملاء</p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Status Tabs */}
        <div className="flex border-b border-border overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setPage(1) }}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                statusFilter === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border bg-secondary/10">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث برقم الطلب..."
              className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">لا توجد طلبات</div>
          ) : (
            <table className="w-full text-sm text-right">
              <thead className="bg-secondary/30 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">رقم الطلب</th>
                  <th className="px-6 py-4 font-medium">العميل</th>
                  <th className="px-6 py-4 font-medium">طريقة الدفع</th>
                  <th className="px-6 py-4 font-medium">المبلغ</th>
                  <th className="px-6 py-4 font-medium">التاريخ</th>
                  <th className="px-6 py-4 font-medium">الحالة</th>
                  <th className="px-6 py-4 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending
                  return (
                    <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs">#{order.id.slice(0, 8)}</td>
                      <td className="px-6 py-4">{order.profiles?.full_name || "—"}</td>
                      <td className="px-6 py-4 text-muted-foreground">{paymentLabels[order.payment_method] || order.payment_method}</td>
                      <td className="px-6 py-4 font-bold text-primary">{Number(order.total_amount).toLocaleString()} د.ع</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(order.created_at).toLocaleDateString("ar-IQ")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center justify-center p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-secondary/10">
          <span>عرض {orders.length} من أصل {total} طلب</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="font-bold">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
