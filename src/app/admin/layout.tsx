"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, Package, Users, Settings, LogOut, 
  Menu, X, Bell, ShoppingBag, Loader2, ArrowRight, Eye, Sparkles 
} from "lucide-react"
import { useAuth } from "@/features/auth/AuthProvider"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, profile } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await signOut()
    router.push("/login")
  }

  const links = [
    { name: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
    { name: "المنتجات", href: "/admin/products", icon: Package },
    { name: "الطلبات", href: "/admin/orders", icon: ShoppingBag },
    { name: "العملاء", href: "/admin/customers", icon: Users },
    { name: "الإعدادات", href: "/admin/settings", icon: Settings },
  ]

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "general_manager":
        return { text: "مدير عام", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" }
      case "owner":
        return { text: "المالك", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
      case "admin":
        return { text: "مسؤول", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" }
      case "observer":
        return { text: "مراقب", class: "bg-purple-500/10 text-purple-400 border-purple-500/20" }
      default:
        return { text: "عضو", class: "bg-secondary text-muted-foreground border-border" }
    }
  }

  const badge = getRoleBadge(profile?.role)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row relative overflow-hidden font-sans">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] glow-purple rounded-full blur-[160px] opacity-[0.03] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] glow-blue rounded-full blur-[160px] opacity-[0.03] pointer-events-none z-0" />

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
            <LayoutDashboard size={18} />
          </div>
          <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">إدارة فكر</span>
        </Link>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="p-2 bg-secondary/80 border border-border/60 hover:bg-secondary rounded-lg transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 right-0 z-40 w-68 h-screen transition-transform duration-300 md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
        bg-card/75 backdrop-blur-xl border-l border-border/60 flex flex-col shadow-xl md:shadow-none`}
      >
        {/* Sidebar Logo */}
        <div className="p-6 border-b border-border/60 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary shadow-sm shadow-primary/10">
              <LayoutDashboard size={20} className="animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-base bg-gradient-to-r from-foreground via-foreground/95 to-foreground/80 bg-clip-text text-transparent">منصة فكر</span>
              <span className="block text-[10px] text-muted-foreground font-medium mt-0.5">لوحة الإدارة الشاملة</span>
            </div>
          </Link>
        </div>

        {/* User Quick Profile Info */}
        <div className="px-5 py-4 border-b border-border/40 bg-secondary/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary/30 to-purple-500/20 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary shadow-inner">
            {profile?.full_name?.charAt(0) || "أ"}
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-xs block truncate text-foreground">{profile?.full_name || "مدير المنصة"}</span>
            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md border mt-1 ${badge.class}`}>
              {badge.text}
            </span>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all relative ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/15 scale-[1.02]" 
                    : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                }`}
              >
                <link.icon className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span className="flex-1">{link.name}</span>
                {isActive && (
                  <motion.span 
                    layoutId="activeIndicator"
                    className="absolute left-2 w-1.5 h-1.5 rounded-full bg-primary-foreground" 
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Sidebar Controls */}
        <div className="p-4 border-t border-border/60 space-y-2">
          {/* Back to website button */}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-xl text-[11px] font-bold bg-secondary/45 border border-border/60 text-foreground hover:bg-secondary transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>عرض المتجر</span>
          </Link>
          
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-[11px] font-bold text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden z-10">
        {/* Top Header */}
        <header className="h-16 border-b border-border/60 bg-card/45 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-lg font-bold text-foreground hidden md:block">
              {links.find(l => l.href === pathname)?.name || "لوحة التحكم"}
            </h2>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-md border border-border/40 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>نبض الذكاء - الإدارة</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mr-auto">
            {/* Notifications Button */}
            <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent hover:border-border/40 rounded-full transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-destructive rounded-full"></span>
            </button>
            
            {/* Small Quick User Badge */}
            <div className="flex items-center gap-2 border border-border/65 bg-secondary/15 rounded-xl pl-3 pr-2 py-1">
              <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm shadow-primary/20">
                {profile?.full_name?.charAt(0) || "أ"}
              </div>
              <span className="text-[10px] font-bold text-muted-foreground hidden sm:block truncate max-w-[80px]">
                {profile?.full_name || "المدير"}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <div className="p-6 md:p-8 flex-1 relative z-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
