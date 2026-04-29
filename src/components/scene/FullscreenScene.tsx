"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { DayScene } from "./DayScene";
import { NightScene } from "./NightScene";
import { SkyEvents } from "./SkyEvents";
import { supabase } from "@/lib/supabase";
import { CreatePost } from "@/components/feed/create-post";
import { RepliesModal, Post } from "@/components/feed/replies-modal";
import { LoginModal } from "@/components/admin/LoginModal";
import { CelestialBodies } from "./CelestialBodies";
import { Landscape } from "./Landscape";
import { Minimap } from "@/components/ui/Minimap";
import { ReportModal } from "@/components/ui/ReportModal";
import { useFloatingClouds, CloudEntityState } from "@/lib/physics/useFloatingClouds";
import { CloudShape, CloudVariant } from "@/components/clouds/CloudShape";
import { EmotionCategory, cloudThemes } from "@/lib/cloud/cloudThemes";
import { Heart, MessageCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app-store";

export function FullscreenScene() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [posts, setPosts] = useState<CloudEntityState[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [filter, setFilter] = useState<EmotionCategory | 'all'>('all');
  const { theme, requestPurge, currentUser } = useAppStore();
  const isDark = theme === 'dark';
  
  const { entitiesRef, registerNode } = useFloatingClouds(posts);

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 768);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const canvasMultiplier = isMobile ? 1.8 : 3;

  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(isMobile ? 12 : 24);

      if (error) throw error;
      if (data) {
        const canvasW = window.innerWidth * canvasMultiplier;
        const canvasH = window.innerHeight * canvasMultiplier;
        const cloudW = isMobile ? 160 : 280;
        const cloudH = isMobile ? 110 : 180;
        const maxSpread = canvasW * 0.45;

        const newPosts: CloudEntityState[] = data.map((d: any, i: number) => {
          const existing = entitiesRef.current.find(e => e.id === d.id);
          if (existing) return { ...existing, content: d.content, support_count: d.support_count, reply_count: d.reply_count };
          
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.max(120, ((i + 1) / data.length) * maxSpread + (Math.random() - 0.5) * 300);
          
          return {
            id: d.id, 
            x: (canvasW / 2) + Math.cos(angle) * radius - cloudW / 2, 
            y: (canvasH / 2) + Math.sin(angle) * radius * 0.7 - cloudH / 2,
            vx: (Math.random() - 0.5) * 1.8, 
            vy: (Math.random() - 0.5) * 1.2, 
            width: cloudW, 
            height: cloudH,
            paused: false, hovered: false, oscillationOffset: Math.random() * Math.PI * 2,
            category: d.type || 'pensamiento', content: d.content, created_at: d.created_at,
            support_count: d.support_count || 0, reply_count: d.reply_count || 0,
          };
        });
        setPosts(newPosts);
        entitiesRef.current = newPosts;
      }
    } catch (e) { console.error(e); }
  }, [isMobile, canvasMultiplier, entitiesRef]);

  useEffect(() => {
    fetchPosts();
    setMounted(true);
  }, [fetchPosts]);

  const [zoom, setZoom] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleZoom = (delta: number) => setZoom(prev => Math.min(Math.max(prev + delta, 0.4), 1.6));

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const container = scrollContainerRef.current;
    if (!container || (e.target as HTMLElement).closest('button, input, a, .cloud-interactive')) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, scrollLeft: container.scrollLeft, scrollTop: container.scrollTop };
    container.style.cursor = 'grabbing';
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollLeft = dragStart.current.scrollLeft - (e.clientX - dragStart.current.x);
    container.scrollTop = dragStart.current.scrollTop - (e.clientY - dragStart.current.y);
  }, []);

  const handlePointerUp = () => { 
    isDragging.current = false; 
    if (scrollContainerRef.current) scrollContainerRef.current.style.cursor = 'grab'; 
  };

  if (!mounted) return null;

  // Color de cielo según filtro
  const getFilterOverlay = () => {
    if (filter === 'all') return '';
    const theme = cloudThemes[filter as EmotionCategory];
    return `after:absolute after:inset-0 after:bg-current ${theme.accent} after:opacity-10 after:pointer-events-none`;
  };

  return (
    <div 
      ref={scrollContainerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`fixed inset-0 w-screen h-dvh overflow-auto z-0 hide-scrollbars overscroll-none touch-none bg-slate-950 ${getFilterOverlay()}`}
    >
      <div 
        className="relative transition-transform duration-300 ease-out origin-center will-change-transform" 
        style={{ 
          width: `${canvasMultiplier * 100}vw`, height: `${canvasMultiplier * 100}vh`,
          transform: `scale(${zoom})`
        }}
      >
        <div className="absolute inset-0">{isDark ? <NightScene /> : <DayScene />}</div>
        <SkyEvents isDark={isDark} onMeteorPurge={fetchPosts} requestPurge={requestPurge} />
        
        <div className="absolute inset-0 z-10 pointer-events-none">
          <AnimatePresence>
            {entitiesRef.current
              .filter(entity => filter === 'all' || entity.category === filter)
              .map((entity, i) => (
                <motion.div
                  key={entity.id} 
                  initial={{ opacity: 0, scale: 0.2, filter: 'blur(20px)' }} 
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
                  exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  ref={(el) => registerNode(entity.id, el as HTMLElement)}
                  className="absolute will-change-transform pointer-events-auto"
                  style={{ transform: `translate3d(${entity.x}px, ${entity.y}px, 0)` }}
                >
                  <div className="cloud-interactive cursor-pointer group" onClick={() => setSelectedPost(entity as any)}>
                    <CloudShape category={entity.category} variant={((i % 4) + 1) as CloudVariant} likes={entity.support_count}>
                      <div className="flex flex-col items-center text-center p-3">
                        <span className="text-[10px] mb-1 group-hover:animate-bounce">{cloudThemes[entity.category]?.icon}</span>
                        <p className={`text-[11px] sm:text-[13px] font-bold leading-tight px-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>{entity.content}</p>
                        <div className="flex gap-3 mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <span className="flex items-center gap-1 text-[10px] font-black"><Heart size={10} className="fill-rose-500 text-rose-500" /> {entity.support_count}</span>
                          <span className="flex items-center gap-1 text-[10px] font-black"><MessageCircle size={10} className="text-sky-500" /> {entity.reply_count}</span>
                        </div>
                      </div>
                    </CloudShape>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
        <div className="absolute bottom-0 left-0 w-full z-[5]"><Landscape /></div>
      </div>

      <CelestialBodies />

      {/* INTERFAZ SUPERIOR REDISEÑADA */}
      <div className="fixed top-6 left-6 right-6 z-[100] pointer-events-none flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="p-3 bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-2xl border border-white/20 pointer-events-auto shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center animate-pulse">
              <Sparkles size={16} className="text-white" />
            </div>
            <h1 className="text-sm font-black tracking-tighter text-white uppercase italic">Cloud Whisper</h1>
          </div>
          
          <div className="flex gap-2 pointer-events-auto">
            <button onClick={() => handleZoom(0.1)} className="w-10 h-10 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/20 text-white font-black hover:bg-white/20 transition-all">+</button>
            <button onClick={() => handleZoom(-0.1)} className="w-10 h-10 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/20 text-white font-black hover:bg-white/20 transition-all">-</button>
          </div>
        </div>

        {/* COMPÁS DE EMOCIONES (CHIPS PREMIUM) */}
        <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-4 no-scrollbar px-2">
          <button 
            onClick={() => setFilter('all')} 
            className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${filter === 'all' ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-black/40 text-white border-white/10 hover:border-white/30'}`}
          >
            Universo
          </button>
          {Object.keys(cloudThemes).map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat as any)} 
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border ${filter === cat ? `bg-sky-500 text-white border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.4)]` : 'bg-black/40 text-white border-white/10 hover:border-white/30'}`}
            >
              <span>{cloudThemes[cat as EmotionCategory].icon}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* BOTÓN CREAR (HOLOGRÁFICO) */}
      {currentUser && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-6">
          <div className="hover:scale-105 transition-transform">
            <CreatePost onPostCreated={fetchPosts} />
          </div>
        </div>
      )}

      {/* RADAR (MINIMAP) */}
      <Minimap posts={posts} scrollContainerRef={scrollContainerRef} zoom={zoom} />

      <AnimatePresence>
        {selectedPost && <RepliesModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      </AnimatePresence>
      {!currentUser && <LoginModal preventClose={true} />}
    </div>
  );
}
