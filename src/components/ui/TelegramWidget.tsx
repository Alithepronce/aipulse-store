"use client";

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send } from "lucide-react"
import Link from "next/link"

export function TelegramWidget({ username = "Jormunghandr" }: { username?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  // Show tooltip briefly after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 5000)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-background border border-border shadow-2xl rounded-2xl p-5 w-72 relative overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-3 left-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                <Send className="w-5 h-5 text-white -ml-1" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">تواصل معنا</h3>
                <p className="text-xs text-muted-foreground mt-0.5">نحن متاحون للرد على استفساراتك</p>
              </div>
            </div>
            
            <Link 
              href={`https://t.me/${username}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-[#0088cc] hover:bg-[#0077b3] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Send className="w-4 h-4" />
              تحدث معنا على تيليجرام
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 bg-background border border-border shadow-lg py-2 px-4 rounded-xl text-sm whitespace-nowrap z-0 font-bold"
            >
              تحتاج مساعدة؟ نحن هنا!
              <div className="absolute top-1/2 right-full -translate-y-1/2 border-8 border-transparent border-r-background -mr-[1px]" />
              <div className="absolute top-1/2 right-full -translate-y-1/2 border-8 border-transparent border-r-border" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 relative z-10 ${
            isOpen 
              ? 'bg-secondary text-foreground rotate-90 scale-90' 
              : 'bg-[#0088cc] hover:bg-[#0077b3] text-white hover:scale-110 hover:shadow-[#0088cc]/30 hover:shadow-xl'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
          
          {/* Notification dot */}
          {!isOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-background rounded-full animate-pulse" />
          )}
        </button>
      </div>
    </div>
  )
}
