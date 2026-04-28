"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SkyEventsProps {
  isDark: boolean;
  onMeteorPurge: () => void;
  survivors?: any[];
  requestPurge?: number;
}

type ActiveEvent = 'none' | 'rainbow' | 'lightning' | 'meteor' | 'rain';

export function SkyEvents({ isDark, onMeteorPurge, survivors = [], requestPurge = 0 }: SkyEventsProps) {
  const [activeEvent, setActiveEvent] = useState<ActiveEvent>('none');
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [eventTriggered, setEventTriggered] = useState(false);
  const [meteorPhase, setMeteorPhase] = useState<'idle' | 'warning' | 'flying' | 'impact' | 'done'>('idle');
  const [stars, setStars] = useState<{ id: string; x: number; y: number; content: string }[]>([]);
  
  // Disparar meteorito manual cuando se pide purga
  const lastRequestRef = useRef(requestPurge);
  useEffect(() => {
    if (requestPurge > lastRequestRef.current) {
      lastRequestRef.current = requestPurge;
      setMeteorPhase('warning');
      setActiveEvent('meteor');
    }
  }, [requestPurge]);
  
  // Ref to always have latest onMeteorPurge
  const purgeRef = useRef(onMeteorPurge);
  purgeRef.current = onMeteorPurge;

  // Sincronizar sobrevivientes con estrellas permanentes
  useEffect(() => {
    if (survivors.length > 0) {
      const newStars = survivors.map(s => ({
        id: s.id,
        x: Math.random() * 100,
        y: Math.random() * 60,
        content: s.content
      }));
      setStars(prev => [...prev, ...newStars].slice(-40)); // Max 40 estrellas
    }
  }, [survivors]);

  // Track time on page
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOnPage(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Trigger weather events randomly
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeEvent !== 'none') return;
      
      const rand = Math.random();
      if (rand < 0.2) {
        setActiveEvent(isDark ? 'lightning' : 'rainbow');
        setTimeout(() => setActiveEvent('none'), 15000);
      } else if (rand < 0.4) {
        setActiveEvent('rain');
        setTimeout(() => setActiveEvent('none'), 20000);
      }
    }, 90000); // Cada 90 segundos intenta disparar algo
    
    return () => clearInterval(interval);
  }, [activeEvent, isDark]);

  // Meteor — Cinema version (Cada 24 horas a medianoche UTC)
  useEffect(() => {
    const triggerMeteor = () => {
      console.log('☄️ EPIC Meteor event starting!');
      setMeteorPhase('warning');
      setActiveEvent('meteor');

      setTimeout(() => setMeteorPhase('flying'), 2000);
      setTimeout(() => setMeteorPhase('impact'), 4500);
      setTimeout(() => {
        purgeRef.current();
        setMeteorPhase('done');
      }, 6500);
      setTimeout(() => {
        setActiveEvent('none');
        setMeteorPhase('idle');
      }, 9000);
    };

    // Verificamos cada minuto si es medianoche UTC para lanzar el meteorito
    const checkInterval = setInterval(() => {
      const now = new Date();
      if (now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {
        triggerMeteor();
      }
    }, 60000);
    
    return () => clearInterval(checkInterval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      <AnimatePresence>
        {/* ═══════════════ RAINBOW EVENT ═══════════════ */}
        {activeEvent === 'rainbow' && (
          <motion.div
            key="rainbow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          >
            {/* Rainbow arc */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.6, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
              style={{
                width: '120vw',
                height: '60vw',
                borderRadius: '60vw 60vw 0 0',
                background: `
                  conic-gradient(
                    from 180deg at 50% 100%,
                    transparent 0deg,
                    #ff0000 20deg,
                    #ff8800 40deg,
                    #ffff00 60deg,
                    #00ff00 80deg,
                    #0088ff 100deg,
                    #4400ff 120deg,
                    #8800ff 140deg,
                    transparent 160deg
                  )
                `,
                filter: 'blur(8px)',
                maskImage: `radial-gradient(ellipse at 50% 100%, transparent 55%, black 56%, black 62%, transparent 63%)`,
                WebkitMaskImage: `radial-gradient(ellipse at 50% 100%, transparent 55%, black 56%, black 62%, transparent 63%)`,
              }}
            />

            {/* Many birds flying */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`bird-${i}`}
                initial={{ x: -100, y: 100 + (i * 30) % 200 }}
                animate={{
                  x: ['-10vw', '110vw'],
                  y: [100 + (i * 30) % 200, 80 + (i * 20) % 150, 120 + (i * 25) % 180]
                }}
                transition={{
                  duration: 8 + (i % 4) * 2,
                  delay: i * 0.4,
                  ease: "linear"
                }}
                className="absolute text-slate-600/40"
                style={{ top: `${15 + (i * 7) % 30}%` }}
              >
                <svg width="30" height="15" viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M0,10 Q10,0 20,10 Q30,0 40,10" />
                </svg>
              </motion.div>
            ))}

            {/* Notification */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-lg"
            >
              <span className="text-sm font-bold text-slate-700">
                ☀️ ¡Un arcoíris apareció en el cielo! (◕‿◕✿)
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* ═══════════════ LIGHTNING EVENT ═══════════════ */}
        {activeEvent === 'lightning' && (
          <motion.div
            key="lightning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {/* Lightning flashes */}
            {[0, 1.5, 3, 4.5, 6].map((delay, i) => (
              <motion.div
                key={`flash-${i}`}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.8, 0, 0.4, 0],
                }}
                transition={{
                  delay,
                  duration: 0.4,
                  times: [0, 0.1, 0.3, 0.4, 1]
                }}
                className="absolute inset-0 bg-white/50"
              />
            ))}

            {/* Lightning bolts */}
            {[0.1, 1.6, 3.1, 4.6].map((delay, i) => (
              <motion.svg
                key={`bolt-${i}`}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: [0, 1, 1, 0], scaleY: [0, 1, 1, 1] }}
                transition={{ delay, duration: 0.5 }}
                className="absolute"
                style={{
                  left: `${20 + (i * 20) % 60}%`,
                  top: 0,
                  width: '60px',
                  height: '50vh',
                  transformOrigin: 'top'
                }}
                viewBox="0 0 60 200"
                fill="none"
              >
                <path
                  d="M30,0 L20,60 L35,60 L15,120 L30,120 L10,200 L45,100 L28,100 L45,50 L30,50 Z"
                  fill="#c4b5fd"
                  opacity="0.9"
                  filter="url(#glow)"
                />
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
              </motion.svg>
            ))}

            {/* Screen shake */}
            <motion.div
              animate={{
                x: [0, -3, 5, -2, 4, 0, -5, 3, 0],
                y: [0, 2, -3, 1, -2, 3, -1, 0, 0]
              }}
              transition={{
                duration: 0.3,
                repeat: 5,
                repeatDelay: 1.2
              }}
              className="absolute inset-0"
            />

            {/* Notification */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-indigo-500/30"
            >
              <span className="text-sm font-bold text-indigo-200">
                ⚡ ¡Tormenta eléctrica en el cielo! (ᴗ̩̩̩ɜ)
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* ═══════════════ EPIC METEOR EVENT ═══════════════ */}
        {activeEvent === 'meteor' && (
          <motion.div
            key="meteor-event"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 overflow-hidden"
          >
            {/* Warning Effects */}
            {meteorPhase === 'warning' && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.4, 0.2, 0.6] }}
                  className="absolute inset-0 bg-gradient-to-t from-red-900/40 via-orange-900/20 to-transparent z-[65]"
                />
                {/* Sutil temblor de aviso */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ x: [-1, 1, -1], y: [1, -1, 1] }}
                  transition={{ duration: 0.1, repeat: Infinity }}
                />
              </>
            )}

            {/* Meteor trail */}
            {meteorPhase === 'flying' && (
              <>
                {/* Sonic Booms */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={`sonic-${i}`}
                    initial={{ x: '-10vw', y: '-10vh', scale: 0.2, opacity: 0 }}
                    animate={{ x: '130vw', y: '130vh', scale: [1, 6], opacity: [0.6, 0] }}
                    transition={{ duration: 2, delay: i * 0.4, ease: "easeOut" }}
                    className="absolute w-80 h-80 border-[3px] border-orange-400/20 rounded-full z-[66] blur-[2px]"
                  />
                ))}

                <motion.div
                  initial={{ x: '-60vw', y: '-40vh', rotate: 30, scale: 0.3 }}
                  animate={{ x: '160vw', y: '160vh', scale: 2.2 }}
                  transition={{ duration: 2.5, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute z-[70]"
                  style={{ width: '1200px', height: '120px' }}
                >
                  {/* Rotating Vortex Core */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 z-40"
                  >
                    <div className="absolute inset-0 rounded-full bg-white blur-sm shadow-[0_0_100px_#fff]" />
                    <div className="absolute inset-4 rounded-full border-[20px] border-t-yellow-400 border-r-orange-500 border-b-red-600 border-l-transparent blur-md opacity-80" />
                  </motion.div>

                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-yellow-400/80 blur-xl z-20" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-600/40 blur-3xl z-10" />
                  
                  {/* Plasma Trail - MASIVA Y DETALLADA */}
                  <div className="absolute right-40 top-1/2 -translate-y-1/2 w-[1800px] h-80 bg-gradient-to-l from-red-600 via-orange-500/30 to-transparent blur-[60px]" />
                  <div className="absolute right-40 top-1/2 -translate-y-1/2 w-[1400px] h-32 bg-gradient-to-l from-yellow-400 via-white/10 to-transparent blur-[30px]" />
                  
                  {/* Heat distortion layer */}
                  <motion.div 
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 0.1, repeat: Infinity }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[80px]"
                  />
                </motion.div>
              </>
            )}

            {/* Impact - La explosión final mejorada */}
            {meteorPhase === 'impact' && (
              <>
                {/* Shockwaves */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={`impact-ring-${i}`}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 15, opacity: 0 }}
                    transition={{ duration: 1.8, delay: i * 0.15, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-[40px] border-white/40 rounded-full z-[101] blur-md"
                  />
                ))}

                {/* Supernova flash */}
                <motion.div
                  animate={{ 
                    opacity: [0, 1, 1, 0, 1, 0],
                    backgroundColor: ['#fff', '#fff', '#fb923c', '#fff', '#fff']
                  }}
                  transition={{ duration: 2.2, times: [0, 0.1, 0.4, 0.5, 0.8, 1] }}
                  className="absolute inset-0 z-[100]"
                />
                
                {/* Sacudida VIOLENTA Y LARGA */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ 
                    x: [0, -80, 80, -80, 80, -40, 40, -20, 20, 0],
                    y: [0, 60, -80, 60, -40, 30, -15, 10, -5, 0]
                  }}
                  transition={{ duration: 1.5 }}
                />
              </>
            )}

            {/* Global Warning Text */}
            {meteorPhase === 'warning' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] text-center"
              >
                <h2 className="text-4xl font-black text-orange-200 tracking-widest uppercase italic drop-shadow-2xl">
                  Advertencia Atmosférica
                </h2>
                <p className="text-orange-300 font-bold mt-2 animate-pulse">
                  Evento de purga inminente...
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
        {/* ═══════════════ EMOTION RAIN EVENT ═══════════════ */}
        {activeEvent === 'rain' && (
          <motion.div
            key="rain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={`rain-${i}`}
                initial={{ y: -20, x: `${Math.random() * 100}vw`, opacity: 0 }}
                animate={{ y: '110vh', opacity: [0, 1, 1, 0] }}
                transition={{ 
                  duration: 2 + Math.random() * 2, 
                  repeat: Infinity, 
                  delay: Math.random() * 5 
                }}
                className="absolute text-white/40 pointer-events-auto cursor-help hover:scale-150 transition-transform"
                style={{ fontSize: `${Math.random() * 10 + 10}px` }}
              >
                {['✨', '💧', '☁️', '❄️'][Math.floor(Math.random() * 4)]}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ═══════════════ STAR WALL (SURVIVORS) ═══════════════ */}
        {isDark && (
          <div className="absolute inset-0 pointer-events-none">
            {stars.map((star, idx) => (
              <motion.div
                key={`survivor-star-${star.id}-${idx}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.2, 1] }}
                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
                className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_5px_#fff]"
                style={{ left: `${star.x}%`, top: `${star.y}%` }}
                title={star.content}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
