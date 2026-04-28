-- ==========================================
-- 1. LIMPIEZA TOTAL
-- ==========================================
DROP TRIGGER IF EXISTS trigger_reply_count_sync ON public.replies;
DROP FUNCTION IF EXISTS handle_reply_count();
DROP FUNCTION IF EXISTS purge_clouds(UUID[]);
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.replies CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE; -- NUEVA TABLA
DROP TYPE IF EXISTS post_type CASCADE;
DROP TYPE IF EXISTS report_target CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;

-- ==========================================
-- 2. TIPOS DE DATOS (Enums)
-- ==========================================
CREATE TYPE post_type AS ENUM ('pensamiento', 'pregunta', 'confesion', 'idea', 'amor', 'tristeza', 'alegria');
CREATE TYPE report_target AS ENUM ('post', 'reply');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed');

-- ==========================================
-- 3. TABLA DE USUARIOS (NUEVO)
-- ==========================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. TABLA PRINCIPAL: POSTS (Nubes)
-- ==========================================
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    type post_type NOT NULL DEFAULT 'pensamiento',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    support_count INT DEFAULT 0,
    reply_count INT DEFAULT 0,
    is_hidden BOOLEAN DEFAULT false,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL -- Enlace opcional al autor
);

-- ==========================================
-- 5. TABLA: REPLIES (Respuestas)
-- ==========================================
CREATE TABLE public.replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_hidden BOOLEAN DEFAULT false,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL -- Enlace opcional al autor
);

-- ==========================================
-- 6. TABLA: REPORTS (Denuncias)
-- ==========================================
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type report_target NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status report_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL -- Enlace opcional al denunciante
);

-- ==========================================
-- 7. SEGURIDAD (Row Level Security)
-- ==========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- USERS: Políticas
CREATE POLICY "Public Select Users" ON public.users FOR SELECT TO public USING (true);
CREATE POLICY "Public Insert Users" ON public.users FOR INSERT TO public WITH CHECK (true);

-- POSTS: Políticas
CREATE POLICY "Public Select Posts" ON public.posts FOR SELECT TO anon USING (is_hidden = false);
CREATE POLICY "Public Insert Posts" ON public.posts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public Update Posts" ON public.posts FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- REPLIES: Políticas
CREATE POLICY "Public Select Replies" ON public.replies FOR SELECT TO anon USING (is_hidden = false);
CREATE POLICY "Public Insert Replies" ON public.replies FOR INSERT TO anon WITH CHECK (true);

-- REPORTS: Políticas
CREATE POLICY "Public Insert Reports" ON public.reports FOR INSERT TO anon WITH CHECK (true);

-- Permisos directos
GRANT ALL ON TABLE public.users TO anon, authenticated;
GRANT ALL ON TABLE public.posts TO anon, authenticated;
GRANT ALL ON TABLE public.replies TO anon, authenticated;
GRANT ALL ON TABLE public.reports TO anon, authenticated;

-- ==========================================
-- 8. USUARIO ADMIN POR DEFECTO
-- ==========================================
INSERT INTO public.users (username, password, is_admin)
VALUES ('nubeadmin', 'secreto123', true)
ON CONFLICT (username) DO NOTHING;

-- ==========================================
-- 9. FUNCIÓN DEL METEORITO (RPC Purge)
-- ==========================================
CREATE OR REPLACE FUNCTION purge_clouds(top_ids UUID[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Salta el RLS para limpiar el cielo
AS $$
BEGIN
  UPDATE public.posts 
  SET is_hidden = true 
  WHERE is_hidden = false 
  AND id != ALL(top_ids);
END;
$$;

-- ==========================================
-- 10. TRIGGERS (Contador de respuestas)
-- ==========================================
CREATE OR REPLACE FUNCTION handle_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts SET reply_count = reply_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts SET reply_count = reply_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reply_count_sync
AFTER INSERT OR DELETE ON public.replies
FOR EACH ROW EXECUTE FUNCTION handle_reply_count();

-- ==========================================
-- 11. ÍNDICES
-- ==========================================
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_support_count ON public.posts(support_count DESC);
CREATE INDEX idx_posts_is_hidden ON public.posts(is_hidden) WHERE is_hidden = false;
CREATE INDEX idx_replies_post_id ON public.replies(post_id);
