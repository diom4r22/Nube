"use client";

import { useMemo } from "react";
import { CloudEntityState } from "@/lib/physics/useFloatingClouds";
import { EmotionCategory, cloudThemes } from "@/lib/cloud/cloudThemes";
import { useAppStore } from "@/store/app-store";

interface EmotionCompassProps {
  entities: CloudEntityState[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function EmotionCompass({ entities, scrollContainerRef }: EmotionCompassProps) {
  const { theme } = useAppStore();
  const isDark = theme === 'dark';

  const directions = useMemo(() => {
    const container = scrollContainerRef.current;
    if (!container || entities.length === 0) return [];

    const viewCenterX = container.scrollLeft + container.clientWidth / 2;
    const viewCenterY = container.scrollTop + container.clientHeight / 2;

    // Agrupar nubes por emoción y calcular centroide de cada grupo
    const groups: Record<string, { x: number; y: number; count: number }> = {};
    
    entities.forEach(e => {
      const cat = e.category || 'pensamiento';
      if (!groups[cat]) groups[cat] = { x: 0, y: 0, count: 0 };
      groups[cat].x += e.x;
      groups[cat].y += e.y;
      groups[cat].count++;
    });

    return Object.entries(groups).map(([cat, g]) => {
      const cx = g.x / g.count;
      const cy = g.y / g.count;
      const dx = cx - viewCenterX;
      const dy = cy - viewCenterY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const theme = cloudThemes[cat as EmotionCategory] || cloudThemes.pensamiento;
      
      return { cat, angle, dist, count: g.count, icon: theme.icon, theme };
    }).filter(d => d.dist > 200); // Solo mostrar si el cluster está lejos
  }, [entities, scrollContainerRef]);

  if (directions.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 z-[70] pointer-events-none">
      <div className={`relative w-24 h-24 rounded-full border backdrop-blur-md ${
        isDark ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white/60 border-white/50'
      }`}>
        {/* Centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-sky-400' : 'bg-sky-500'}`} />
        </div>
        
        {/* Flechas de dirección */}
        {directions.map(d => (
          <div
            key={d.cat}
            className="absolute top-1/2 left-1/2 pointer-events-auto"
            style={{
              transform: `translate(-50%, -50%) rotate(${d.angle}deg) translateX(32px)`,
            }}
            title={`${d.cat} (${d.count} nubes)`}
          >
            <span 
              className="text-sm cursor-default block"
              style={{ transform: `rotate(${-d.angle}deg)` }}
            >
              {d.icon}
            </span>
          </div>
        ))}
        
        <div className={`absolute -bottom-5 left-0 right-0 text-[8px] font-bold tracking-widest uppercase text-center ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}>
          Brújula
        </div>
      </div>
    </div>
  );
}
