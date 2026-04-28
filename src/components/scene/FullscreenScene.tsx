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
import { Heart, MessageCircle, Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useAppStore } from "@/store/app-store";

export function FullscreenScene() {
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<CloudEntityState[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const { theme, requestPurge, currentUser } = useAppStore();
  const isDark = theme === 'dark';
  
  const { entitiesRef, registerNode, setHovered } = useFloatingClouds(posts);

  // Fetch posts from Supabase
  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(15);

      if (error) throw error;
      
      if (data) {
        const canvasW = window.innerWidth * 3;
        const canvasH = window.innerHeight * 3;
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;
        
        const cloudW = 300;
        const cloudH = 190;

        // Distribución orgánica: Random Polar con capas
        // Las nubes populares van cerca del centro, las menos populares más lejos
        const sorted = [...data].sort((a: any, b: any) => (b.support_count || 0) - (a.support_count || 0));
        const maxSpread = window.innerWidth * 1.5; // Mucho más esparcido para el mapa gigante

        const newPosts: CloudEntityState[] = sorted.map((d: any, i: number) => {
          const existing = entitiesRef.current.find(e => e.id === d.id);
          
          if (existing) {
            return {
              ...existing,
              content: d.content,
              support_count: d.support_count || 0,
              reply_count: d.reply_count || 0,
              category: d.type || 'pensamiento',
            };
          }

          // Posición: ángulo completamente aleatorio, radio proporcional al rank
          const angle = Math.random() * Math.PI * 2;
          const rankRatio = (i + 1) / sorted.length; // 0 = más popular, 1 = menos
          const baseRadius = rankRatio * maxSpread;
          const jitter = (Math.random() - 0.5) * maxSpread * 0.4; // ±20% del spread total
          const radius = Math.max(50, baseRadius + jitter);
          
          return {
            id: d.id,
            x: centerX + Math.cos(angle) * radius - cloudW / 2,
            y: centerY + Math.sin(angle) * radius * 0.7 - cloudH / 2, // 0.7 para aspecto ovalado
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 2,
            width: cloudW,
            height: cloudH,
            paused: false,
            hovered: false,
            oscillationOffset: Math.random() * Math.PI * 2,
            category: d.type || 'pensamiento',
            content: d.content,
            created_at: d.created_at,
            support_count: d.support_count || 0,
            reply_count: d.reply_count || 0,
          };
        });
        
        setPosts(newPosts);
        entitiesRef.current = newPosts;
      }
    } catch (e) {
      console.error("Error fetching posts:", e);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    setMounted(true);
  }, [fetchPosts]);

  const handleLike = async (entity: CloudEntityState, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedPosts.has(entity.id)) return;
    
    setLikedPosts(prev => new Set(prev).add(entity.id));
    const newCount = (entity.support_count || 0) + 1;
    entity.support_count = newCount;
    
    await supabase.from('posts').update({ support_count: newCount }).eq('id', entity.id);
  };

  const handleReplyClick = (entity: CloudEntityState, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPost({
      id: entity.id,
      content: entity.content || '',
      type: entity.category || 'pensamiento',
      created_at: entity.created_at || new Date().toISOString(),
      support_count: entity.support_count || 0,
      reply_count: entity.reply_count || 0,
    });
  };

  const [survivors, setSurvivors] = useState<any[]>([]);

  // Meteor purge: delete all posts except top 5 by likes
  const handleMeteorPurge = useCallback(async () => {
    console.log('☄️ PURGE STARTED');
    try {
      const { data: topPosts } = await supabase
        .from('posts')
        .select('id, content')
        .eq('is_hidden', false)
        .order('support_count', { ascending: false })
        .limit(5);

      if (topPosts && topPosts.length > 0) {
        setSurvivors(topPosts); // Guardar para las estrellas
        const topIds = topPosts.map(p => p.id);
        
        const { error } = await supabase.rpc('purge_clouds', { top_ids: topIds });

        if (error) throw error;
        
        fetchPosts();
      }
    } catch (e) {
      console.error('Meteor purge error:', e);
    }
  }, [fetchPosts]);

  const [filter, setFilter] = useState<EmotionCategory | 'all'>('all');

  // Calcular sentimiento dominante para el cielo
  const counts = posts.reduce((acc, p) => {
    const cat = p.category || 'pensamiento';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantEmotion = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'pensamiento') as EmotionCategory;

  // La purga ahora se maneja dentro de SkyEvents para disparar la animación antes de la limpieza

  // Centrar el scroll inicial
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (mounted && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
      container.scrollTop = (container.scrollHeight - container.clientHeight) / 2;
    }
  }, [mounted]);

  // Drag-to-pan navigation (como Google Maps)
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (e.button !== 0) return;
    
    // No interceptar clics en elementos interactivos (botones, inputs, modales, etc.)
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, input, textarea, a, form, [role="dialog"], label, select');
    if (isInteractive) return;
    
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    };
    container.style.cursor = 'grabbing';
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    container.scrollLeft = dragStart.current.scrollLeft - dx;
    container.scrollTop = dragStart.current.scrollTop - dy;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDragging.current = false;
    const container = scrollContainerRef.current;
    if (container) container.style.cursor = 'grab';
  }, []);

  const [zoom, setZoom] = useState(1);

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.4), 1.6));
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        handleZoom(delta);
      }
    };

    container.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => container.removeEventListener('wheel', handleWheelNative);
  }, []);

  if (!mounted) return null;

  return (
    <div 
      ref={scrollContainerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="fixed inset-0 w-screen h-dvh overflow-auto z-0 hide-scrollbars"
      style={{ cursor: 'grab' }}
    >
      <div 
        className="relative transition-transform duration-300 ease-out origin-center" 
        style={{ 
          width: '300vw', 
          height: '300vh',
          transform: `scale(${zoom})`
        }}
      >
        {/* Layer 1: Background - Reacciona al sentimiento de forma nativa */}
        <div className="absolute inset-0">
        {isDark ? (
          <NightScene />
        ) : (
          <DayScene />
        )}
      </div>

      {/* Layer 2: Sky Events */}
      <SkyEvents 
        isDark={isDark} 
        onMeteorPurge={handleMeteorPurge} 
        survivors={survivors}
        requestPurge={requestPurge}
      />
      
      {/* Layer 3: Interactive Cloud Entities */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <AnimatePresence>
          {entitiesRef.current
            .filter(entity => filter === 'all' || entity.category === filter)
            .map((entity, i) => {
              const cat = (entity.category || 'pensamiento') as EmotionCategory;
              const theme = cloudThemes[cat] || cloudThemes.pensamiento;
              
              return (
                <motion.div
                  key={entity.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.5 }}
                  ref={(el) => registerNode(entity.id, el as HTMLElement)}
                  className="absolute will-change-transform pointer-events-auto cursor-pointer"
                  style={{
                    transform: `translate3d(${entity.x}px, ${entity.y}px, 0)`
                  }}
                  onMouseEnter={() => setHovered(entity.id, true)}
                  onMouseLeave={() => setHovered(entity.id, false)}
                >
                  <CloudShape 
                    category={cat} 
                    variant={((i % 4) + 1) as CloudVariant}
                    isHovered={entity.hovered}
                    likes={entity.support_count}
                  >
                {/* Todo centrado dentro de la nube */}
                <div 
                  className="flex flex-col items-center text-center gap-0.5 cursor-pointer"
                  onClick={(e) => handleReplyClick(entity, e)}
                >
                  <span className={`text-[9px] ${theme.mutedText}`}>{theme.icon}</span>
                  <p className={`text-[11px] font-semibold leading-tight line-clamp-2 ${theme.text}`}>
                    {entity.content}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLike(entity, e); }}
                      className={`flex items-center gap-1 text-xs font-bold hover:scale-110 transition-transform ${
                        likedPosts.has(entity.id) ? 'text-rose-500' : theme.mutedText
                      }`}
                    >
                      <Heart size={12} className={likedPosts.has(entity.id) ? 'fill-rose-500' : ''} />
                      {entity.support_count && entity.support_count > 0 ? entity.support_count : ''}
                    </button>
                    <span className={`text-xs font-bold ${theme.mutedText} flex items-center gap-1`}>
                      <MessageCircle size={12} />{entity.reply_count && entity.reply_count > 0 ? entity.reply_count : ''}
                    </span>
                  </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setReportingPostId(entity.id); }}
                      className={`text-xs hover:scale-110 transition-transform ${theme.mutedText} hover:text-rose-500`}
                      title="Reportar"
                    >
                      <Flag size={10} />
                    </button>
                </div>
              </CloudShape>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>
      
      {/* Paisaje Terrestre (z-[5], debajo de nubes z-10) */}
      <div className="absolute bottom-0 left-0 w-full z-[5]">
        <Landscape />
      </div>
      
      </div> {/* <-- Fin del Lienzo Infinito 300vw/300vh */}

      {/* Astros Fijos (Sol y Luna) */}
      <CelestialBodies />

      {/* Layer 4: UI Overlay (Fixed to screen) */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <button 
          onClick={() => handleZoom(0.1)}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-800 hover:bg-slate-100'}`}
        >
          +
        </button>
        <button 
          onClick={() => handleZoom(-0.1)}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-800 hover:bg-slate-100'}`}
        >
          -
        </button>
        <div className={`text-[10px] text-center font-bold px-2 py-1 rounded bg-black/20 backdrop-blur-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {Math.round(zoom * 100)}%
        </div>
      </div>
      {currentUser && (
        <>
          <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto px-4 pb-4 flex justify-center bg-gradient-to-t from-black/10 dark:from-black/30 to-transparent pt-12">
            <CreatePost onPostCreated={fetchPosts} />
          </div>

          {/* Emotion Filter UI (Fixed to screen) */}
          <div className="fixed top-20 left-6 z-[60] flex flex-col gap-2 pointer-events-auto">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${
                filter === 'all' ? 'bg-white text-black shadow-lg scale-105' : 'bg-black/20 text-white/60 hover:bg-black/40'
              }`}
            >
              Todos
            </button>
            {(Object.keys(cloudThemes) as EmotionCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${
                  filter === cat 
                    ? `${cloudThemes[cat].fill} ${cloudThemes[cat].text} shadow-xl scale-105 border border-white/20` 
                    : 'bg-black/20 text-white/60 hover:bg-black/40 backdrop-blur-sm'
                }`}
              >
                <span className="text-xs">{cloudThemes[cat].icon}</span>
                {cat}
              </button>
            ))}
          </div>

          {/* Minimap */}
          <Minimap posts={posts} scrollContainerRef={scrollContainerRef} zoom={zoom} />

          {/* Replies Modal */}
          <AnimatePresence>
            {selectedPost && (
              <RepliesModal 
                post={selectedPost} 
                onClose={() => setSelectedPost(null)} 
              />
            )}
          </AnimatePresence>

          {/* Report Modal */}
          <AnimatePresence>
            {reportingPostId && (
              <ReportModal
                targetId={reportingPostId}
                targetType="post"
                onClose={() => setReportingPostId(null)}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {/* Force Login Modal */}
      {!currentUser && (
        <LoginModal preventClose={true} />
      )}
    </div>
  );
}
