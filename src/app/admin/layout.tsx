"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Package, Users, Settings, LogOut, Menu, X, Bell, ShoppingBag, Loader2 } from "lucide-react"
import { useAuth } from "@/features/auth/AuthProvider"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, profile } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
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

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <span className="font-bold text-lg">إدارة Ai Pulse</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-secondary rounded-md">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"} 
        fixed md:sticky top-0 right-0 z-40 w-64 h-screen transition-transform duration-300
        bg-card border-l border-border flex flex-col`}
      >
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-3 px-2">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <LayoutDashboard size={24} />
            </div>
            <span className="font-bold text-lg">إدارة Ai Pulse</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-30">
          <h2 className="font-bold text-lg hidden md:block">
            {links.find(l => l.href === pathname)?.name || "لوحة التحكم"}
          </h2>
          <div className="flex items-center gap-4 mr-auto">
            <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary">
              {profile?.full_name?.charAt(0) || "م"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}
