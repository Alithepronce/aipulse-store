"use client"

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Target, Zap, GraduationCap, Code, BookOpen, Award, Mail, Cpu, FlaskConical, BrainCircuit, Megaphone, TrendingUp, PenTool, Share2 } from "lucide-react"

export default function AboutPage() {
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



      </div>
    </div>
  )
}
