"use client";

import { useEffect, useRef, useState } from "react";

export interface CloudEntityState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  paused: boolean;
  hovered: boolean;
  oscillationOffset: number;
  // Post data
  category?: string;
  content?: string;
  created_at?: string;
  support_count?: number;
  reply_count?: number;
}

export function useFloatingClouds(initialEntities: CloudEntityState[]) {
  // Utilizamos un ref para mutar el estado sin re-renders en React
  const entitiesRef = useRef<CloudEntityState[]>(initialEntities);
  const requestRef = useRef<number>(undefined);
  
  // Exponemos el ref para que los componentes UI puedan forzar un re-render o leer posiciones
  // Pero la actualización visual se hará mediante manipulación directa del DOM (Refs a los elementos)
  // para máximo rendimiento.
  const domNodesRef = useRef<{ [id: string]: HTMLElement | null }>({});

  const registerNode = (id: string, node: HTMLElement | null) => {
    domNodesRef.current[id] = node;
  };

  const setHovered = (id: string, hovered: boolean) => {
    const entity = entitiesRef.current.find(e => e.id === id);
    if (entity) entity.hovered = hovered;
  };

  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Sincronizar entidades cuando cambian los props (Purga o Nuevo Post)
    // Mantenemos la inercia (vx, vy) y posición actual de las que ya existen
    const nextEntities = initialEntities.map(incoming => {
      const current = entitiesRef.current.find(e => e.id === incoming.id);
      if (current) {
        return {
          ...current,
          ...incoming, // Actualizar likes/replies si cambiaron
        };
      }
      return incoming;
    });
    entitiesRef.current = nextEntities;
  }, [initialEntities]);

  useEffect(() => {
    let lastTime = performance.now();
    let isTabVisible = true;

    const handleVisibility = () => { isTabVisible = !document.hidden; };
    const handleMouseMove = (e: MouseEvent) => {
      // Usar pageX/pageY para soportar scroll en el lienzo gigante
      mouseRef.current = { x: e.pageX, y: e.pageY };
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('mousemove', handleMouseMove);

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animate = (time: number) => {
      if (!isTabVisible) {
        requestRef.current = requestAnimationFrame(animate);
        return;
      }

      const dt = Math.min((time - lastTime) / 16.6, 2.0);
      lastTime = time;

      // --- REPULSIÓN ENTRE NUBES (Pre-calculada para evitar apilamiento) ---
      const entities = entitiesRef.current;
      for (let i = 0; i < entities.length; i++) {
        const e1 = entities[i];
        for (let j = i + 1; j < entities.length; j++) {
          const e2 = entities[j];
          const dx = (e1.x + e1.width/2) - (e2.x + e2.width/2);
          const dy = (e1.y + e1.height/2) - (e2.y + e2.height/2);
          const distSq = dx*dx + dy*dy;
          const minDist = 350; // Aumentado para evitar solapamiento visual
          if (distSq < minDist * minDist && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (minDist - dist) * 0.08; // Fuerza de repulsión duplicada
            const fx = (dx / dist) * force * dt;
            const fy = (dy / dist) * force * dt;
            e1.vx += fx; e1.vy += fy;
            e2.vx -= fx; e2.vy -= fy;
          }
        }
      }

      // Lienzo Gigante (300vw x 300vh)
      const viewportW = window.innerWidth * 3;
      const viewportH = window.innerHeight * 3;
      const centerX = viewportW / 2;
      const centerY = viewportH / 2;

      entitiesRef.current.forEach(entity => {
        if (entity.paused) return;

        let effectiveVx = entity.vx;
        let effectiveVy = entity.vy;

        // --- POPULARITY GRAVITY (Centro = Fama, Bordes = Olvido) ---
        const dxCenter = centerX - (entity.x + entity.width / 2);
        const dyCenter = centerY - (entity.y + entity.height / 2);
        const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
        
        const likes = entity.support_count || 0;
        
        if (likes > 0) {
           // Nubes populares: Atracción hacia un offset único basado en su ID para evitar el centro exacto
           const seed = entity.id.split('-')[0];
           const offX = (parseInt(seed, 16) % 400) - 200;
           const offY = (parseInt(seed.slice(2), 16) % 200) - 100;
           
           const dxT = (centerX + offX) - (entity.x + entity.width / 2);
           const dyT = (centerY + offY) - (entity.y + entity.height / 2);
           const distT = Math.sqrt(dxT * dxT + dyT * dyT) || 1;
           
           const pullStrength = Math.min(likes * 0.02, 0.12);
           entity.vx += (dxT / distT) * pullStrength * dt;
           entity.vy += (dyT / distT) * pullStrength * dt;
        } else {
           // Nubes sin likes: Repulsión suave hacia los bordes
           const pushStrength = 0.005;
           if (distCenter > 100) {
             entity.vx -= (dxCenter / distCenter) * pushStrength * dt;
             entity.vy -= (dyCenter / distCenter) * pushStrength * dt;
           }
        }

        // --- EFECTO DE VIENTO (MOUSE) ---
        const dxMouse = (entity.x + entity.width / 2) - mouseRef.current.x;
        const dyMouse = (entity.y + entity.height / 2) - mouseRef.current.y;
        const distSq = dxMouse * dxMouse + dyMouse * dyMouse;
        const influenceRadius = 300;
        
        if (distSq < influenceRadius * influenceRadius) {
          const distMouse = Math.sqrt(distSq);
          const force = (1 - distMouse / influenceRadius) * 2.5;
          entity.vx += (dxMouse / distMouse) * force * dt;
          entity.vy += (dyMouse / distMouse) * force * dt;
        }

        // Hover = casi pausar
        if (entity.hovered) {
          effectiveVx *= 0.03;
          effectiveVy *= 0.03;
        }

        if (prefersReduced) {
          effectiveVx = 0;
          effectiveVy = 0;
        }

        entity.x += effectiveVx * dt;
        entity.y += effectiveVy * dt;

        // Rebote contra el NUEVO viewport gigante
        const padding = 10;
        if (entity.x <= padding) {
          entity.x = padding;
          entity.vx = Math.abs(entity.vx) * 0.9;
        } else if (entity.x + entity.width >= viewportW - padding) {
          entity.x = viewportW - entity.width - padding;
          entity.vx = -Math.abs(entity.vx) * 0.9;
        }

        if (entity.y <= padding) { // Quitamos el padding extra de header superior porque es scrollable
          entity.y = padding;
          entity.vy = Math.abs(entity.vy) * 0.9;
        } else if (entity.y + entity.height >= viewportH - padding) {
          entity.y = viewportH - entity.height - padding;
          entity.vy = -Math.abs(entity.vy) * 0.9;
        }

        // Damping general y límites de velocidad
        const speed = Math.sqrt(entity.vx * entity.vx + entity.vy * entity.vy);
        const MIN_SPEED = 0.5; // Reducido para que floten más lento si no tienen inercia
        const MAX_SPEED = 6.0;
        
        // Fricción suave
        entity.vx *= 0.99;
        entity.vy *= 0.99;

        if (speed > MAX_SPEED) {
          const scale = MAX_SPEED / speed;
          entity.vx *= scale;
          entity.vy *= scale;
        } else if (speed < MIN_SPEED && speed > 0) {
          const scale = MIN_SPEED / speed;
          entity.vx *= scale;
          entity.vy *= scale;
        }

        // Oscillation vertical suave
        entity.oscillationOffset += 0.02 * dt;
        const floatY = Math.sin(entity.oscillationOffset) * 3;

        const node = domNodesRef.current[entity.id];
        if (node) {
          node.style.transform = `translate3d(${entity.x}px, ${entity.y + floatY}px, 0)`;
        }
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return {
    entitiesRef,
    registerNode,
    setHovered
  };
}
