"use client";

import { useEffect, useRef, useState } from "react";
import { CloudEntityState } from "@/lib/physics/useFloatingClouds";
import { useAppStore } from "@/store/app-store";

interface MinimapProps {
  posts: CloudEntityState[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
}

export function Minimap({ posts, scrollContainerRef, zoom }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useAppStore();
  const isDark = theme === 'dark';
  const [viewRect, setViewRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const animRef = useRef<number>(0);

  // Actualizar viewRect con scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const update = () => {
      const totalW = container.scrollWidth || 1;
      const totalH = container.scrollHeight || 1;
      setViewRect({
        x: container.scrollLeft / totalW,
        y: container.scrollTop / totalH,
        w: (container.clientWidth / zoom) / totalW,
        h: (container.clientHeight / zoom) / totalH,
      });
    };

    container.addEventListener('scroll', update);
    update();
    
    return () => container.removeEventListener('scroll', update);
  }, [scrollContainerRef, zoom]);

  // Redibujar canvas con requestAnimationFrame para capturar posiciones de entidades en movimiento
  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const container = scrollContainerRef.current;
      if (!container) return;

      const w = canvas.width;
      const h = canvas.height;
      const totalW = container.scrollWidth || 1;
      const totalH = container.scrollHeight || 1;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(186, 230, 253, 0.9)';
      ctx.fillRect(0, 0, w, h);

      // Suelo (franja inferior)
      ctx.fillStyle = isDark ? '#0d1a0d' : '#86efac';
      ctx.fillRect(0, h * 0.8, w, h * 0.2);

      // Draw cloud dots usando las posiciones actuales del DOM
      posts.forEach(entity => {
        const mx = (entity.x / totalW) * w;
        const my = (entity.y / totalH) * h;
        const likes = entity.support_count || 0;
        const size = Math.min(2 + likes * 0.8, 6);
        
        ctx.beginPath();
        ctx.arc(mx, my, size, 0, Math.PI * 2);
        ctx.fillStyle = likes > 0 
          ? '#fbbf24'
          : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.9)');
        ctx.fill();

        // Glow para las populares
        if (likes > 2) {
          ctx.beginPath();
          ctx.arc(mx, my, size + 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
          ctx.fill();
        }
      });

      // Draw viewport rectangle
      ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 2]);
      ctx.strokeRect(
        viewRect.x * w,
        viewRect.y * h,
        viewRect.w * w,
        viewRect.h * h
      );
      ctx.setLineDash([]);

      // Label "Tú estás aquí"
      const vx = viewRect.x * w + (viewRect.w * w) / 2;
      const vy = viewRect.y * h + (viewRect.h * h) / 2;
      ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.beginPath();
      ctx.arc(vx, vy, 3, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [posts, viewRect, isDark, scrollContainerRef]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const container = scrollContainerRef.current;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    container.scrollTo({
      left: clickX * container.scrollWidth - container.clientWidth / 2,
      top: clickY * container.scrollHeight - container.clientHeight / 2,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed bottom-24 right-4 z-[70] pointer-events-auto">
      <div className={`rounded-xl overflow-hidden border shadow-xl backdrop-blur-sm ${
        isDark ? 'border-slate-700/50 shadow-black/30' : 'border-white/40 shadow-black/10'
      }`}>
        <canvas
          ref={canvasRef}
          width={180}
          height={110}
          onClick={handleClick}
          className="cursor-crosshair block"
          style={{ width: '180px', height: '110px' }}
        />
        <div className={`text-[9px] font-bold tracking-widest uppercase text-center py-1 ${
          isDark ? 'bg-slate-900/80 text-slate-400' : 'bg-white/80 text-slate-500'
        }`}>
          🗺️ Mapa
        </div>
      </div>
    </div>
  );
}
