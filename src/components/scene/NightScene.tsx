"use client";

import { motion } from "framer-motion";

export function NightScene() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-1000">
      {/* Gradiente Nocturno Base - Azul profundo fijo */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#1e1b4b] to-[#312e81] transition-all duration-1000" />
      
      {/* Dynamic Nebulas (Más envolventes y etéreas) */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)] animate-pulse mix-blend-screen" style={{ animationDuration: '10s' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08),transparent_70%)] mix-blend-screen" />
      <div className="absolute top-[20%] right-[20%] w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.05),transparent_60%)] animate-pulse mix-blend-screen" style={{ animationDuration: '15s' }} />

      {/* Vía Láctea (Polvo estelar sutil) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent origin-bottom-left rotate-[-30deg] blur-3xl opacity-50" />

      {/* Estrellas (Variedad en tamaños y brillos) */}
      <div className="absolute inset-0">
        {[...Array(120)].map((_, i) => {
          const isLarge = Math.random() > 0.9;
          return (
            <div
              key={`star-${i}`}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: isLarge ? '3px' : `${Math.random() * 1.5 + 0.5}px`,
                height: isLarge ? '3px' : `${Math.random() * 1.5 + 0.5}px`,
                opacity: isLarge ? Math.random() * 0.4 + 0.6 : Math.random() * 0.5 + 0.1,
                animationDuration: `${Math.random() * 4 + 2}s`,
                boxShadow: isLarge ? '0 0 4px rgba(255,255,255,0.8)' : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Estrellas Fugaces (The "cositas") */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`shooting-star-${i}`}
          initial={{ x: '-10vw', y: `${20 + i * 15}vh`, opacity: 0, scaleX: 0 }}
          animate={{ 
            x: '110vw', 
            y: `${40 + i * 15}vh`,
            opacity: [0, 1, 1, 0],
            scaleX: [0, 1, 1, 0]
          }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            repeatDelay: 4 + Math.random() * 6,
            delay: i * 2,
            ease: "easeIn"
          }}
          className="absolute w-32 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent z-10 origin-left"
          style={{ transform: 'rotate(15deg)' }}
        />
      ))}
    </div>
  );
}
