"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Heart, MessageCircle, Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { EmotionType, EMOTIONS_DATA } from "@/lib/emotions";

export interface Post {
  id: string;
  content: string;
  type: EmotionType;
  created_at: string;
  support_count: number;
  reply_count: number;
}

export function PostCard({ post, onReplyClick }: { post: Post; onReplyClick: (post: Post) => void }) {
  const [hasSupported, setHasSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(post.support_count || 0);
  const [showParticles, setShowParticles] = useState(false);

  const emotion = EMOTIONS_DATA[post.type] || EMOTIONS_DATA.pensamiento;

  const handleSupport = async () => {
    if (hasSupported) return;
    
    setHasSupported(true);
    setSupportCount(prev => prev + 1);
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1000);
    
    await supabase.from('posts').update({ support_count: supportCount + 1 }).eq('id', post.id);
  };

  const handleReport = async () => {
    if (confirm("¿Seguro que deseas reportar este pensamiento?")) {
      await supabase.from('reports').insert([{ target_type: 'post', target_id: post.id, reason: 'Reporte rápido' }]);
      alert("Nube reportada. Gracias por cuidar el cielo.");
    }
  };

  // Generamos un offset de flotación aleatorio basado en el ID para que no todas floten igual
  const floatDelay = Array.from(post.id).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5;
  const floatDuration = 4 + (Array.from(post.id).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 3);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ 
        y: { duration: floatDuration, repeat: Infinity, ease: "easeInOut", delay: floatDelay },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4, type: "spring", bounce: 0.4 }
      }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative w-full max-w-sm mx-auto mb-8 group"
      style={{ filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.06))' }}
    >
      {/* Sistema de partículas al dar Like */}
      <AnimatePresence>
        {showParticles && (
          <motion.div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: 0, 
                  scale: 1.5, 
                  x: (Math.random() - 0.5) * 150, 
                  y: (Math.random() - 0.5) * 150 
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute text-2xl"
              >
                {emotion.icon}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cloud Shape Wrapper */}
      <div className={`relative bg-gradient-to-br ${emotion.color} backdrop-blur-xl p-6 pt-8 pb-7 rounded-[40px] rounded-tl-[60px] rounded-br-[60px] border border-white/40 dark:border-white/10 transition-colors`}>
        
        {/* Pseudo-burbujas para hacerla más orgánica (puestas absolutamente) */}
        <div className={`absolute -top-4 right-10 w-16 h-16 rounded-full bg-gradient-to-br ${emotion.color} -z-10`} />
        <div className={`absolute -bottom-3 left-8 w-12 h-12 rounded-full bg-gradient-to-br ${emotion.color} -z-10`} />

        {/* Emotion Icon & Time */}
        <div className="absolute -top-5 left-6 bg-white/80 dark:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 shadow-sm flex items-center gap-2">
          <span className="text-xl leading-none">{emotion.icon}</span>
          <span className="text-xs font-bold text-foreground/70">{emotion.label}</span>
        </div>

        <div className="text-right mb-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
            {formatDistanceToNow(new Date(post.created_at), { locale: es })}
          </span>
        </div>

        {/* Content */}
        <p className="text-[17px] leading-relaxed mb-6 font-medium text-foreground/90 whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-4">
          <div className="flex gap-4">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleSupport}
              className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${
                hasSupported ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'
              }`}
            >
              <Heart size={18} className={hasSupported ? 'fill-rose-500' : ''} />
              <span>{supportCount > 0 ? supportCount : ''}</span>
            </motion.button>
            
            <button
              onClick={() => onReplyClick(post)}
              className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle size={18} />
              <span>{post.reply_count > 0 ? post.reply_count : ''} Responder</span>
            </button>
          </div>

          <button
            onClick={handleReport}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-foreground p-1"
            title="Reportar"
          >
            <Flag size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
