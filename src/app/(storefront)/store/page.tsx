"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, Search, BookOpen, Video, Cpu, Grid } from "lucide-react"
import ProductCard from "@/features/products/ProductCard"
import { createClient } from "@/lib/supabase/client"
import { MagneticWrapper } from "@/components/ui/MagneticWrapper"

const CATEGORIES = ["الكل", "كورسات أونلاين", "كتب إلكترونية", "برامج"]

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState("الكل")
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          
        if (data) {
          // Format DB products
          const dbFormatted = data.map(p => ({
            id: p.id,
            name: p.title,
            price: Number(p.price),
            category: p.category,
            description: p.description || "",
            image: p.cover_image,
            rating: Number(p.rating) || 0,
            review_count: p.review_count || 0,
            badge: p.created_at > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() ? "جديد" : undefined
          }))
          
          setProducts(dbFormatted)
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error(err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "الكل" || p.category === activeCategory
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Category Icons Helper
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "كتب إلكترونية": return <BookOpen className="w-3.5 h-3.5" />
      case "كورسات أونلاين": return <Video className="w-3.5 h-3.5" />
      case "برامج": return <Cpu className="w-3.5 h-3.5" />
      default: return <Grid className="w-3.5 h-3.5" />
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pt-32 pb-20 relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] glow-purple rounded-full blur-[140px] opacity-20 pointer-events-none z-0"></div>
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12 border-b border-border/80 pb-8">
          <div className="text-right">
            <h1 className="text-4xl font-serif text-foreground tracking-tight mb-3">المعرض الرقمي</h1>
            <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
              انتقاء متميز من المراجع التعليمية، الكورسات الاحترافية، والبرمجيات المطورة لتمكين أعمالك التقنية والقانونية.
            </p>
          </div>
          
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex items-center bg-card border border-border/80 focus-within:border-primary/40 rounded-xl px-4 py-2 w-full sm:w-72 transition-colors">
              <Search className="w-4 h-4 text-muted-foreground ml-2" />
              <input 
                type="text" 
                placeholder="ابحث عن كتب، كورسات، أدوات..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full text-foreground placeholder:text-muted-foreground focus:ring-0"
              />
            </div>
            
            <MagneticWrapper>
              <button className="bg-card border border-border/80 hover:bg-secondary/40 text-xs font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors text-foreground">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span>فرز متطور</span>
              </button>
            </MagneticWrapper>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar - Category selector */}
          <div className="w-full lg:w-60 shrink-0">
            <div className="sticky top-28">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-4 text-right">التصنيفات</h3>
              
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-none">
                {CATEGORIES.map(category => (
                  <MagneticWrapper key={category}>
                    <button
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-right whitespace-nowrap transition-all duration-200 flex items-center gap-2.5 w-full ${
                        activeCategory === category 
                          ? "bg-foreground text-background font-bold shadow-sm shadow-foreground/5" 
                          : "bg-secondary/10 border border-border/80 text-muted-foreground hover:text-foreground hover:bg-secondary/35"
                      }`}
                    >
                      <span className={activeCategory === category ? "text-background" : "text-muted-foreground"}>
                        {getCategoryIcon(category)}
                      </span>
                      <span>{category}</span>
                    </button>
                  </MagneticWrapper>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-grow">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card p-6 rounded-2xl border border-border/80 flex flex-col space-y-4">
                    <div className="h-44 w-full rounded-xl bg-secondary/60 animate-pulse" />
                    <div className="space-y-2 flex-grow">
                      <div className="h-5 w-2/3 bg-secondary/60 rounded-md animate-pulse" />
                      <div className="h-4 w-full bg-secondary/60 rounded-md animate-pulse" />
                    </div>
                    <div className="h-9 w-full bg-secondary/60 rounded-xl mt-4 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div 
                layout 
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <ProductCard product={{ ...product, quantity: 1 }} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
            
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-24 rounded-3xl border border-dashed border-border/80 bg-secondary/10">
                <p className="text-muted-foreground text-sm">عذراً، لا توجد منتجات تطابق معايير البحث الحالية.</p>
                <button 
                  onClick={() => { setSearchQuery(""); setActiveCategory("الكل"); }}
                  className="mt-4 text-xs font-semibold text-foreground underline hover:text-muted-foreground transition-colors"
                >
                  إعادة تهيئة الفلاتر
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
