"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, User, Cloud } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/app-store";

interface LoginModalProps {
  onClose?: () => void;
  preventClose?: boolean;
}

export function LoginModal({ onClose, preventClose = false }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim() || !password.trim()) {
      setError("Usuario y contraseña son obligatorios.");
      return;
    }

    if (mode === 'register' && !acceptedPolicy) {
      setError("Debes aceptar la política de datos para registrarte.");
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const { data, error: dbError } = await supabase
          .from('users')
          .insert([{ username: username.trim(), password, is_admin: false }])
          .select()
          .single();

        if (dbError) {
          console.error('Register error:', dbError);
          if (dbError.code === '23505') {
            setError("Ese nombre de usuario ya existe. Prueba otro.");
          } else if (dbError.code === '42P01') {
            setError("Error: La tabla de usuarios no existe. Ejecuta el script SQL en Supabase.");
          } else {
            setError(`Error al crear la cuenta: ${dbError.message}`);
          }
          setLoading(false);
          return;
        }

        if (!data) {
          setError("No se recibieron datos al crear la cuenta.");
          setLoading(false);
          return;
        }

        login({ id: data.id, username: data.username, isAdmin: data.is_admin });
      } else {
        const { data, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('username', username.trim())
          .eq('password', password)
          .single();

        if (dbError) {
          console.error('Login error:', dbError);
          if (dbError.code === '42P01') {
            setError("Error: La tabla de usuarios no existe. Ejecuta el script SQL en Supabase.");
          } else if (dbError.code === 'PGRST116') {
            setError("Usuario o contraseña incorrectos.");
          } else {
            setError(`Error: ${dbError.message}`);
          }
          setLoading(false);
          return;
        }
        
        if (!data) {
          setError("Usuario o contraseña incorrectos.");
          setLoading(false);
          return;
        }

        login({ id: data.id, username: data.username, isAdmin: data.is_admin });
      }

      if (onClose) onClose();
    } catch (err: any) {
      console.error('Network error:', err);
      setError(`Error de red: ${err?.message || 'Verifica tu conexión.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={preventClose ? undefined : onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border border-white/20 dark:border-slate-700/50"
      >
        {!preventClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        )}

        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/50 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Cloud className="text-sky-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">CloudWhisper</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {mode === 'login' ? 'Bienvenido de vuelta al cielo.' : 'Únete de forma anónima.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(""); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(""); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'register' ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Crear Cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 text-slate-800 dark:text-slate-200 placeholder-slate-400"
                required
                maxLength={20}
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 text-slate-800 dark:text-slate-200 placeholder-slate-400"
                required
                minLength={6}
              />
            </div>
          </div>

          <AnimatePresence>
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 pt-2"
              >
                <input
                  type="checkbox"
                  id="policy"
                  checked={acceptedPolicy}
                  onChange={(e) => setAcceptedPolicy(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="policy" className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                  Acepto la <a href="#" className="text-sky-500 hover:underline">política de tratamiento de datos</a> y reconozco que mis interacciones serán almacenadas de forma anónima.
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-red-500 text-xs font-semibold text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : mode === 'login' ? 'Entrar al Cielo' : 'Unirse a las Nubes'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
