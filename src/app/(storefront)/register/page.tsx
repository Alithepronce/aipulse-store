"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft, AlertCircle, User, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/AuthProvider"
import { MagneticWrapper } from "@/components/ui/MagneticWrapper"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const passwordStrength = React.useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" }
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    
    const levels = [
      { label: "ضعيفة جداً", color: "bg-red-500" },
      { label: "ضعيفة", color: "bg-orange-500" },
      { label: "متوسطة", color: "bg-yellow-500" },
      { label: "جيدة", color: "bg-blue-500" },
      { label: "قوية", color: "bg-emerald-500" },
    ]
    return { score, ...levels[score] }
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      return
    }

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين")
      return
    }

    setIsLoading(true)

    const { error: signUpError } = await signUp(email, password, fullName)
    
    if (signUpError) {
      setError(
        signUpError.includes("already registered")
          ? "هذا البريد مسجل بالفعل. جرّب تسجيل الدخول."
          : signUpError
      )
      setIsLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 2000)
    }
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">
              مرحباً بك في منصة Ai Pulse، {fullName}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            جارٍ تحويلك للصفحة الرئيسية...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </Link>

        <div className="glass-panel border border-border rounded-3xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">إنشاء حساب جديد</h1>
              <p className="text-sm text-muted-foreground">انضم إلى مجتمع Ai Pulse واستمتع بأفضل المنتجات الرقمية</p>
            </div>
          </div>

          {/* Error Alert */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: أحمد محمد"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

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

            <div>
              <label className="block text-sm font-medium mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 أحرف على الأقل"
                  dir="ltr"
                  className="w-full bg-background border border-border rounded-xl px-12 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-left"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password Strength */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i < passwordStrength.score ? passwordStrength.color : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">قوة كلمة المرور: {passwordStrength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد كتابة كلمة المرور"
                  dir="ltr"
                  className="w-full bg-background border border-border rounded-xl px-12 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-left"
                />
                {confirmPassword && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    {password === confirmPassword ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <MagneticWrapper>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>إنشاء الحساب</span>
                  </>
                )}
              </button>
            </MagneticWrapper>
          </form>

          {/* Login Link */}
          <div className="text-center mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                سجّل دخولك
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
