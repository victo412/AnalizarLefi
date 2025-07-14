-- Tabla principal de rutina base del usuario
CREATE TABLE IF NOT EXISTS rutina_base_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES usuarios(id),
  nombre_actividad TEXT NOT NULL,
  dias TEXT[] NOT NULL,  -- ['L','M','X']
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  ubicacion TEXT,
  requiere_recordatorio BOOLEAN,
  es_inflexible BOOLEAN DEFAULT FALSE,
  bloque_tipo TEXT CHECK (bloque_tipo IN ('fijo', 'básico', 'personal')) NOT NULL,
  estado TEXT DEFAULT 'activo', -- 'activo', 'pausado_temporalmente'
  creado_en TIMESTAMP DEFAULT now(),
  actualizado_en TIMESTAMP DEFAULT now()
);

-- Tabla secundaria para necesidades básicas
CREATE TABLE IF NOT EXISTS necesidades_basicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES usuarios(id),
  tipo TEXT CHECK (tipo IN ('comida', 'cena', 'sueño_semana', 'sueño_findes')) NOT NULL,
  hora TIME NOT NULL,
  duracion_minutos INT,
  rango_flexible BOOLEAN,
  creado_en TIMESTAMP DEFAULT now()
); 