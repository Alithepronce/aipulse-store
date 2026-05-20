"use client"

import React, { useEffect, useState } from "react"
import { DollarSign, ShoppingBag, Users, Package, ArrowUpRight, Loader2, Clock, CheckCircle2, XCircle, ArrowUp, Sparkles, TrendingUp } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Stats {
  totalOrders: number
  totalProducts: number
  totalUsers: number
  totalRevenue: number
  pendingOrders: number
  recentOrders: {
    id: string
    status: string
    total_amount: number
    created_at: string
    payment_method: string
    profiles: { full_name: string } | null
  }[]
  chartData?: { month: string; sales: number; orders: number }[]
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: "قيد المراجعة", color: "text-amber-500 border-amber-500/20", bg: "bg-amber-500/10", icon: Clock },
  approved: { label: "مكتمل", color: "text-emerald-500 border-emerald-500/20", bg: "bg-emerald-500/10", icon: CheckCircle2 },
  rejected: { label: "مرفوض", color: "text-destructive border-destructive/20", bg: "bg-destructive/10", icon: XCircle },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeChartPoint, setActiveChartPoint] = useState<number | null>(null)

  const chartData = stats?.chartData && stats.chartData.length > 0
    ? stats.chartData
    : [
        { month: "كانون الثاني", sales: 0, orders: 0 },
        { month: "شباط", sales: 0, orders: 0 },
        { month: "آذار", sales: 0, orders: 0 },
        { month: "نيسان", sales: 0, orders: 0 },
        { month: "أيار", sales: 0, orders: 0 },
        { month: "حزيران", sales: 0, orders: 0 },
      ]

  useEffect(() => {
    if (stats?.chartData && stats.chartData.length > 0 && activeChartPoint === null) {
      setActiveChartPoint(stats.chartData.length - 1)
    }
  }, [stats, activeChartPoint])

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats")
        const json = await res.json()
        if (json.success) {
          setStats(json.data)
        } else {
          setError(json.error || "حدث خطأ")
        }
      } catch {
        setError("فشل الاتصال بالخادم")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground animate-pulse">جاري تحميل بيانات لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-destructive">
        <div className="text-center p-8 bg-destructive/10 rounded-2xl border border-destructive/20 max-w-md">
          <XCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="font-bold text-sm">{error || "حدث خطأ غير متوقع"}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  const statCards = [
    { 
      title: "إجمالي الإيرادات", 
      value: `${stats.totalRevenue.toLocaleString()} د.ع`, 
      icon: DollarSign, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10",
      border: "hover:border-emerald-500/30",
      glow: "glow-green",
      growth: "إيرادات المبيعات المعتمدة الحالية" 
    },
    { 
      title: "الطلبات الحالية", 
      value: stats.totalOrders.toString(), 
      icon: ShoppingBag, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10", 
      border: "hover:border-blue-500/30",
      glow: "glow-blue",
      badge: stats.pendingOrders > 0 ? `${stats.pendingOrders} معلّق` : null,
      growth: "إجمالي الطلبات المسجلة بالنظام"
    },
    { 
      title: "إجمالي العملاء", 
      value: stats.totalUsers.toString(), 
      icon: Users, 
      color: "text-purple-500", 
      bg: "bg-purple-500/10",
      border: "hover:border-purple-500/30",
      glow: "glow-purple",
      growth: "المستخدمين المسجلين بدور عميل" 
    },
    { 
      title: "المنتجات النشطة", 
      value: stats.totalProducts.toString(), 
      icon: Package, 
      color: "text-amber-500", 
      bg: "bg-amber-500/10",
      border: "hover:border-amber-500/30",
      glow: "glow-amber",
      growth: "المنتجات المتوفرة للبيع بالمعرض" 
    },
  ]

  // Dynamic SVG Chart Coordinates calculation
  const width = 600
  const height = 180
  const padding = 35
  const graphWidth = width - padding * 2
  const graphHeight = height - padding * 2

  const maxVal = Math.max(...chartData.map((d) => d.sales)) * 1.1 // Add 10% ceiling
  const minVal = 0

  const points = chartData.map((d, i) => {
    const x = padding + (i / (chartData.length - 1)) * graphWidth
    const y = padding + graphHeight - ((d.sales - minVal) / (maxVal - minVal)) * graphHeight
    return { x, y }
  })

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
  }, "")

  const fillD = `${pathD} L ${points[points.length - 1].x} ${padding + graphHeight} L ${points[0].x} ${padding + graphHeight} Z`

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-card/85 via-card/55 to-secondary/35 border border-border/60 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-44 h-44 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>نظرة عامة على الأداء</span>
          </h1>
          <p className="text-xs text-muted-foreground">تابع المبيعات، الطلبات المعلقة وأداء المنصة الرقمية بشكل لحظي.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-background text-[10px] font-bold text-muted-foreground">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>تحديث تلقائي: نشط</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -3, scale: 1.01 }}
            className={`bg-card border border-border/80 ${stat.border} rounded-2xl p-6 shadow-sm transition-all duration-300 relative group overflow-hidden`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl pointer-events-none opacity-5 transition-all group-hover:opacity-15 ${stat.glow}`} />
            
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center border border-border/20`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {stat.badge ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  {stat.badge}
                </span>
              ) : (
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                  <ArrowUp className="w-3 h-3 text-emerald-400" />
                  <span>نشط</span>
                </div>
              )}
            </div>
            <h3 className="text-muted-foreground text-xs font-semibold mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold tracking-tight mb-2 text-foreground font-mono">{stat.value}</p>
            <span className="text-[10px] text-muted-foreground/80 font-medium block">{stat.growth}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Summary and Line Chart */}
        <div className="xl:col-span-2 bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col min-h-[420px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-base text-foreground">تحليل الإيرادات والنمو</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">مقارنة شهرية لإيرادات متجر نبض الذكاء الرقمي.</p>
            </div>
            {/* Chart Info Tip */}
            {activeChartPoint !== null && (
              <div className="bg-secondary/40 border border-border text-[10px] px-3 py-1.5 rounded-xl text-right">
                <span className="text-muted-foreground">شهر {chartData[activeChartPoint].month}: </span>
                <span className="font-bold text-foreground ml-2 font-mono">{(chartData[activeChartPoint].sales).toLocaleString()} د.ع</span>
                <span className="text-muted-foreground mr-2 border-r border-border pr-2">({chartData[activeChartPoint].orders} طلب)</span>
              </div>
            )}
          </div>
          
          {/* Custom SVG Line Chart */}
          <div className="flex-1 w-full min-h-[200px] relative mt-2" dir="ltr">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-full overflow-visible"
            >
              {/* Grids and Axes */}
              {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                const y = padding + graphHeight * r
                const val = maxVal - (maxVal - minVal) * r
                return (
                  <g key={idx} className="opacity-40">
                    <line 
                      x1={padding} 
                      y1={y} 
                      x2={width - padding} 
                      y2={y} 
                      stroke="var(--border)" 
                      strokeDasharray="4 4" 
                      strokeWidth="0.8" 
                    />
                    <text 
                      x={padding - 5} 
                      y={y + 3} 
                      textAnchor="end" 
                      className="fill-muted-foreground text-[8px] font-mono"
                    >
                      {val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val.toLocaleString()}
                    </text>
                  </g>
                )
              })}

              {/* Area Under Curve */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={fillD} fill="url(#chartGradient)" />

              {/* Line Curve */}
              <path 
                d={pathD} 
                fill="none" 
                stroke="var(--primary)" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Active points interaction overlay */}
              {points.map((p, idx) => (
                <g 
                  key={idx} 
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveChartPoint(idx)}
                >
                  {/* Invisible hover helper */}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="12" 
                    fill="transparent" 
                  />
                  {/* Outer ring */}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={activeChartPoint === idx ? "7" : "4"} 
                    fill={activeChartPoint === idx ? "var(--background)" : "var(--primary)"} 
                    stroke="var(--primary)" 
                    strokeWidth={activeChartPoint === idx ? "2.5" : "1.5"}
                    className="transition-all duration-150"
                  />
                </g>
              ))}

              {/* X Axis Labels */}
              {chartData.map((d, idx) => (
                <text
                  key={idx}
                  x={points[idx].x}
                  y={height - 8}
                  textAnchor="middle"
                  className={`fill-muted-foreground text-[9px] font-sans ${activeChartPoint === idx ? "fill-foreground font-bold" : ""}`}
                >
                  {d.month}
                </text>
              ))}
            </svg>
          </div>

          {/* Simple Breakdown Blocks */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-border/40">
            {[
              { label: "بانتظار المراجعة", count: stats.pendingOrders, color: "border-amber-500/20", bg: "bg-amber-500/5", textColor: "text-amber-500" },
              { label: "مكتملة ومسلمة", count: stats.totalOrders - stats.pendingOrders, color: "border-emerald-500/20", bg: "bg-emerald-500/5", textColor: "text-emerald-500" },
              { label: "إجمالي الطلبات", count: stats.totalOrders, color: "border-primary/20", bg: "bg-primary/5", textColor: "text-primary" },
            ].map((item, i) => (
              <div key={i} className={`${item.bg} border ${item.color} rounded-2xl py-4 px-3 flex flex-col items-center justify-center text-center`}>
                <p className={`text-2xl font-bold tracking-tight ${item.textColor} mb-1 font-mono`}>{item.count}</p>
                <p className="text-[10px] text-muted-foreground font-bold">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders List Card */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="font-bold text-base text-foreground">أحدث الطلبات</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">الطلبات الأخيرة المسجلة على المنصة.</p>
          </div>
          
          <div className="space-y-4 flex-1">
            {stats.recentOrders.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs">
                لا توجد طلبات بعد
              </div>
            ) : (
              stats.recentOrders.slice(0, 5).map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending
                const initials = order.profiles?.full_name?.charAt(0) || "ع"
                return (
                  <Link key={order.id} href={`/admin/orders/${order.id}`} className="block group">
                    <div className="flex items-center justify-between pb-3.5 border-b border-border/60 last:border-0 last:pb-0 hover:bg-secondary/25 -mx-2 px-2.5 py-2 rounded-xl transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-xs font-bold text-foreground shadow-sm group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-foreground truncate max-w-[120px]">{order.profiles?.full_name || "عميل"}</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">
                            {new Date(order.created_at).toLocaleDateString("ar-IQ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                        <p className="text-xs font-bold text-primary mt-1.5 font-mono">{Number(order.total_amount).toLocaleString()} د.ع</p>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
          
          <Link href="/admin/orders" className="w-full mt-6 py-2.5 border border-border hover:bg-secondary/40 text-xs font-bold text-foreground rounded-xl transition-all flex items-center justify-center gap-1.5">
            <span>عرض كافة الطلبات</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
