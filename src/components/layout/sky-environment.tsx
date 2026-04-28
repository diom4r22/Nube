"use client";

import { useAppStore } from "@/store/app-store";
import { motion } from "framer-motion";

export function SkyEnvironment() {
  const { sunEmotion, theme } = useAppStore();
  
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Background clouds layer 1 (Slowest) */}
      <motion.div
        className="absolute top-[10%] w-[200vw] flex justify-around opacity-30"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
      >
        <CloudShape width={300} height={100} className="fill-white/40 dark:fill-white/5" />
        <CloudShape width={400} height={120} className="fill-white/40 dark:fill-white/5" />
        <CloudShape width={250} height={80} className="fill-white/40 dark:fill-white/5" />
      </motion.div>

      {/* Background clouds layer 2 (Faster) */}
      <motion.div
        className="absolute top-[30%] w-[250vw] flex justify-between opacity-50"
        animate={{ x: [0, -1200] }}
        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
      >
        <CloudShape width={200} height={70} className="fill-white/60 dark:fill-white/10" />
        <CloudShape width={350} height={110} className="fill-white/60 dark:fill-white/10" />
        <CloudShape width={150} height={50} className="fill-white/60 dark:fill-white/10" />
      </motion.div>

      {/* Estrellas (Solo de noche) */}
      {isDark && (
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                opacity: Math.random() * 0.8 + 0.2,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          ))}
          {/* Lluvia nocturna ligera */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`rain-${i}`}
              className="absolute bg-blue-300/20 w-[1px] h-20"
              style={{
                top: `-20%`,
                left: `${Math.random() * 100}%`,
                animation: `fall ${Math.random() * 2 + 3}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
                transform: 'rotate(15deg)'
              }}
            />
          ))}
        </div>
      )}

      {/* The Sun / Moon */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="fixed top-10 right-10 md:top-20 md:right-20 z-0"
      >
        <div className="relative w-32 h-32">
          {/* Glow */}
          <div className={`absolute inset-0 rounded-full blur-2xl opacity-60 ${isDark ? 'bg-indigo-400/20' : 'bg-yellow-300/50'}`} />
          
          {/* Celestial Body */}
          <div className={`absolute inset-4 rounded-full shadow-lg flex items-center justify-center transition-colors duration-1000 ${
            isDark ? 'bg-gradient-to-br from-slate-700 to-indigo-900 border border-indigo-400/20' : 'bg-gradient-to-br from-yellow-100 to-orange-200'
          }`}>
            <SunMoonFace emotion={sunEmotion} isDark={isDark} />
          </div>
        </div>
      </motion.div>

      {/* Hills / Horizon at bottom */}
      <div className="absolute bottom-0 w-full h-[30vh] opacity-30 dark:opacity-10">
        <div className="absolute bottom-0 w-[150vw] h-full left-[-25%] bg-gradient-to-t from-emerald-100/50 to-transparent rounded-[100%_100%_0_0]" />
        <div className="absolute bottom-0 w-[120vw] h-[80%] left-[-10%] bg-gradient-to-t from-teal-100/60 to-transparent rounded-[100%_100%_0_0]" />
      </div>
    </div>
  );
}

function CloudShape({ width, height, className }: { width: number, height: number, className?: string }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 50" preserveAspectRatio="none" className={className}>
      <path d="M 20,40 Q 10,40 10,30 Q 10,20 25,20 Q 30,10 45,10 Q 60,10 65,20 Q 80,15 90,25 Q 100,35 85,45 Q 75,50 60,45 Q 50,55 35,45 Q 25,50 20,40 Z" />
    </svg>
  );
}

function SunMoonFace({ emotion, isDark }: { emotion: string, isDark: boolean }) {
  const color = isDark ? "#cbd5e1" : "#d97706"; // Slate-300 or Amber-600

  if (emotion === 'happy') {
    return (
      <motion.svg width="60" height="60" viewBox="0 0 100 100" initial={{ scale: 0.8 }} animate={{ scale: 1.1, rotate: [0, -5, 5, 0] }}>
        <path d="M 25,40 Q 35,30 45,40" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 55,40 Q 65,30 75,40" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 30,60 Q 50,80 70,60" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* Blush */}
        <circle cx="20" cy="55" r="8" fill="#fca5a5" opacity="0.6" />
        <circle cx="80" cy="55" r="8" fill="#fca5a5" opacity="0.6" />
      </motion.svg>
    );
  }

  // Neutral / Sleeping
  return (
    <svg width="60" height="60" viewBox="0 0 100 100">
      {isDark ? (
        <>
          {/* Sleeping */}
          <path d="M 25,45 Q 35,55 45,45" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 55,45 Q 65,55 75,45" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 45,70 Q 50,68 55,70" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          {/* Neutral but cute */}
          <circle cx="35" cy="45" r="6" fill={color} />
          <circle cx="65" cy="45" r="6" fill={color} />
          <path d="M 40,65 Q 50,70 60,65" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        </>
      )}
    </svg>
  );
}
