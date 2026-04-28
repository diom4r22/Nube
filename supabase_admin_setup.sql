-- ==========================================
-- SCRIPT DE CONFIGURACIÓN DE ADMIN (CLOUDWHISPER)
-- Ejecuta esto en el SQL Editor de tu panel de Supabase
-- ==========================================

-- 1. Crear tabla de administradores
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas (Para permitir lectura anónima solo para verificar login)
-- Nota: En producción, el password debería estar en hash. Esto es solo para la prueba local/demo.
DROP POLICY IF EXISTS "Allow public read of admins for login verification" ON public.admins;
CREATE POLICY "Allow public read of admins for login verification"
ON public.admins FOR SELECT
TO public
USING (true);

-- 4. Insertar usuario admin por defecto (admin / admin123)
-- Si ya existe, no hace nada
INSERT INTO public.admins (username, password)
VALUES ('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- 5. Dar permisos al rol anon y authenticated
GRANT SELECT ON public.admins TO anon, authenticated;
