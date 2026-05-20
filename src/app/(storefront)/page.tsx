"use client"

import React, { useRef, useState, useEffect } from "react"
import { motion, Variants, useScroll, useTransform } from "framer-motion"
import { ArrowLeft, Zap, Shield, Sparkles, Terminal, Code, Cpu, Download, Calculator, Percent } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import ProductCard from "@/features/products/ProductCard"
import { createClient } from "@/lib/supabase/client"
import { LogoMark } from "@/components/brand/Logo"
import { MagneticWrapper } from "@/components/ui/MagneticWrapper"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
}

// Mock database fallback if Supabase table is empty or loading
const fallbackFeatured = [
  {
    id: "f1",
    name: "الإطار القانوني للذكاء الاصطناعي في الأدلة الجنائية",
    price: 50000,
    category: "كتب إلكترونية",
    description: "كتاب أكاديمي متخصص من تأليف د. فريال إبراهيم جبار الظفيري، يتناول الجوانب القانونية لاستخدام تقنيات الذكاء الاصطناعي في مجال الأدلة الجنائية.",
    image: "/book.png",
    rating: 4.9,
    review_count: 14,
    badge: "الأكثر مبيعاً"
  },
  {
    id: "f2",
    name: "كورس أمن المعلومات والتحقيق الرقمي المتكامل",
    price: 120000,
    category: "كورسات أونلاين",
    description: "دورة تدريبية عملية تركز على تقنيات الكشف عن الاختراقات وجمع الأدلة الرقمية القانونية وفقاً للمعايير العالمية.",
    image: "/course.png",
    rating: 5.0,
    review_count: 28,
    badge: "شائع"
  },
  {
    id: "f3",
    name: "قالب Next.js & Supabase المتكامل لإطلاق المشاريع",
    price: 60000,
    category: "برامج",
    description: "قالب نظيف واحترافي يضم أنظمة المصادقة، الدفع الإلكتروني، الإشعارات، ولوحة التحكم لإطلاق مشروعك التقني في ساعات.",
    image: "/course.png",
    rating: 4.8,
    review_count: 9,
    badge: "جديد"
  }
]

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])

  // State for Speed Simulator Widget
  const [speedOption, setSpeedOption] = useState<"adsl" | "4g" | "fiber" | "5g">("fiber")
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  // State for API Terminal Widget
  const [activeLang, setActiveLang] = useState<"js" | "curl" | "py">("js")
  const [terminalOutput, setTerminalOutput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // State for ROI Calculator
  const [monthlySales, setMonthlySales] = useState(120)
  const [productPrice, setProductPrice] = useState(35000)

  // Scrollytelling hooks for Hero
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  })

  // Hero transforms
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 0.4], [0, 80])
  const compositionScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.15])
  const compositionRotate = useTransform(scrollYProgress, [0, 0.4], [0, 6])
  const compositionY = useTransform(scrollYProgress, [0, 0.4], [0, 40])

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .limit(3)
          
        if (data && data.length > 0) {
          const formattedProducts = data.map(p => ({
            id: p.id,
            name: p.title,
            price: Number(p.price),
            category: p.category,
            description: p.description || "",
            image: p.cover_image,
            rating: Number(p.rating) || 0,
            review_count: p.review_count || 0,
            badge: p.created_at > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() ? "جديد" : undefined
          }))
          setFeaturedProducts(formattedProducts)
        } else {
          setFeaturedProducts(fallbackFeatured)
        }
      } catch (err) {
        console.error(err)
        setFeaturedProducts(fallbackFeatured)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  // Trigger download progress bar animation
  const handleStartDownload = () => {
    if (isDownloading) return
    setIsDownloading(true)
    setDownloadProgress(0)
    
    let duration = 3000
    if (speedOption === "adsl") duration = 8000
    if (speedOption === "4g") duration = 4000
    if (speedOption === "fiber") duration = 2000
    if (speedOption === "5g") duration = 800

    const startTime = Date.now()
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / duration) * 100, 100)
      setDownloadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsDownloading(false)
        }, 1000)
      }
    }, 30)
  }

  // Typewriter effect for API terminal code simulation
  const apiSnippets = {
    js: `// كود جلب المنتج رقميا باستخدام جافا سكريبت\nimport { createClient } from '@supabase/supabase-js';\n\nconst supabase = createClient(URL, KEY);\nconst { data, error } = await supabase\n  .from('products')\n  .select('file_url')\n  .eq('id', 'prod_009x');\n\nconsole.log("رابط التحميل:", data.file_url);`,
    curl: `# جلب الملف الرقمي مباشرة عبر الكونسول\ncurl -X GET \\\n  https://api.aipulse.com/v1/downloads/prod_009x \\\n  -H "Authorization: Bearer api_key_live_2026" \\\n  -H "Accept: application/octet-stream"`,
    py: `# جلب وتحميل المنتج برمجيا بلغة بايثون\nimport requests\n\nheaders = {"Authorization": "Bearer api_key_live_2026"}\nurl = "https://api.aipulse.com/v1/downloads/prod_009x"\n\nresponse = requests.get(url, headers=headers)\nwith open("ebook.pdf", "wb") as f:\n    f.write(response.content)\nprint("تم تحميل المنتج بنجاح!")`
  }

  useEffect(() => {
    setIsTyping(true)
    setTerminalOutput("")
    let i = 0
    const txt = apiSnippets[activeLang]
    const timer = setInterval(() => {
      setTerminalOutput((prev) => prev + txt.charAt(i))
      i++
      if (i >= txt.length) {
        clearInterval(timer)
        setIsTyping(false)
      }
    }, 12)

    return () => clearInterval(timer)
  }, [activeLang])

  // Speed simulator configs
  const speedConfigs = {
    adsl: { label: "ADSL النحاسي", speed: "12 Mbps", time: "11 دقيقة" },
    "4g": { label: "شبكة 4G LTE", speed: "45 Mbps", time: "3 دقائق" },
    fiber: { label: "ألياف ضوئية Fiber", speed: "150 Mbps", time: "48 ثانية" },
    "5g": { label: "شبكة 5G الفائقة", speed: "800 Mbps", time: "9 ثوانٍ" },
  }

  // ROI Calculator Calculations
  const calculatedSavings = Math.round(monthlySales * productPrice * 0.08) // Save 8% compared to Gumroad/Teachable

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-grid opacity-[0.4] pointer-events-none z-0" />
      
      {/* Scrollytelling Hero Section */}
      <section ref={targetRef} className="relative h-[130vh] z-10">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] glow-orange rounded-full blur-[140px] mix-blend-screen opacity-30 animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] glow-blue rounded-full blur-[120px] mix-blend-screen opacity-20 animate-pulse"></div>
          </div>

          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              <motion.div 
                style={{ opacity: textOpacity, y: textY }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col text-right lg:col-span-7"
              >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border w-fit mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground/80">النسخة التفاعلية الفخمة 2.0 أصبحت جاهزة</span>
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl tracking-tight mb-6 leading-[1.05] font-serif font-normal text-foreground">
                  ارتقِ بعملك مع <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/80 to-foreground/40">
                    محتوى رقمي مبتكر
                  </span>
                </motion.h1>
                
                <motion.p variants={itemVariants} className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl leading-relaxed">
                  اكتشف بيئة رقمية متكاملة تقدم أرقى الكورسات والكتب الإلكترونية والأدوات البرمجية، مصممة بدقة استثنائية لمساعدة رواد الأعمال والمطورين على الريادة والتميز.
                </motion.p>
                
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                  <MagneticWrapper>
                    <Link href="/store" className="px-8 py-3.5 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 group w-full text-sm shadow-md shadow-foreground/5">
                      <span>تصفح المتجر المميز</span>
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                  </MagneticWrapper>
                  <MagneticWrapper>
                    <Link href="/about" className="px-8 py-3.5 rounded-xl bg-secondary/50 border border-border hover:bg-secondary text-foreground font-bold transition-all flex items-center justify-center w-full text-sm">
                      فلسفتنا في التصميم
                    </Link>
                  </MagneticWrapper>
                </motion.div>
              </motion.div>

              <motion.div
                style={{ scale: compositionScale, rotate: compositionRotate, y: compositionY }}
                initial={{ opacity: 0, scale: 0.95, rotate: -3 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="relative hidden lg:block lg:col-span-5"
              >
                <div className="relative aspect-square w-full max-w-md mx-auto">
                  {/* 3D-like floating composition */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-foreground/10 to-transparent rounded-3xl transform rotate-6 scale-105 border border-border backdrop-blur-xl"></div>
                  <div className="absolute inset-0 bg-card/90 rounded-3xl border border-border overflow-hidden flex flex-col shadow-2xl">
                     <div className="h-10 border-b border-border bg-secondary/80 flex items-center px-4 gap-2">
                       <div className="w-2.5 h-2.5 rounded-full bg-foreground/20"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-foreground/10"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-foreground/5"></div>
                     </div>
                     <div className="flex-1 relative bg-transparent p-8">
                        <div className="absolute right-8 top-8 w-36 h-48 bg-gradient-to-br from-foreground/10 to-foreground/5 rounded-xl border border-border rotate-12 shadow-xl backdrop-blur-md z-10 flex items-center justify-center overflow-hidden">
                           <Image src="/book.png" alt="كتاب إلكتروني" fill className="object-cover opacity-80" />
                        </div>
                        <div className="absolute left-10 bottom-10 w-56 h-36 bg-gradient-to-br from-foreground/5 to-transparent rounded-xl border border-border -rotate-6 shadow-2xl backdrop-blur-md z-20 flex items-center justify-center overflow-hidden">
                           <Image src="/course.png" alt="كورس" fill className="object-cover opacity-80" />
                        </div>
                        <div className="absolute right-24 bottom-24 w-16 h-16 bg-background rounded-2xl border border-border rotate-45 shadow-lg flex items-center justify-center z-30 hover:scale-105 transition-transform cursor-pointer">
                          <LogoMark sizeClass="w-8 h-8" />
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
              
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 relative overflow-hidden z-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-2xl text-right">
              <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">أرقى المختارات الرقمية</h2>
              <p className="text-muted-foreground text-sm">تصفح أحدث إضافاتنا من المنتجات المنسقة بدقة والمصممة لتسريع وتيرة نموك.</p>
            </div>
            <Link href="/store" className="text-foreground text-sm font-semibold hover:underline mt-4 md:mt-0 flex items-center gap-2 group">
              <span>عرض المتجر الكامل</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col space-y-4 bg-card p-6 rounded-2xl border border-border">
                    <Skeleton className="h-48 w-full rounded-xl bg-secondary" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-2/3 bg-secondary" />
                      <Skeleton className="h-4 w-full bg-secondary" />
                      <Skeleton className="h-4 w-4/5 bg-secondary" />
                    </div>
                    <Skeleton className="h-10 w-full mt-4 bg-secondary" />
                  </div>
                ))
              : featuredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
                    className="h-full"
                  >
                    <ProductCard product={{ ...product, quantity: 1 }} />
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* Interactive Bento Box Features Section */}
      <section className="py-24 border-t border-border bg-gradient-to-b from-background to-secondary/30 relative z-20">
        <div className="container px-6 mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">نظام عمل تفاعلي متطور</h2>
            <p className="text-sm text-muted-foreground">
              بوابة متكاملة تدعم تجربة تفاعلية ذكية من الجلب الفوري للملفات، مروراً بالتحقق التلقائي والشفافية التقنية.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-6">
            
            {/* Bento Block 1: Interactive Download Speed Simulator (Spans 2 columns, 2 rows) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="lg:col-span-2 lg:row-span-2 rounded-3xl border border-border bg-card/85 p-8 hover:border-foreground/10 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-48 h-48 glow-green rounded-full blur-[80px] opacity-40 pointer-events-none"></div>
              
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Download className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">اختبار السرعة المدمج</span>
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-foreground">تحميل فوري عبر شبكة سحابية فائقة</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                  يتم تسليم الملفات الرقمية عبر شبكات CDN عالمية موزعة لضمان أقصى سرعة تحميل. اختر نوع شبكتك لتجربة السرعة الفعلية للملف بحجم **1 جيجابايت**:
                </p>

                {/* Speed buttons */}
                <div className="grid grid-cols-4 gap-2 mt-6">
                  {(Object.keys(speedConfigs) as Array<keyof typeof speedConfigs>).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setSpeedOption(opt); setDownloadProgress(0); }}
                      className={`py-2 px-1 text-center rounded-lg border text-[11px] font-bold transition-all duration-200 ${
                        speedOption === opt
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/5"
                          : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="bg-secondary/30 border border-border p-4 rounded-xl mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">السرعة المتوقعة:</span>
                  <span className="text-xs font-bold text-foreground" dir="ltr">{speedConfigs[speedOption].speed}</span>
                </div>

                <div className="bg-secondary/30 border border-border p-4 rounded-xl mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">زمن التحميل المقدر:</span>
                  <span className="text-xs font-bold text-foreground">{speedConfigs[speedOption].time}</span>
                </div>
              </div>
              
              {/* Interactive Download progress bar */}
              <div className="mt-8">
                <button
                  onClick={handleStartDownload}
                  disabled={isDownloading}
                  className="w-full py-2.5 rounded-xl bg-foreground text-background hover:opacity-90 font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  {isDownloading ? "جاري محاكاة التحميل..." : "ابدأ محاكاة التحميل"}
                </button>

                <div className="relative h-1.5 w-full bg-secondary rounded-full mt-4 overflow-hidden">
                  <motion.div
                    className="absolute top-0 right-0 h-full bg-emerald-400"
                    animate={{ width: `${downloadProgress}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-[10px] text-muted-foreground">
                  <span>تم تحميل {Math.round(downloadProgress)}%</span>
                  <span dir="ltr">{speedOption.toUpperCase()} - {speedConfigs[speedOption].speed}</span>
                </div>
              </div>
            </motion.div>

            {/* Bento Block 2: Interactive API Console (Spans 2 columns, 1 row) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="lg:col-span-2 lg:row-span-1 rounded-3xl border border-border bg-card/85 p-8 hover:border-foreground/10 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute -bottom-12 -left-12 w-48 h-48 glow-blue rounded-full blur-[80px] opacity-30 pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Terminal className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">كونسول الربط للمطورين</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">سهولة دمج المنتجات برمجياً</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed max-w-sm">
                    هل ترغب بدمج منتجاتك بقاعدة بياناتك؟ نوفر واجهة برمجية API قوية وسهلة الاستخدام للمطورين لجلب الملفات لحظياً.
                  </p>
                  
                  {/* Language selection tabs */}
                  <div className="flex gap-2 mt-4">
                    {[
                      { id: "js", label: "JavaScript" },
                      { id: "curl", label: "cURL" },
                      { id: "py", label: "Python" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        disabled={isTyping}
                        onClick={() => setActiveLang(tab.id as any)}
                        className={`px-3 py-1 rounded-lg border text-[10px] font-mono transition-all duration-200 ${
                          activeLang === tab.id
                            ? "bg-blue-500/10 border-blue-500 text-blue-400"
                            : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated IDE Terminal */}
                <div className="w-full md:w-80 bg-background border border-border rounded-xl overflow-hidden font-mono text-[10px] flex flex-col h-40" dir="ltr">
                  <div className="bg-secondary px-3 py-1.5 border-b border-border flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/40"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/40"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/40"></div>
                    <span className="text-[9px] text-muted-foreground ml-auto">aipulse_api.sh</span>
                  </div>
                  <div className="p-3 flex-1 overflow-y-auto text-left text-foreground/90 whitespace-pre-wrap select-all cursor-text leading-normal scrollbar-none">
                    {terminalOutput}
                    {isTyping && <span className="animate-pulse inline-block w-1.5 h-3.5 bg-blue-400 ml-1">|</span>}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bento Box 3: ROI Calculator (Spans 1 column, 1 row) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="lg:col-span-1 lg:row-span-1 rounded-3xl border border-border bg-card/85 p-6 hover:border-foreground/10 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute -bottom-12 -right-12 w-36 h-36 glow-orange rounded-full blur-[60px] opacity-30 pointer-events-none"></div>
              
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="w-4 h-4 text-orange-400" />
                  <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">حاسبة التوفير الرقمية</span>
                </div>
                <h3 className="text-base font-bold mb-2 text-foreground">احسب نسبة أرباحك</h3>
                <p className="text-muted-foreground text-[11px] leading-relaxed mb-4">
                  توفير 8% من العمولات مقارنة بالمنصات الأخرى التي تفرض رسوماً إضافية مرتفعة:
                </p>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>معدل المبيعات شهرياً:</span>
                      <span className="text-foreground font-bold">{monthlySales} مبيعة</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      value={monthlySales}
                      onChange={(e) => setMonthlySales(Number(e.target.value))}
                      className="w-full accent-orange-500 bg-secondary h-1 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>متوسط سعر المنتج:</span>
                      <span className="text-foreground font-bold">{productPrice.toLocaleString()} د.ع</span>
                    </div>
                    <input
                      type="range"
                      min="5000"
                      max="250000"
                      step="5000"
                      value={productPrice}
                      onChange={(e) => setProductPrice(Number(e.target.value))}
                      className="w-full accent-orange-500 bg-secondary h-1 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">التوفير السنوي الصافي:</span>
                  <span className="text-xs font-bold text-orange-400">{calculatedSavings.toLocaleString()} د.ع</span>
                </div>
              </div>
            </motion.div>

            {/* Bento Block 4: Call to Action Block (Spans 1 column, 1 row) */}
            <Link href="/store" className="lg:col-span-1 lg:row-span-1 block h-full w-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                className="h-full bg-foreground rounded-3xl p-8 text-background flex flex-col justify-between items-center text-center group overflow-hidden relative cursor-pointer hover:shadow-xl transition-all duration-300 min-h-[220px]"
              >
                 <div className="absolute inset-0 bg-foreground/90 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-500 rounded-3xl z-0"></div>
                 
                 <div className="relative z-10 w-full h-full flex flex-col justify-between items-center">
                   <div className="w-12 h-12 rounded-full bg-background/10 flex items-center justify-center">
                     <Sparkles className="w-6 h-6 text-background" />
                   </div>
                   
                   <div>
                     <h3 className="text-xl font-bold mb-1 font-serif">اكتشف الإمكانيات</h3>
                     <p className="text-background/70 text-[10px] max-w-[150px] mx-auto leading-normal">ادخل لمتجرنا لتجربة معينات المنتجات الرقمية.</p>
                   </div>
                   
                   <div className="flex items-center gap-1.5 text-xs font-bold">
                     <span>ابدأ التصفح</span>
                     <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform duration-300" />
                   </div>
                 </div>
              </motion.div>
            </Link>

          </div>
        </div>
      </section>
    </div>
  )
}
