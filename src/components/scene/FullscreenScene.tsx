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
import { Heart, MessageCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app-store";

export function FullscreenScene() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [posts, setPosts] = useState<CloudEntityState[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<EmotionCategory | 'all'>('all');
  const { theme, requestPurge, currentUser } = useAppStore();
  const isDark = theme === 'dark';
  
  const { entitiesRef, registerNode, setHovered } = useFloatingClouds(posts);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const canvasMultiplier = isMobile ? 1.8 : 3;

  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(isMobile ? 10 : 18);

      if (error) throw error;
      if (data) {
        const canvasW = window.innerWidth * canvasMultiplier;
        const canvasH = window.innerHeight * canvasMultiplier;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;
        const cloudW = isMobile ? 220 : 300;
        const cloudH = isMobile ? 140 : 190;
        const maxSpread = window.innerWidth * (isMobile ? 0.8 : 1.5);

        const newPosts: CloudEntityState[] = data.map((d: any, i: number) => {
          const existing = entitiesRef.current.find(e => e.id === d.id);
          if (existing) return { ...existing, content: d.content, support_count: d.support_count, reply_count: d.reply_count };
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.max(50, ((i + 1) / data.length) * maxSpread + (Math.random() - 0.5) * 200);
          return {
            id: d.id, x: centerX + Math.cos(angle) * radius - cloudW / 2, y: centerY + Math.sin(angle) * radius * 0.7 - cloudH / 2,
            vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 1.5, width: cloudW, height: cloudH,
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
  const touchStartDist = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touchStartDist.current = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current !== null) {
      const dist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
      const delta = (dist - touchStartDist.current) * 0.005;
      setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 1.8));
      touchStartDist.current = dist;
    }
  };

  const handleZoom = (delta: number) => setZoom(prev => Math.min(Math.max(prev + delta, 0.4), 1.6));

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const container = scrollContainerRef.current;
    if (!container || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if ((e.target as HTMLElement).closest('button, input, a, [role="dialog"]')) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, scrollLeft: container.scrollLeft, scrollTop: container.scrollTop };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollLeft = dragStart.current.scrollLeft - (e.clientX - dragStart.current.x);
    container.scrollTop = dragStart.current.scrollTop - (e.clientY - dragStart.current.y);
  }, []);

  const handlePointerUp = () => { isDragging.current = false; };

  if (!mounted) return null;

  return (
    <div 
      ref={scrollContainerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="fixed inset-0 w-screen h-dvh overflow-auto z-0 hide-scrollbars overscroll-none touch-none"
    >
      <div 
        className="relative transition-transform duration-100 ease-out origin-center will-change-transform" 
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
                  key={entity.id} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  ref={(el) => registerNode(entity.id, el as HTMLElement)}
                  className="absolute will-change-transform pointer-events-auto"
                  style={{ transform: `translate3d(${entity.x}px, ${entity.y}px, 0)` }}
                  onClick={() => setSelectedPost(entity as any)}
                >
                  <CloudShape category={entity.category} variant={((i % 4) + 1) as CloudVariant} isHovered={entity.hovered} likes={entity.support_count}>
                    <div className="flex flex-col items-center text-center gap-0.5">
                      <span className="text-[10px] opacity-60">{cloudThemes[entity.category]?.icon}</span>
                      <p className={`text-[11px] font-bold px-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>{entity.content}</p>
                    </div>
                  </CloudShape>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
        <div className="absolute bottom-0 left-0 w-full z-[5]"><Landscape /></div>
      </div>

      <CelestialBodies />

      <div className="fixed bottom-24 right-4 z-[100] flex flex-col gap-2 scale-90">
        <button onClick={() => handleZoom(0.1)} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur shadow-lg flex items-center justify-center font-bold">+</button>
        <button onClick={() => handleZoom(-0.1)} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur shadow-lg flex items-center justify-center font-bold">-</button>
      </div>

      <div className={`fixed top-20 left-4 z-[100] transition-transform duration-300 ${isMobile && !showFilters ? '-translate-x-[85%]' : 'translate-x-0'}`}>
        <div className="flex items-start">
          <div className="flex flex-col gap-2 bg-black/10 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold ${filter === 'all' ? 'bg-white text-black' : 'text-white/60'}`}>Todos</button>
            {Object.keys(cloudThemes).map(cat => (
              <button key={cat} onClick={() => setFilter(cat as any)} className={`p-2 rounded-xl flex items-center gap-2 text-[10px] font-bold ${filter === cat ? 'bg-white/20 scale-105' : 'opacity-50'}`}>
                <span>{cloudThemes[cat as EmotionCategory].icon}</span>
                {!isMobile || showFilters ? cat : ''}
              </button>
            ))}
          </div>
          {isMobile && (
            <button onClick={() => setShowFilters(!showFilters)} className="mt-4 ml-1 p-2 bg-white/20 backdrop-blur rounded-r-xl">
              {showFilters ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
        </div>
      </div>

      {currentUser && <div className="fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center"><CreatePost onPostCreated={fetchPosts} /></div>}
      <Minimap posts={posts} scrollContainerRef={scrollContainerRef} zoom={zoom} />
      <AnimatePresence>
        {selectedPost && <RepliesModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      </AnimatePresence>
      {!currentUser && <LoginModal preventClose={true} />}
    </div>
  );
}
