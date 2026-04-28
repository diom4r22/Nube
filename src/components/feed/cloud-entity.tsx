"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Heart, MessageCircle, Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { supabase } from "@/lib/supabase";
import { EmotionType, EMOTIONS_DATA } from "@/lib/emotions";
import { useCloudPhysics } from "@/hooks/use-cloud-physics";

export interface Post {
  id: string;
  content: string;
  type: EmotionType;
  created_at: string;
  support_count: number;
  reply_count: number;
}

// 4 diferentes máscaras de nubes para variedad
const CLOUD_PATHS = [
  "M 30,50 C 10,50 0,35 15,20 C 25,5 50,0 65,15 C 80,5 100,15 95,35 C 100,50 80,60 65,55 C 50,65 30,60 30,50 Z",
  "M 20,40 C 5,40 5,20 20,15 C 30,0 55,0 65,15 C 85,10 95,25 90,40 C 100,55 75,60 60,50 C 45,60 25,55 20,40 Z",
  "M 35,45 C 15,50 5,30 20,15 C 35,0 60,5 70,20 C 90,15 100,35 85,45 C 95,60 70,60 60,50 C 45,60 30,55 35,45 Z",
  "M 25,45 C 10,40 10,25 25,15 C 40,0 65,5 75,20 C 95,15 95,35 80,45 C 90,60 65,60 55,50 C 40,60 20,55 25,45 Z"
];

export function CloudEntity({ 
  post, 
  index,
  onReplyClick 
}: { 
  post: Post; 
  index: number;
  onReplyClick: (post: Post) => void 
}) {
  const [hasSupported, setHasSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(post.support_count || 0);
  const [showParticles, setShowParticles] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Optimización: si no está en pantalla, no calcular físicas
  const { ref: viewRef, inView } = useInView({ rootMargin: '200px' });

  const emotion = EMOTIONS_DATA[post.type] || EMOTIONS_DATA.pensamiento;

  // Lógica de físicas autónomas (rebotar suavemente)
  // Posicionamiento "ancla" basado en index para que bajen en la pantalla
  const anchorX = (index % 3) * 30 + 10; // 10%, 40%, 70%
  const anchorY = Math.floor(index / 3) * 300 + 100;
  
  const { style: physicsStyle } = useCloudPhysics({
    anchorX,
    anchorY,
    rangeX: 20,
    rangeY: 100,
    speed: 0.5 + (index % 5) * 0.2,
    isPaused: !inView || isHovered
  });

  const pathIndex = Array.from(post.id).reduce((a, b) => a + b.charCodeAt(0), 0) % CLOUD_PATHS.length;
  const cloudPath = CLOUD_PATHS[pathIndex];

  const handleSupport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasSupported) return;
    
    setHasSupported(true);
    setSupportCount(prev => prev + 1);
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1200);
    
    await supabase.from('posts').update({ support_count: supportCount + 1 }).eq('id', post.id);
  };

  return (
    <div 
      ref={viewRef}
      className="absolute w-full max-w-sm pointer-events-none"
      style={{
        left: `${anchorX}%`,
        top: `${anchorY}px`,
        ...physicsStyle
      }}
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group pointer-events-auto"
        style={{ filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.1))' }}
      >
        {/* SVG Cloud Shape */}
        <div className="relative w-full aspect-[4/3]">
          {/* El contenedor con clip path para la forma real de la nube */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 65" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`grad-${post.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                {/* Los colores vendrían de las clases de tailwind, pero para SVG necesitamos hex.
                    Haremos un truco usando la clase fill en Tailwind o currentColor */}
              </linearGradient>
            </defs>
            {/* Base Color de la Nube */}
            <path d={cloudPath} className={`fill-white dark:fill-slate-800`} />
            
            {/* Gradiente Emocional Superpuesto con Opacidad */}
            <path d={cloudPath} className={`fill-current opacity-30 ${emotion.color.split(' ')[0].replace('from-', 'text-')}`} />
          </svg>

          {/* Rostro de la Nube */}
          <CloudFace type={post.type} className="absolute right-12 top-10 w-16 h-8 opacity-70" />

          {/* Contenido (Text) posicionado sobre el SVG */}
          <div className="absolute inset-0 p-8 pt-10 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm border border-white/50">
                  <span className="text-lg leading-none">{emotion.icon}</span>
                  <span className="text-foreground/70">{emotion.label}</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                  {formatDistanceToNow(new Date(post.created_at), { locale: es })}
                </span>
              </div>
              <p className="text-base font-medium text-foreground/90 leading-snug line-clamp-4">
                {post.content}
              </p>
            </div>

            {/* Acciones (Solo visibles en Hover) */}
            <AnimatePresence>
              {isHovered && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3"
                >
                  <div className="flex gap-4">
                    <button
                      onClick={handleSupport}
                      className={`flex items-center gap-1.5 text-sm font-bold transition-transform hover:scale-110 ${
                        hasSupported ? 'text-rose-500' : 'text-foreground/50 hover:text-rose-500'
                      }`}
                    >
                      <Heart size={18} className={hasSupported ? 'fill-rose-500' : ''} />
                      <span>{supportCount > 0 ? supportCount : ''}</span>
                    </button>
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); onReplyClick(post); }}
                      className="flex items-center gap-1.5 text-sm font-bold text-foreground/50 hover:text-foreground transition-transform hover:scale-110"
                    >
                      <MessageCircle size={18} />
                      <span>{post.reply_count > 0 ? post.reply_count : ''}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sistema de Partículas de Like */}
        <AnimatePresence>
          {showParticles && (
            <motion.div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                    animate={{ 
                      opacity: 0, 
                      scale: 1.5, 
                      x: Math.cos(angle) * 120, 
                      y: Math.sin(angle) * 120 
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute text-2xl"
                  >
                    {emotion.icon}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Caritas Emocionales Integradas en SVG
function CloudFace({ type, className }: { type: EmotionType, className?: string }) {
  const color = "currentColor";
  
  return (
    <svg className={className} viewBox="0 0 100 50">
      {type === 'amor' && (
        <g stroke={color} strokeWidth="4" strokeLinecap="round" fill="none">
          {/* Heart eyes */}
          <path d="M 20,20 Q 25,15 30,20 Q 25,30 20,35 Q 15,30 10,20 Q 15,15 20,20 Z" fill="#ef4444" stroke="none" />
          <path d="M 80,20 Q 85,15 90,20 Q 85,30 80,35 Q 75,30 70,20 Q 75,15 80,20 Z" fill="#ef4444" stroke="none" />
          <path d="M 40,40 Q 50,45 60,40" />
        </g>
      )}
      {type === 'tristeza' && (
        <g stroke={color} strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M 15,25 Q 25,15 35,25" />
          <path d="M 65,25 Q 75,15 85,25" />
          <path d="M 40,45 Q 50,40 60,45" />
          <circle cx="25" cy="35" r="3" fill="#60a5fa" stroke="none" />
        </g>
      )}
      {type === 'alegria' && (
        <g stroke={color} strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M 15,20 Q 25,10 35,20" />
          <path d="M 65,20 Q 75,10 85,20" />
          <path d="M 30,35 Q 50,55 70,35" />
          {/* Blush */}
          <circle cx="10" cy="30" r="8" fill="#fca5a5" opacity="0.5" stroke="none" />
          <circle cx="90" cy="30" r="8" fill="#fca5a5" opacity="0.5" stroke="none" />
        </g>
      )}
      {type === 'confesion' && (
        <g stroke={color} strokeWidth="4" strokeLinecap="round" fill="none">
          <circle cx="25" cy="20" r="4" fill={color} />
          <circle cx="75" cy="20" r="4" fill={color} />
          <path d="M 45,40 Q 50,38 55,40" />
          {/* Heavy blush */}
          <circle cx="15" cy="30" r="12" fill="#fca5a5" opacity="0.8" stroke="none" />
          <circle cx="85" cy="30" r="12" fill="#fca5a5" opacity="0.8" stroke="none" />
        </g>
      )}
      {type === 'idea' && (
        <g stroke={color} strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M 15,20 L 35,25" />
          <path d="M 65,25 L 85,20" />
          <circle cx="25" cy="25" r="4" fill={color} />
          <circle cx="75" cy="25" r="4" fill={color} />
          <path d="M 40,40 Q 50,45 60,40" />
        </g>
      )}
      {type === 'pregunta' && (
        <g stroke={color} strokeWidth="4" strokeLinecap="round" fill="none">
          <circle cx="25" cy="25" r="5" fill={color} />
          <circle cx="75" cy="25" r="5" fill={color} />
          <path d="M 40,45 Q 50,45 60,45" />
          <path d="M 15,15 Q 25,5 35,15" />
        </g>
      )}
      {type === 'pensamiento' && (
        <g stroke={color} strokeWidth="4" strokeLinecap="round" fill="none">
          <circle cx="25" cy="25" r="4" fill={color} />
          <circle cx="75" cy="25" r="4" fill={color} />
          <path d="M 45,40 L 55,40" />
        </g>
      )}
    </svg>
  );
}
