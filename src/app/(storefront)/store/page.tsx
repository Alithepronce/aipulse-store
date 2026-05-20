"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, Search, BookOpen, Video, Cpu, Grid } from "lucide-react"
import ProductCard from "@/features/products/ProductCard"
import { createClient } from "@/lib/supabase/client"
import { MagneticWrapper } from "@/components/ui/MagneticWrapper"

const CATEGORIES = ["الكل", "كورسات أونلاين", "كتب إلكترونية", "برامج"]

const mockProductsList = [
  {
    id: "3a93b423-b6eb-4cbc-8020-3b04966be030", // DB ID for the forensic AI book
    name: "الإطار القانوني للذكاء الاصطناعي في الأدلة الجنائية",
    price: 50000,
    category: "كتب إلكترونية",
    description: "كتاب أكاديمي متخصص من تأليف د. فريال إبراهيم جبار الظفيري، يتناول الجوانب القانونية لاستخدام تقنيات الذكاء الاصطناعي في مجال الأدلة الجنائية والتحقيقات الجنائية الرقمية.",
    image: "/book.png",
    rating: 4.9,
    review_count: 14,
    badge: "الأكثر مبيعاً"
  },
  {
    id: "f2",
    name: "كورس أمن المعلومات والتحقيق الرقمي المتكامل",
    price: 120000,
    category: "كورسات أونلاين",
    description: "دورة تدريبية عملية تركز على تقنيات الكشف عن الاختراقات وجمع الأدلة الرقمية القانونية وفقاً للمعايير العالمية.",
    image: "/course.png",
    rating: 5.0,
    review_count: 28,
    badge: "شائع"
  },
  {
    id: "f3",
    name: "قالب Next.js & Supabase المتكامل لإطلاق المشاريع",
    price: 60000,
    category: "برامج",
    description: "قالب نظيف واحترافي يضم أنظمة المصادقة، الدفع الإلكتروني، الإشعارات، ولوحة التحكم لإطلاق مشروعك التقني في ساعات.",
    image: "/course.png",
    rating: 4.8,
    review_count: 9,
    badge: "جديد"
  },
  {
    id: "f4",
    name: "دليل المطور الشامل لتطبيقات Next.js السحابية",
    price: 25000,
    category: "كتب إلكترونية",
    description: "أقوى دليل باللغة العربية لبناء وإطلاق تطبيقات الويب الاحترافية باستخدام Next.js 15 و React Server Components.",
    image: "/book.png",
    rating: 4.7,
    review_count: 18,
    badge: "موصى به"
  },
  {
    id: "f5",
    name: "دورة البرمجة الاحترافية بلغة TypeScript وتطبيقاتها",
    price: 75000,
    category: "كورسات أونلاين",
    description: "تعلّم TypeScript من الصفر لتصميم أنظمة ويب قابلة للتوسع بمشاريع حقيقية مع Next.js و Node.js.",
    image: "/course.png",
    rating: 4.9,
    review_count: 32
  },
  {
    id: "f6",
    name: "نظام Fikr CRM لإدارة عيادات ومكاتب الاستشارة القانونية",
    price: 150000,
    category: "برامج",
    description: "لوحة تحكم سحابية لإدارة ملفات العملاء، الجلسات، الفواتير، ومتابعة القضايا بشكل مؤتمت بالكامل.",
    image: "/course.png",
    rating: 5.0,
    review_count: 7,
    badge: "ممتاز"
  },
  {
    id: "f7",
    name: "دليل التحقيق الجنائي الرقمي والجرائم المعلوماتية",
    price: 38000,
    category: "كتب إلكترونية",
    description: "دليل قانوني وعملي يستهدف المحققين الرقميين ورجال القانون لتوثيق وتحليل الجرائم الإلكترونية.",
    image: "/book.png",
    rating: 4.6,
    review_count: 11
  },
  {
    id: "f8",
    name: "دورة الذكاء الاصطناعي والتطبيقات القضائية والقانونية",
    price: 95000,
    category: "كورسات أونلاين",
    description: "دورة فريدة توضح كيفية استغلال نماذج الذكاء الاصطناعي التوليدي في إعداد المذكرات وتحليل النصوص القانونية.",
    image: "/course.png",
    rating: 4.9,
    review_count: 15
  }
]

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
          
          // Merge with mock products ensuring no duplicates by name
          const merged: any[] = [...dbFormatted]
          mockProductsList.forEach(mock => {
            const exists = dbFormatted.some(p => p.name.trim() === mock.name.trim() || p.id === mock.id)
            if (!exists) {
              merged.push(mock)
            }
          })
          
          setProducts(merged)
        } else {
          setProducts(mockProductsList)
        }
      } catch (err) {
        console.error(err)
        setProducts(mockProductsList)
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
    <div className="flex flex-col min-h-screen bg-black text-white pt-32 pb-20 relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] glow-purple rounded-full blur-[140px] opacity-20 pointer-events-none z-0"></div>
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12 border-b border-white/[0.06] pb-8">
          <div className="text-right">
            <h1 className="text-4xl font-serif text-white tracking-tight mb-3">المعرض الرقمي</h1>
            <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
              انتقاء متميز من المراجع التعليمية، الكورسات الاحترافية، والبرمجيات المطورة لتمكين أعمالك التقنية والقانونية.
            </p>
          </div>
          
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex items-center bg-white/[0.02] border border-white/[0.06] focus-within:border-white/20 rounded-xl px-4 py-2 w-full sm:w-72 transition-colors">
              <Search className="w-4 h-4 text-muted-foreground ml-2" />
              <input 
                type="text" 
                placeholder="ابحث عن كتب، كورسات، أدوات..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full text-white placeholder:text-muted-foreground focus:ring-0"
              />
            </div>
            
            <MagneticWrapper>
              <button className="bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] text-xs font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors">
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
                          ? "bg-white text-black font-bold shadow-md shadow-white/5" 
                          : "bg-white/[0.01] border border-white/[0.04] text-muted-foreground hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className={activeCategory === category ? "text-black" : "text-muted-foreground"}>
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
                  <div key={i} className="bg-[#0a0a0c] p-6 rounded-2xl border border-white/[0.04] flex flex-col space-y-4">
                    <div className="h-44 w-full rounded-xl bg-white/[0.04] animate-pulse" />
                    <div className="space-y-2 flex-grow">
                      <div className="h-5 w-2/3 bg-white/[0.04] rounded-md animate-pulse" />
                      <div className="h-4 w-full bg-white/[0.04] rounded-md animate-pulse" />
                    </div>
                    <div className="h-9 w-full bg-white/[0.04] rounded-xl mt-4 animate-pulse" />
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
              <div className="text-center py-24 rounded-3xl border border-dashed border-white/[0.06] bg-white/[0.01]">
                <p className="text-muted-foreground text-sm">عذراً، لا توجد منتجات تطابق معايير البحث الحالية.</p>
                <button 
                  onClick={() => { setSearchQuery(""); setActiveCategory("الكل"); }}
                  className="mt-4 text-xs font-semibold text-white underline hover:text-muted-foreground transition-colors"
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
