"use client"

import React from "react"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
  linkTo?: string
}

function LogoMark({ sizeClass }: { sizeClass: string }) {
  return (
    <div className={`${sizeClass} relative group-hover:scale-105 transition-transform duration-300`}>
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          {/* Premium gradient */}
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="pulseGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background circle with subtle gradient */}
        <circle cx="40" cy="40" r="38" fill="url(#logoGrad)" opacity="0.08" />
        <circle cx="40" cy="40" r="38" stroke="url(#logoGrad)" strokeWidth="2" opacity="0.3" />

        {/* Brain/AI neural network - left hemisphere */}
        <path
          d="M28 28C28 28 24 32 24 40C24 48 28 52 28 52"
          stroke="url(#logoGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M22 34C22 34 20 37 20 40C20 43 22 46 22 46"
          stroke="url(#logoGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* Brain/AI neural network - right hemisphere */}
        <path
          d="M52 28C52 28 56 32 56 40C56 48 52 52 52 52"
          stroke="url(#logoGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M58 34C58 34 60 37 60 40C60 43 58 46 58 46"
          stroke="url(#logoGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* Pulse/Heartbeat line - the "نبض" */}
        <path
          d="M16 40 L30 40 L34 28 L38 52 L42 24 L46 48 L50 40 L64 40"
          stroke="url(#pulseGrad)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#glow)"
        />

        {/* Neural nodes */}
        <circle cx="34" cy="28" r="2.5" fill="#8b5cf6" opacity="0.9" />
        <circle cx="42" cy="24" r="2.5" fill="#6366f1" opacity="0.9" />
        <circle cx="38" cy="52" r="2.5" fill="#06b6d4" opacity="0.9" />
        <circle cx="46" cy="48" r="2.5" fill="#22d3ee" opacity="0.9" />

        {/* Center AI dot */}
        <circle cx="40" cy="40" r="3" fill="url(#logoGrad)" />
        <circle cx="40" cy="40" r="5" stroke="url(#logoGrad)" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  )
}

export default function Logo({ size = "md", showText = true, className = "", linkTo = "/" }: LogoProps) {
  const sizeMap = {
    sm: { icon: "w-8 h-8", arabic: "text-base", english: "text-[10px]" },
    md: { icon: "w-10 h-10", arabic: "text-lg", english: "text-[11px]" },
    lg: { icon: "w-14 h-14", arabic: "text-2xl", english: "text-sm" },
  }

  const s = sizeMap[size]

  const content = (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <LogoMark sizeClass={s.icon} />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${s.arabic} font-bold tracking-tight`}>
            نبض الذكاء
          </span>
          <span className={`${s.english} font-semibold tracking-[0.15em] text-muted-foreground uppercase`}>
            AI PULSE
          </span>
        </div>
      )}
    </div>
  )

  if (linkTo) {
    return (
      <Link href={linkTo} className="relative z-10">
        {content}
      </Link>
    )
  }

  return content
}

// Export standalone mark for favicon/small contexts
export { LogoMark }
