"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Filter, Search } from "lucide-react"
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
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        
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
        setProducts(formattedProducts)
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "الكل" || p.category === activeCategory
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="flex flex-col min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-border pb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">المتجر الرقمي</h1>
            <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
              استكشف مجموعتنا من الكورسات، الكتب الإلكترونية، والبرامج المصممة بعناية لمساعدتك على التفوق.
            </p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative glass-panel flex items-center px-4 py-2 w-full sm:w-64 border border-border">
              <Search className="w-4 h-4 text-muted-foreground ml-2" />
              <input 
                type="text" 
                placeholder="ابحث عن منتج..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
              />
            </div>
            
            <MagneticWrapper>
              <button className="glass-panel px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium hover:bg-secondary transition-colors border border-border">
                <Filter className="w-4 h-4" />
                <span>فلاتر</span>
              </button>
            </MagneticWrapper>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar / Categories */}
          <div className="w-full lg:w-64 shrink-0">
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">التصنيفات</h3>
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
              {CATEGORIES.map(category => (
                <MagneticWrapper key={category}>
                  <button
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium text-right whitespace-nowrap transition-colors ${
                      activeCategory === category 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {category}
                  </button>
                </MagneticWrapper>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={{ ...product, quantity: 1 }} />
                </motion.div>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-20 glass-panel border border-border mt-6">
                <p className="text-muted-foreground text-lg">لم يتم العثور على منتجات تطابق بحثك.</p>
                <button 
                  onClick={() => { setSearchQuery(""); setActiveCategory("الكل"); }}
                  className="mt-4 text-primary font-medium hover:underline"
                >
                  مسح الفلاتر
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
