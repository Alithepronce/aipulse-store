"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  ShoppingBag, Clock, CheckCircle2, XCircle, ArrowLeft, 
  Eye, Package, Loader2, Calendar
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/features/auth/AuthProvider"
import { createClient } from "@/lib/supabase/client"

interface Order {
  id: string
  status: "pending" | "approved" | "rejected"
  payment_method: string
  total_amount: number
  created_at: string
  order_items: {
    id: string
    price: number
    product: {
      title: string
      cover_image: string
    } | null
  }[]
}

const statusConfig = {
  pending: {
    label: "قيد المراجعة",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  approved: {
    label: "تم الموافقة",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  rejected: {
    label: "مرفوض",
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
  },
}

const paymentMethods: Record<string, string> = {
  zaincash: "زين كاش",
  fastpay: "فاست باي",
  fib: "FIB",
  mastercard: "ماستركارد",
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!user) return
    
    const fetchOrders = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            price,
            product:products (
              title,
              cover_image
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (data) setOrders(data as unknown as Order[])
      setIsLoading(false)
    }

    fetchOrders()
  }, [user])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <Link
              href="/profile"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">طلباتي</h1>
              <p className="text-muted-foreground mt-1">تتبع حالة طلباتك ومشترياتك</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="glass-panel border border-border rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold mb-2">لا توجد طلبات بعد</h2>
              <p className="text-muted-foreground mb-6">ابدأ بتصفح منتجاتنا الرقمية المميزة</p>
              <Link
                href="/store"
                className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                تصفح المتجر
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusConfig[order.status]
                const StatusIcon = status.icon
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel border border-border rounded-2xl p-6 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="w-5 h-5 text-primary" />
                          <span className="font-bold">طلب #{order.id.slice(0, 8)}</span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color} ${status.border} border`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(order.created_at).toLocaleDateString("ar-IQ")}
                          </span>
                          <span>{paymentMethods[order.payment_method] || order.payment_method}</span>
                          <span>{order.order_items?.length || 0} منتجات</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-primary">
                          {Number(order.total_amount).toLocaleString()} د.ع
                        </span>
                        <button
                          onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                        >
                          <Eye className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </div>
                    </div>

                    {/* Order Details Expansion */}
                    {selectedOrder?.id === order.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pt-4 border-t border-border"
                      >
                        <h4 className="font-bold text-sm mb-3">المنتجات المطلوبة</h4>
                        <div className="space-y-2">
                          {order.order_items?.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-2 px-3 bg-secondary/30 rounded-xl text-sm">
                              <span>{item.product?.title || "منتج محذوف"}</span>
                              <span className="font-bold">{Number(item.price).toLocaleString()} د.ع</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
