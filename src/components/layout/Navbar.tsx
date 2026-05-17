"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Menu, X, Moon, Sun, User, LogIn, LogOut, Settings, ChevronDown, Shield } from "lucide-react"
import { useTheme } from "next-themes"
import { useCart } from "@/features/cart/CartProvider"
import { useAuth } from "@/features/auth/AuthProvider"
import CartDrawer from "@/features/cart/CartDrawer"
import { motion, AnimatePresence } from "framer-motion"
import Logo from "@/components/brand/Logo"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { totalCount } = useCart()
  const { user, profile, isAdmin, signOut, isLoading } = useAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "المتجر", href: "/store" },
    { name: "من نحن", href: "/about" },
  ]

  const handleSignOut = async () => {
    setUserMenuOpen(false)
    await signOut()
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "py-4 bg-background/80 backdrop-blur-lg border-b border-border shadow-sm" 
            : "py-6 bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo size="md" />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3 relative z-10">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="تبديل المظهر"
                >
                  {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}

              <button 
                onClick={() => setCartOpen(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-background shadow-sm">
                    {totalCount}
                  </span>
                )}
              </button>

              {/* Auth Section */}
              {!isLoading && (
                <>
                  {user ? (
                    /* Logged in - User Avatar Dropdown */
                    <div className="relative hidden md:block" ref={userMenuRef}>
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-secondary transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold border border-primary/20 overflow-hidden">
                          {profile?.avatar_url ? (
                            <Image src={profile.avatar_url} alt="" width={32} height={32} className="object-cover" />
                          ) : (
                            <span>{profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || "U"}</span>
                          )}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {userMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 top-full mt-2 w-64 bg-background border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                          >
                            {/* User Info */}
                            <div className="p-4 border-b border-border bg-secondary/30">
                              <p className="font-bold text-sm truncate">{profile?.full_name || "مستخدم"}</p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                            </div>

                            {/* Menu Items */}
                            <div className="p-2">
                              <Link
                                href="/profile"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl hover:bg-secondary transition-colors"
                              >
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>الملف الشخصي</span>
                              </Link>
                              <Link
                                href="/profile/orders"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl hover:bg-secondary transition-colors"
                              >
                                <Settings className="w-4 h-4 text-muted-foreground" />
                                <span>طلباتي</span>
                              </Link>
                              {isAdmin && (
                                <Link
                                  href="/admin"
                                  onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl hover:bg-secondary transition-colors text-amber-600"
                                >
                                  <Shield className="w-4 h-4" />
                                  <span>لوحة التحكم</span>
                                </Link>
                              )}
                            </div>

                            <div className="p-2 border-t border-border">
                              <button
                                onClick={handleSignOut}
                                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                              >
                                <LogOut className="w-4 h-4" />
                                <span>تسجيل الخروج</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    /* Not logged in - Auth Buttons */
                    <div className="hidden md:flex items-center gap-2">
                      <Link
                        href="/login"
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-secondary"
                      >
                        دخول
                      </Link>
                      <Link
                        href="/register"
                        className="px-5 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-sm shadow-primary/20"
                      >
                        إنشاء حساب
                      </Link>
                    </div>
                  )}
                </>
              )}

              <button
                className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 items-center text-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-2xl font-bold hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile Auth Links */}
              {!isLoading && (
                <div className="w-full pt-6 mt-4 border-t border-border space-y-4">
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-secondary text-foreground font-bold"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span>الملف الشخصي</span>
                      </Link>
                      <button
                        onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-destructive font-bold"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-secondary text-foreground font-bold"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LogIn className="w-5 h-5" />
                        <span>تسجيل الدخول</span>
                      </Link>
                      <Link
                        href="/register"
                        className="block w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-center shadow-lg shadow-primary/20"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        إنشاء حساب مجاناً
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
