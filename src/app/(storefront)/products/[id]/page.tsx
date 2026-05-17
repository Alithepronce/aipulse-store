"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Check, Star, Shield, ArrowRight, ChevronDown, Loader2, Send } from "lucide-react"
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

  useEffect(() => {
    async function fetchProduct() {
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
          longDescription: data.description || "هذا الكورس مصمم ليأخذك من الصفر في عالم التعلم إلى مستوى متقدم. ستتعلم كل شيء بدءاً من المفاهيم الأساسية وصولاً إلى التطبيق العملي. يركز الكورس على التطبيق العملي أكثر من النظري لضمان استعدادك لسوق العمل.",
          image: data.cover_image || "/course.png",
          features: data.features || [],
          faqs: data.faqs || [],
          reviews: data.review_count || 0,
          rating: data.rating || 0
        })
      }
      
      const { data: reviewsData } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false })
      
      if (reviewsData) {
        setReviewsList(reviewsData)
      }
      
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addItem({ ...product, quantity: 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewName || reviewRating < 1 || reviewRating > 5) return
    setIsSubmittingReview(true)
    
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

  const faqs = product?.faqs || []

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen pt-32 pb-20 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen pt-32 pb-20 items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">لم يتم العثور على المنتج</h1>
        <Link href="/store" className="text-primary hover:underline">العودة للمتجر</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <Link href="/store" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-medium">
          <ArrowRight className="w-4 h-4" />
          <span>العودة للمتجر</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Product Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-secondary to-background border border-border shadow-lg flex items-center justify-center overflow-hidden relative">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/3] rounded-xl bg-secondary/50 border border-border flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors relative overflow-hidden">
                  <Image src={product.image} alt={product.name} fill className="object-cover opacity-50 hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 ${star <= Math.round(product.rating || 0) ? "fill-current" : "fill-transparent text-muted-foreground"}`} />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviews} تقييم)</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-6">{product.price.toLocaleString("ar-IQ")} د.ع</p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                {product.description}
              </p>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="space-y-4 mb-10 bg-secondary/20 p-6 rounded-2xl border border-border">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">ماذا يشمل هذا المنتج؟</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm font-bold">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-auto flex flex-col gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={added}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                  added 
                    ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                    : "bg-primary text-primary-foreground hover:opacity-90 shadow-primary/20"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>تمت الإضافة للسلة</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>أضف للسلة — {product.price.toLocaleString("ar-IQ")} د.ع</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
                <Shield className="w-4 h-4" />
                <span>ضمان استرجاع لمدة 14 يوماً. تسوق بأمان تام.</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Description & FAQ */}
        {(product.description || faqs.length > 0) && (
          <div className="border-t border-border pt-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className={faqs.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
              <h2 className="text-3xl font-bold mb-6">نظرة عامة على المنتج</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                <p>{product.description}</p>
              </div>
            </div>

            {faqs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">الأسئلة الشائعة</h2>
                <div className="space-y-4">
                  {faqs.map((faq: { q: string; a: string }, i: number) => (
                    <div key={i} className="glass border border-border rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full px-6 py-4 flex items-center justify-between font-bold text-right hover:bg-secondary/50 transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 text-primary ${openFaq === i ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {openFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed"
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
        <div className="border-t border-border pt-20 mt-20">
          <h2 className="text-3xl font-bold mb-12">تقييمات العملاء</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <div className="glass border border-border p-6 rounded-2xl sticky top-24">
                <h3 className="text-xl font-bold mb-6">أضف تقييمك</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">الاسم</label>
                    <input 
                      type="text" 
                      required 
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" 
                      placeholder="اسمك الكريم" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">التقييم</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star className={`w-8 h-8 ${star <= reviewRating ? "fill-amber-500 text-amber-500" : "fill-transparent text-muted-foreground"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">تعليقك (اختياري)</label>
                    <textarea 
                      rows={4} 
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors resize-none" 
                      placeholder="ما رأيك في هذا المنتج؟" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmittingReview || !reviewName}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSubmittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : (reviewSuccess ? <Check className="w-5 h-5" /> : <Send className="w-5 h-5" />)}
                    {isSubmittingReview ? "جاري الإرسال..." : (reviewSuccess ? "شكراً لتقييمك!" : "إرسال التقييم")}
                  </button>
                </form>
              </div>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              {reviewsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-secondary/20 rounded-2xl border border-border border-dashed">
                  <Star className="w-12 h-12 mb-4 opacity-20" />
                  <p>لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج!</p>
                </div>
              ) : (
                reviewsList.map(review => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={review.id} 
                    className="p-6 rounded-2xl bg-secondary/30 border border-border"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                          {review.reviewer_name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{review.reviewer_name}</h4>
                          <div className="flex items-center text-amber-500 mt-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={`w-4 h-4 ${star <= review.rating ? "fill-current" : "fill-transparent text-muted-foreground"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('ar-IQ')}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-muted-foreground leading-relaxed mt-4 bg-background/50 p-4 rounded-xl border border-border/50">
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
