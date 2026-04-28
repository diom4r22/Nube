"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Flag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/app-store";

interface ReportModalProps {
  targetId: string;
  targetType: 'post' | 'reply';
  onClose: () => void;
}

const REASONS = [
  "Contenido ofensivo o de odio",
  "Spam o publicidad",
  "Acoso o intimidación",
  "Contenido sexual inapropiado",
  "Información falsa o engañosa",
  "Otro motivo",
];

export function ReportModal({ targetId, targetType, onClose }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAppStore();

  const handleSubmit = async () => {
    const reason = selectedReason === "Otro motivo" ? customReason : selectedReason;
    if (!reason.trim()) return;
    
    setLoading(true);
    try {
      await supabase.from('reports').insert({
        target_type: targetType,
        target_id: targetId,
        reason,
        reporter_id: currentUser?.id || null,
      });
      setSent(true);
    } catch (e) {
      console.error('Report error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 dark:border-slate-700/50"
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <X size={18} />
        </button>

        {sent ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Reporte Enviado</h3>
            <p className="text-sm text-slate-500 mt-2">Gracias. Un administrador revisará este contenido.</p>
            <button onClick={onClose} className="mt-4 px-6 py-2 bg-sky-500 text-white rounded-xl font-bold text-sm">Cerrar</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Flag className="text-rose-500" size={20} />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Reportar Contenido</h3>
            </div>
            
            <div className="space-y-2 mb-4">
              {REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                    selectedReason === reason
                      ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {selectedReason === "Otro motivo" && (
              <textarea
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="Describe el motivo..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 resize-none mb-4"
                rows={3}
              />
            )}

            <button
              onClick={handleSubmit}
              disabled={!selectedReason || loading || (selectedReason === "Otro motivo" && !customReason.trim())}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar Reporte'}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
