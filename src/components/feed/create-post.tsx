"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { EmotionType, EMOTIONS_DATA } from "@/lib/emotions";
import { useAppStore } from "@/store/app-store";

const POST_TYPES: EmotionType[] = ['pensamiento', 'pregunta', 'confesion', 'idea', 'amor', 'tristeza', 'alegria'];

export function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<EmotionType>('pensamiento');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { triggerHappySun, theme } = useAppStore();
  const isDark = theme === 'dark';

  const activeEmotion = EMOTIONS_DATA[type];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({ content: content.trim(), type })
        .select();

      if (error) {
        console.error('Supabase error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log('Post created successfully:', data);
      triggerHappySun();
      setContent("");
      setIsExpanded(false);
      onPostCreated();
    } catch (error: any) {
      console.error('Error creating post:', error?.message || error?.code || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative w-full max-w-xl mx-auto mb-16 z-10"
      style={{ filter: `drop-shadow(0 20px 30px rgba(0,0,0,${isDark ? '0.3' : '0.08'}))` }}
    >
      <div className={`relative backdrop-blur-xl p-6 md:p-8 rounded-[50px] rounded-tl-[70px] rounded-br-[70px] border transition-colors duration-500 ${
        isDark 
          ? 'bg-slate-800/80 border-white/10 text-slate-100' 
          : `bg-gradient-to-br ${activeEmotion.color} border-white/50 text-slate-800`
      }`}>
        
        {/* Decoraciones orgánicas */}
        <div className={`absolute -top-6 right-16 w-20 h-20 rounded-full -z-10 transition-colors duration-500 ${isDark ? 'bg-slate-800/60' : `bg-gradient-to-br ${activeEmotion.color}`}`} />
        <div className={`absolute -bottom-5 left-12 w-16 h-16 rounded-full -z-10 transition-colors duration-500 ${isDark ? 'bg-slate-800/60' : `bg-gradient-to-br ${activeEmotion.color}`}`} />
        <div className={`absolute top-10 -left-6 w-14 h-14 rounded-full -z-10 transition-colors duration-500 ${isDark ? 'bg-slate-800/60' : `bg-gradient-to-br ${activeEmotion.color}`}`} />

        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="Deja ir un pensamiento hacia el cielo..."
              className={`w-full bg-transparent resize-none outline-none text-xl font-medium min-h-[70px] transition-all ${
                isDark ? 'text-slate-100 placeholder:text-slate-400/60' : 'text-slate-800 placeholder:text-slate-500/40'
              }`}
              style={{ height: isExpanded ? '140px' : '70px' }}
              maxLength={500}
            />
            <div className={`absolute bottom-2 right-2 text-xs font-bold ${isDark ? 'text-slate-400/40' : 'text-slate-600/30'}`}>
              {content.length}/500
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-6 pt-6 border-t flex flex-col gap-6 overflow-hidden ${isDark ? 'border-white/10' : 'border-black/5'}`}
              >
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider mb-3 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    ¿Qué tipo de nube es?
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {POST_TYPES.map((t) => {
                      const emo = EMOTIONS_DATA[t];
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setType(t)}
                          className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                            type === t 
                              ? isDark ? 'bg-white/15 shadow-sm border border-white/20 scale-105 text-white' : 'bg-white/80 shadow-sm border border-white/50 scale-105 text-slate-800'
                              : isDark ? 'bg-white/5 text-slate-300/70 hover:bg-white/10' : 'bg-black/5 text-slate-600/70 hover:bg-black/10'
                          }`}
                        >
                          <span>{emo.icon}</span>
                          <span>{emo.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false);
                      setContent("");
                    }}
                    className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!content.trim() || isSubmitting}
                    className={`hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                      isDark ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'
                    }`}
                  >
                    {isSubmitting ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <Sparkles size={18} />
                      </motion.div>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Soltar Nube</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </motion.div>
  );
}
