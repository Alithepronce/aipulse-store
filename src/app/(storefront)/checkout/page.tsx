"use client"

import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Shield, Lock, CheckCircle2, ArrowRight, Upload, 
  AlertCircle, Loader2, CreditCard, Smartphone,
  Copy, Check, Image as ImageIcon
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/features/cart/CartProvider"
import { useAuth } from "@/features/auth/AuthProvider"
import { MagneticWrapper } from "@/components/ui/MagneticWrapper"

const paymentMethods = [
  {
    id: "zaincash",
    name: "زين كاش",
    icon: "💳",
    color: "from-green-500 to-green-600",
    number: "07801234567",
    instructions: "حوّل المبلغ إلى الرقم أعلاه عبر تطبيق زين كاش، ثم ارفع صورة الإيصال"
  },
  {
    id: "fastpay",
    name: "فاست باي",
    icon: "⚡",
    color: "from-blue-500 to-blue-600",
    number: "07901234567",
    instructions: "استخدم تطبيق FastPay لتحويل المبلغ إلى الرقم أعلاه"
  },
  {
    id: "fib",
    name: "FIB",
    icon: "🏦",
    color: "from-amber-500 to-amber-600",
    number: "IBAN: IQ12 FIBR 0012 3456 7890",
    instructions: "حوّل عبر تطبيق FIB أو فرع المصرف الأقرب إليك"
  },
  {
    id: "mastercard",
    name: "ماستركارد",
    icon: "💎",
    color: "from-purple-500 to-purple-600",
    number: "يرجى التواصل للحصول على رابط الدفع",
    instructions: "سيتم إرسال رابط دفع آمن عبر البريد الإلكتروني خلال دقائق"
  },
]

export default function CheckoutPage() {
  const { items, totalCount, clearCart } = useCart()
  const { user } = useAuth()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedNumber, setCopiedNumber] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal // No tax for Iraq

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم الملف يجب أن لا يتجاوز 5 ميغابايت")
        return
      }
      setReceiptFile(file)
      setError(null)
      const reader = new FileReader()
      reader.onload = (ev) => setReceiptPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedNumber(true)
    setTimeout(() => setCopiedNumber(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMethod) {
      setError("يرجى اختيار طريقة الدفع")
      return
    }
    if (selectedMethod !== "mastercard" && !receiptFile) {
      setError("يرجى رفع صورة إيصال الدفع")
      return
    }
    if (!user) {
      setError("يرجى تسجيل الدخول أولاً")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      let receiptUrl = null
      
      // Upload receipt via API route
      if (receiptFile) {
        const formData = new FormData()
        formData.append("file", receiptFile)
        
        const uploadRes = await fetch("/api/upload/receipt", {
          method: "POST",
          body: formData,
        })
        
        const uploadResult = await uploadRes.json()
        
        if (!uploadRes.ok) {
          if (uploadRes.status === 429) {
            setError("محاولات كثيرة لرفع الإيصال. يرجى الانتظار قليلاً")
            return
          }
          // If storage not configured yet, proceed without it
          console.warn("Receipt upload skipped:", uploadResult.error)
        } else {
          receiptUrl = uploadResult.data?.url
        }
      }

      // Create order via API route
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_method: selectedMethod,
          payment_receipt_url: receiptUrl,
          total_amount: total,
          items: items.map((item) => ({
            product_id: item.id,
            price: item.price,
          })),
        }),
      })

      const orderResult = await orderRes.json()

      if (!orderRes.ok) {
        if (orderRes.status === 429) {
          setError("لقد أرسلت طلبات كثيرة. يرجى الانتظار دقيقة")
          return
        }
        throw new Error(orderResult.error || "فشل في إنشاء الطلب")
      }

      setIsSuccess(true)
      clearCart()
    } catch (err: unknown) {
      console.error("Checkout error:", err)
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى"
      setError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Success Screen
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 pb-20 px-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full mx-auto p-8 glass-panel border border-border text-center rounded-3xl"
        >
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-4">تم استلام طلبك بنجاح! 🎉</h2>
          <p className="text-muted-foreground mb-8">
            شكراً لثقتك بمنصة Ai Pulse. سيتم مراجعة إيصال الدفع والموافقة على طلبك خلال ساعات.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            سيتم إرسال روابط التحميل إلى بريدك الإلكتروني بعد الموافقة.
          </p>
          <div className="space-y-3">
            <MagneticWrapper>
              <Link href="/profile/orders" className="flex items-center justify-center w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                متابعة طلبي
              </Link>
            </MagneticWrapper>
            <MagneticWrapper>
              <Link href="/store" className="flex items-center justify-center w-full py-4 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-all">
                العودة للمتجر
              </Link>
            </MagneticWrapper>
          </div>
        </motion.div>
      </div>
    )
  }

  // Empty Cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 pb-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">سلتك فارغة</h2>
          <MagneticWrapper>
            <Link href="/store" className="text-primary hover:bg-primary/5 rounded-xl px-4 py-2 mt-4 flex items-center gap-2 justify-center w-fit mx-auto transition-colors">
              <span>تصفح المنتجات</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Link>
          </MagneticWrapper>
        </div>
      </div>
    )
  }

  const currentMethod = paymentMethods.find((m) => m.id === selectedMethod)

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">إتمام الطلب</h1>
        <p className="text-muted-foreground mb-10">اختر طريقة الدفع المناسبة وأكمل عملية الشراء</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Payment Form */}
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Step 1: Payment Method Selection */}
              <div className="glass-panel p-8 border border-border rounded-2xl">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
                  اختر طريقة الدفع
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => {
                        setSelectedMethod(method.id)
                        setError(null)
                      }}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        selectedMethod === method.id
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "border-border hover:border-primary/30 hover:bg-secondary/50"
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{method.icon}</span>
                      <span className="text-sm font-bold block">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Payment Details */}
              <AnimatePresence mode="wait">
                {currentMethod && (
                  <motion.div
                    key={selectedMethod}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-panel p-8 border border-border rounded-2xl"
                  >
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</span>
                      تفاصيل الدفع عبر {currentMethod.name}
                    </h3>

                    {/* Payment Number */}
                    <div className="bg-secondary/50 p-4 rounded-xl mb-4 border border-border">
                      <p className="text-xs text-muted-foreground mb-2">حوّل المبلغ إلى:</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-lg" dir="ltr">{currentMethod.number}</span>
                        <MagneticWrapper>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(currentMethod.number)}
                            className="w-9 h-9 rounded-lg bg-background flex items-center justify-center hover:bg-primary/10 transition-colors"
                          >
                            {copiedNumber ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </MagneticWrapper>
                      </div>
                    </div>

                    {/* Amount to send */}
                    <div className="bg-primary/5 p-4 rounded-xl mb-4 border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">المبلغ المطلوب تحويله:</p>
                      <p className="text-2xl font-bold text-primary">{total.toLocaleString()} د.ع</p>
                    </div>

                    <p className="text-sm text-muted-foreground mb-6">{currentMethod.instructions}</p>

                    {/* Receipt Upload */}
                    {selectedMethod !== "mastercard" && (
                      <div>
                        <label className="block text-sm font-medium mb-3">صورة إيصال الدفع *</label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        
                        {receiptPreview ? (
                          <div className="relative rounded-xl overflow-hidden border border-border">
                            <Image
                              src={receiptPreview}
                              alt="إيصال الدفع"
                              width={400}
                              height={300}
                              className="w-full h-48 object-cover"
                            />
                            <MagneticWrapper>
                              <button
                                type="button"
                                onClick={() => {
                                  setReceiptFile(null)
                                  setReceiptPreview(null)
                                }}
                                className="absolute top-3 left-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                              >
                                ✕
                              </button>
                            </MagneticWrapper>
                          </div>
                        ) : (
                          <MagneticWrapper>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full py-8 rounded-xl border-2 border-dashed border-border hover:border-primary/30 bg-secondary/30 hover:bg-secondary/50 transition-all flex flex-col items-center gap-3"
                            >
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Upload className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">اضغط لرفع صورة الإيصال</p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG حتى 5MB</p>
                              </div>
                            </button>
                          </MagneticWrapper>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit */}
              <MagneticWrapper>
                <button 
                  type="submit" 
                  disabled={isProcessing || !selectedMethod}
                  className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>إرسال الطلب - {total.toLocaleString()} د.ع</span>
                    </>
                  )}
                </button>
              </MagneticWrapper>

            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="glass-panel p-8 border border-border rounded-2xl sticky top-32">
              <h3 className="font-bold text-lg mb-6">ملخص الطلب ({totalCount} منتجات)</h3>
              
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/50">
                    <div className="flex-1 pl-4">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">الكمية: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-sm">{(item.price * item.quantity).toLocaleString()} د.ع</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border flex justify-between items-end">
                <div>
                  <p className="text-lg font-bold">الإجمالي</p>
                </div>
                <span className="text-3xl font-bold text-primary">{total.toLocaleString()} د.ع</span>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>معاملة آمنة وموثوقة بنسبة 100%</span>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">دفع آمن</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">دعم فوري</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">طرق متعددة</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
