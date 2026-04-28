"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { X, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export interface Post {
  id: string;
  content: string;
  type: string;
  created_at: string;
  support_count: number;
  reply_count: number;
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
}

export function RepliesModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    fetchReplies();
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('replies')
        .select('*')
        .eq('post_id', post.id)
        .eq('is_hidden', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('replies').insert([
        { post_id: post.id, content: newReply.trim() }
      ]);

      if (error) throw error;
      
      setNewReply("");
      fetchReplies(); // Reload replies
      
      // Note: Trigger in DB updates reply_count on post
    } catch (error) {
      console.error('Error creating reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-surface backdrop-blur-xl border border-border/50 rounded-3xl shadow-float overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
          <h2 className="text-lg font-medium">Respuestas</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Original Post context */}
        <div className="p-4 sm:p-6 bg-muted/30 border-b border-border/50">
          <p className="text-foreground/80 italic line-clamp-3">"{post.content}"</p>
        </div>

        {/* Replies List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Sparkles className="animate-spin text-muted-foreground opacity-50" />
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aún no hay respuestas. Sé el primero en dejar un pensamiento.
            </div>
          ) : (
            replies.map((reply) => (
              <div key={reply.id} className="bg-background/50 rounded-2xl p-4 shadow-sm border border-border/20">
                <p className="text-base mb-3 whitespace-pre-wrap">{reply.content}</p>
                <div className="text-xs text-muted-foreground/70 text-right">
                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: es })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply Input */}
        <div className="p-4 sm:p-6 border-t border-border/50 bg-background/50">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Escribe una respuesta amable..."
              className="flex-1 bg-muted/50 border border-border/50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent-foreground/30 transition-all"
              maxLength={300}
            />
            <button
              type="submit"
              disabled={!newReply.trim() || isSubmitting}
              className="bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed w-12 rounded-2xl flex items-center justify-center transition-all flex-shrink-0"
            >
              {isSubmitting ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Sparkles size={16} />
                </motion.div>
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
