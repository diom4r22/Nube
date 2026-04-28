"use client";

import { ReactNode } from "react";
import { cloudThemes, EmotionCategory } from "@/lib/cloud/cloudThemes";

export type CloudVariant = 1 | 2 | 3 | 4;

interface CloudShapeProps {
  category: EmotionCategory;
  variant?: CloudVariant;
  children: ReactNode;
  isHovered?: boolean;
  likes?: number;
}

const CLOUD_PATHS = {
  // SVG viewbox 0 0 200 120
  1: "M40,60 C40,40 60,30 80,40 C90,20 120,20 130,40 C150,30 170,40 170,60 C180,70 170,90 150,90 C150,110 110,110 100,100 C90,110 50,110 50,90 C30,90 20,70 40,60 Z",
  2: "M50,70 C40,50 60,30 80,50 C95,25 130,30 140,50 C165,40 180,60 170,80 C180,100 160,110 140,110 C120,125 80,120 70,110 C45,115 30,100 40,80 C30,75 35,65 50,70 Z",
  3: "M60,55 C50,35 70,25 90,40 C105,20 140,25 150,45 C170,35 190,55 180,75 C190,95 170,105 150,100 C140,115 100,115 90,105 C70,120 40,105 50,85 C30,85 40,65 60,55 Z",
  4: "M45,65 C35,45 60,30 80,45 C95,20 135,25 145,50 C170,45 185,65 170,85 C180,105 155,115 140,110 C120,125 75,120 65,110 C40,115 25,95 35,75 C25,70 30,60 45,65 Z"
};

export function CloudShape({ category, variant = 1, children, isHovered, likes = 0 }: CloudShapeProps) {
  const theme = cloudThemes[category];
  const path = CLOUD_PATHS[variant];
  const isLegendary = likes >= 10;

  return (
    <div 
      className={`relative w-[300px] h-[190px] pointer-events-auto group transition-all duration-500 ${
        isHovered ? 'scale-105 z-20' : 'scale-100'
      } ${isLegendary ? 'brightness-110' : ''}`}
    >
      {/* Legendary Aura */}
      {isLegendary && (
        <div className="absolute inset-0 bg-yellow-400/20 blur-[40px] animate-pulse rounded-full" />
      )}

      {/* Drop shadow suave / Glow */}
      <div 
        className={`absolute inset-2 rounded-[80px] blur-[20px] transition-all duration-500 ${
          isHovered ? 'opacity-30 scale-105' : 'opacity-15'
        } ${isLegendary ? 'bg-yellow-400 opacity-40 blur-[30px]' : `bg-current ${theme.accent}`}`}
      />
      
      {/* SVG Cloud Shape */}
      <svg
        viewBox="0 0 200 130"
        className="absolute inset-0 w-full h-full"
        style={{ 
          filter: isHovered 
            ? 'drop-shadow(0 10px 25px rgba(0,0,0,0.15))' 
            : 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))' 
        }}
        preserveAspectRatio="none"
      >
        {/* Sombra inferior */}
        <path 
          d={path} 
          fill="black" 
          opacity="0.04" 
          transform="translate(0, 3)" 
        />
        {/* Relleno principal */}
        <path 
          d={path} 
          className={`${isLegendary ? 'fill-yellow-50/90' : theme.fill} transition-colors duration-700`}
        />
        {/* Legendary Border Shine */}
        {isLegendary && (
          <path 
            d={path} 
            fill="none" 
            stroke="gold" 
            strokeWidth="1" 
            opacity="0.4"
          />
        )}
        {/* Brillo superior */}
        <path 
          d={path} 
          fill="white" 
          opacity="0.15" 
          transform="translate(0, -1.5) scale(0.98)" 
        />
      </svg>

      {/* Área de contenido */}
      <div className={`absolute inset-0 flex items-center justify-center overflow-hidden px-[20%] py-[28%] transition-all duration-500 ${isLegendary ? 'scale-110' : ''}`}>
        <div className="w-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
