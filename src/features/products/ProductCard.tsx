"use client"

import React from "react"
import { motion } from "framer-motion"
import { ShoppingCart, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCart, CartItem } from "@/features/cart/CartProvider"

interface ProductCardProps {
  product: CartItem & { description: string; badge?: string; image?: string; rating?: number; review_count?: number }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  return (
    <motion.div 
      whileHover={{ y: -6, transition: { duration: 0.2, ease: "easeOut" } }}
      className="group relative rounded-2xl bg-card border border-border/80 dark:border-white/[0.06] hover:border-border dark:hover:border-white/15 overflow-hidden transition-all duration-300 flex flex-col h-full shadow-sm hover:shadow-md dark:shadow-none"
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {product.badge && (
        <div className="absolute top-4 right-4 z-10">
          <span className="backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-foreground text-[10px] font-bold tracking-wider px-3 py-1 rounded-full shadow-sm">
            {product.badge}
          </span>
        </div>
      )}
      
      <Link href={`/products/${product.id}`} className="block relative">
        <div className="aspect-[4/3] bg-muted/30 w-full relative overflow-hidden flex items-center justify-center border-b border-border/50 dark:border-white/[0.04]">
          {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full bg-background/50 flex items-center justify-center relative">
               <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                 <span className="text-primary/70 font-bold text-xl">{product.name.charAt(0)}</span>
               </div>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-6 flex flex-col flex-grow relative z-10">
        <div className="flex justify-between items-start mb-2 gap-4">
          <Link href={`/products/${product.id}`} className="hover:underline decoration-primary underline-offset-4">
            <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors text-foreground">{product.name}</h3>
          </Link>
          <span className="font-bold text-base whitespace-nowrap text-foreground">{product.price.toLocaleString("ar-IQ")} د.ع</span>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center text-amber-500">
            <Star className={`w-3.5 h-3.5 ${product.rating && product.rating > 0 ? "fill-current" : "opacity-30"}`} />
          </div>
          <span className="text-xs font-semibold text-foreground/80">{product.rating && product.rating > 0 ? product.rating : "0.0"}</span>
          <span className="text-xs text-muted-foreground">({product.review_count || 0} تقييم)</span>
        </div>
        
        <p className="text-xs text-muted-foreground mb-6 line-clamp-2 flex-grow leading-relaxed">
          {product.description}
        </p>
        
        <button 
          onClick={(e) => {
            e.preventDefault()
            addItem({ ...product, quantity: 1 })
          }}
          className="w-full mt-auto py-2.5 px-4 rounded-xl bg-secondary dark:bg-white/[0.04] border border-border/80 dark:border-white/[0.06] text-xs font-semibold text-foreground flex items-center justify-center gap-2 hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-black transition-all duration-200 group/btn"
        >
          <ShoppingCart className="w-3.5 h-3.5 group-hover/btn:scale-105 transition-transform" />
          <span>أضف للسلة</span>
        </button>
      </div>
    </motion.div>
  )
}

