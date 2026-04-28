import { useEffect, useRef, useState } from "react";

interface PhysicsOptions {
  anchorX: number; // Porcentaje del ancho (0-100)
  anchorY: number; // Pixeles en Y absoluto (donde nació la nube)
  rangeX: number;  // Cuánto puede alejarse en X (%)
  rangeY: number;  // Cuánto puede alejarse en Y (px)
  speed: number;   // Velocidad de movimiento
  isPaused: boolean; // Si está hovered o fuera de pantalla
}

export function useCloudPhysics(options: PhysicsOptions) {
  const { anchorX, anchorY, rangeX, rangeY, speed, isPaused } = options;
  
  // Posiciones actuales relativas al origen
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef<{ x: number, y: number }>(null as any);
  if (!velRef.current) {
    velRef.current = {
      x: (Math.random() > 0.5 ? 1 : -1) * speed * (Math.random() * 0.5 + 0.5), 
      y: (Math.random() > 0.5 ? 1 : -1) * speed * (Math.random() * 0.5 + 0.5) 
    };
  }
  
  const requestRef = useRef<number>(undefined);
  const [style, setStyle] = useState({ transform: `translate(0px, 0px)` });

  useEffect(() => {
    // Si la física está pausada (fuera del viewport o hovered), no calculamos nada
    if (isPaused) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    let lastTime = performance.now();

    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 16.66; // Normalizado a 60fps
      lastTime = time;

      let { x, y } = posRef.current;
      let { x: vx, y: vy } = velRef.current;

      // Update positions
      x += vx * deltaTime;
      y += vy * deltaTime;

      // Convert limits (X is in % relative to viewport width approx, Y is in px)
      // For simplicity, we assume 1% width is approx 10px just for local bounds
      const pixelRangeX = rangeX * 10; 
      
      // Bouncing logic X
      if (x > pixelRangeX) {
        x = pixelRangeX;
        vx *= -1;
      } else if (x < -pixelRangeX) {
        x = -pixelRangeX;
        vx *= -1;
      }

      // Bouncing logic Y
      if (y > rangeY) {
        y = rangeY;
        vy *= -1;
      } else if (y < -rangeY) {
        y = -rangeY;
        vy *= -1;
      }

      // Add a tiny bit of random wind
      vx += (Math.random() - 0.5) * 0.05;
      vy += (Math.random() - 0.5) * 0.05;

      // Clamp speed
      const currentSpeed = Math.sqrt(vx*vx + vy*vy);
      if (currentSpeed > speed * 1.5) {
        vx *= 0.9;
        vy *= 0.9;
      } else if (currentSpeed < speed * 0.5) {
        vx *= 1.1;
        vy *= 1.1;
      }

      posRef.current = { x, y };
      velRef.current = { x: vx, y: vy };

      // Batch visual update
      setStyle({
        transform: `translate(${x}px, ${y}px)`
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPaused, rangeX, rangeY, speed]);

  return { style };
}
