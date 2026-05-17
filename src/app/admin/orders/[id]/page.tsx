"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Package, User, Calendar, DollarSign, MessageSquare, Send, Paperclip, CheckCircle, FileText, Download, Loader2, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/features/auth/AuthProvider"

interface OrderDetail {
  id: string
  status: "pending" | "approved" | "rejected"
  total_amount: number
  created_at: string
  profiles: {
    full_name: string
    email: string
    phone: string
  } | null
  order_items: {
    id: string
    price: number
    quantity: number
    product: {
      title: string
      cover_image: string
      price: number
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

export default function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const { user } = useAuth()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [messages, setMessages] = useState<OrderMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchOrderAndMessages = async () => {
      const supabase = createClient()
      
      const { data: orderData } = await supabase
        .from("orders")
        .select(`
          *,
          profiles (full_name, email, phone),
          order_items (
            id,
            price,
            quantity,
            product:products (title, cover_image, price)
          )
        `)
        .eq("id", id)
        .single()

      if (orderData) {
        setOrder(orderData as unknown as OrderDetail)
      }

      const { data: messagesData } = await supabase
        .from("order_messages")
        .select(`*, profiles(full_name, role)`)
        .eq("order_id", id)
        .order("created_at", { ascending: true })

      if (messagesData) {
        setMessages(messagesData as OrderMessage[])
      }
      
      setIsLoading(false)
    }

    fetchOrderAndMessages()

    const supabase = createClient()
    const subscription = supabase
      .channel('admin_order_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_messages', filter: `order_id=eq.${id}` }, (payload) => {
        supabase.from('profiles').select('full_name, role').eq('id', payload.new.user_id).single().then(({ data }) => {
          const newMsg = { ...payload.new, profiles: data } as OrderMessage
          setMessages(prev => [...prev, newMsg])
        })
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent, isDelivery: boolean = false) => {
    e.preventDefault()
    if (!order || (!newMessage.trim() && !file && !isDelivery) || !user) return

    setIsSending(true)
    const supabase = createClient()
    let fileUrl = null

    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${order.id}/${Math.random()}.${fileExt}`
      const { data, error } = await supabase.storage.from('order_attachments').upload(fileName, file)
      if (data) {
        const { data: publicUrlData } = supabase.storage.from('order_attachments').getPublicUrl(fileName)
        fileUrl = publicUrlData.publicUrl
      }
    }

    const { error } = await supabase.from('order_messages').insert({
      order_id: order.id,
      user_id: user.id,
      message: newMessage.trim(),
      file_url: fileUrl,
      is_delivery: isDelivery
    })

    if (!error) {
      setNewMessage("")
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
    setIsSending(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        لم يتم العثور على الطلب
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="p-2 hover:bg-secondary rounded-xl transition-colors">
          <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            طلب #{order.id.slice(0, 8)}
            <span className={`text-sm px-3 py-1 rounded-lg ${
              order.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
              order.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
              'bg-amber-500/10 text-amber-500'
            }`}>
              {order.status === 'approved' ? 'تم الموافقة' : order.status === 'rejected' ? 'مرفوض' : 'قيد التنفيذ'}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">تم الطلب في {new Date(order.created_at).toLocaleDateString("ar-SA")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order details */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              تفاصيل العميل
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الاسم</span>
                <span className="font-medium">{order.profiles?.full_name || 'غير متوفر'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">البريد الإلكتروني</span>
                <span className="font-medium">{order.profiles?.email || 'غير متوفر'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">رقم الهاتف</span>
                <span className="font-medium" dir="ltr">{order.profiles?.phone || 'غير متوفر'}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              المنتجات
            </h3>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{item.product?.title || 'منتج غير معروف'}</h4>
                    <p className="text-muted-foreground text-xs mt-1">الكمية: {item.quantity || 1}</p>
                    <p className="font-bold text-primary text-sm mt-1">{item.price} د.ع</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center font-bold">
              <span>الإجمالي</span>
              <span className="text-lg text-primary">{Number(order.total_amount).toLocaleString()} د.ع</span>
            </div>
          </div>
        </div>

        {/* Right Column: Chat and Delivery */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl shadow-sm flex flex-col h-[600px]">
            <div className="p-4 border-b border-border bg-secondary/10 flex justify-between items-center rounded-t-2xl z-10">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                المراسلة وتسليم الملفات
              </h3>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-70">
                  <Package className="w-12 h-12 mb-4" />
                  <p>لا توجد رسائل بعد</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.profiles?.role === "admin" || msg.profiles?.role === "owner" || msg.profiles?.role === "general_manager"
                  const isMine = msg.user_id === user?.id

                  return (
                    <div key={msg.id} className={`flex flex-col ${isMine ? "items-start" : "items-end"}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.is_delivery 
                          ? "bg-emerald-500/10 border border-emerald-500/20 w-full md:w-3/4" 
                          : isMine
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-secondary rounded-tl-none border border-border"
                      }`}>
                        {msg.is_delivery ? (
                          <div className="flex flex-col gap-3 text-emerald-950 dark:text-emerald-50">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold">
                              <CheckCircle className="w-5 h-5" />
                              <span>تسليم نهائي للملفات</span>
                            </div>
                            {msg.message && <p className="text-sm">{msg.message}</p>}
                            {msg.file_url && (
                              <div className="bg-background rounded-xl p-3 border border-border flex items-center justify-between mt-2">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-5 h-5 text-primary" />
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-foreground truncate">ملف مرفق</p>
                                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">عرض الملف</a>
                                  </div>
                                </div>
                                <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors flex-shrink-0">
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs opacity-70 mb-1">
                              <span className="font-bold">{isMine ? 'أنت' : (isAdmin ? 'الإدارة' : msg.profiles?.full_name || 'مستخدم')}</span>
                            </div>
                            {msg.message && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>}
                            {msg.file_url && (
                              <a 
                                href={msg.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`mt-2 flex items-center gap-2 p-3 rounded-xl transition-colors border text-sm ${
                                  isMine 
                                    ? 'bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20' 
                                    : 'bg-background hover:bg-background/80 border-border'
                                }`}
                              >
                                <FileText className="w-5 h-5" />
                                <span className="font-bold truncate">مرفق</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground mt-2 px-2">
                        {new Date(msg.created_at).toLocaleTimeString("ar-IQ", { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-secondary/5 rounded-b-2xl">
              {/* Delivery Action Button */}
              <div className="mb-4 flex flex-wrap gap-2">
                <button 
                  onClick={(e) => handleSendMessage(e, true)}
                  disabled={isSending || (!newMessage.trim() && !file)}
                  className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  تسليم الملفات النهائية
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-background border border-border hover:bg-secondary px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                  إرفاق ملف
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>

              {file && (
                <div className="mb-3 flex items-center gap-2 bg-background p-2 rounded-lg text-sm w-fit border border-border">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <button onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-destructive hover:opacity-80">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={(e) => handleSendMessage(e, false)} className="flex items-end gap-2 relative">
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="اكتب رسالة..."
                  className="flex-1 bg-background border border-border rounded-xl p-3 min-h-[50px] max-h-[120px] resize-y focus:outline-none focus:border-primary text-sm"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e, false)
                    }
                  }}
                />
                <button 
                  type="submit" 
                  disabled={isSending || (!newMessage.trim() && !file)}
                  className="h-[50px] px-6 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 rtl:-scale-x-100" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
