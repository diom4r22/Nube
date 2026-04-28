"use client";

import { useAppStore } from "@/store/app-store";
import { Cloud, Sun, Moon } from "lucide-react";
import { AmbientAudioPlayer } from "./ambient-audio-player";

import { useEffect, useState } from "react";
import { LoginModal } from "../admin/LoginModal";
import { ProfileModal } from "../ui/ProfileModal";
import { Shield, Sparkles } from "lucide-react";

export function Header() {
  const { theme, toggleTheme, currentUser, logout, triggerPurge } = useAppStore();
  const isDark = theme === 'dark';
  const [timeLeft, setTimeLeft] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Calcular tiempo hasta la próxima purga (Medianoche UTC)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const nextPurge = new Date(now);
      nextPurge.setUTCHours(24, 0, 0, 0); // Próxima medianoche
      
      const diff = nextPurge.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <header className={`w-full backdrop-blur-md border-b sticky top-0 z-50 ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white/40 border-white/20'}`}>
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
              Cloud<span className={`${isDark ? 'text-indigo-400' : 'text-sky-500'}`}>Whisper</span>
            </h1>

            {/* Contador de Purga */}
            <div className="hidden sm:flex flex-col ml-2 border-l border-white/20 pl-4">
              <span className="text-[8px] uppercase tracking-[0.2em] font-bold opacity-50">Próxima Purga</span>
              <span className="text-xs font-mono font-bold text-orange-500 animate-pulse">{timeLeft}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser?.isAdmin && (
              <button
                onClick={triggerPurge}
                className="mr-2 flex items-center gap-2 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-rose-500/20"
                title="Forzar Purga de Nubes"
              >
                <Sparkles size={14} /> Purgar
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-3 bg-white/20 dark:bg-black/20 rounded-full px-3 py-1">
                <button
                  onClick={() => setShowProfile(true)}
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-sky-500 transition-colors"
                >
                  @{currentUser.username}
                </button>
                <button
                  onClick={logout}
                  className="text-[10px] text-slate-500 hover:text-rose-500 font-bold uppercase tracking-wider"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className={`p-2 rounded-full transition-colors text-sky-500 hover:bg-sky-500/10`}
                title="Iniciar Sesión"
              >
                <Shield size={20} />
              </button>
            )}

            <AmbientAudioPlayer />
            
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-slate-200' : 'hover:bg-black/5 text-slate-500 hover:text-slate-800'}`}
              title="Alternar tema"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>
      </header>
      
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
