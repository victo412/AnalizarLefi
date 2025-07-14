-- Enable RLS on all tables
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_settings ENABLE ROW LEVEL SECURITY;

-- Blocks policies
CREATE POLICY "Users can view their own blocks" 
ON public.blocks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own blocks" 
ON public.blocks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blocks" 
ON public.blocks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blocks" 
ON public.blocks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Inbox policies
CREATE POLICY "Users can view their own inbox items" 
ON public.inbox 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inbox items" 
ON public.inbox 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inbox items" 
ON public.inbox 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inbox items" 
ON public.inbox 
FOR DELETE 
USING (auth.uid() = user_id);

-- Sleep settings policies
CREATE POLICY "Users can view their own sleep settings" 
ON public.sleep_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sleep settings" 
ON public.sleep_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep settings" 
ON public.sleep_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep settings" 
ON public.sleep_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on blocks
CREATE TRIGGER update_blocks_updated_at
BEFORE UPDATE ON public.blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();