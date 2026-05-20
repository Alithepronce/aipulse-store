"use client"

import React, { useState, useEffect } from "react"
import { 
  Settings, Globe, CreditCard, Phone, Mail, Save, 
  Loader2, CheckCircle, ExternalLink, Plus, Edit, Trash2, 
  AlertCircle, Copy, Check, RefreshCw, Smartphone, Sparkles, HelpCircle 
} from "lucide-react"

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
}

interface PaymentMethod {
  id: string
  name: string
  icon: string
  number: string
  instructions: string
  is_active: boolean
  is_custom: boolean
}

const defaultSettings: SiteSettings = {
  siteName: "Ai Pulse",
  siteDescription: "منصة عراقية لبيع المنتجات الرقمية - كورسات، كتب إلكترونية، وبرامج",
  contactEmail: "support@aipulse.com",
  contactPhone: "+964 770 000 0000",
  socialLinks: {
    telegram: "https://t.me/aipulse",
    instagram: "https://instagram.com/aipulse",
    whatsapp: "+964770000000",
  }
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "gateways" | "contact">("general")
  const [generalSettings, setGeneralSettings] = useState<SiteSettings>(defaultSettings)
  const [isSavingGeneral, setIsSavingGeneral] = useState(false)
  const [savedGeneral, setSavedGeneral] = useState(false)

  // Payment Gateways States
  const [gateways, setGateways] = useState<PaymentMethod[]>([])
  const [loadingGateways, setLoadingGateways] = useState(true)
  const [tableMissing, setTableMissing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [errorGateways, setErrorGateways] = useState<string | null>(null)

  // Modals States
  const [showGatewayModal, setShowGatewayModal] = useState(false)
  const [editingGateway, setEditingGateway] = useState<PaymentMethod | null>(null)
  const [gatewayForm, setGatewayForm] = useState({
    name: "",
    icon: "💳",
    number: "",
    instructions: "",
    is_active: true
  })
  const [isSavingGateway, setIsSavingGateway] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeletingGateway, setIsDeletingGateway] = useState(false)

  // Utility Copy State
  const [copiedSql, setCopiedSql] = useState(false)

  // SQL code for the database migration helper
  const sqlMigrationCode = `-- كود إنشاء جدول بوابات الدفع (Payment Methods) في Supabase
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '💳',
  number TEXT NOT NULL,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- تمكين سياسات الأمان RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بالقراءة وتعديل المسؤولين فقط
CREATE POLICY "Anyone can view active payment methods" ON payment_methods 
  FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('general_manager', 'owner', 'admin')));

CREATE POLICY "Managers can manage payment methods" ON payment_methods 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('general_manager', 'owner', 'admin')));

-- إدراج البوابات الافتراضية
INSERT INTO payment_methods (id, name, icon, number, instructions, is_active, is_custom)
VALUES 
  ('zaincash', 'زين كاش', '💳', '07801234567', 'حوّل المبلغ إلى الرقم أعلاه عبر زين كاش، ثم ارفع صورة الإيصال للتحقق السريع', true, false),
  ('fastpay', 'فاست باي', '⚡', '07901234567', 'استخدم تطبيق FastPay لتحويل المبلغ إلى الرقم، ثم ارفع صورة الإيصال للتحقق السريع', true, false),
  ('fib', 'FIB', '🏦', 'IBAN: IQ12 FIBR 0012 3456 7890', 'حوّل عبر تطبيق FIB أو فرع المصرف، ثم ارفع صورة الإيصال للتحقق السريع', true, false),
  ('mastercard', 'ماستركارد', '💎', 'يرجى التواصل للحصول على رابط الدفع', 'سيتم إرسال رابط دفع آمن عبر البريد الإلكتروني خلال دقائق', true, false)
ON CONFLICT (id) DO NOTHING;`

  // Fetch Settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("site_settings")
    if (saved) {
      try {
        setGeneralSettings(JSON.parse(saved))
      } catch {
        // use default
      }
    }
  }, [])

  // Fetch Payment Gateways from API
  const fetchGateways = async (silent = false) => {
    if (!silent) setLoadingGateways(true)
    setErrorGateways(null)
    try {
      const res = await fetch("/api/admin/payment-methods")
      const json = await res.json()
      if (json.success) {
        setGateways(json.data.methods)
        setTableMissing(json.data.table_missing)
      } else {
        setErrorGateways(json.error || "فشل تحميل بوابات الدفع")
      }
    } catch (err: any) {
      setErrorGateways("حدث خطأ أثناء الاتصال بالخادم")
    } finally {
      if (!silent) setLoadingGateways(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchGateways()
  }, [])

  const handleRefreshStatus = () => {
    setRefreshing(true)
    fetchGateways()
  }

  // Save General Settings
  const handleSaveGeneral = async () => {
    setIsSavingGeneral(true)
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600))
    localStorage.setItem("site_settings", JSON.stringify(generalSettings))
    setIsSavingGeneral(false)
    setSavedGeneral(true)
    setTimeout(() => setSavedGeneral(false), 3000)
  }

  // Toggle active status of a gateway
  const handleToggleGateway = async (gateway: PaymentMethod) => {
    // Optimistic UI update
    const updatedGateways = gateways.map(g => 
      g.id === gateway.id ? { ...g, is_active: !g.is_active } : g
    )
    setGateways(updatedGateways)

    try {
      const res = await fetch("/api/admin/payment-methods", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: gateway.id,
          name: gateway.name,
          icon: gateway.icon,
          number: gateway.number,
          instructions: gateway.instructions,
          is_active: !gateway.is_active
        })
      })
      const json = await res.json()
      if (!json.success) {
        // Rollback on error
        setGateways(gateways)
        alert("فشل تحديث الحالة: " + json.error)
      }
    } catch {
      setGateways(gateways)
      alert("حدث خطأ أثناء تحديث حالة بوابة الدفع")
    }
  }

  // Open Add/Edit Modal
  const openGatewayModal = (gateway: PaymentMethod | null = null) => {
    if (gateway) {
      setEditingGateway(gateway)
      setGatewayForm({
        name: gateway.name,
        icon: gateway.icon || "💳",
        number: gateway.number,
        instructions: gateway.instructions || "",
        is_active: gateway.is_active
      })
    } else {
      setEditingGateway(null)
      setGatewayForm({
        name: "",
        icon: "💳",
        number: "",
        instructions: "",
        is_active: true
      })
    }
    setShowGatewayModal(true)
  }

  // Save Gateway Form
  const handleSaveGateway = async () => {
    if (!gatewayForm.name.trim() || !gatewayForm.number.trim()) return
    setIsSavingGateway(true)

    try {
      let res: Response
      const body = {
        name: gatewayForm.name.trim(),
        icon: gatewayForm.icon.trim() || "💳",
        number: gatewayForm.number.trim(),
        instructions: gatewayForm.instructions.trim(),
        is_active: gatewayForm.is_active
      }

      if (editingGateway) {
        res = await fetch("/api/admin/payment-methods", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, id: editingGateway.id })
        })
      } else {
        res = await fetch("/api/admin/payment-methods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        })
      }

      const json = await res.json()
      if (json.success) {
        setShowGatewayModal(false)
        fetchGateways(true)
      } else {
        alert("فشل الحفظ: " + json.error)
      }
    } catch {
      alert("حدث خطأ أثناء حفظ بوابة الدفع")
    } finally {
      setIsSavingGateway(false)
    }
  }

  // Delete Gateway
  const handleDeleteGateway = async () => {
    if (!deleteConfirmId) return
    setIsDeletingGateway(true)

    try {
      const res = await fetch(`/api/admin/payment-methods?id=${deleteConfirmId}`, {
        method: "DELETE"
      })
      const json = await res.json()
      if (json.success) {
        setDeleteConfirmId(null)
        fetchGateways(true)
      } else {
        alert("فشل الحذف: " + json.error)
      }
    } catch {
      alert("حدث خطأ أثناء حذف بوابة الدفع")
    } finally {
      setIsDeletingGateway(false)
    }
  }

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlMigrationCode)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2000)
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-3">
            <Settings className="w-7 h-7 text-primary" />
            <span>إعدادات النظام</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">تحكم بخصائص الموقع العام، بوابات الدفع ومعلومات الدعم الفني.</p>
        </div>
        
        {activeTab !== "gateways" && (
          <button
            onClick={handleSaveGeneral}
            disabled={isSavingGeneral}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 disabled:opacity-50 transition-all self-end sm:self-auto"
          >
            {isSavingGeneral ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : savedGeneral ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{savedGeneral ? "تم الحفظ!" : "حفظ إعدادات الموقع"}</span>
          </button>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border/60 pb-px gap-2">
        {[
          { id: "general" as const, label: "المعلومات العامة", icon: Globe },
          { id: "gateways" as const, label: "بوابات الدفع والتحويل", icon: CreditCard },
          { id: "contact" as const, label: "الدعم والتواصل", icon: Phone },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs transition-all ${
                isActive 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        
        {/* Tab 1: General Info */}
        {activeTab === "general" && (
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/60">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">بيانات المتجر الأساسية</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">تعديل اسم منصتك والوصف التعريفي لها في محركات البحث.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-foreground mb-2">اسم المتجر / المنصة *</label>
                <input
                  type="text"
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  placeholder="مثال: نبض الذكاء - Ai Pulse"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-foreground mb-2">الوصف التعريفي للمتجر *</label>
                <textarea
                  value={generalSettings.siteDescription}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  placeholder="اكتب وصفاً جذاباً لمنصتك الرقمية..."
                  rows={4}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary transition-all resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Payment Gateways Manager */}
        {activeTab === "gateways" && (
          <div className="space-y-6">
            {/* If table is missing in Database, render SQL install helper */}
            {tableMissing ? (
              <div className="bg-card border border-amber-500/20 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-foreground">إعداد جدول بوابات الدفع في قاعدة البيانات</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      يبدو أن جدول `payment_methods` لم يتم إنشاؤه في قاعدة البيانات حتى الآن. لتفعيل تحكم المسؤول الكامل بالبوابات والتفاصيل من هنا، يرجى تشغيل كود SQL التالي في لوحة تحكم Supabase.
                    </p>
                  </div>
                </div>

                {/* SQL Code Container */}
                <div className="relative rounded-xl border border-border bg-slate-950 p-4 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-56 leading-relaxed" dir="ltr">
                  <pre className="whitespace-pre">{sqlMigrationCode}</pre>
                  <button
                    onClick={copySqlToClipboard}
                    className="absolute top-3 right-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 p-2 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[9px] font-bold text-emerald-400 font-sans">تم نسخ الكود!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-[9px] font-bold text-slate-300 font-sans">نسخ كود SQL</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border/40">
                  <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>النظام يعمل حالياً بـ **الوضع الافتراضي البديل (Fallback)** لمنع تعطل المخزن وصفحة الشراء.</span>
                  </div>
                  
                  <button
                    onClick={handleRefreshStatus}
                    disabled={refreshing}
                    className="px-4 py-2 border border-border bg-secondary hover:bg-secondary/80 rounded-xl text-xs font-bold flex items-center gap-2 transition-all self-end sm:self-auto"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
                    <span>تحديث حالة الاتصال</span>
                  </button>
                </div>
              </div>
            ) : (
              // Active table screen with gate list
              <div className="space-y-6">
                {/* Gate List Header */}
                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">بوابات الدفع والتحويل النشطة</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">أضف، عدل، أو عطل المحافظ والحسابات البنكية المخصصة لدفع المستخدمين.</p>
                  </div>
                  <button
                    onClick={() => openGatewayModal(null)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-lg shadow-primary/20 transition-all self-end sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة بوابة جديدة</span>
                  </button>
                </div>

                {/* Gateways Grid */}
                {loadingGateways ? (
                  <div className="p-12 text-center bg-card border border-border rounded-2xl">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">جاري تحميل بوابات الدفع...</p>
                  </div>
                ) : gateways.length === 0 ? (
                  <div className="p-12 text-center bg-card border border-border rounded-2xl text-muted-foreground text-xs">
                    لا توجد بوابات دفع مسجلة. يرجى إضافة بوابة جديدة.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {gateways.map((gateway) => (
                      <div 
                        key={gateway.id} 
                        className={`bg-card border rounded-2xl p-5 shadow-sm space-y-4 transition-all relative ${
                          gateway.is_active 
                            ? "border-border/80" 
                            : "border-border/40 opacity-70 bg-secondary/10"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center border border-border/40">
                              {gateway.icon}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-xs text-foreground">{gateway.name}</h4>
                                {gateway.is_custom && (
                                  <span className="text-[8px] font-bold text-primary bg-primary/10 border border-primary/25 px-1.5 py-0.5 rounded">مخصصة</span>
                                )}
                              </div>
                              <span className="text-[9px] text-muted-foreground font-mono mt-0.5 block truncate max-w-[180px]" dir="ltr">
                                {gateway.number}
                              </span>
                            </div>
                          </div>
                          
                          {/* Active Toggle */}
                          <button
                            onClick={() => handleToggleGateway(gateway)}
                            className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                              gateway.is_active ? "bg-emerald-500" : "bg-border"
                            }`}
                            title={gateway.is_active ? "تعطيل البوابة" : "تفعيل البوابة"}
                          >
                            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                              gateway.is_active ? "right-0.5" : "right-4.5"
                            }`} />
                          </button>
                        </div>

                        {gateway.instructions && (
                          <p className="text-[10px] text-muted-foreground line-clamp-2 bg-secondary/15 p-2.5 rounded-lg border border-border/20">
                            {gateway.instructions}
                          </p>
                        )}

                        <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-border/40">
                          <button
                            onClick={() => openGatewayModal(gateway)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/15 rounded-lg border border-transparent hover:border-primary/20 transition-all text-[10px] font-bold flex items-center gap-1"
                            title="تعديل تفاصيل البوابة"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>
                          
                          {(gateway.is_custom || true) && (
                            <button
                              onClick={() => setDeleteConfirmId(gateway.id)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/15 rounded-lg border border-transparent hover:border-destructive/20 transition-all text-[10px] font-bold flex items-center gap-1"
                              title="حذف البوابة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Contact & Support Info */}
        {activeTab === "contact" && (
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/60">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Phone className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">قنوات الدعم الفني والتواصل</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">تعديل قنوات التواصل المباشر وروابط السوشيال ميديا للعملاء.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  البريد الإلكتروني للدعم
                </label>
                <input
                  type="email"
                  value={generalSettings.contactEmail}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="support@feryal.com"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary transition-all font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  رقم الهاتف المباشر
                </label>
                <input
                  type="text"
                  value={generalSettings.contactPhone}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+964 770 000 0000"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary transition-all font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/40">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                روابط منصات التواصل الاجتماعي
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] text-muted-foreground mb-1.5 font-bold">حساب تيليجرام</label>
                  <input
                    type="url"
                    value={generalSettings.socialLinks.telegram}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, telegram: e.target.value } }))}
                    placeholder="https://t.me/yourchannel"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary transition-all font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground mb-1.5 font-bold">حساب انستجرام</label>
                  <input
                    type="url"
                    value={generalSettings.socialLinks.instagram}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, instagram: e.target.value } }))}
                    placeholder="https://instagram.com/yourpage"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary transition-all font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground mb-1.5 font-bold">رقم واتساب المباشر</label>
                  <input
                    type="text"
                    value={generalSettings.socialLinks.whatsapp}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, whatsapp: e.target.value } }))}
                    placeholder="+9647700000000"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary transition-all font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gateway Add/Edit Modal */}
      {showGatewayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10 rounded-t-2xl">
              <h3 className="font-bold text-sm text-foreground">{editingGateway ? "تعديل تفاصيل بوابة الدفع" : "إضافة بوابة دفع جديدة"}</h3>
              <button onClick={() => setShowGatewayModal(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors text-xs font-bold">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-2">اسم البوابة *</label>
                <input
                  type="text"
                  value={gatewayForm.name}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: زين كاش، آسيا حوالة"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Icon & Active Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">أيقونة البوابة (إيموجي) *</label>
                  <input
                    type="text"
                    value={gatewayForm.icon}
                    onChange={(e) => setGatewayForm(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="💳"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-semibold text-center focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2">حالة التفعيل</label>
                  <button
                    type="button"
                    onClick={() => setGatewayForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-xs font-bold transition-all ${
                      gatewayForm.is_active
                        ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-500"
                        : "border-border bg-secondary/20 text-muted-foreground"
                    }`}
                  >
                    <span>{gatewayForm.is_active ? "نشطة ومتاحة" : "معطلة حالياً"}</span>
                    <span className={`w-3.5 h-3.5 rounded-full ${gatewayForm.is_active ? "bg-emerald-500" : "bg-muted"}`} />
                  </button>
                </div>
              </div>

              {/* Account details */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-2">رقم الحساب / المحفظة / IBAN *</label>
                <input
                  type="text"
                  value={gatewayForm.number}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="مثال: 07801234567 أو رقم الحساب البنكي"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary transition-colors font-mono"
                  dir="ltr"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-2">تعليمات التحويل للعميل</label>
                <textarea
                  value={gatewayForm.instructions}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="اكتب توجيهات الدفع التي تظهر للمشتري في صفحة الدفع..."
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="p-6 border-t border-border bg-secondary/15 flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setShowGatewayModal(false)}
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-secondary transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveGateway}
                disabled={isSavingGateway || !gatewayForm.name.trim() || !gatewayForm.number.trim()}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
              >
                {isSavingGateway ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="font-bold text-sm text-foreground">حذف بوابة الدفع</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                هل أنت متأكد من رغبتك بحذف بوابة الدفع هذه؟ لن يتمكن العملاء من استخدامها في صفحة الدفع بعد الحذف.
              </p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-secondary transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteGateway}
                disabled={isDeletingGateway}
                className="flex-1 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isDeletingGateway ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>حذف البوابة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
