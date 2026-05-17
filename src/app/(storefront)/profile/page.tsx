"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  User, Mail, Phone, MapPin, Globe, Camera, Save, 
  CheckCircle2, AlertCircle, Link2, Loader2,
  ShoppingBag, BookOpen, Calendar
} from "lucide-react"
import { useAuth } from "@/features/auth/AuthProvider"
import Link from "next/link"
import { MagneticWrapper } from "@/components/ui/MagneticWrapper"

export default function ProfilePage() {
  const { user, profile, updateProfile, refreshProfile, isLoading: authLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    social_links: {} as Record<string, string>,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        social_links: profile.social_links || {},
      })
    }
  }, [profile])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSocialChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMsg("")
    setErrorMsg("")

    const { error } = await updateProfile(formData)
    
    if (error) {
      setErrorMsg(error)
    } else {
      setSuccessMsg("تم حفظ التغييرات بنجاح")
      await refreshProfile()
      setTimeout(() => setSuccessMsg(""), 3000)
    }
    setIsSaving(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-bold">الملف الشخصي</h1>
              <p className="text-muted-foreground mt-1">إدارة معلوماتك الشخصية وتخصيص حسابك</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - Avatar & Quick Info */}
            <div className="lg:col-span-1">
              <div className="glass-panel border border-border rounded-2xl p-6 text-center sticky top-32">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <div className="w-28 h-28 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold border-4 border-primary/20 mx-auto">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <MagneticWrapper>
                    <button className="absolute bottom-1 left-1 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity">
                      <Camera className="w-4 h-4" />
                    </button>
                  </MagneticWrapper>
                </div>
                <h2 className="font-bold text-lg">{profile?.full_name || "مستخدم"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                
                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <ShoppingBag className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">الطلبات</p>
                    <p className="font-bold">0</p>
                  </div>
                  <div className="text-center">
                    <BookOpen className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">الكتب</p>
                    <p className="font-bold">0</p>
                  </div>
                </div>
                
                {/* Member Since */}
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>عضو منذ {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("ar-IQ") : "—"}</span>
                </div>

                {/* Nav Links */}
                <div className="mt-6 pt-4 border-t border-border space-y-2">
                  <Link
                    href="/profile/orders"
                    className="block w-full py-2.5 rounded-xl bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors"
                  >
                    طلباتي
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Form */}
            <div className="lg:col-span-2">
              {/* Messages */}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="glass-panel border border-border rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    المعلومات الأساسية
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
                      <div className="relative">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => handleChange("full_name", e.target.value)}
                          placeholder="الاسم الكامل"
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
                          value={user?.email || ""}
                          disabled
                          className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 pr-12 text-muted-foreground cursor-not-allowed text-left"
                          dir="ltr"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                      <div className="relative">
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder="+964 7XX XXX XXXX"
                          dir="ltr"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-left"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio & Details */}
                <div className="glass-panel border border-border rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    تفاصيل إضافية
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">نبذة عنك</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        placeholder="أخبرنا عن نفسك..."
                        rows={4}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">الموقع</label>
                        <div className="relative">
                          <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => handleChange("location", e.target.value)}
                            placeholder="بغداد، العراق"
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">الموقع الإلكتروني</label>
                        <div className="relative">
                          <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => handleChange("website", e.target.value)}
                            placeholder="https://example.com"
                            dir="ltr"
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-left"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="glass-panel border border-border rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-primary" />
                    روابط التواصل الاجتماعي
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: "twitter", label: "X / Twitter", placeholder: "@username" },
                      { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
                      { key: "telegram", label: "Telegram", placeholder: "@username" },
                    ].map((social) => (
                      <div key={social.key}>
                        <label className="block text-sm font-medium mb-2">{social.label}</label>
                        <input
                          type="text"
                          value={formData.social_links[social.key] || ""}
                          onChange={(e) => handleSocialChange(social.key, e.target.value)}
                          placeholder={social.placeholder}
                          dir="ltr"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-left"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <MagneticWrapper>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>حفظ التغييرات</span>
                      </>
                    )}
                  </button>
                </MagneticWrapper>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
