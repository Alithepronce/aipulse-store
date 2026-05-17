"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Heart, Loader2, Trash2, ShoppingCart, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/features/auth/AuthProvider"
import { createClient } from "@/lib/supabase/client"
import { useCart } from "@/features/cart/CartProvider"
import { toast } from "sonner"
import { MagneticWrapper } from "@/components/ui/MagneticWrapper"

interface WishlistItem {
  id: string
  product: {
    id: string
    title: string
    cover_image: string
    price: number
    discount_price: number | null
    is_active: boolean
  }
}

export default function WishlistPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { addItem } = useCart()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    
    const fetchWishlist = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("wishlists")
        .select(`
          id,
          product:products (
            id,
            title,
            cover_image,
            price,
            discount_price,
            is_active
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (data) {
        setWishlist(data as unknown as WishlistItem[])
      }
      setIsLoading(false)
    }

    fetchWishlist()
  }, [user])

  const removeFromWishlist = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", id)

    if (!error) {
      setWishlist(prev => prev.filter(item => item.id !== id))
      toast.success("تم إزالة المنتج من المفضلة")
    } else {
      toast.error("حدث خطأ أثناء إزالة المنتج")
    }
  }

  const addToCart = (product: WishlistItem['product']) => {
    if (!product.is_active) {
      toast.error("هذا المنتج غير متوفر حالياً")
      return
    }
    
    addItem({
      id: product.id,
      name: product.title,
      price: product.discount_price || product.price,
      image: product.cover_image,
      quantity: 1,
    })
    toast.success("تم إضافة المنتج إلى السلة")
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
        <Heart className="w-16 h-16 text-muted-foreground opacity-50 mb-6" />
        <h1 className="text-2xl font-bold mb-2">سجل الدخول لعرض المفضلة</h1>
        <p className="text-muted-foreground mb-8">يجب عليك تسجيل الدخول لتتمكن من إضافة المنتجات إلى المفضلة</p>
        <MagneticWrapper>
          <Link
            href="/login?redirect=/wishlist"
            className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all inline-block"
          >
            تسجيل الدخول
          </Link>
        </MagneticWrapper>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <MagneticWrapper>
              <Link
                href="/profile"
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
            </MagneticWrapper>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
                المفضلة
              </h1>
              <p className="text-muted-foreground mt-1">المنتجات والخدمات التي نالت إعجابك</p>
            </div>
          </div>

          {wishlist.length === 0 ? (
            <div className="glass-panel border border-border rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold mb-2">قائمة المفضلة فارغة</h2>
              <p className="text-muted-foreground mb-6">تصفح المتجر وأضف ما يعجبك إلى المفضلة</p>
              <MagneticWrapper>
                <Link
                  href="/store"
                  className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  تصفح المتجر
                </Link>
              </MagneticWrapper>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wishlist.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel border border-border rounded-2xl overflow-hidden group hover:border-primary/30 transition-all"
                >
                  <div className="relative h-48 w-full bg-secondary">
                    {item.product.cover_image ? (
                      <Image
                        src={item.product.cover_image}
                        alt={item.product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        لا توجد صورة
                      </div>
                    )}
                    <MagneticWrapper>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute top-3 left-3 w-10 h-10 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center text-destructive hover:bg-destructive hover:text-white transition-colors"
                        title="إزالة من المفضلة"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </MagneticWrapper>
                    {!item.product.is_active && (
                      <div className="absolute top-3 right-3 bg-destructive text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        غير متوفر
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <Link href={`/store/${item.product.id}`} className="hover:text-primary transition-colors">
                      <h3 className="font-bold text-lg mb-2 line-clamp-1">{item.product.title}</h3>
                    </Link>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex flex-col">
                        {item.product.discount_price ? (
                          <>
                            <span className="text-xl font-bold text-primary">
                              {Number(item.product.discount_price).toLocaleString()} د.ع
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {Number(item.product.price).toLocaleString()} د.ع
                            </span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-primary">
                            {Number(item.product.price).toLocaleString()} د.ع
                          </span>
                        )}
                      </div>
                      <MagneticWrapper>
                        <button
                          onClick={() => addToCart(item.product)}
                          disabled={!item.product.is_active}
                          className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="إضافة للسلة"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </MagneticWrapper>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
