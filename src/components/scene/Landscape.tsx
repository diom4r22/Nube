"use client";
import { useAppStore } from "@/store/app-store";
import { useMemo } from "react";

export function Landscape() {
  const { theme } = useAppStore();
  const isDark = theme === 'dark';

  const c = useMemo(() => ({
    skylineBackest: isDark ? '#080a14' : '#c0c8d8',
    skylineBack: isDark ? '#0c1220' : '#b0b8c8',
    skylineMid: isDark ? '#141c2e' : '#8995ab',
    skylineFront: isDark ? '#1e293b' : '#64748b',
    grass: isDark ? '#0d1a0d' : '#4ade80',
    grassDark: isDark ? '#081208' : '#22c55e',
    road: isDark ? '#2a2520' : '#78716c',
    roadLine: isDark ? '#5a5530' : '#fbbf24',
    sidewalk: isDark ? '#1e1e1e' : '#d6d3d1',
    windowOn: '#fbbf24',
    windowOff: isDark ? '#0a0a1a' : '#bfdbfe',
  }), [isDark]);

  return (
    <div className="absolute bottom-0 left-0 w-full pointer-events-none" style={{ height: '55vh' }}>
      <svg viewBox="0 0 2100 550" preserveAspectRatio="xMidYMax slice" className="absolute bottom-0 left-0 w-full h-full">
        <defs>
          <style>{`
            @keyframes driveRight { from { transform: translateX(-100px); } to { transform: translateX(2200px); } }
            @keyframes driveLeft  { from { transform: translateX(2200px); } to { transform: translateX(-100px); } }
          `}</style>
          
          {/* PATRÓN DE VENTANAS: Esto es 100 veces más rápido que dibujar rectángulos individuales */}
          <pattern id="windowPattern" x="0" y="0" width="20" height="25" patternUnits="userSpaceOnUse">
             <rect x="5" y="5" width="10" height="15" rx="1" fill={isDark ? c.windowOn : c.windowOff} opacity={isDark ? 0.8 : 0.3} />
          </pattern>

          <linearGradient id="fogGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? "rgba(15,23,42,0)" : "rgba(255,255,255,0)"} />
            <stop offset="100%" stopColor={isDark ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.6)"} />
          </linearGradient>
        </defs>

        {/* Niebla de profundidad */}
        <rect x="0" y="200" width="2100" height="300" fill="url(#fogGradient)" />

        {/* CAPA 0, 1, 2 (Siluetas optimizadas) */}
        <path d="M0,550 L0,450 L100,450 L100,300 L200,300 L200,450 L300,450 L300,200 L400,200 L400,450 L500,450 L500,250 L600,250 L600,450 L700,450 L700,150 L800,150 L800,450 L900,450 L900,300 L1000,300 L1000,450 L1100,450 L1100,200 L1200,200 L1200,450 L1300,450 L1300,350 L1400,350 L1400,450 L1500,450 L1500,180 L1600,180 L1600,450 L1700,450 L1700,250 L1800,250 L1800,450 L1900,450 L1900,300 L2000,300 L2000,450 L2100,450 L2100,550 Z" fill={c.skylineBackest} opacity={0.3} />
        <path d="M0,550 L0,400 L50,400 L50,250 L100,250 L100,380 L150,380 L150,180 L200,180 L200,350 L260,350 L260,420 L310,420 L310,300 L360,300 L360,200 L410,200 L410,370 L470,370 L470,280 L520,280 L520,400 L570,400 L570,160 L620,160 L620,350 L680,350 L680,420 L730,420 L730,250 L780,250 L780,380 L840,380 L840,190 L890,190 L890,350 L940,350 L940,420 L990,420 L990,280 L1040,280 L1040,170 L1090,170 L1090,350 L1140,350 L1140,400 L1200,400 L1200,220 L1250,220 L1250,350 L1300,350 L1300,420 L1360,420 L1360,280 L1410,280 L1410,180 L1460,180 L1460,350 L1510,350 L1510,400 L1560,400 L1560,250 L1610,250 L1610,380 L1660,380 L1660,200 L1710,200 L1710,350 L1770,350 L1770,420 L1820,420 L1820,280 L1870,280 L1870,170 L1920,170 L1920,380 L1970,380 L1970,300 L2020,300 L2020,400 L2100,400 L2100,550 Z" fill={c.skylineBack} opacity={0.4} />
        <path d="M0,550 L0,420 L70,420 L70,280 L130,280 L130,400 L190,400 L190,200 L250,200 L250,360 L320,360 L320,420 L380,420 L380,300 L440,300 L440,180 L500,180 L500,380 L560,380 L560,250 L630,250 L630,420 L700,420 L700,320 L760,320 L760,190 L820,190 L820,400 L880,400 L880,280 L940,280 L940,420 L1010,420 L1010,220 L1070,220 L1070,360 L1140,360 L1140,420 L1200,420 L1200,260 L1260,260 L1260,180 L1320,180 L1320,380 L1390,380 L1390,300 L1450,300 L1450,420 L1520,420 L1520,240 L1580,240 L1580,380 L1640,380 L1640,200 L1700,200 L1700,360 L1760,360 L1760,420 L1830,420 L1830,280 L1890,280 L1890,180 L1950,180 L1950,380 L2020,380 L2020,300 L2100,300 L2100,550 Z" fill={c.skylineMid} opacity={0.65} />

        {/* CAPA FRONT (Edificios con textura de ventanas) */}
        {[
          {x:0, y:350, w:100, h:120}, {x:120, y:150, w:80, h:320}, {x:220, y:320, w:110, h:150},
          {x:350, y:100, w:90, h:370}, {x:460, y:280, w:100, h:190}, {x:580, y:180, w:70, h:290},
          {x:670, y:340, w:90, h:130}, {x:780, y:120, w:85, h:350}, {x:880, y:300, w:100, h:170},
          {x:1000, y:80, w:80, h:390}, {x:1100, y:320, w:110, h:150}, {x:1230, y:160, w:75, h:310},
          {x:1320, y:350, w:90, h:120}, {x:1430, y:110, w:85, h:360}, {x:1530, y:290, w:100, h:180},
          {x:1650, y:140, w:80, h:330}, {x:1750, y:340, w:95, h:130}, {x:1860, y:100, w:90, h:370},
          {x:1970, y:310, w:120, h:160}
        ].map((b, i) => (
          <g key={`eb-${i}`}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={c.skylineFront} />
            <rect x={b.x + 5} y={b.y + 5} width={b.w - 10} height={b.h - 10} fill="url(#windowPattern)" />
          </g>
        ))}

        <rect x="0" y="470" width="2100" height="8" fill={c.sidewalk} />
        <rect x="0" y="490" width="2100" height="60" fill={c.grass} />
        <rect x="0" y="500" width="2100" height="50" fill={c.grassDark} />
        <rect x="0" y="478" width="2100" height="14" fill={c.road} />
        <line x1="0" y1="485" x2="2100" y2="485" stroke={c.roadLine} strokeWidth="2" strokeDasharray="20,14" />
      </svg>
    </div>
  );
}
