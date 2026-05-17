"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowLeft, AlertCircle, KeyRound, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/features/auth/AuthProvider"
import { MagneticWrapper } from "@/components/ui/MagneticWrapper"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { error: resetError } = await resetPassword(email)
    
    if (resetError) {
      setError(resetError)
    } else {
      setSuccess(true)
    }
    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full glass-panel border border-border rounded-3xl p-10 text-center"
        >
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-3">تم إرسال رابط الاستعادة! 📧</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            تحقق من بريدك الإلكتروني <span className="font-bold text-foreground" dir="ltr">{email}</span> واتبع الرابط المرسل لإعادة تعيين كلمة المرور.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all"
          >
            <span>العودة لتسجيل الدخول</span>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>العودة لتسجيل الدخول</span>
        </Link>

        <div className="glass-panel border border-border rounded-3xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
              <KeyRound className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">نسيت كلمة المرور؟</h1>
            <p className="text-sm text-muted-foreground">أدخل بريدك الإلكتروني وسنرسل لك رابط لاستعادة كلمة المرور</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  dir="ltr"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-left"
                />
              </div>
            </div>

            <MagneticWrapper>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>إرسال رابط الاستعادة</span>
                )}
              </button>
            </MagneticWrapper>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
