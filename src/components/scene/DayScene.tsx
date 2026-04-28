"use client";

import { motion } from "framer-motion";

export function DayScene() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-1000">
      {/* Gradiente Atmosférico Diurno Base (Azul Original) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7dd3fc] via-[#bae6fd] to-[#e0f2fe] transition-all duration-1000" />
      
      {/* Gradiente animado superpuesto para dar vida */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 animate-pulse mix-blend-overlay" style={{ animationDuration: '8s' }} />

      {/* God Rays (Rayos de sol suaves) */}
      <div className="absolute top-0 right-0 w-[60vw] h-[120vh] origin-top-right rotate-[-15deg] bg-gradient-to-l from-yellow-100/15 to-transparent blur-3xl pointer-events-none" />

      {/* Decorative Parallax Clouds */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`bg-cloud-${i}`}
          animate={{ x: i % 2 === 0 ? ['-15vw', '115vw'] : ['115vw', '-15vw'] }}
          transition={{ duration: 90 + i * 20, repeat: Infinity, ease: "linear" }}
          className="absolute opacity-20 blur-3xl bg-white rounded-full"
          style={{
            top: `${8 + (i * 12)}%`,
            width: `${350 + (i * 120)}px`,
            height: `${120 + (i * 25)}px`,
          }}
        />
      ))}

      {/* Aves (múltiples bandadas) */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={`bird-${i}`}
          animate={{ x: ["-10vw", "110vw"], y: [0, -15 * (i + 1), 8, -5, 0] }}
          transition={{ duration: 30 + i * 10, repeat: Infinity, ease: "linear", delay: i * 8 }}
          className="absolute left-0 text-slate-400/15"
          style={{ top: `${15 + i * 20}%` }}
        >
          <svg width="30" height="15" viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M0,10 Q10,0 20,10 Q30,0 40,10" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
