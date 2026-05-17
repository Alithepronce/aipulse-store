"use client"

import React, { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export const SmartCursor = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isPointer, setIsPointer] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  // Smooth springs for the cursor movement
  const springConfig = { damping: 25, stiffness: 300 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    // Only show custom cursor on non-touch devices
    if (window.matchMedia("(hover: none)").matches) return

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16) // offset by half width
      cursorY.set(e.clientY - 16)
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Check if hovering over interactive elements
      const isClickable = 
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") || 
        target.closest("button")

      // Check for specific data attribute for magnetic/special hover
      const isMagnetic = target.closest('[data-magnetic="true"]')

      if (isMagnetic) {
        setIsHovering(true)
        setIsPointer(false)
      } else if (isClickable) {
        setIsPointer(true)
        setIsHovering(false)
      } else {
        setIsHovering(false)
        setIsPointer(false)
      }
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    window.addEventListener("mousemove", moveCursor)
    window.addEventListener("mouseover", handleMouseOver)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      window.removeEventListener("mousemove", moveCursor)
      window.removeEventListener("mouseover", handleMouseOver)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [cursorX, cursorY, isVisible])

  if (!isVisible) return null

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:flex items-center justify-center"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
        animate={{
          scale: isHovering ? 2.5 : isPointer ? 1.5 : 1,
          backgroundColor: isHovering || isPointer ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.5)",
        }}
        transition={{ duration: 0.15 }}
      >
        {isHovering && (
          <motion.span 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-[4px] font-bold text-black"
          >
            استكشف
          </motion.span>
        )}
      </motion.div>
      <style dangerouslySetInnerHTML={{__html: `
        @media (hover: hover) and (pointer: fine) {
          body {
            cursor: none;
          }
          a, button, [role="button"] {
            cursor: none !important;
          }
        }
      `}} />
    </>
  )
}
