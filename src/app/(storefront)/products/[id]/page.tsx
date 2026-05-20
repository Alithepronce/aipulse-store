"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShoppingCart, Check, Star, Shield, ArrowRight, 
  ChevronDown, Loader2, Send, BookOpen, Play, 
  Maximize2, ZoomIn, ZoomOut, CheckCircle, XCircle, 
  Eye, RefreshCw, Smartphone, Settings, Code, Bell
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/features/cart/CartProvider"
import { createClient } from "@/lib/supabase/client"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const { addItem } = useCart()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  
  const [reviewsList, setReviewsList] = useState<any[]>([])
  const [reviewName, setReviewName] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  // Interactive Book Reader states
  const [bookPage, setBookPage] = useState(1)
  const [bookFontSize, setBookFontSize] = useState<"sm" | "md" | "lg">("md")
  const [isBookFullscreen, setIsBookFullscreen] = useState(false)
  const [bookSearch, setBookSearch] = useState("")

  // Interactive Classroom states
  const [activeLesson, setActiveLesson] = useState(1)
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)

  // Interactive Config customizer states
  const [cfgTheme, setCfgTheme] = useState<"dark" | "light">("dark")
  const [cfgColor, setCfgColor] = useState<"blue" | "emerald" | "purple">("purple")
  const [cfgNotifications, setCfgNotifications] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()
          
        if (data) {
          setProduct({
            id: data.id,
            name: data.title,
            price: Number(data.price),
            category: data.category,
            description: data.description || "",
            longDescription: data.description || "هذا الكورس مصمم ليأخذك من الصفر في عالم التعلم إلى مستوى متقدم. ستتعلم كل شيء بدءاً من المفاهيم الأساسية وصولاً إلى التطبيق العملي.",
            image: data.cover_image || "/course.png",
            features: data.features || [],
            faqs: data.faqs || [],
            reviews: data.review_count || 0,
            rating: data.rating || 0
          })

          const { data: reviewsData } = await supabase
            .from('product_reviews')
            .select('*')
            .eq('product_id', id)
            .order('created_at', { ascending: false })
          
          if (reviewsData) {
            setReviewsList(reviewsData)
          }
        } else {
          setProduct(null)
        }
      } catch (err) {
        console.error(err)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])  // Video progress simulator
  useEffect(() => {
    let interval: any
    if (isVideoPlaying) {
      interval = setInterval(() => {
        setVideoProgress((prev) => {
          if (prev >= 100) {
            setIsVideoPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 150)
    }
    return () => clearInterval(interval)
  }, [isVideoPlaying])

  const handleAddToCart = () => {
    if (!product) return
    addItem({ ...product, quantity: 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // Check if ID is a Database UUID
  const isUUID = (str: string) => {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewName || reviewRating < 1 || reviewRating > 5) return
    setIsSubmittingReview(true)
    
    // If it's a mock product, simulate writing to database locally
    if (!isUUID(id)) {
      setTimeout(() => {
        const newReview = {
          id: `r_${Date.now()}`,
          reviewer_name: reviewName,
          rating: reviewRating,
          comment: reviewComment,
          created_at: new Date().toISOString()
        }
        setReviewsList(prev => [newReview, ...prev])
        setReviewSuccess(true)
        setReviewName("")
        setReviewComment("")
        setReviewRating(5)
        
        // Update product average rating locally
        setProduct((prev: any) => {
          const newCount = (prev.reviews || 0) + 1
          const newRating = Number((((prev.rating || 0) * prev.reviews + reviewRating) / newCount).toFixed(2))
          return { ...prev, reviews: newCount, rating: newRating }
        })

        setIsSubmittingReview(false)
        setTimeout(() => setReviewSuccess(false), 3000)
      }, 800)
      return
    }

    // Call Supabase API for actual products
    const supabase = createClient()
    const { error } = await supabase.from('product_reviews').insert({
      product_id: id,
      reviewer_name: reviewName,
      rating: reviewRating,
      comment: reviewComment
    })
    
    if (!error) {
      setReviewSuccess(true)
      setReviewName("")
      setReviewComment("")
      setReviewRating(5)
      
      const { data: reviewsData } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false })
      
      if (reviewsData) {
        setReviewsList(reviewsData)
      }
      
      const { data } = await supabase.from('products').select('rating, review_count').eq('id', id).single()
      if (data) {
        setProduct((prev: any) => ({ ...prev, rating: data.rating, reviews: data.review_count }))
      }
      
      setTimeout(() => setReviewSuccess(false), 3000)
    }
    
    setIsSubmittingReview(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen pt-32 pb-20 items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen pt-32 pb-20 items-center justify-center bg-background text-foreground">
        <h1 className="text-2xl font-serif mb-4">لم يتم العثور على المنتج</h1>
        <Link href="/store" className="text-muted-foreground hover:text-foreground underline">العودة للمتجر</Link>
      </div>
    )
  }

  const faqs = product?.faqs || []
  const getBookPageContent = () => {
    switch (bookPage) {
      case 1:
        return {
          title: "الفصل الأول: مدخل للذكاء الاصطناعي الجنائي",
          text: "الذكاء الاصطناعي الجنائي هو العلم الذي يدرس كيفية توظيف خوارزميات التعلم الآلي والشبكات العصبية العميقة لاستخلاص الأدلة الرقمية من الأجهزة والشبكات. تكمن الأهمية القصوى لهذا التداخل في تسريع وتيرة التحقيقات وتقليل الأخطاء البشرية الناتجة عن مراجعة تيرابايتات من البيانات الرقمية يدوياً..."
        }
      case 2:
        return {
          title: "الفصل الثاني: حجية الأدلة الرقمية",
          text: "وفقاً للمادة 5 من قانون التوقيع الإلكتروني والمعاملات الإلكترونية العراقي، تحظى الرسائل والمستندات الرقمية بحجية قانونية كاملة إذا ثبتت سلامة النظام المصدر لها. عند استخدام الذكاء الاصطناعي، يجب إثبات أن الخوارزمية المستخدمة تتبع معايير هندسية موثقة وخالية من التحيز الحسابي..."
        }
      case 3:
        return {
          title: "الفصل الثالث: الشبكات العصبية العميقة",
          text: "الشبكات العصبية الاصطناعية (ANN) تحاكي العقل البشري في تحديد الأنماط. في الأدلة الجنائية، تُستخدم الشبكات لتصنيف البصمات، التعرف على الوجوه في لقطات الكاميرات التالفة، وفحص البصمات الصوتية للكشف عن التزييف العميق (Deepfakes) الذي يهدد مصداقية الأدلة السمعية والبصرية..."
        }
      case 4:
        return {
          title: "الفصل الرابع: تحديات وضمانات التحقيق",
          text: "أبرز تحديات الذكاء الاصطناعي في القضاء هي مشكلة الصندوق الأسود (Black Box)، حيث يصعب تتبع كيفية اتخاذ الخوارزمية للقرار. يوصي هذا الدليل بتبني أنظمة الذكاء الاصطناعي القابلة للتفسير (XAI) لتمكين حقوق الدفاع من مناقشة الأدلة الجنائية بوضوح أمام القضاة..."
        }
      case 5:
        return {
          title: "الفصل الخامس: التوصيات الإجرائية للمحاكم",
          text: "نوصي بتشكيل لجان خبراء مشتركة (تقنيين وقانونيين) لفحص البرمجيات الجنائية قبل اعتماد مخرجاتها في الأحكام. كما يتعين تدريب القضاة على أساسيات البيانات الرقمية وحرية القاضي في تكوين عقيدته بناءً على يقين تقني لا يقبل الشك..."
        }
      default:
        return { title: "", text: "" }
    }
  }

  const bookContent = getBookPageContent()

  // Dynamic color configuration for Config playground mockup
  const getCfgColorClass = () => {
    switch (cfgColor) {
      case "blue": return "bg-blue-500"
      case "emerald": return "bg-emerald-500"
      default: return "bg-purple-600"
    }
  }

  const getCfgTextClass = () => {
    switch (cfgColor) {
      case "blue": return "text-blue-400"
      case "emerald": return "text-emerald-400"
      default: return "text-purple-400"
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pt-32 pb-20 relative">
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] glow-blue rounded-full blur-[140px] opacity-10 pointer-events-none z-0"></div>
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        <Link href="/store" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-xs font-semibold">
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة للمعرض الرقمي</span>
        </Link>

        {/* Top Section: Title & Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          
          {/* Gallery - Column span 5 */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-4"
          >
            <div className="aspect-[4/3] rounded-2xl bg-card border border-border/80 flex items-center justify-center overflow-hidden relative shadow-2xl">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/3] rounded-xl bg-secondary/10 border border-border/80 flex items-center justify-center cursor-pointer hover:bg-secondary/20 transition-colors relative overflow-hidden group">
                  <Image src={product.image} alt={product.name} fill className="object-cover opacity-30 group-hover:opacity-80 transition-opacity" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Info - Column span 7 */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-sm font-semibold">{product.rating ? product.rating.toFixed(1) : "0.0"}</span>
                <span className="text-xs text-muted-foreground">({product.reviews || 0} تقييم)</span>
                <span className="text-border">•</span>
                <span className="text-xs text-muted-foreground font-semibold uppercase">{product.category}</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-serif text-foreground tracking-tight mb-4 leading-tight">{product.name}</h1>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold text-foreground">{(product.price).toLocaleString("ar-IQ")}</span>
                <span className="text-xs text-muted-foreground font-bold">د.ع</span>
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                {product.description}
              </p>
            </div>

            {/* Feature List */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-3 mb-8 bg-secondary/10 border border-border/80 p-5 rounded-2xl">
                <h3 className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-3">ما الذي يشتمل عليه الشراء؟</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-semibold text-foreground/90">
                      <div className="w-5 h-5 rounded-full bg-secondary/20 border border-border/80 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-foreground" />
                      </div>
                      <span className="truncate">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleAddToCart}
                disabled={added}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                  added 
                    ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                    : "bg-foreground text-background hover:bg-foreground/90 shadow-foreground/5"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تمت الإضافة للسلة</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>أضف للسلة — {(product.price).toLocaleString("ar-IQ")} د.ع</span>
                  </>
                )}
              </button>
              
              <div className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground border border-border/80 bg-secondary/10 rounded-xl px-4 py-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>ضمان أمان فوري 100%</span>
              </div>
            </div>

          </motion.div>
        </div>

        {/* Middle Section: Interactive Preview Sandbox (Center Stage) */}
        <section className="border-t border-border/80 pt-16 mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase bg-secondary/20 px-3 py-1 rounded-full border border-border/80">البيئة التفاعلية</span>
            <h2 className="text-2xl md:text-3xl font-serif text-foreground mt-4 mb-2">معاينة تفاعلية حية للمنتج</h2>
            <p className="text-xs text-muted-foreground">اختبر جودة ومحتويات هذا المنتج الرقمي قبل الشراء مباشرة من متصفحك.</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Conditional Render based on Category */}
            
            {/* 1. BOOK READER SANDBOX */}
            {product.category === "كتب إلكترونية" && (
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden flex flex-col shadow-2xl relative">
                {/* Header */}
                <div className="bg-secondary/10 border-b border-border/80 px-5 py-3 flex justify-between items-center z-10">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-foreground" />
                    <span className="text-xs font-bold text-foreground">قارئ الكتب المدمج | نسخة تجريبية</span>
                  </div>
                  
                  {/* Search word inside book */}
                  <div className="relative hidden md:flex items-center bg-secondary/20 border border-border/80 rounded-lg px-2 py-0.5 text-[10px]">
                    <input
                      type="text"
                      placeholder="ابحث عن كلمة..."
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      className="bg-transparent border-none outline-none w-28 text-foreground focus:ring-0 placeholder:text-muted-foreground text-right"
                    />
                  </div>

                  {/* Size adjustments */}
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setBookFontSize("sm")} 
                      className={`w-6 h-6 rounded flex items-center justify-center text-[10px] transition-colors ${bookFontSize === "sm" ? "bg-foreground text-background font-bold" : "bg-secondary hover:bg-secondary/80"}`}
                    >
                      A-
                    </button>
                    <button 
                      onClick={() => setBookFontSize("md")} 
                      className={`w-6 h-6 rounded flex items-center justify-center text-[10px] transition-colors ${bookFontSize === "md" ? "bg-foreground text-background font-bold" : "bg-secondary"}`}
                    >
                      A
                    </button>
                    <button 
                      onClick={() => setBookFontSize("lg")} 
                      className={`w-6 h-6 rounded flex items-center justify-center text-[10px] transition-colors ${bookFontSize === "lg" ? "bg-foreground text-background font-bold" : "bg-secondary hover:bg-secondary/80"}`}
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* Book Page Content */}
                <div className={`p-8 md:p-12 min-h-[220px] transition-all flex flex-col justify-between ${
                  bookFontSize === "sm" ? "text-xs" : bookFontSize === "md" ? "text-sm" : "text-base"
                }`}>
                  <div className="space-y-4">
                    <h4 className="font-serif font-bold text-foreground border-b border-border/80 pb-2 text-lg">{bookContent.title}</h4>
                    <p className="text-muted-foreground leading-relaxed text-right whitespace-pre-line">
                      {bookSearch && bookContent.text.includes(bookSearch) ? (
                        // Highlight searched text
                        (() => {
                          const parts = bookContent.text.split(bookSearch)
                          return (
                            <>
                              {parts[0]}
                              <span className="bg-yellow-500/30 text-yellow-300 font-bold border border-yellow-500/20 px-1 rounded">{bookSearch}</span>
                              {parts[1]}
                            </>
                          )
                        })()
                      ) : (
                        bookContent.text
                      )}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-10 pt-4 border-t border-border/80">
                    <span className="text-[10px] text-muted-foreground">الصفحة {bookPage} من 5</span>
                    <span className="text-[10px] text-muted-foreground">© د. فريال إبراهيم الظفيري</span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="bg-secondary/10 border-t border-border/80 px-5 py-3.5 flex justify-between items-center">
                  <button
                    disabled={bookPage === 1}
                    onClick={() => setBookPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border/85 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    السابق
                  </button>
                  
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(p => (
                      <button
                        key={p}
                        onClick={() => setBookPage(p)}
                        className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                          bookPage === p ? "bg-foreground text-background" : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={bookPage === 5}
                    onClick={() => setBookPage(prev => Math.min(prev + 1, 5))}
                    className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border/85 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}

            {/* 2. CLASSROOM WORKSPACE SANDBOX */}
            {product.category === "كورسات أونلاين" && (
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-2xl">
                
                {/* Left: Lessons Sidebar (4 cols) */}
                <div className="md:col-span-4 bg-secondary/10 border-b md:border-b-0 md:border-l border-border/80 p-4 flex flex-col justify-between min-h-[300px]">
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-4 text-right">مقرر الدورة التدريبية</h3>
                    <div className="space-y-1">
                      {[
                        { id: 1, title: "1. أساسيات وتأمين الشبكات", dur: "14 دقيقة", unlocked: true },
                        { id: 2, title: "2. فحص الهجمات السيبرانية", dur: "22 دقيقة", unlocked: false },
                        { id: 3, title: "3. استخلاص الأدلة الرقمية", dur: "18 دقيقة", unlocked: false },
                        { id: 4, title: "4. الجوانب الإجرائية بالمحكمة", dur: "25 دقيقة", unlocked: false }
                      ].map(lesson => (
                        <button
                          key={lesson.id}
                          disabled={!lesson.unlocked}
                          onClick={() => { setActiveLesson(lesson.id); setIsVideoPlaying(false); setVideoProgress(0); }}
                          className={`w-full text-right px-3 py-2 rounded-xl text-xs flex justify-between items-center transition-all ${
                            activeLesson === lesson.id
                              ? "bg-foreground text-background font-bold"
                              : "hover:bg-secondary/40 text-muted-foreground disabled:opacity-40"
                          }`}
                        >
                          <span>{lesson.title}</span>
                          <span className="text-[9px] font-normal opacity-60">{lesson.unlocked ? lesson.dur : "مغلق 🔒"}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/80 text-[10px] text-muted-foreground text-center">
                    شراء الدورة يفتح الوصول لجميع الشروحات
                  </div>
                </div>

                {/* Right: Video Workspace (8 cols) */}
                <div className="md:col-span-8 p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-muted-foreground mb-2">معاينة الدرس المفتوح</h4>
                    
                    {/* Simulated video player */}
                    <div className="aspect-video bg-background border border-border/80 rounded-xl overflow-hidden relative flex items-center justify-center group">
                      {isVideoPlaying ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-muted/40">
                          <Loader2 className="w-8 h-8 animate-spin text-foreground mb-2" />
                          <span className="text-xs font-mono text-foreground/80">تشغيل العينة... {videoProgress}%</span>
                          
                          <button 
                            onClick={() => setIsVideoPlaying(false)}
                            className="mt-4 px-3 py-1 bg-secondary hover:bg-secondary/80 border border-border/80 text-[9px] font-bold rounded-lg"
                          >
                            إيقاف مؤقت
                          </button>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 p-4">
                          <button 
                            onClick={() => { setIsVideoPlaying(true); }}
                            className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform"
                          >
                            <Play className="w-6 h-6 fill-current translate-x-[2px]" />
                          </button>
                          <span className="text-xs font-bold text-foreground mt-4">شغّل عينة من الدرس الأول (14 دقيقة)</span>
                        </div>
                      )}

                      {/* Video progress indicator bar */}
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-border/40">
                        <div className="h-full bg-primary" style={{ width: `${videoProgress}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Interactive Quiz widget */}
                  <div className="mt-6 bg-secondary/10 border border-border/80 p-4 rounded-xl">
                    <h5 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>اختبار سريع: ما الخطوة الأولى للتحقيق الرقمي؟</span>
                    </h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => setQuizAnswer("correct")}
                        className={`p-2.5 text-right rounded-lg border text-[11px] font-bold transition-all ${
                          quizAnswer === "correct"
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                            : "bg-secondary/10 border-border/85 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        أ) جمع وتوثيق الأدلة مع الحفاظ على سلامتها
                      </button>
                      <button
                        onClick={() => setQuizAnswer("incorrect")}
                        className={`p-2.5 text-right rounded-lg border text-[11px] font-bold transition-all ${
                          quizAnswer === "incorrect"
                            ? "bg-red-500/10 border-red-500 text-red-400"
                            : "bg-white/[0.01] border-white/[0.04] text-muted-foreground hover:text-white"
                        }`}
                      >
                        ب) تعديل وفحص الملفات المشبوهة فوراً
                      </button>
                    </div>

                    {quizAnswer && (
                      <div className="mt-3 text-[10px] leading-relaxed">
                        {quizAnswer === "correct" ? (
                          <span className="text-emerald-400">✓ إجابة صحيحة! الحفاظ على سلامة الدليل وتوثيقه هي الخطوة الأولى لمنع الطعن في قيمته القانونية.</span>
                        ) : (
                          <span className="text-red-400">✗ إجابة خاطئة. تعديل الملفات دون توثيق يفسد سلامتها القانونية أمام المحكمة. جرب الخيار (أ).</span>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* 3. SOFTWARE CONFIGURATION PLAYGROUND */}
            {product.category === "برامج" && (
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-2xl">
                {/* Left: Controls (5 cols) */}
                <div className="md:col-span-5 bg-secondary/10 border-b md:border-b-0 md:border-l border-border/80 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="w-4 h-4 text-foreground" />
                      <span className="text-xs font-bold text-foreground">لوحة تخصيص القالب</span>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-6">
                      عدّل خصائص القالب البرمجي واشهد النتيجة فوراً على لوحة تحكم النموذج التفاعلي:
                    </p>

                    <div className="space-y-4">
                      {/* Theme toggle */}
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-1.5">مظهر لوحة التحكم:</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCfgTheme("dark")}
                            className={`flex-1 py-1 px-2 border rounded-lg text-[10px] font-bold transition-all ${
                              cfgTheme === "dark" ? "bg-foreground text-background" : "bg-secondary border-border/85"
                            }`}
                          >
                            داكن
                          </button>
                          <button
                            onClick={() => setCfgTheme("light")}
                            className={`flex-1 py-1 px-2 border rounded-lg text-[10px] font-bold transition-all ${
                              cfgTheme === "light" ? "bg-foreground text-background" : "bg-secondary border-border/85"
                            }`}
                          >
                            مضيء
                          </button>
                        </div>
                      </div>

                      {/* Primary colors */}
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-1.5">اللون الأساسي للعلامة:</label>
                        <div className="flex gap-1.5">
                          {["purple", "blue", "emerald"].map((col) => (
                            <button
                              key={col}
                              onClick={() => setCfgColor(col as any)}
                              className={`flex-1 py-1 px-1.5 border rounded-lg text-[10px] font-semibold transition-all ${
                                cfgColor === col 
                                  ? "border-foreground text-foreground bg-secondary" 
                                  : "border-border/85 text-muted-foreground bg-secondary/30"
                              }`}
                            >
                              {col === "purple" ? "أوركيد" : col === "blue" ? "أزرق" : "أخضر"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Toggle notification */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] text-muted-foreground">تفعيل لوحة الإشعارات:</span>
                        <button
                          onClick={() => setCfgNotifications(prev => !prev)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${
                            cfgNotifications ? "bg-foreground" : "bg-secondary/40"
                          }`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-all ${
                            cfgNotifications ? "right-5" : "right-1"
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Config code generator */}
                  <div className="pt-6 border-t border-border/80">
                    <div className="flex items-center gap-1.5 text-xs text-foreground mb-2">
                      <Code className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-mono text-[9px]">config.json</span>
                    </div>
                    <pre className="bg-secondary/20 border border-border/80 p-2.5 rounded-lg text-[9px] font-mono text-left select-all overflow-x-auto text-muted-foreground leading-normal" dir="ltr">
{`{
  "theme": "${cfgTheme}",
  "primary": "${cfgColor}",
  "notifications": ${cfgNotifications}
}`}
                    </pre>
                  </div>
                </div>

                {/* Right: Mockup Render (7 cols) */}
                <div className="md:col-span-7 p-6 flex items-center justify-center min-h-[300px]">
                  <div className={`w-full max-w-sm rounded-xl border border-border/80 shadow-2xl overflow-hidden font-sans transition-all duration-300 flex flex-col h-60 ${
                    cfgTheme === "dark" ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900 border-zinc-200"
                  }`}>
                    {/* Simulated app header */}
                    <div className={`px-4 py-2 border-b flex justify-between items-center ${
                      cfgTheme === "dark" ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-200 bg-zinc-100"
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-full ${getCfgColorClass()}`} />
                        <span className="text-[9px] font-bold tracking-wider">Fikr SaaS Dashboard</span>
                      </div>
                      
                      {cfgNotifications && (
                        <Bell className={`w-3.5 h-3.5 ${getCfgTextClass()} animate-bounce`} />
                      )}
                    </div>

                    {/* Simulated body */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="grid grid-cols-3 gap-2">
                        <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                          cfgTheme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-neutral-100 border-neutral-200"
                        }`}>
                          <span className="text-[8px] text-muted-foreground">المبيعات</span>
                          <span className="text-xs font-bold mt-1">1,248</span>
                        </div>
                        <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                          cfgTheme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-neutral-100 border-neutral-200"
                        }`}>
                          <span className="text-[8px] text-muted-foreground">التنزيلات</span>
                          <span className="text-xs font-bold mt-1">942</span>
                        </div>
                        <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                          cfgTheme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-neutral-100 border-neutral-200"
                        }`}>
                          <span className="text-[8px] text-muted-foreground">الزوار</span>
                          <span className="text-xs font-bold mt-1">5,820</span>
                        </div>
                      </div>

                      {/* Bar graph mock */}
                      <div className="h-16 flex items-end gap-1.5 px-2 mt-4">
                        {[30, 60, 45, 80, 50, 95, 70].map((h, i) => (
                          <div 
                            key={i} 
                            className={`w-full rounded-t-sm transition-all duration-300 ${getCfgColorClass()}`} 
                            style={{ height: `${h}%`, opacity: 0.3 + (i * 0.1) }} 
                          />
                        ))}
                      </div>

                      <div className="text-[8px] text-muted-foreground text-center mt-2">
                        قالب Next.js تفاعلي يدعم كامل إعدادات الألوان والمظهر بسلاسة.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </section>

        {/* Detailed Description & FAQ */}
        {(product.longDescription || faqs.length > 0) && (
          <div className="border-t border-border/80 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className={faqs.length > 0 ? "lg:col-span-8" : "lg:col-span-12"}>
              <h2 className="text-2xl font-serif text-foreground mb-5">نظرة عامة مفصلة</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-right whitespace-pre-line">
                {product.longDescription}
              </div>
            </div>

            {faqs.length > 0 && (
              <div className="lg:col-span-4">
                <h2 className="text-xl font-serif text-foreground mb-5">الأسئلة الشائعة</h2>
                <div className="space-y-3">
                  {faqs.map((faq: { q: string; a: string }, i: number) => (
                    <div key={i} className="bg-secondary/10 border border-border/80 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full px-5 py-3 flex items-center justify-between text-xs font-bold text-right hover:bg-secondary/20 transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 text-foreground ${openFaq === i ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {openFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-5 pb-3.5 text-xs text-muted-foreground leading-relaxed text-right border-t border-border/80 pt-2"
                          >
                            {faq.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews Section */}
        <div className="border-t border-border/80 pt-16 mt-16">
          <h2 className="text-2xl font-serif text-foreground mb-10 text-right">تقييمات مجتمعنا</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Submit review */}
            <div className="lg:col-span-4">
              <div className="bg-secondary/10 border border-border/80 p-6 rounded-2xl sticky top-24">
                <h3 className="text-sm font-bold text-foreground mb-4">أضف رأيك الصادق</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1.5">الاسم</label>
                    <input 
                      type="text" 
                      required 
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full bg-secondary/10 border border-border/80 rounded-xl px-4 py-2.5 outline-none focus:border-border/100 text-xs transition-colors" 
                      placeholder="اسمك الكريم" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1.5">معدل التقييم بالنجوم</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none transition-transform hover:scale-105"
                        >
                          <Star className={`w-6 h-6 ${star <= reviewRating ? "fill-amber-500 text-amber-500" : "fill-transparent text-muted-foreground"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1.5">رأيك حول المنتج</label>
                    <textarea 
                      rows={3} 
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-secondary/10 border border-border/80 rounded-xl px-4 py-2.5 outline-none focus:border-border/100 text-xs transition-colors resize-none" 
                      placeholder="اكتب ملاحظاتك وتقييمك هنا..." 
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isSubmittingReview || !reviewName}
                    className="w-full bg-foreground text-background py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-foreground/95 transition-colors disabled:opacity-50"
                  >
                    {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : (reviewSuccess ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />)}
                    {isSubmittingReview ? "جاري الحفظ..." : (reviewSuccess ? "شكراً لمشاركتنا تقييمك!" : "إرسال التقييم")}
                  </button>
                </form>
              </div>
            </div>
            
            {/* Reviews history */}
            <div className="lg:col-span-8 space-y-4">
              {reviewsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-secondary/10 rounded-2xl border border-border/80 border-dashed">
                  <Star className="w-10 h-10 mb-3 opacity-20 text-foreground" />
                  <p className="text-xs">لا توجد تقييمات سابقة بعد. شاركنا تقييمك لتكون الأول!</p>
                </div>
              ) : (
                reviewsList.map(review => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={review.id} 
                    className="p-5 rounded-2xl bg-secondary/10 border border-border/80"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary text-foreground flex items-center justify-center font-bold text-sm">
                          {review.reviewer_name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs">{review.reviewer_name}</h4>
                          <div className="flex items-center text-amber-500 mt-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={`w-3 h-3 ${star <= review.rating ? "fill-current" : "fill-transparent text-muted-foreground"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('ar-IQ')}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-muted-foreground text-xs leading-relaxed mt-4 bg-secondary/20 p-3.5 rounded-xl border border-border/80 text-right">
                        {review.comment}
                      </p>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
