"use client";

import { useEffect, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { supabase } from "@/lib/supabase";
import { AnimatePresence } from "framer-motion";
import { CloudEntity, Post } from "./cloud-entity";
import { RepliesModal } from "./replies-modal";

const POSTS_PER_PAGE = 10;

export function Feed({ newPostTrigger }: { newPostTrigger: number }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const fetchPosts = useCallback(async (isInitial = false) => {
    try {
      const from = isInitial ? 0 : posts.length;
      const to = from + POSTS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        if (isInitial) {
          setPosts(data as Post[]);
        } else {
          setPosts((prev) => {
            // filter duplicates
            const newPosts = data.filter(d => !prev.some(p => p.id === d.id));
            return [...prev, ...(newPosts as Post[])];
          });
        }
        
        if (data.length < POSTS_PER_PAGE) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [posts.length]);

  // Initial load or new post created
  useEffect(() => {
    setLoading(true);
    fetchPosts(true);
  }, [newPostTrigger]);

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchPosts(false);
    }
  }, [inView, hasMore, loading, fetchPosts]);

  const handleReplyClick = (post: Post) => {
    setSelectedPost(post);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map((n) => (
          <div key={n} className="glass-panel rounded-3xl p-6 h-40"></div>
        ))}
      </div>
    );
  }

  // Calcular la altura del contenedor en base al número de posts
  // Suponiendo ~3 nubes por fila y 300px por fila
  const containerHeight = Math.max(800, Math.ceil(posts.length / 3) * 350 + 600);

  return (
    <>
      <div 
        className="relative w-full overflow-hidden" 
        style={{ height: `${containerHeight}px` }}
      >
        {posts.map((post, index) => (
          <CloudEntity 
            key={post.id} 
            post={post} 
            index={index} 
            onReplyClick={handleReplyClick} 
          />
        ))}

        {/* Carga infinita al final del contenedor relativo */}
        <div 
          className="absolute w-full bottom-32 flex flex-col items-center justify-center pointer-events-none"
        >
          {loading && posts.length > 0 && (
            <div className="text-muted-foreground font-bold animate-pulse">
              Buscando más nubes en el cielo...
            </div>
          )}
          
          {!hasMore && posts.length > 0 && (
            <div className="text-muted-foreground/50 font-bold">
              Has visto todas las nubes del cielo hoy.
            </div>
          )}
        </div>

        {/* Ref para el infinite scroll */}
        <div ref={ref} className="absolute bottom-0 h-32 w-full pointer-events-none" />
      </div>

      <AnimatePresence>
        {selectedPost && (
          <RepliesModal 
            post={selectedPost} 
            onClose={() => setSelectedPost(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
