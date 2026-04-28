-- ==========================================
-- SCRIPT DE CONFIGURACIÓN DE USUARIOS (CLOUDWHISPER)
-- Ejecuta esto en el SQL Editor de tu panel de Supabase
-- ==========================================

-- 1. Eliminar la tabla anterior de admins si existe
DROP TABLE IF EXISTS public.admins CASCADE;

-- 2. Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas 
-- Nota: En producción, el password debería estar en hash. Esto es solo para la demo.
DROP POLICY IF EXISTS "Permitir lectura publica" ON public.users;
CREATE POLICY "Permitir lectura publica"
ON public.users FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Permitir insercion publica" ON public.users;
CREATE POLICY "Permitir insercion publica"
ON public.users FOR INSERT
TO public
WITH CHECK (true);

-- 5. Insertar usuario admin por defecto (nubeadmin / secreto123)
INSERT INTO public.users (username, password, is_admin)
VALUES ('nubeadmin', 'secreto123', true)
ON CONFLICT (username) DO NOTHING;

-- 6. Dar permisos al rol anon y authenticated
GRANT SELECT, INSERT ON public.users TO anon, authenticated;
