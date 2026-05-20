"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShoppingBag, Clock, CheckCircle2, XCircle, 
  Send, Paperclip, Package, Loader2, Calendar, FileText,
  BookOpen, Video, Code, Download, MessageSquare, Library, Bell, Check
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
      id: string
      title: string
      category: string
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
  pending: { label: "قيد المراجعة", icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  approved: { label: "تم التفعيل", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  rejected: { label: "مرفوض", icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
}

const fallbackOrders: Order[] = [
  {
    id: "order_001x",
    status: "approved",
    payment_method: "zaincash",
    total_amount: 50000,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    order_items: [
      {
        id: "item_01",
        price: 50000,
        product: {
          id: "3a93b423-b6eb-4cbc-8020-3b04966be030",
          title: "الإطار القانوني للذكاء الاصطناعي في الأدلة الجنائية",
          category: "كتب إلكترونية",
          cover_image: "/book.png"
        }
      }
    ]
  },
  {
    id: "order_002x",
    status: "pending",
    payment_method: "fastpay",
    total_amount: 120000,
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    order_items: [
      {
        id: "item_02",
        price: 120000,
        product: {
          id: "f2",
          title: "كورس أمن المعلومات والتحقيق الرقمي المتكامل",
          category: "كورسات أونلاين",
          cover_image: "/course.png"
        }
      }
    ]
  }
]

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<"orders" | "library">("orders")
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [messages, setMessages] = useState<OrderMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [isAdminTyping, setIsAdminTyping] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders")
        const result = await res.json()
        if (res.ok && result.data && result.data.length > 0) {
          setOrders(result.data as Order[])
          setSelectedOrder(result.data[0] as Order)
        } else {
          // Fill fallback orders
          setOrders(fallbackOrders)
          setSelectedOrder(fallbackOrders[0])
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err)
        setOrders(fallbackOrders)
        setSelectedOrder(fallbackOrders[0])
      }
      setIsLoading(false)
    }
    fetchOrders()
  }, [user])

  // Support messages loader
  useEffect(() => {
    if (!selectedOrder || !user) return
    
    // Clear and load initial messages
    setMessages([])
    
    // For mock orders, simulate initial messaging
    if (selectedOrder.id.startsWith("order_")) {
      if (selectedOrder.id === "order_001x") {
        setMessages([
          {
            id: "m1",
            order_id: "order_001x",
            user_id: "system",
            message: "مرحباً بك في بوابة الدعم لـ Ai Pulse. تم تأكيد الحوالة المالية بنجاح وربط إيصال التحويل بحسابك. تم تفعيل منتجك الرقمي في المكتبة الخاصة بك.",
            file_url: null,
            is_delivery: true,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
            profiles: { full_name: "مدير النظام", role: "admin" }
          }
        ])
      } else {
        setMessages([
          {
            id: "m2",
            order_id: "order_002x",
            user_id: "system",
            message: "مرحباً بك. لقد استلمنا إيصال الدفع المرفق لطلبك #order_002x. جاري فحص الحوالة يدوياً الآن من قِبل المحاسب بعد اجتياز الفحص التلقائي. يرجى الانتظار قليلاً.",
            file_url: null,
            is_delivery: false,
            created_at: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
            profiles: { full_name: "محاسب المنصة", role: "admin" }
          }
        ])
      }
      return
    }

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
  }, [messages, isAdminTyping])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder || (!newMessage.trim() && !file) || !user) return

    const userMsgText = newMessage.trim()
    setIsSending(true)
    
    // If mock order, simulate chatbot typing
    if (selectedOrder.id.startsWith("order_")) {
      setTimeout(() => {
        // Add user message to local state
        const userMsg: OrderMessage = {
          id: `um_${Date.now()}`,
          order_id: selectedOrder.id,
          user_id: user.id,
          message: userMsgText,
          file_url: null,
          is_delivery: false,
          created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, userMsg])
        setNewMessage("")
        setIsSending(false)

        // Trigger Admin response after 1.8s
        setIsAdminTyping(true)
        
        setTimeout(() => {
          setIsAdminTyping(false)
          let adminReply = ""
          
          if (selectedOrder.id === "order_001x") {
            adminReply = `مرحباً بك يا ${user?.email?.split('@')[0] || "عميلنا"}. هذا المنتج تم تفعيله مسبقاً وتجده متوفراً للتحميل الفوري في تبويب "مكتبتي الرقمية". إذا واجهت مشكلة في التحميل أخبرنا.`
          } else {
            adminReply = `أهلاً بك. نؤكد لك أن عملية فحص الإيصال التلقائي قد اكتملت بنجاح وتطابقت القيمة (120,000 د.ع). سنقوم بإشعارك عبر البريد فور الموافقة النهائية وتفعيل الكورس خلال دقائق معدودة.`
          }

          const responseMsg: OrderMessage = {
            id: `sys_${Date.now()}`,
            order_id: selectedOrder.id,
            user_id: "system",
            message: adminReply,
            file_url: null,
            is_delivery: false,
            created_at: new Date().toISOString(),
            profiles: { full_name: "مساعد الذكاء الاصطناعي للعملاء", role: "admin" }
          }
          
          setMessages(prev => [...prev, responseMsg])
        }, 1800)

      }, 500)
      return
    }

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
          message: userMsgText,
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

  // Get active products for library (all approved items)
  const approvedProducts = orders
    .filter(o => o.status === "approved")
    .flatMap(o => o.order_items.map(item => item.product))
    .filter(Boolean)

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 relative">
      <div className="absolute top-0 right-1/3 w-[600px] h-[600px] glow-purple rounded-full blur-[140px] opacity-[0.08] pointer-events-none z-0"></div>
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Header with user details */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-white/[0.06] pb-6">
          <div className="text-right">
            <h1 className="text-3xl font-serif text-white mb-2">بوابة العميل الرقمية</h1>
            <p className="text-muted-foreground text-xs">مرحباً بك، {user?.email} • أهلاً بك في حسابك الشخصي</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-white/[0.02] border border-white/[0.08] rounded-xl p-1 shrink-0">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "orders"
                  ? "bg-white text-black font-bold"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>متابعة الدعم والطلبات</span>
            </button>
            
            <button
              onClick={() => setActiveTab("library")}
              className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "library"
                  ? "bg-white text-black font-bold"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Library className="w-4 h-4" />
              <span>مكتبتي الرقمية</span>
              {approvedProducts.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white font-mono text-[9px] flex items-center justify-center">
                  {approvedProducts.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Orders and Support Chat */}
        {activeTab === "orders" && (
          <div className="flex flex-col lg:flex-row gap-6 h-[650px] items-stretch">
            
            {/* Sidebar list of orders */}
            <div className="lg:w-80 rounded-2xl border border-white/[0.08] bg-[#07070a]/90 p-4 overflow-y-auto space-y-2 flex-shrink-0">
              <h2 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-4 px-2 text-right">قائمة الطلبات</h2>
              
              {orders.map((order) => {
                const status = statusConfig[order.status]
                const isSelected = selectedOrder?.id === order.id
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full text-right p-4 rounded-xl border transition-all duration-200 ${
                      isSelected 
                        ? 'border-white bg-white/[0.04] shadow-md shadow-white/5' 
                        : 'border-white/[0.04] bg-[#08080c]/30 hover:border-white/10 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2.5">
                      <span className="font-bold text-xs text-white">طلب #{order.id.slice(0, 8)}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${status.bg} ${status.color} ${status.border} border`}>
                        {status.label}
                      </span>
                    </div>
                    
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{new Date(order.created_at).toLocaleDateString("ar-IQ")}</span>
                    </div>
                    
                    <div className="text-xs font-bold text-white flex justify-between items-center mt-3 pt-2.5 border-t border-white/[0.02]">
                      <span className="text-[9px] text-muted-foreground font-normal">طريقة الدفع: {order.payment_method.toUpperCase()}</span>
                      <span>{order.total_amount.toLocaleString()} د.ع</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Chat support box */}
            <div className="flex-1 rounded-2xl border border-white/[0.08] bg-[#07070a]/90 flex flex-col overflow-hidden relative">
              {selectedOrder ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/[0.06] bg-[#0c0c0e]/80 flex justify-between items-center z-10">
                    <div className="text-right">
                      <h3 className="font-bold text-sm text-white">دردشة الدعم والتحقق للطلب #{selectedOrder.id.slice(0, 8)}</h3>
                      <div className="text-[10px] text-muted-foreground mt-1 truncate max-w-sm">
                        المنتجات: {selectedOrder.order_items.map(item => item.product?.title).filter(Boolean).join("، ")}
                      </div>
                    </div>
                    
                    <div className="text-left shrink-0">
                      <div className="text-sm font-bold text-white">قيمة الفاتورة: {selectedOrder.total_amount.toLocaleString()} د.ع</div>
                    </div>
                  </div>

                  {/* Messages log */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {messages.map((msg) => {
                      const isMine = msg.user_id === user?.id
                      const isAdmin = msg.profiles?.role === "admin" || msg.profiles?.role === "owner" || msg.profiles?.role === "general_manager" || msg.user_id === "system"
                      
                      return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[75%] rounded-2xl p-4 text-right transition-all duration-300 ${
                            isMine 
                              ? 'bg-white/[0.03] border border-white/[0.08] text-white' 
                              : 'bg-zinc-900 border border-zinc-800 text-white'
                          }`}>
                            <div className="flex items-center gap-2 mb-2 text-[9px] opacity-60">
                              <span className="font-bold text-white/80">
                                {isMine ? 'أنت' : (msg.profiles?.full_name || 'خدمة العملاء')}
                              </span>
                              <span>•</span>
                              <span>{new Date(msg.created_at).toLocaleTimeString("ar-IQ", { hour: '2-digit', minute: '2-digit' })}</span>
                              {msg.is_delivery && (
                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold ml-auto mr-2">
                                  تفعيل المنتج
                                </span>
                              )}
                            </div>
                            
                            {msg.message && <p className="whitespace-pre-wrap text-xs leading-relaxed">{msg.message}</p>}
                            
                            {msg.file_url && (
                              <a 
                                href={msg.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="mt-3 flex items-center gap-2 bg-black border border-white/[0.04] p-2.5 rounded-xl transition-colors text-xs text-white"
                              >
                                <FileText className="w-4 h-4 text-white" />
                                <span className="font-bold truncate">تحميل المرفق المرسل</span>
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {/* Typing state simulator */}
                    {isAdminTyping && (
                      <div className="flex justify-end">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground animate-pulse">جاري صياغة رد الدعم الفني...</span>
                          <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input fields */}
                  <div className="p-4 border-t border-white/[0.06] bg-[#0c0c0e]/80">
                    {file && (
                      <div className="mb-3 flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-lg text-xs w-fit">
                        <FileText className="w-4 h-4 text-white" />
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <button onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-red-400 hover:opacity-80">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <form onSubmit={handleSendMessage} className="flex gap-2.5 items-center">
                      <div className="relative flex-1">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="اطرح سؤالك أو أرسل استفسارك للدعم..."
                          className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-12 pr-4 py-3 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20 resize-none h-[52px] scrollbar-none"
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
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                        >
                          <Paperclip className="w-4 h-4" />
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
                          className="w-[52px] h-[52px] bg-white hover:bg-neutral-100 text-black rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                        >
                          {isSending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4.5 h-4.5" />
                          )}
                        </button>
                      </MagneticWrapper>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                  <Package className="w-12 h-12 mb-4 opacity-35" />
                  <h3 className="text-base font-serif mb-2">يرجى تحديد طلب للدردشة</h3>
                  <p className="text-xs">اختر أحد الطلبات الرقمية لمطابقتها مع خوادمنا والتحدث للدعم.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Digital Library */}
        {activeTab === "library" && (
          <div>
            {approvedProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.01] p-12 text-center max-w-lg mx-auto">
                <Library className="w-12 h-12 text-muted-foreground mb-4 mx-auto opacity-35" />
                <h3 className="text-lg font-serif text-white mb-2">مكتبتك الرقمية فارغة حالياً</h3>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  تظهر هنا جميع المنتجات الرقمية (كتب، دورات، قوالب برمجية) فور تفعيلها والتحقق من الحوالة المالية بنجاح.
                </p>
                <Link href="/store" className="bg-white text-black font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-neutral-100 transition-colors shadow-lg">
                  تسوق الآن بالمعرض الرقمي
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedProducts.map((prod: any, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={prod.id}
                    className="rounded-2xl border border-white/[0.08] bg-[#07070a]/90 overflow-hidden flex flex-col h-full shadow-lg"
                  >
                    {/* Header Image */}
                    <div className="aspect-[16/9] w-full bg-white/[0.01] border-b border-white/[0.04] relative overflow-hidden flex items-center justify-center">
                      <Image src={prod.cover_image || "/course.png"} alt={prod.title} fill className="object-cover opacity-80" />
                      <div className="absolute top-3 right-3 bg-black/80 border border-white/10 px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase">
                        {prod.category}
                      </div>
                    </div>

                    <div className="p-6 flex-grow flex flex-col justify-between text-right">
                      <div>
                        <h3 className="font-bold text-sm text-white mb-2 leading-tight">{prod.title}</h3>
                        
                        {/* Course/Book progress bar representation */}
                        {prod.category === "كورسات أونلاين" ? (
                          <div className="mt-4 mb-5">
                            <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                              <span>التقدم في الدورة:</span>
                              <span className="text-emerald-400 font-bold">25% (مكتمل)</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400" style={{ width: "25%" }} />
                            </div>
                          </div>
                        ) : prod.category === "كتب إلكترونية" ? (
                          <div className="mt-4 mb-5 text-[9px] text-muted-foreground">
                            مرفق بصيغتين: **PDF** عالي الدقة و **ePub** المخصص للهواتف.
                          </div>
                        ) : (
                          <div className="mt-4 mb-5 text-[9px] text-muted-foreground">
                            قالب جاهز للتحميل شامل كامل ملفات التثبيت والسورس كود.
                          </div>
                        )}
                      </div>

                      {/* Download controls */}
                      <div className="space-y-2 mt-4">
                        <Link
                          href={`/products/${prod.id}`}
                          className="w-full py-2 border border-white/[0.08] bg-white/[0.02] text-white hover:bg-white/[0.04] text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>فتح عينة المعاينة الذكية</span>
                        </Link>
                        
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            alert("جاري تحميل الملفات الرقمية للكمبيوتر... شكراً لشرائك من Ai Pulse.")
                          }}
                          className="w-full py-2.5 bg-white text-black hover:bg-neutral-100 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل الملف الكامل للمنتج</span>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
