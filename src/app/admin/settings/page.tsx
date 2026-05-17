"use client"

import React, { useState } from "react"
import { Settings, Globe, CreditCard, Phone, Mail, Save, Loader2, CheckCircle, ExternalLink } from "lucide-react"

interface SiteSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  socialLinks: {
    telegram: string
    instagram: string
    whatsapp: string
  }
  paymentMethods: {
    zaincash: boolean
    fastpay: boolean
    fib: boolean
    mastercard: boolean
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "Ai Pulse",
    siteDescription: "منصة عراقية لبيع المنتجات الرقمية - كورسات، كتب إلكترونية، وبرامج",
    contactEmail: "support@aipulse.com",
    contactPhone: "+964 770 000 0000",
    socialLinks: {
      telegram: "https://t.me/aipulse",
      instagram: "https://instagram.com/aipulse",
      whatsapp: "+964770000000",
    },
    paymentMethods: {
      zaincash: true,
      fastpay: true,
      fib: true,
      mastercard: true,
    },
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save - in the future this will connect to a site_settings table
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updatePayment = (key: keyof SiteSettings["paymentMethods"]) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [key]: !prev.paymentMethods[key],
      },
    }))
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Settings className="w-7 h-7 text-primary" />
            إعدادات الموقع
          </h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة الإعدادات العامة للمنصة</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saved ? "تم الحفظ!" : "حفظ التغييرات"}</span>
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">معلومات الموقع</h3>
            <p className="text-xs text-muted-foreground">الإعدادات الأساسية للمنصة</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">اسم الموقع</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">وصف الموقع</label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
              rows={3}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">طرق الدفع</h3>
            <p className="text-xs text-muted-foreground">تفعيل وتعطيل طرق الدفع المتاحة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: "zaincash" as const, label: "زين كاش", desc: "الدفع عبر محفظة زين كاش" },
            { key: "fastpay" as const, label: "فاست باي", desc: "الدفع عبر فاست باي" },
            { key: "fib" as const, label: "FIB", desc: "الدفع عبر بنك الأول العراقي" },
            { key: "mastercard" as const, label: "ماستركارد", desc: "الدفع ببطاقة الائتمان" },
          ].map((method) => (
            <button
              key={method.key}
              onClick={() => updatePayment(method.key)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-right ${
                settings.paymentMethods[method.key]
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-border bg-secondary/20 opacity-60"
              }`}
            >
              <div>
                <p className="font-bold text-sm">{method.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{method.desc}</p>
              </div>
              <div className={`w-12 h-7 rounded-full transition-colors relative ${
                settings.paymentMethods[method.key] ? "bg-emerald-500" : "bg-border"
              }`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                  settings.paymentMethods[method.key] ? "right-1" : "right-6"
                }`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Phone className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">معلومات التواصل</h3>
            <p className="text-xs text-muted-foreground">بيانات التواصل وروابط التواصل الاجتماعي</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={settings.contactPhone}
              onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
            روابط التواصل الاجتماعي
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">تيليجرام</label>
              <input
                type="url"
                value={settings.socialLinks.telegram}
                onChange={(e) => setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, telegram: e.target.value } }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">انستجرام</label>
              <input
                type="url"
                value={settings.socialLinks.instagram}
                onChange={(e) => setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, instagram: e.target.value } }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">واتساب</label>
              <input
                type="tel"
                value={settings.socialLinks.whatsapp}
                onChange={(e) => setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, whatsapp: e.target.value } }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
