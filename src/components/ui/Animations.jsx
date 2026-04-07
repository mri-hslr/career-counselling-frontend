import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// 1. SPLIT TEXT ANIMATION (Premium Character-by-Character GSAP feel)
// ============================================================================
export const SplitText = ({ text, className = '', delay = 0.03 }) => {
  // 👉 We split by empty string to get individual characters!
  const letters = text.split('');

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: delay, 
          },
        },
      }}
      className={`inline-block ${className}`}
    >
      {letters.map((char, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 40 }, 
            visible: {
              opacity: 1,
              y: 0,
              // The exact mathematical equivalent of GSAP's "power3.out"
              transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }, 
            },
          }}
          className="inline-block"
        >
          {/* Preserve spaces between words so it formats correctly */}
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

// ============================================================================
// 2. FAST BLUR TEXT ANIMATION (Word-by-word)
// ============================================================================
export const BlurText = ({ text = "", delay = 0, className = "" }) => {
  const words = (text || "").split(" ");
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{ visible: { transition: { staggerChildren: 0.015, delayChildren: delay } } }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, filter: "blur(10px)", y: 5 },
            visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.2 } },
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

// ============================================================================
// 3. SHINY HOVER OUTLINE
// ============================================================================
export const ShinyOverlay = () => (
  <>
    <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/50 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.4)_inset] transition-all duration-500 pointer-events-none z-20" />
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 z-20 pointer-events-none"
      initial={{ x: '-150%' }}
      whileHover={{ x: '150%' }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </>
);