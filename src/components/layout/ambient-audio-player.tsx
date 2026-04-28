"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Play, Pause, Volume2, VolumeX, CloudRain, Music, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AUDIO_TRACKS = {
  none: "",
  rain: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Rain_on_the_roof.ogg",
  piano: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Gymnop%C3%A9die_No._1.ogg",
  lofi: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Crickets_at_night.ogg",
};

export function AmbientAudioPlayer() {
  const { audioTrack, setAudioTrack, isPlaying, setIsPlaying, volume, setVolume } = useAppStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && audioTrack !== "none") {
        audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
      } else {
        audioRef.current.pause();
      }
      audioRef.current.volume = volume;
    }
  }, [isPlaying, audioTrack, volume]);

  if (!mounted) return null;

  return (
    <div className="relative z-50">
      {audioTrack !== "none" && (
        <audio
          ref={audioRef}
          src={AUDIO_TRACKS[audioTrack]}
          loop
          preload="auto"
        />
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
        title="Música ambiental"
      >
        {isPlaying && audioTrack !== "none" ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 right-0 w-64 glass-panel rounded-2xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Ambiente sonoro</span>
              <button
                onClick={() => {
                  if (audioTrack === "none" && !isPlaying) {
                    setAudioTrack("rain");
                  }
                  setIsPlaying(!isPlaying);
                }}
                className="p-2 rounded-full bg-accent/50 text-accent-foreground hover:bg-accent transition-colors"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <TrackOption id="rain" label="Lluvia suave" icon={<CloudRain size={14} />} current={audioTrack} onSelect={setAudioTrack} />
              <TrackOption id="piano" label="Piano ambiental" icon={<Music size={14} />} current={audioTrack} onSelect={setAudioTrack} />
              <TrackOption id="lofi" label="Noche lo-fi" icon={<Moon size={14} />} current={audioTrack} onSelect={setAudioTrack} />
            </div>

            <div className="flex items-center gap-2">
              <VolumeX size={14} className="text-muted-foreground" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-accent-foreground"
              />
              <Volume2 size={14} className="text-muted-foreground" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrackOption({ 
  id, 
  label, 
  icon, 
  current, 
  onSelect 
}: { 
  id: 'rain' | 'piano' | 'lofi'; 
  label: string; 
  icon: React.ReactNode; 
  current: string; 
  onSelect: (id: any) => void 
}) {
  const isActive = current === id;
  return (
    <button
      onClick={() => onSelect(id)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
        isActive ? 'bg-accent/30 text-accent-foreground font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
