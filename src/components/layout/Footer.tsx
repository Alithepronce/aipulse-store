import React from "react"
import Link from "next/link"
import Logo from "@/components/brand/Logo"
const Twitter = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
)
const Instagram = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
)
const Youtube = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
)


export default function Footer() {
  return (
    <footer className="border-t border-border bg-background pt-16 pb-8">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="md:col-span-2">
            <Logo size="md" />
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              منصة رائدة للمنتجات الرقمية. نهدف إلى تقديم كورسات، كتب إلكترونية، وبرامج عالية الجودة تساعدك على تنمية مهاراتك وأعمالك في العصر الرقمي.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">الروابط السريعة</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">الرئيسية</Link></li>
              <li><Link href="/store" className="text-muted-foreground hover:text-primary transition-colors">المتجر</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">من نحن</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider">قانوني</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">الشروط والأحكام</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">سياسة الخصوصية</Link></li>
              <li><Link href="/refund" className="text-muted-foreground hover:text-primary transition-colors">سياسة الاسترجاع</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} نبض الذكاء. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 border border-border shadow-sm">
              <Twitter className="w-4 h-4" />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 border border-border shadow-sm">
              <Instagram className="w-4 h-4" />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 border border-border shadow-sm">
              <Youtube className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
