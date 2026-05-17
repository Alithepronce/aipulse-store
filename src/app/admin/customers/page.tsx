"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Search, Users, Loader2, ChevronLeft, ChevronRight, Mail, Phone, ShoppingBag, Calendar } from "lucide-react"

interface Customer {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role: string
  created_at: string
  orders_count: number
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "15" })
      if (searchQuery.trim()) params.set("search", searchQuery.trim())

      const res = await fetch(`/api/admin/customers?${params}`)
      const json = await res.json()
      if (json.success) {
        setCustomers(json.data.customers)
        setTotalPages(json.data.pagination.totalPages)
        setTotal(json.data.pagination.total)
      }
    } catch {
      console.error("Failed to fetch customers")
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => { setPage(1) }, 300)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Users className="w-7 h-7 text-primary" />
            إدارة العملاء
          </h1>
          <p className="text-muted-foreground text-sm mt-1">عرض وإدارة جميع العملاء المسجلين</p>
        </div>
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 px-4 py-2 rounded-xl">
          <Users className="w-5 h-5 text-primary" />
          <span className="font-bold text-primary">{total}</span>
          <span className="text-sm text-muted-foreground">عميل مسجل</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-border bg-secondary/10">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو البريد أو الهاتف..."
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
          ) : customers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>لا يوجد عملاء مسجلين</p>
            </div>
          ) : (
            <table className="w-full text-sm text-right">
              <thead className="bg-secondary/30 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">العميل</th>
                  <th className="px-6 py-4 font-medium">البريد الإلكتروني</th>
                  <th className="px-6 py-4 font-medium">الهاتف</th>
                  <th className="px-6 py-4 font-medium">الطلبات</th>
                  <th className="px-6 py-4 font-medium">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                          {customer.full_name?.charAt(0) || "؟"}
                        </div>
                        <span className="font-bold">{customer.full_name || "بدون اسم"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="text-xs" dir="ltr">{customer.email || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        <span dir="ltr">{customer.phone || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                        <span className="font-bold text-primary">{customer.orders_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(customer.created_at).toLocaleDateString("ar-IQ")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-secondary/10">
          <span>عرض {customers.length} من أصل {total} عميل</span>
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
