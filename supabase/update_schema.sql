-- Alterar el ENUM para añadir las nuevas emociones
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'amor';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'tristeza';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'alegria';
