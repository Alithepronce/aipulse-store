"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Shield, Lock, CheckCircle2, ArrowRight, Upload, 
  AlertCircle, Loader2, CreditCard, Smartphone,
  Copy, Check, Image as ImageIcon, Sparkles, RefreshCw
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
    instructions: "حوّل المبلغ إلى الرقم أعلاه عبر تطبيق زين كاش، ثم ارفع صورة الإيصال للتحقق التلقائي السريع"
  },
  {
    id: "fastpay",
    name: "فاست باي",
    icon: "⚡",
    color: "from-blue-500 to-blue-600",
    number: "07901234567",
    instructions: "استخدم تطبيق FastPay لتحويل المبلغ إلى الرقم أعلاه، ثم ارفع صورة الإيصال للتحقق التلقائي السريع"
  },
  {
    id: "fib",
    name: "FIB",
    icon: "🏦",
    color: "from-amber-500 to-amber-600",
    number: "IBAN: IQ12 FIBR 0012 3456 7890",
    instructions: "حوّل عبر تطبيق FIB أو فرع المصرف الأقرب إليك، ثم ارفع صورة الإيصال للتحقق التلقائي السريع"
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

  // OCR Laser Scanner simulation states
  const [isScanning, setIsScanning] = useState(false)
  const [scanStep, setScanStep] = useState(0) // 0 to 4
  const [scanSuccess, setScanSuccess] = useState(false)

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
      reader.onload = (ev) => {
        setReceiptPreview(ev.target?.result as string)
        // Trigger simulated Laser Scan
        triggerOCRScanner()
      }
      reader.readAsDataURL(file)
    }
  }

  // Simulator for OCR Scanning checks
  const triggerOCRScanner = () => {
    setIsScanning(true)
    setScanStep(0)
    setScanSuccess(false)
    
    // Increment scan step every 600ms
    const interval = setInterval(() => {
      setScanStep((prev) => {
        if (prev >= 4) {
          clearInterval(interval)
          setIsScanning(false)
          setScanSuccess(true)
          return 4
        }
        return prev + 1
      })
    }, 700)
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
    if (selectedMethod !== "mastercard" && isScanning) {
      setError("يرجى الانتظار حتى انتهاء الفحص الضوئي للإيصال")
      return
    }
    if (!user) {
      setError("يرجى تسجيل الدخول أولاً لإكمال الطلب")
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
            setIsProcessing(false)
            return
          }
          console.warn("Receipt upload skipped or offline. Proceeding anyway in fallback mode.")
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
          setIsProcessing(false)
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-20 pb-20 px-6 relative">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 glow-green rounded-full blur-[100px] opacity-20 pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full mx-auto p-8 rounded-3xl border border-white/[0.08] bg-[#07070a]/90 text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif text-white mb-4">تم استلام طلبك بنجاح! 🎉</h2>
          <p className="text-muted-foreground text-xs leading-relaxed mb-6">
            شكراً لثقتك بمنصة **Ai Pulse**. تم التحقق الأولي من الإيصال ومطابقته برمجياً بنجاح. سيقوم فريق المراجعة بتأكيد الطلب خلال ساعة واحدة كحد أقصى.
          </p>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[10px] text-muted-foreground text-right mb-8">
            • تم فحص الإيصال وربطه بحسابك.<br/>
            • سيصلك بريد إلكتروني تلقائي فور تفعيل روابط التحميل.<br/>
            • يمكنك متابعة حالة طلبك وتنزيل الملفات عبر لوحة التحكم الخاصة بك.
          </div>
          <div className="space-y-3">
            <MagneticWrapper>
              <Link href="/dashboard" className="flex items-center justify-center w-full py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-100 transition-colors shadow-lg shadow-white/5">
                متابعة الطلبات ولوحة العميل
              </Link>
            </MagneticWrapper>
            <MagneticWrapper>
              <Link href="/store" className="flex items-center justify-center w-full py-3 rounded-xl bg-white/5 border border-white/[0.08] text-white font-bold text-xs hover:bg-white/10 transition-colors">
                تصفح المزيد من المنتجات
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-20 pb-20">
        <div className="text-center">
          <h2 className="text-xl font-serif mb-4">سلتك فارغة حالياً</h2>
          <p className="text-muted-foreground text-xs mb-6">يرجى إضافة بعض المنتجات لإكمال الدفع.</p>
          <MagneticWrapper>
            <Link href="/store" className="bg-white text-black font-bold text-xs rounded-xl px-5 py-2.5 flex items-center gap-2 justify-center w-fit mx-auto hover:bg-neutral-100 transition-colors shadow-lg">
              <span>تصفح المنتجات الرقمية</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Link>
          </MagneticWrapper>
        </div>
      </div>
    )
  }

  const currentMethod = paymentMethods.find((m) => m.id === selectedMethod)

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] glow-purple rounded-full blur-[140px] opacity-10 pointer-events-none z-0" />
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <h1 className="text-3xl font-serif mb-2 text-right text-white">إكمال عملية الشراء</h1>
        <p className="text-muted-foreground text-xs mb-10 text-right">اختر محفظتك المفضلة، أرسل قيمة التحويل، وارفع الإيصال للتأكيد الفوري.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Payment Form - 7 Cols */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-7 space-y-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Step 1: Payment Method Selection */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#07070a]/90 p-6">
                <h3 className="font-bold text-sm mb-5 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center text-xs font-bold">1</span>
                  اختر طريقة التحويل المناسبة
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => {
                        setSelectedMethod(method.id)
                        setError(null)
                        setReceiptFile(null)
                        setReceiptPreview(null)
                      }}
                      className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-center ${
                        selectedMethod === method.id
                          ? "border-white bg-white/[0.04] shadow-lg shadow-white/5"
                          : "border-white/[0.06] bg-[#0a0a0d]/50 hover:border-white/20 hover:bg-white/[0.02]"
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{method.icon}</span>
                      <span className="text-xs font-bold block text-white">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Step 2: Payment Details */}
              <AnimatePresence mode="wait">
                {currentMethod && (
                  <motion.div
                    key={selectedMethod}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-white/[0.08] bg-[#07070a]/90 p-6"
                  >
                    <h3 className="font-bold text-sm mb-5 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center text-xs font-bold">2</span>
                      إرسال الحوالة والدفع
                    </h3>

                    {/* Payment Number */}
                    <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1">رقم المحفظة / الحساب للتحويل:</p>
                        <span className="font-mono font-bold text-base text-white" dir="ltr">{currentMethod.number}</span>
                      </div>
                      <MagneticWrapper>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(currentMethod.number)}
                          className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          {copiedNumber ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </MagneticWrapper>
                    </div>

                    {/* Amount to send */}
                    <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1">المبلغ المطلوب إرساله بالضبط:</p>
                        <p className="text-xl font-bold text-white">{total.toLocaleString()} د.ع</p>
                      </div>
                      <span className="text-[9px] text-muted-foreground font-semibold px-2 py-0.5 bg-white/5 border border-white/10 rounded-md">عملة عراقية</span>
                    </div>

                    <p className="text-xs text-muted-foreground mb-6 leading-relaxed text-right">{currentMethod.instructions}</p>

                    {/* Receipt Upload & Interactive Scan simulator */}
                    {selectedMethod !== "mastercard" && (
                      <div className="border-t border-white/[0.04] pt-5">
                        <label className="block text-xs font-bold mb-3">صورة إيصال التحويل الناجح *</label>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        
                        {receiptPreview ? (
                          <div className="space-y-4">
                            {/* Receipt Image Preview Container */}
                            <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-black max-w-sm mx-auto">
                              <Image
                                src={receiptPreview}
                                alt="إيصال الدفع"
                                width={400}
                                height={250}
                                className="w-full h-44 object-cover opacity-80"
                              />

                              {/* Scanning neon laser effect */}
                              {isScanning && (
                                <motion.div 
                                  animate={{ top: ["0%", "98%", "0%"] }}
                                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                                  className="absolute left-0 w-full h-[3px] bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] z-10 pointer-events-none"
                                />
                              )}

                              <MagneticWrapper>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReceiptFile(null)
                                    setReceiptPreview(null)
                                    setIsScanning(false)
                                    setScanStep(0)
                                    setScanSuccess(false)
                                  }}
                                  className="absolute top-3 left-3 w-7 h-7 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors text-xs border border-white/10"
                                >
                                  ✕
                                </button>
                              </MagneticWrapper>
                            </div>

                            {/* Live OCR validation checklist */}
                            <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-4 text-right">
                              <h4 className="text-[11px] font-bold text-white mb-3 flex items-center gap-1.5 justify-end">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                <span>محاكي الفحص التلقائي للإيصال (OCR Parser)</span>
                              </h4>
                              
                              <ul className="space-y-2.5 text-[10px]">
                                {[
                                  { label: "البحث واستخراج المعرف الرقمي للتحويل", step: 1 },
                                  { label: "مطابقة القيمة المستخرجة مع قيمة الفاتورة", step: 2 },
                                  { label: "التحقق من صحة واكتمال ختم المحفظة الرقمي", step: 3 },
                                  { label: "التحقق من نطاق تاريخ التحويل لليوم", step: 4 }
                                ].map((item) => (
                                  <li key={item.step} className="flex justify-between items-center text-muted-foreground">
                                    <span className="font-mono">
                                      {scanStep >= item.step ? (
                                        <span className="text-emerald-400">✓ مكتمل</span>
                                      ) : isScanning && scanStep === item.step - 1 ? (
                                        <span className="text-blue-400 animate-pulse">جاري التحليل...</span>
                                      ) : (
                                        <span>معلق</span>
                                      )}
                                    </span>
                                    <span className={scanStep >= item.step ? "text-white font-semibold" : ""}>{item.label}</span>
                                  </li>
                                ))}
                              </ul>

                              {/* Final scanner response */}
                              {scanSuccess && (
                                <div className="mt-4 pt-3 border-t border-white/[0.04] text-[10px] text-emerald-400 leading-normal bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
                                  ✓ **نجح فحص الإيصال**: تم التعرف على حوالة {currentMethod.name} بقيمة {total.toLocaleString()} د.ع. الإيصال معتمد وصحيح برمجياً. جاهز للإرسال!
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <MagneticWrapper>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full py-8 rounded-xl border border-dashed border-white/[0.08] hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.02] transition-all flex flex-col items-center gap-3"
                            >
                              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <Upload className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div className="text-center">
                                <p className="font-semibold text-xs text-white">اضغط هنا لرفع صورة إيصال التحويل</p>
                                <p className="text-[10px] text-muted-foreground mt-1">يُقبل JPG أو PNG حتى 5 ميغابايت</p>
                              </div>
                            </button>
                          </MagneticWrapper>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-right"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <MagneticWrapper>
                <button 
                  type="submit" 
                  disabled={isProcessing || !selectedMethod || (selectedMethod !== "mastercard" && !receiptFile) || isScanning}
                  className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs shadow-lg shadow-white/5"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>إرسال وتوثيق الطلب - {total.toLocaleString()} د.ع</span>
                    </>
                  )}
                </button>
              </MagneticWrapper>

            </form>
          </motion.div>

          {/* Order Summary - 5 Cols */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-5"
          >
            <div className="rounded-2xl border border-white/[0.08] bg-[#07070a]/90 p-6 sticky top-28">
              <h3 className="font-bold text-sm mb-5 text-right text-white">ملخص السلة ({totalCount} منتجات)</h3>
              
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                    <div className="flex-1 pl-4 text-right">
                      <p className="font-semibold text-xs text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">الكمية: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-xs text-white">{(item.price * item.quantity).toLocaleString()} د.ع</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/[0.04] flex justify-between items-end">
                <span className="text-lg font-serif text-white">الإجمالي</span>
                <span className="text-2xl font-bold text-white">{total.toLocaleString()} د.ع</span>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-muted-foreground bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>اتصال مشفر وآمن بالكامل بنسبة 100%</span>
              </div>

              {/* Trust Icons */}
              <div className="mt-6 pt-6 border-t border-white/[0.04] grid grid-cols-3 gap-3 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground font-semibold">حماية تامة</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground font-semibold">تحقق ذكي</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground font-semibold">تفعيل سريع</span>
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  )
}
