-- Crear tabla global de categorías
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Políticas: todos pueden leer, solo admin puede modificar
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);

-- Agregar columna category_id a blocks
ALTER TABLE public.blocks ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column(); 