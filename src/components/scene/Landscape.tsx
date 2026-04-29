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
    windowOn: '#fbbf24',
    windowOff: isDark ? '#0a0a1a' : '#bfdbfe',
  }), [isDark]);

  return (
    <div className="absolute bottom-0 left-0 w-full pointer-events-none" style={{ height: '60vh' }}>
      {/* 
        Aumentamos el viewBox a 6000 para cubrir los 300vw del mapa gigante. 
        Esto evita que la ciudad se vea "a la mitad" o cortada en pantallas grandes.
      */}
      <svg viewBox="0 0 6000 550" preserveAspectRatio="xMidYMax slice" className="absolute bottom-0 left-0 w-full h-full">
        <defs>
          <pattern id="windowPattern" x="0" y="0" width="20" height="25" patternUnits="userSpaceOnUse">
             <rect x="5" y="5" width="10" height="15" rx="1" fill={isDark ? c.windowOn : c.windowOff} opacity={isDark ? 0.7 : 0.2} />
          </pattern>
          
          <linearGradient id="cityFog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? "rgba(15,23,42,0)" : "rgba(255,255,255,0)"} />
            <stop offset="100%" stopColor={isDark ? "rgba(15,23,42,0.4)" : "rgba(255,255,255,0.3)"} />
          </linearGradient>
        </defs>

        <rect x="0" y="100" width="6000" height="450" fill="url(#cityFog)" />

        {/* ═══ CAPA TRASERA (Siluetas Lejanas) ═══ */}
        <path d="M0,550 L0,300 L200,300 L200,150 L400,150 L400,300 L600,300 L600,100 L800,100 L800,300 L1000,300 L1000,200 L1200,200 L1200,300 L1400,300 L1400,50 L1600,50 L1600,300 L1800,300 L1800,250 L2000,250 L2000,300 L2200,300 L2200,100 L2400,100 L2400,300 L2600,300 L2600,150 L2800,150 L2800,300 L3000,300 L3000,50 L3200,50 L3200,300 L3400,300 L3400,200 L3600,200 L3600,300 L3800,300 L3800,100 L4000,100 L4000,300 L4200,300 L4200,150 L4400,150 L4400,300 L4600,300 L4600,100 L4800,100 L4800,300 L5000,300 L5000,200 L5200,200 L5200,300 L5400,300 L5400,50 L5600,50 L5600,300 L5800,300 L5800,200 L6000,200 L6000,550 Z" fill={c.skylineBackest} opacity={0.3} />

        {/* ═══ CAPA MEDIA ═══ */}
        <path d="M0,550 L0,350 L150,350 L150,250 L300,250 L300,350 L450,350 L450,200 L600,200 L600,350 L750,350 L750,280 L900,280 L900,350 L1050,350 L1050,150 L1200,150 L1200,350 L1350,350 L1350,250 L1500,250 L1500,350 L1650,350 L1650,180 L1800,180 L1800,350 L1950,350 L1950,300 L2100,300 L2100,350 L2250,350 L2250,150 L2400,150 L2400,350 L2550,350 L2550,250 L2700,250 L2700,350 L2850,350 L2850,200 L3000,200 L3000,350 L3150,350 L3150,280 L3300,280 L3300,350 L3450,350 L3450,150 L3600,150 L3600,350 L3750,350 L3750,250 L3900,250 L3900,350 L4050,350 L4050,180 L4200,180 L4200,350 L4350,350 L4350,300 L4500,300 L4500,350 L4650,350 L4650,150 L4800,150 L4800,350 L4950,350 L4950,250 L5100,250 L5100,350 L5250,350 L5250,200 L5400,200 L5400,350 L5550,350 L5550,280 L5700,280 L5700,350 L5850,350 L5850,150 L6000,150 L6000,550 Z" fill={c.skylineMid} opacity={0.5} />

        {/* ═══ CAPA FRONTAL (Edificios Detallados con Ventanas) ═══ */}
        {Array.from({length: 30}).map((_, i) => {
          const x = i * 200 + 50;
          const h = 150 + Math.random() * 250;
          const w = 80 + Math.random() * 40;
          const y = 470 - h;
          return (
            <g key={`b-front-${i}`}>
              <rect x={x} y={y} width={w} height={h} fill={c.skylineFront} />
              <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} fill="url(#windowPattern)" />
            </g>
          )
        })}

        {/* ═══ SUELO Y CARRETERA ═══ */}
        <rect x="0" y="470" width="6000" height="10" fill={c.sidewalk} />
        <rect x="0" y="490" width="6000" height="60" fill={c.grass} />
        <rect x="0" y="500" width="6000" height="50" fill={c.grassDark} />
        <rect x="0" y="480" width="6000" height="14" fill={c.road} />
        <line x1="0" y1="487" x2="6000" y2="487" stroke={c.roadLine} strokeWidth="2" strokeDasharray="20,15" />
      </svg>
    </div>
  );
}
