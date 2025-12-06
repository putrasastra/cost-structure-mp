-- Create spt_documents table
CREATE TABLE IF NOT EXISTS public.spt_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    file_type TEXT,
    file_url TEXT NOT NULL,
    tax_year TEXT NOT NULL,
    spt_type TEXT NOT NULL CHECK (spt_type IN ('Pribadi', 'Perusahaan')),
    reporting_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spt_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for spt_documents
CREATE POLICY "Users can view their own documents"
    ON public.spt_documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
    ON public.spt_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
    ON public.spt_documents FOR DELETE
    USING (auth.uid() = user_id);

-- Create storage bucket for SPT files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('spt-files', 'spt-files', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Give users access to own folder 1gm9u_0" ON storage.objects FOR SELECT TO public USING (bucket_id = 'spt-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Give users access to own folder 1gm9u_1" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'spt-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Give users access to own folder 1gm9u_2" ON storage.objects FOR DELETE TO public USING (bucket_id = 'spt-files' AND auth.uid()::text = (storage.foldername(name))[1]);
