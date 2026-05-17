"use client"

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Target, Zap, GraduationCap, Code, BookOpen, Award, Mail, Cpu, FlaskConical, BrainCircuit, Megaphone, TrendingUp, PenTool, Share2, Star, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const certificates = [
  {
    src: "/certificates/cert-1-cambridge-lens26.jpeg",
    title: "شهادة مشاركة — مؤتمر LENS 26",
    subtitle: "Cambridge Energy Nexus 2026 | كامبريدج، إنجلترا",
    category: "مؤتمرات دولية",
    color: "from-blue-500 to-indigo-600",
  },
  {
    src: "/certificates/cert-2-american-university.jpeg",
    title: "دبلوم الذكاء الاصطناعي",
    subtitle: "The American University of Science — Oregon, USA",
    category: "شهادات أكاديمية",
    color: "from-red-500 to-rose-600",
  },
  {
    src: "/certificates/cert-3-ai-diploma-part1.jpeg",
    title: "دبلوم الذكاء الاصطناعي — الجزء الأول",
    subtitle: "مركز التدريب التكنولوجي | 60 ساعة تدريبية | تقدير ممتاز",
    category: "شهادات تدريبية",
    color: "from-amber-500 to-orange-600",
  },
  {
    src: "/certificates/cert-4-ai-python.jpeg",
    title: "شهادة Python في دبلوم الذكاء الاصطناعي",
    subtitle: "مركز التدريب التكنولوجي | 60 ساعة | تقدير ممتاز",
    category: "شهادات تدريبية",
    color: "from-green-500 to-emerald-600",
  },
  {
    src: "/certificates/cert-5-experience.jpeg",
    title: "شهادة خبرة — مهندسة تعلم آلي",
    subtitle: "مركز التدريب التكنولوجي | Junior Machine Learning Engineer",
    category: "شهادات خبرة",
    color: "from-violet-500 to-purple-600",
  },
  {
    src: "/certificates/cert-6-achievements.jpeg",
    title: "شهادة تميّز — دبلوم الذكاء الاصطناعي",
    subtitle: "تقدير لتحقيق العلامة الكاملة في امتحان دبلوم الذكاء الاصطناعي",
    category: "شهادات تميّز",
    color: "from-yellow-500 to-amber-600",
  },
]

export default function AboutPage() {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const openLightbox = (idx: number) => setLightbox(idx)
  const closeLightbox = () => setLightbox(null)
  const prevCert = () => setLightbox(prev => prev !== null ? (prev - 1 + certificates.length) % certificates.length : null)
  const nextCert = () => setLightbox(prev => prev !== null ? (prev + 1) % certificates.length : null)
  const team = [
    { 
      name: "د. فريال إبراهيم جبار الظفيري", 
      role: "المؤسِّسة والمديرة العامة", 
      initial: "ف",
      color: "from-violet-500 to-purple-600",
      qualifications: [
        "دكتوراه هندسة الذكاء الاصطناعي — UTHM ماليزيا (2023)",
        "ماجستير ذكاء اصطناعي — جامعة الموصل (2015)",
        "بكالوريوس هندسة القدرة الكهربائية — جامعة الفرات الأوسط (2007)"
      ],
      achievements: [
        { icon: BookOpen, text: "أكثر من 30 بحثاً منشوراً في مجلات Scopus العالمية" },
        { icon: GraduationCap, text: "خبرة أكاديمية تتجاوز 35 سنة في التدريس والتدريب" },
        { icon: Award, text: "أستاذة في جامعة المستقبل وعضوة في مركز تطبيقات الذكاء الاصطناعي" },
        { icon: FlaskConical, text: "مؤلفة كتاب \"الإطار القانوني للذكاء الاصطناعي في الأدلة الجنائية\"" },
      ],
      email: "Feryal.ibrahim@uomus.edu.iq"
    },
    { 
      name: "المهندس علي موفق مهدي كريم الموسوي", 
      role: "الشريك المؤسس والمدير التقني",
      initial: "ع",
      color: "from-blue-500 to-cyan-500",
      qualifications: [
        "بكالوريوس فيزياء طبية — جامعة المستقبل (2025)",
        "مؤسس ومدير تنفيذي لشركة حلول الموسوي البرمجية",
      ],
      achievements: [
        { icon: Code, text: "مدير منتج لمنصة Trado — منصة تواصل اجتماعي عراقية (+1000 مستخدم أول شهر)" },
        { icon: BrainCircuit, text: "خبير في: React, Next.js, Flutter, Dart, Kotlin, Swift, PostgreSQL" },
        { icon: Cpu, text: "خبير في هندسة الـ Prompt: Gemini, Claude, Cursor, Antigravity" },
        { icon: Award, text: "مشروع التخرج: روبوت توصيل الأدوية الطبية بالـ Arduino" },
      ],
      email: "gamegdeo@gmail.com"
    },
    { 
      name: "الأستاذ كرار حيدر علي", 
      role: "مسؤول الترويج والسوشل ميديا",
      initial: "ك",
      color: "from-emerald-500 to-teal-500",
      qualifications: [
        "بكالوريوس إدارة أعمال — تخصص تسويق رقمي",
        "شهادة معتمدة في إدارة حملات Google Ads و Meta Ads",
        "دبلوم متقدم في صناعة المحتوى الرقمي والعلامات التجارية",
      ],
      achievements: [
        { icon: Megaphone, text: "إدارة حملات تسويقية ناجحة بميزانيات تجاوزت $50K وعائد استثمار +320%" },
        { icon: TrendingUp, text: "تحقيق نمو +500% في المتابعين لأكثر من 15 علامة تجارية عراقية" },
        { icon: PenTool, text: "صانع محتوى إبداعي متخصص في Reels و TikTok بملايين المشاهدات" },
        { icon: Share2, text: "خبير في بناء استراتيجيات السوشل ميديا وتحليل البيانات التسويقية" },
      ],
      email: "karrar.haidar@aipulse.iq"
    },
  ]

  return (
    <div className="flex flex-col min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-sm text-primary mb-6"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>تكنولوجيا × أكاديميا × ابتكار</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
          >
            نحن هنا لنغير قواعد اللعبة
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-3xl font-bold mb-6">قصتنا</h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              &quot;Ai Pulse&quot; ليست مجرد منصة لبيع المنتجات الرقمية، بل هي مجتمع طموح يهدف لتمكين الأفراد والشركات في العالم العربي للوصول إلى أقصى إمكاناتهم من خلال حلول رقمية مبتكرة وعالية الجودة.
            </p>
          </motion.div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-10 rounded-3xl"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">رؤيتنا</h2>
            <p className="text-muted-foreground leading-relaxed">
              أن نكون المنصة الأولى في الشرق الأوسط التي تقدم أدوات رقمية من الطراز العالمي، وأن نساهم في بناء جيل جديد من رواد الأعمال والمبدعين العرب القادرين على المنافسة عالمياً.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-10 rounded-3xl"
          >
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">مهمتنا</h2>
            <p className="text-muted-foreground leading-relaxed">
              تقديم كورسات عملية، كتب مركزة، وبرمجيات ذكية تختصر الوقت والجهد على عملائنا. نحن نؤمن بأن الجودة لا تعني التعقيد، بل تكمن في البساطة والتصميم الذكي.
            </p>
          </motion.div>
        </div>

        {/* Team Section */}
        <div className="container mx-auto px-4 py-24 bg-secondary/30">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">الفريق خلف &quot;Ai Pulse&quot;</h2>
            <p className="text-muted-foreground text-lg">
              نحن مجموعة من الشغوفين بالتكنولوجيا والتصميم، نعمل معاً لتقديم أفضل تجربة ممكنة لعملائنا.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-panel rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-500 group"
              >
                {/* Header with Gradient */}
                <div className={`relative h-28 bg-gradient-to-l ${member.color} flex items-end p-6`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute -bottom-10 right-6 w-20 h-20 rounded-2xl bg-card border-4 border-background shadow-xl flex items-center justify-center text-3xl font-bold text-primary z-10 group-hover:scale-105 transition-transform duration-300">
                    {member.initial}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-14">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-primary text-sm font-semibold mb-5">{member.role}</p>

                  {/* Qualifications */}
                  <div className="mb-5">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">المؤهلات العلمية</h4>
                    <div className="space-y-2">
                      {member.qualifications.map((q, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <GraduationCap className="w-4 h-4 mt-0.5 text-primary/60 shrink-0" />
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="mb-5">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">الإنجازات البارزة</h4>
                    <div className="space-y-2.5">
                      {member.achievements.map((a, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-sm">
                          <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                            <a.icon className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-muted-foreground">{a.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="pt-4 border-t border-border">
                    <a 
                      href={`mailto:${member.email}`} 
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="font-mono text-xs" dir="ltr">{member.email}</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Team Photo Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mt-20 max-w-5xl mx-auto"
          >
            {/* Premium Frame */}
            <div className="relative group">
              {/* Outer glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 rounded-[2rem] blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
              
              {/* Golden border frame */}
              <div className="relative rounded-[1.75rem] p-[3px] bg-gradient-to-br from-amber-400/80 via-yellow-300/60 to-amber-500/80 shadow-2xl shadow-amber-900/10">
                <div className="relative rounded-[1.6rem] overflow-hidden bg-background">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-400/50 rounded-tl-[1.6rem] z-10" />
                  <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-400/50 rounded-tr-[1.6rem] z-10" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-400/50 rounded-bl-[1.6rem] z-10" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-400/50 rounded-br-[1.6rem] z-10" />

                  {/* Image */}
                  <div className="relative aspect-[16/10] w-full">
                    <Image
                      src="/team-photo.png"
                      alt="فريق نبض الذكاء | Ai Pulse"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 960px"
                      className="object-cover object-center"
                      quality={100}
                    />
                  </div>

                  {/* Bottom caption overlay */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-6 px-8 z-10">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-400/60" />
                      <p className="text-white/90 font-bold text-lg tracking-wide whitespace-nowrap">
                        فريق نبض الذكاء — نصنع المستقبل الرقمي
                      </p>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-400/60" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ===== Certificates Section ===== */}
        <div className="mt-32 mb-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-sm text-amber-500 mb-6"
            >
              <Star className="w-4 h-4 fill-amber-500" />
              <span>شهادات وتقديرات عالمية</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              شهادات د. فريال إبراهيم جبار
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg leading-relaxed"
            >
              مجموعة من الشهادات والتقديرات الدولية والأكاديمية المعتمدة التي تعكس مسيرة علمية حافلة بالتميّز والإنجاز
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
                onClick={() => openLightbox(i)}
              >
                <div className="glass-panel rounded-2xl overflow-hidden hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500">
                  {/* Category badge */}
                  <div className="px-4 pt-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${cert.color} text-white`}>
                      <Award className="w-3 h-3" />
                      {cert.category}
                    </span>
                  </div>

                  {/* Certificate image */}
                  <div className="relative mx-4 mt-3 rounded-xl overflow-hidden aspect-[4/3] bg-secondary/30">
                    <Image
                      src={cert.src}
                      alt={cert.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <Star className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-base mb-1 leading-snug">{cert.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cert.subtitle}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Click to expand hint */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            اضغط على أي شهادة لعرضها بالحجم الكامل
          </motion.p>
        </div>

      </div>

      {/* ===== Lightbox ===== */}
      {lightbox !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prevCert() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); nextCert() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image container */}
          <motion.div
            key={lightbox}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative max-w-3xl w-full max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={certificates[lightbox].src}
                alt={certificates[lightbox].title}
                className="w-full max-h-[75vh] object-contain bg-black"
              />
            </div>
            {/* Caption */}
            <div className="text-center mt-4">
              <p className="text-white font-bold text-lg">{certificates[lightbox].title}</p>
              <p className="text-white/60 text-sm mt-1">{certificates[lightbox].subtitle}</p>
              <p className="text-white/40 text-xs mt-2">{lightbox + 1} / {certificates.length}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
