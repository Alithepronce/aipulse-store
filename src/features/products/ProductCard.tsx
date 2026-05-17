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
      whileHover={{ y: -5 }}
      className="group relative glass-panel overflow-hidden transition-all duration-300 flex flex-col h-full"
    >
      {product.badge && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {product.badge}
          </span>
        </div>
      )}
      
      <Link href={`/products/${product.id}`} className="block relative">
        <div className="aspect-[4/3] bg-gradient-to-br from-secondary to-background w-full relative overflow-hidden flex items-center justify-center">
          {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full bg-background/50 rounded-lg border border-white/10 shadow-sm flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500">
               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                 <span className="text-primary font-bold text-xl">{product.name.charAt(0)}</span>
               </div>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-4">
          <Link href={`/products/${product.id}`} className="hover:underline decoration-primary underline-offset-4">
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
          </Link>
          <span className="font-bold text-lg whitespace-nowrap text-emerald-600 dark:text-emerald-400">{product.price.toLocaleString("ar-IQ")} د.ع</span>
        </div>
        {(product.rating !== undefined && product.review_count !== undefined && product.review_count > 0) && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center text-amber-500">
              <Star className="w-4 h-4 fill-current" />
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.review_count})</span>
          </div>
        )}
        <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-grow">
          {product.description}
        </p>
        
        <button 
          onClick={(e) => {
            e.preventDefault()
            addItem({ ...product, quantity: 1 })
          }}
          className="w-full mt-auto py-3 px-4 rounded-lg bg-background border border-border font-medium flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 group/btn shadow-sm"
        >
          <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          <span>أضف للسلة</span>
        </button>
      </div>
    </motion.div>
  )
}
