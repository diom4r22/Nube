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
    treeTrunk: isDark ? '#2a1a0a' : '#78350f',
    treeLeaf1: isDark ? '#0a2a0a' : '#15803d',
    treeLeaf2: isDark ? '#0d1f0d' : '#22c55e',
    lampPost: isDark ? '#3a3a3a' : '#525252',
    lampGlow: isDark ? 'rgba(251,191,36,0.7)' : 'rgba(251,191,36,0)',
    fog: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.3)',
  }), [isDark]);

  const win = (bx: number, by: number, bw: number, bh: number, cols: number, rows: number) => {
    const result = [];
    const gapX = (bw - 8) / cols;
    const gapY = (bh - 8) / rows;
    for (let r = 0; r < rows; r++) {
      for (let cl = 0; cl < cols; cl++) {
        const wx = bx + 5 + cl * gapX;
        const wy = by + 5 + r * gapY;
        const lit = isDark && ((r * 7 + cl * 3 + Math.floor(bx)) % 3 !== 0);
        result.push(
          <rect key={`${bx}-${r}-${cl}`} x={wx} y={wy} width={gapX * 0.6} height={gapY * 0.55} rx={1}
            fill={lit ? c.windowOn : c.windowOff} style={{ transition: 'fill 1s' }} />
        );
      }
    }
    return result;
  };

  return (
    <div className="absolute bottom-0 left-0 w-full pointer-events-none" style={{ height: '55vh' }}>
      <svg viewBox="0 0 2100 550" preserveAspectRatio="xMidYMax slice" className="absolute bottom-0 left-0 w-full h-full">
        <defs>
          <style>{`
            @keyframes driveRight { from { transform: translateX(-100px); } to { transform: translateX(2200px); } }
            @keyframes driveLeft  { from { transform: translateX(2200px); } to { transform: translateX(-100px); } }
          `}</style>
        </defs>

        {/* Niebla lejana */}
        <rect x={0} y={300} width={2100} height={200} fill={`url(#fogGradient-${isDark?'dark':'light'})`} />
        <defs>
          <linearGradient id="fogGradient-light" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
          </linearGradient>
          <linearGradient id="fogGradient-dark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(15,23,42,0)" />
            <stop offset="100%" stopColor="rgba(15,23,42,0.5)" />
          </linearGradient>
        </defs>

        {/* ═══ CAPA 0: Skyline muy lejano ═══ */}
        <path d={`
          M0,550 L0,450 L100,450 L100,300 L200,300 L200,450 L300,450 L300,200 L400,200 L400,450 L500,450 
          L500,250 L600,250 L600,450 L700,450 L700,150 L800,150 L800,450 L900,450 L900,300 L1000,300 
          L1000,450 L1100,450 L1100,200 L1200,200 L1200,450 L1300,450 L1300,350 L1400,350 L1400,450 
          L1500,450 L1500,180 L1600,180 L1600,450 L1700,450 L1700,250 L1800,250 L1800,450 L1900,450 
          L1900,300 L2000,300 L2000,450 L2100,450 L2100,550 Z
        `} fill={c.skylineBackest} opacity={0.3} />

        {/* ═══ CAPA 1: Skyline lejano ═══ */}
        <path d={`
          M0,550 L0,400 L50,400 L50,250 L100,250 L100,380 L150,380 L150,180
          L200,180 L200,350 L260,350 L260,420 L310,420 L310,300 L360,300
          L360,200 L410,200 L410,370 L470,370 L470,280 L520,280 L520,400
          L570,400 L570,160 L620,160 L620,350 L680,350 L680,420 L730,420
          L730,250 L780,250 L780,380 L840,380 L840,190 L890,190 L890,350
          L940,350 L940,420 L990,420 L990,280 L1040,280 L1040,170 L1090,170
          L1090,350 L1140,350 L1140,400 L1200,400 L1200,220 L1250,220
          L1250,350 L1300,350 L1300,420 L1360,420 L1360,280 L1410,280
          L1410,180 L1460,180 L1460,350 L1510,350 L1510,400 L1560,400
          L1560,250 L1610,250 L1610,380 L1660,380 L1660,200 L1710,200
          L1710,350 L1770,350 L1770,420 L1820,420 L1820,280 L1870,280
          L1870,170 L1920,170 L1920,380 L1970,380 L1970,300 L2020,300
          L2020,400 L2100,400 L2100,550 Z
        `} fill={c.skylineBack} opacity={0.4} />

        {/* ═══ CAPA 2: Edificios medios ═══ */}
        <path d={`
          M0,550 L0,420 L70,420 L70,280 L130,280 L130,400 L190,400
          L190,200 L250,200 L250,360 L320,360 L320,420 L380,420
          L380,300 L440,300 L440,180 L500,180 L500,380 L560,380
          L560,250 L630,250 L630,420 L700,420 L700,320 L760,320
          L760,190 L820,190 L820,400 L880,400 L880,280 L940,280
          L940,420 L1010,420 L1010,220 L1070,220 L1070,360 L1140,360
          L1140,420 L1200,420 L1200,260 L1260,260 L1260,180 L1320,180
          L1320,380 L1390,380 L1390,300 L1450,300 L1450,420 L1520,420
          L1520,240 L1580,240 L1580,380 L1640,380 L1640,200 L1700,200
          L1700,360 L1760,360 L1760,420 L1830,420 L1830,280 L1890,280
          L1890,180 L1950,180 L1950,380 L2020,380 L2020,300 L2100,300
          L2100,550 Z
        `} fill={c.skylineMid} opacity={0.65} />

        {/* ═══ CAPA 3: Edificios frontales ═══ */}
        <rect x={0} y={350} width={100} height={120} fill={c.skylineFront} />
        {win(0, 350, 100, 120, 4, 3)}

        <rect x={120} y={150} width={80} height={320} fill={c.skylineFront} />
        {win(120, 150, 80, 320, 3, 9)}
        <line x1={160} y1={150} x2={160} y2={120} stroke={c.skylineFront} strokeWidth={3} />
        <circle cx={160} cy={117} r={3} fill={isDark ? '#ef4444' : '#94a3b8'} />

        <rect x={220} y={320} width={110} height={150} fill={c.skylineFront} />
        {win(220, 320, 110, 150, 4, 4)}

        <rect x={350} y={100} width={90} height={370} fill={c.skylineFront} />
        {win(350, 100, 90, 370, 3, 11)}
        <line x1={395} y1={100} x2={395} y2={65} stroke={c.skylineFront} strokeWidth={3} />
        <circle cx={395} cy={62} r={3} fill={isDark ? '#ef4444' : '#94a3b8'} />

        <rect x={460} y={280} width={100} height={190} fill={c.skylineFront} />
        {win(460, 280, 100, 190, 4, 5)}

        <rect x={580} y={180} width={70} height={290} fill={c.skylineFront} />
        {win(580, 180, 70, 290, 2, 8)}

        <rect x={670} y={340} width={90} height={130} fill={c.skylineFront} />
        {win(670, 340, 90, 130, 3, 3)}

        <rect x={780} y={120} width={85} height={350} fill={c.skylineFront} />
        {win(780, 120, 85, 350, 3, 10)}
        <line x1={822} y1={120} x2={822} y2={90} stroke={c.skylineFront} strokeWidth={3} />
        <circle cx={822} cy={87} r={3} fill={isDark ? '#ef4444' : '#94a3b8'} />

        <rect x={880} y={300} width={100} height={170} fill={c.skylineFront} />
        {win(880, 300, 100, 170, 4, 4)}

        <rect x={1000} y={80} width={80} height={390} fill={c.skylineFront} />
        {win(1000, 80, 80, 390, 3, 12)}
        <line x1={1040} y1={80} x2={1040} y2={45} stroke={c.skylineFront} strokeWidth={3} />
        <circle cx={1040} cy={42} r={3} fill={isDark ? '#ef4444' : '#94a3b8'} />

        <rect x={1100} y={320} width={110} height={150} fill={c.skylineFront} />
        {win(1100, 320, 110, 150, 4, 4)}

        <rect x={1230} y={160} width={75} height={310} fill={c.skylineFront} />
        {win(1230, 160, 75, 310, 2, 9)}

        <rect x={1320} y={350} width={90} height={120} fill={c.skylineFront} />
        {win(1320, 350, 90, 120, 3, 3)}

        <rect x={1430} y={110} width={85} height={360} fill={c.skylineFront} />
        {win(1430, 110, 85, 360, 3, 11)}

        <rect x={1530} y={290} width={100} height={180} fill={c.skylineFront} />
        {win(1530, 290, 100, 180, 4, 5)}

        <rect x={1650} y={140} width={80} height={330} fill={c.skylineFront} />
        {win(1650, 140, 80, 330, 3, 10)}

        <rect x={1750} y={340} width={95} height={130} fill={c.skylineFront} />
        {win(1750, 340, 95, 130, 4, 3)}

        <rect x={1860} y={100} width={90} height={370} fill={c.skylineFront} />
        {win(1860, 100, 90, 370, 3, 11)}

        <rect x={1970} y={310} width={120} height={160} fill={c.skylineFront} />
        {win(1970, 310, 120, 160, 5, 4)}

        {/* ═══ ACERA ═══ */}
        <rect x={0} y={470} width={2100} height={8} fill={c.sidewalk} />

        {/* ═══ PASTO ═══ */}
        <rect x={0} y={490} width={2100} height={60} fill={c.grass} />
        <rect x={0} y={500} width={2100} height={50} fill={c.grassDark} />

        {/* ═══ CARRETERA ═══ */}
        <rect x={0} y={478} width={2100} height={14} fill={c.road} />
        <line x1={0} y1={485} x2={2100} y2={485} stroke={c.roadLine} strokeWidth={2} strokeDasharray="20,14" />

        {/* ═══ CARROS ═══ */}
        <g style={{ animation: 'driveRight 14s linear infinite' }}>
          <rect x={0} y={479} width={30} height={10} rx={3} fill="#ef4444" />
          <rect x={4} y={475} width={12} height={6} rx={2} fill="#dc2626" />
          <circle cx={8} cy={490} r={2.5} fill="#1a1a1a" />
          <circle cx={25} cy={490} r={2.5} fill="#1a1a1a" />
        </g>
        <g style={{ animation: 'driveLeft 18s linear infinite', animationDelay: '3s' }}>
          <rect x={0} y={482} width={35} height={10} rx={3} fill="#3b82f6" />
          <rect x={6} y={478} width={14} height={6} rx={2} fill="#2563eb" />
          <circle cx={10} cy={493} r={2.5} fill="#1a1a1a" />
          <circle cx={28} cy={493} r={2.5} fill="#1a1a1a" />
        </g>

        {/* ═══ CASAS ═══ */}
        {[
          { x: 50, w: 60, h: 45, wall: isDark ? '#2d2d3f' : '#fef3c7', roof: isDark ? '#4a1a1a' : '#dc2626' },
          { x: 550, w: 65, h: 48, wall: isDark ? '#2a2a3a' : '#dbeafe', roof: isDark ? '#1a3a4a' : '#2563eb' },
          { x: 1050, w: 58, h: 45, wall: isDark ? '#2e2e42' : '#fecaca', roof: isDark ? '#3a2a1a' : '#ea580c' },
          { x: 1550, w: 62, h: 46, wall: isDark ? '#2d3d2f' : '#d1fae5', roof: isDark ? '#1a3a2a' : '#16a34a' },
        ].map((h, i) => (
          <g key={`house-${i}`}>
            <rect x={h.x} y={470 - h.h} width={h.w} height={h.h} fill={h.wall} />
            <polygon points={`${h.x - 5},${470 - h.h} ${h.x + h.w / 2},${470 - h.h - h.h * 0.6} ${h.x + h.w + 5},${470 - h.h}`} fill={h.roof} />
            <rect x={h.x + h.w / 2 - 6} y={470 - 18} width={12} height={18} fill={isDark ? '#1a1a2e' : '#78350f'} rx={1} />
          </g>
        ))}

        {/* ═══ ÁRBOLES ═══ */}
        {[150, 450, 750, 1050, 1350, 1650, 1950].map((tx, i) => (
          <g key={`tree-${i}`} transform={`translate(${tx},460) scale(1.2)`}>
            <rect x={-2} y={0} width={4} height={15} fill={c.treeTrunk} />
            <circle cx={0} cy={-5} r={10} fill={c.treeLeaf1} />
            <circle cx={-6} cy={1} r={7} fill={c.treeLeaf2} />
            <circle cx={6} cy={-1} r={8} fill={c.treeLeaf2} />
          </g>
        ))}

      </svg>
    </div>
  );
}
