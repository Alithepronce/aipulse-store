"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { useCart } from "./CartProvider"
import Link from "next/link"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalCount } = useCart()

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-full max-w-md bg-background border-r border-border shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">سلة المشتريات</h2>
                <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-full ml-2">
                  {totalCount} منتجات
                </span>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground opacity-70">
                  <ShoppingBag className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">سلتك فارغة</p>
                  <p className="text-sm mt-2">يبدو أنك لم تضف أي منتج بعد.</p>
                  <button 
                    onClick={onClose}
                    className="mt-6 px-6 py-2 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                  >
                    تصفح المتجر
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id} 
                      className="flex gap-4 glass border border-border p-3 rounded-xl relative group"
                    >
                      <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-lg">{item.name.charAt(0)}</span>
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm leading-tight ml-4">{item.name}</h4>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-primary mt-1">${item.price.toFixed(2)}</p>
                        
                        <div className="mt-auto flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-secondary rounded-lg px-2 py-1">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-6 h-6 flex items-center justify-center hover:bg-background rounded-md text-sm font-bold transition-colors"
                            >-</button>
                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-background rounded-md text-sm font-bold transition-colors"
                            >+</button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border bg-background/50 backdrop-blur-md">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-muted-foreground font-medium">المجموع (بدون الضرائب)</span>
                  <span className="text-2xl font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6 text-center">الضرائب والخصومات يتم حسابها عند الدفع.</p>
                <Link href="/checkout" onClick={onClose} className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all">
                  <span>إتمام الطلب بأمان</span>
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
