"use client"

import React, { useRef } from "react"
import { motion, Variants, useScroll, useTransform } from "framer-motion"
import { ArrowLeft, Zap, Shield, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import ProductCard from "@/features/products/ProductCard"
import { createClient } from "@/lib/supabase/client"
import { LogoMark } from "@/components/brand/Logo"
import { MagneticWrapper } from "@/components/ui/MagneticWrapper"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])

  // Scrollytelling hooks for Hero
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  })

  // Hero transforms
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, 100])
  const compositionScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2])
  const compositionRotate = useTransform(scrollYProgress, [0, 0.5], [0, 10])
  const compositionY = useTransform(scrollYProgress, [0, 0.5], [0, 50])

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .limit(3)
          
        if (data) {
          const formattedProducts = data.map(p => ({
            id: p.id,
            name: p.title,
            price: Number(p.price),
            category: p.category,
            description: p.description || "",
            image: p.cover_image,
            badge: p.created_at > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() ? "جديد" : undefined
          }))
          setFeaturedProducts(formattedProducts)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Scrollytelling Hero Section */}
      <section ref={targetRef} className="relative h-[150vh]">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50 dark:opacity-20 animate-blob"></div>
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen opacity-50 dark:opacity-20 animate-blob animation-delay-2000"></div>
          </div>

          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              <motion.div 
                style={{ opacity: textOpacity, y: textY }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col text-right"
              >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border w-fit mb-6">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">النسخة 2.0 أصبحت متاحة الآن</span>
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                  ارتقِ بعملك مع <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 dark:to-blue-400">
                    منتجات رقمية فاخرة
                  </span>
                </motion.h1>
                
                <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
                  اكتشف مجموعة منتقاة بعناية من الكورسات والكتب الإلكترونية والبرامج المصممة لمساعدتك على التفوق في عالم الأعمال الرقمي.
                </motion.p>
                
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                  <MagneticWrapper>
                    <Link href="/store" className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group w-full">
                      <span>تصفح المتجر</span>
                      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                  </MagneticWrapper>
                  <MagneticWrapper>
                    <Link href="/about" className="px-8 py-4 rounded-xl glass-panel font-bold hover:bg-secondary transition-all flex items-center justify-center border border-border w-full">
                      تعرف علينا
                    </Link>
                  </MagneticWrapper>
                </motion.div>
              </motion.div>

              <motion.div
                style={{ scale: compositionScale, rotate: compositionRotate, y: compositionY }}
                initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="relative hidden lg:block"
              >
                <div className="relative aspect-square w-full max-w-lg mx-auto">
                  {/* 3D-like floating composition */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl transform rotate-6 scale-105 border border-white/10 glass"></div>
                  <div className="absolute inset-0 bg-background rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col">
                     <div className="h-12 border-b border-border bg-secondary/50 flex items-center px-4 gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                       <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                       <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                     </div>
                     <div className="flex-1 relative bg-secondary/20 p-8">
                        <div className="absolute right-8 top-8 w-40 h-56 bg-primary/10 rounded-xl border border-primary/20 rotate-12 shadow-lg backdrop-blur-md z-10 flex items-center justify-center overflow-hidden">
                           <Image src="/book.png" alt="كتاب إلكتروني" fill className="object-cover opacity-80" />
                        </div>
                        <div className="absolute left-12 bottom-12 w-64 h-40 bg-blue-500/10 rounded-xl border border-blue-500/20 -rotate-6 shadow-xl backdrop-blur-md z-20 flex items-center justify-center overflow-hidden">
                           <Image src="/course.png" alt="كورس" fill className="object-cover opacity-80" />
                        </div>
                        <div className="absolute right-24 bottom-24 w-20 h-20 bg-background rounded-2xl border border-border rotate-45 shadow-lg flex items-center justify-center z-30 hover:scale-110 transition-transform">
                          <LogoMark sizeClass="w-10 h-10" />
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
              
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">أحدث المنتجات المميزة</h2>
              <p className="text-muted-foreground text-lg">تصفح أحدث إضافاتنا من المنتجات الرقمية المصممة لزيادة إنتاجيتك.</p>
            </div>
            <Link href="/store" className="text-primary font-bold hover:underline mt-4 md:mt-0 flex items-center gap-2 group">
              <span>عرض الكل</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col space-y-4">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                    <Skeleton className="h-10 w-1/3 mt-4" />
                  </div>
                ))
              : featuredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
                    className="h-full"
                  >
                    <ProductCard product={{ ...product, quantity: 1 }} />
                  </motion.div>
                ))}
            {!isLoading && featuredProducts.length === 0 && (
               <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-muted-foreground">
                 لا توجد منتجات مميزة حالياً
               </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Bento Box Features Section */}
      <section className="py-24 border-t border-border bg-secondary/30 relative">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">لماذا تختار منصة Ai Pulse؟</h2>
            <p className="text-lg text-muted-foreground">
              نحن نقدم لك كل ما تحتاجه للنجاح في مسيرتك المهنية والشخصية من خلال محتوى رقمي عالي الجودة.
              تختصر عليك طريق النجاح.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
            {/* Bento Block 1: Large Featured (Spans 2 columns, 2 rows) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="md:col-span-2 md:row-span-2 glass-panel p-8 rounded-3xl border border-border hover:border-primary/50 transition-colors group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                  <Zap className="w-7 h-7 text-primary group-hover:text-current" />
                </div>
                <h3 className="text-3xl font-bold mb-4">تحميل فوري وسريع</h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                  احصل على منتجاتك الرقمية فور إتمام عملية الدفع بأمان. لا داعي للانتظار، ابدأ التعلم والتطبيق فوراً عبر نظامنا السحابي الذكي.
                </p>
              </div>
              
              {/* Micro-interaction: Animated bar chart representing speed/success */}
              <div className="mt-8 h-32 w-full bg-background/50 rounded-xl border border-border/50 p-4 flex items-end gap-3 overflow-hidden relative z-10">
                {[40, 70, 45, 90, 65, 100].map((height, i) => (
                  <motion.div 
                    key={i}
                    className="w-full bg-primary/40 rounded-t-sm"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Bento Block 2: Wide Block (Spans 2 columns, 1 row) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="md:col-span-2 md:row-span-1 glass-panel p-8 rounded-3xl border border-border hover:border-blue-500/50 transition-colors group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-l from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">جودة احترافية مضمونة</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    جميع منتجاتنا مصممة ومختبرة من قبل خبراء في السوق لضمان أعلى معايير الجودة والاحترافية التي تلبي احتياجاتك الفعلية.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Bento Block 3: Square Block (Spans 1 column, 1 row) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="md:col-span-1 md:row-span-1 glass-panel p-8 rounded-3xl border border-border hover:border-amber-500/50 transition-colors group relative overflow-hidden flex flex-col justify-center items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 group-hover:rotate-180 transition-transform duration-700">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">تحديثات مستمرة</h3>
              <p className="text-sm text-muted-foreground">وصول مدى الحياة لأي تحديثات مستقبلية للمنتجات.</p>
            </motion.div>

            {/* Bento Block 4: Call to Action Block (Spans 1 column, 1 row) */}
            <Link href="/store" className="md:col-span-1 md:row-span-1 block h-full w-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                className="h-full bg-primary rounded-3xl p-8 text-primary-foreground flex flex-col justify-center items-center text-center group overflow-hidden relative cursor-none hover:shadow-xl hover:shadow-primary/20 transition-all"
                data-magnetic="true"
              >
                 <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-500 rounded-3xl"></div>
                 <div className="relative z-10 flex flex-col items-center">
                   <h3 className="text-xl font-bold mb-2">ابدأ الآن</h3>
                   <ArrowLeft className="w-8 h-8 group-hover:-translate-x-2 transition-transform duration-300" />
                 </div>
              </motion.div>
            </Link>

          </div>
        </div>
      </section>
    </div>
  )
}
