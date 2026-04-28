"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cloud, Heart, MessageCircle, Calendar } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ProfileModalProps {
  onClose: () => void;
}

export function ProfileModal({ onClose }: ProfileModalProps) {
  const { currentUser } = useAppStore();
  const [stats, setStats] = useState({ clouds: 0, totalLikes: 0, totalReplies: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    async function fetchStats() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('support_count, reply_count')
          .eq('author_id', currentUser!.id)
          .eq('is_hidden', false);

        if (data) {
          setStats({
            clouds: data.length,
            totalLikes: data.reduce((sum, p) => sum + (p.support_count || 0), 0),
            totalReplies: data.reduce((sum, p) => sum + (p.reply_count || 0), 0),
          });
        }
      } catch (e) {
        console.error('Error fetching profile stats:', e);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-xs bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl border border-white/20 dark:border-slate-700/50"
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Avatar */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-sky-500/30">
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">@{currentUser.username}</h3>
          <p className="text-xs text-slate-400 mt-1">
            {currentUser.isAdmin ? '👑 Administrador' : '☁️ Susurrador'}
          </p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="text-center text-sm text-slate-400 py-4">Cargando...</div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-3 text-center">
              <Cloud className="mx-auto text-sky-500 mb-1" size={18} />
              <div className="text-lg font-black text-slate-800 dark:text-slate-100">{stats.clouds}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Nubes</div>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-3 text-center">
              <Heart className="mx-auto text-rose-500 mb-1" size={18} />
              <div className="text-lg font-black text-slate-800 dark:text-slate-100">{stats.totalLikes}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Likes</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
              <MessageCircle className="mx-auto text-amber-500 mb-1" size={18} />
              <div className="text-lg font-black text-slate-800 dark:text-slate-100">{stats.totalReplies}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Respuestas</div>
            </div>
          </div>
        )}

        <p className="text-[10px] text-center text-slate-400 mt-4">
          Tu identidad es completamente anónima. 🔒
        </p>
      </motion.div>
    </div>
  );
}
