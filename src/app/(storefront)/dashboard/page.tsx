"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { 
  ShoppingBag, Clock, CheckCircle2, XCircle, 
  Send, Paperclip, Package, Loader2, Calendar, FileText
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/features/auth/AuthProvider"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { MagneticWrapper } from "@/components/ui/MagneticWrapper"

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

interface OrderMessage {
  id: string
  order_id: string
  user_id: string
  message: string
  file_url: string | null
  is_delivery: boolean
  created_at: string
  profiles?: {
    full_name: string
    role: string
  }
}

const statusConfig = {
  pending: { label: "قيد المراجعة", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  approved: { label: "تم الموافقة", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  rejected: { label: "مرفوض", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [messages, setMessages] = useState<OrderMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders")
        const result = await res.json()
        if (res.ok && result.data) {
          setOrders(result.data as Order[])
          if (result.data.length > 0) setSelectedOrder(result.data[0] as Order)
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err)
      }
      setIsLoading(false)
    }
    fetchOrders()
  }, [user])

  useEffect(() => {
    if (!selectedOrder || !user) return
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/orders/${selectedOrder.id}/messages`)
        const result = await res.json()
        if (res.ok && result.data) setMessages(result.data as OrderMessage[])
      } catch (err) {
        console.error("Failed to fetch messages:", err)
      }
    }
    fetchMessages()

    const supabase = createClient()
    const subscription = supabase
      .channel('order_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_messages', filter: `order_id=eq.${selectedOrder.id}` }, (payload) => {
        // Fetch profile info for the new message
        supabase.from('profiles').select('full_name, role').eq('id', payload.new.user_id).single().then(({ data }) => {
          const newMsg = { ...payload.new, profiles: data } as OrderMessage
          setMessages(prev => [...prev, newMsg])
        })
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [selectedOrder, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder || (!newMessage.trim() && !file) || !user) return

    setIsSending(true)
    try {
      let fileUrl = null

      if (file) {
        const formData = new FormData()
        formData.append("file", file)
        const uploadRes = await fetch("/api/upload/receipt", {
          method: "POST",
          body: formData,
        })
        const uploadResult = await uploadRes.json()
        if (uploadRes.ok) {
          fileUrl = uploadResult.data?.url
        }
      }

      const res = await fetch(`/api/orders/${selectedOrder.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage.trim(),
          file_url: fileUrl,
        }),
      })

      if (res.ok) {
        setNewMessage("")
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    } catch (err) {
      console.error("Failed to send message:", err)
    }
    setIsSending(false)
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">بوابة العميل</h1>
          <p className="text-muted-foreground mt-1">تتبع طلباتك وتواصل مع فريق الدعم</p>
        </div>

        {orders.length === 0 ? (
          <div className="glass-panel border border-border rounded-2xl p-12 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">لا توجد طلبات بعد</h2>
            <p className="text-muted-foreground mb-6">قم بتصفح المتجر لطلب خدماتنا أو منتجاتنا</p>
            <MagneticWrapper>
              <Link
                href="/store"
                className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                تصفح المتجر
              </Link>
            </MagneticWrapper>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 h-[700px]">
            {/* Orders Sidebar */}
            <div className="lg:w-1/3 glass-panel border border-border rounded-2xl p-4 overflow-y-auto space-y-3 flex-shrink-0">
              <h2 className="font-bold text-lg mb-4 px-2">طلباتي</h2>
              {orders.map((order) => {
                const status = statusConfig[order.status]
                const isSelected = selectedOrder?.id === order.id
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full text-right p-4 rounded-xl border transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/30 hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold">طلب #{order.id.slice(0, 8)}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${status.bg} ${status.color} ${status.border} border`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.created_at).toLocaleDateString("ar-IQ")}
                    </div>
                    <div className="text-sm font-bold text-primary">
                      {Number(order.total_amount).toLocaleString()} د.ع
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Chat Area */}
            <div className="flex-1 glass-panel border border-border rounded-2xl flex flex-col overflow-hidden relative">
              {selectedOrder ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border bg-background/50 flex justify-between items-center z-10">
                    <div>
                      <h3 className="font-bold text-lg">تفاصيل الطلب #{selectedOrder.id.slice(0, 8)}</h3>
                      <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-2">
                        {selectedOrder.order_items.map(item => item.product?.title).filter(Boolean).join("، ")}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold text-primary">{Number(selectedOrder.total_amount).toLocaleString()} د.ع</div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-70">
                        <Package className="w-12 h-12 mb-4" />
                        <p>لا توجد رسائل سابقة. ابدأ المحادثة الآن!</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMine = msg.user_id === user?.id
                        const isAdmin = msg.profiles?.role === "admin" || msg.profiles?.role === "owner" || msg.profiles?.role === "general_manager"
                        return (
                          <div key={msg.id} className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 ${
                              isMine 
                                ? 'bg-primary/10 border border-primary/20 text-foreground' 
                                : isAdmin 
                                  ? 'bg-secondary border border-border text-foreground' 
                                  : 'bg-muted border border-border text-muted-foreground'
                            }`}>
                              <div className="flex items-center gap-2 mb-2 text-xs opacity-70">
                                <span className="font-bold">{isMine ? 'أنت' : (isAdmin ? 'الإدارة' : msg.profiles?.full_name || 'مستخدم')}</span>
                                <span>•</span>
                                <span>{new Date(msg.created_at).toLocaleTimeString("ar-IQ", { hour: '2-digit', minute: '2-digit' })}</span>
                                {msg.is_delivery && (
                                  <span className="bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full font-bold ml-auto">
                                    تسليم نهائي
                                  </span>
                                )}
                              </div>
                              {msg.message && <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>}
                              {msg.file_url && (
                                <a 
                                  href={msg.file_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="mt-3 flex items-center gap-2 bg-background/50 hover:bg-background p-3 rounded-xl transition-colors border border-border/50 text-sm"
                                >
                                  <FileText className="w-5 h-5 text-primary" />
                                  <span className="font-bold truncate">مرفق</span>
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border bg-background/50">
                    {file && (
                      <div className="mb-3 flex items-center gap-2 bg-secondary p-2 rounded-lg text-sm w-fit border border-border">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <button onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-destructive hover:opacity-80">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                      <div className="relative flex-1">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="اكتب رسالتك هنا..."
                          className="w-full bg-secondary border-none rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/50 resize-none h-[52px] scrollbar-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage(e)
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </div>
                      <MagneticWrapper>
                        <button
                          type="submit"
                          disabled={isSending || (!newMessage.trim() && !file)}
                          className="w-[52px] h-[52px] bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        >
                          {isSending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                        </button>
                      </MagneticWrapper>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                  <Package className="w-16 h-16 mb-4 opacity-50" />
                  <h3 className="text-xl font-bold mb-2">اختر طلباً</h3>
                  <p>اختر أحد طلباتك من القائمة الجانبية لعرض التفاصيل والمراسلة</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
