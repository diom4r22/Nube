-- Enums
CREATE TYPE post_type AS ENUM ('pensamiento', 'pregunta', 'confesion', 'idea');
CREATE TYPE report_target AS ENUM ('post', 'reply');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed');

-- Table: posts
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    type post_type NOT NULL DEFAULT 'pensamiento',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    support_count INT DEFAULT 0,
    reply_count INT DEFAULT 0,
    is_hidden BOOLEAN DEFAULT false
);

-- Table: replies
CREATE TABLE public.replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_hidden BOOLEAN DEFAULT false
);

-- Table: reports
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type report_target NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status report_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policies for posts
-- Anyone can view non-hidden posts
CREATE POLICY "Enable read access for non-hidden posts" ON public.posts
    FOR SELECT
    USING (is_hidden = false);

-- Anyone can insert a post (anonymous)
CREATE POLICY "Enable insert for anyone" ON public.posts
    FOR INSERT
    WITH CHECK (true);

-- Anyone can update support_count (we'll allow specific fields ideally, but for now we allow updating support_count and reply_count via RPC or simple update)
CREATE POLICY "Enable update for support and replies" ON public.posts
    FOR UPDATE
    USING (true);

-- Policies for replies
-- Anyone can view non-hidden replies
CREATE POLICY "Enable read access for non-hidden replies" ON public.replies
    FOR SELECT
    USING (is_hidden = false);

-- Anyone can insert a reply
CREATE POLICY "Enable insert for anyone on replies" ON public.replies
    FOR INSERT
    WITH CHECK (true);

-- Policies for reports
-- Anyone can insert a report
CREATE POLICY "Enable insert for anyone on reports" ON public.reports
    FOR INSERT
    WITH CHECK (true);

-- Only admins should read reports (we leave it default restrictive for select)

-- Indexes for performance (Infinite scrolling typically orders by created_at)
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_replies_post_id ON public.replies(post_id);

-- Function to increment reply count automatically
CREATE OR REPLACE FUNCTION increment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.posts
    SET reply_count = reply_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_reply_count
AFTER INSERT ON public.replies
FOR EACH ROW
EXECUTE FUNCTION increment_reply_count();
