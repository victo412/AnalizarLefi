import { createClient } from '@supabase/supabase-js';
import { RutinaBaseUsuario, NecesidadBasica } from '@/integrations/supabase/types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function useRutinaBase() {
  const saveRutina = async (
    userId: string,
    rutina: {
      fijos: Omit<RutinaBaseUsuario, 'id'|'user_id'|'creado_en'|'actualizado_en'>[],
      basicos: Omit<NecesidadBasica, 'id'|'user_id'|'creado_en'>[],
      personales: Omit<RutinaBaseUsuario, 'id'|'user_id'|'creado_en'|'actualizado_en'>[],
    }
  ) => {
    // Guardar bloques fijos y personales
    const cleanBloque = (b, tipo) => {
      const { nombre_actividad, dias, hora_inicio, hora_fin, ubicacion, requiere_recordatorio, es_inflexible } = b;
      return {
        user_id: userId,
        nombre_actividad,
        dias,
        hora_inicio,
        hora_fin,
        ubicacion: ubicacion || null,
        requiere_recordatorio: !!requiere_recordatorio,
        es_inflexible: tipo === 'fijo' ? true : (typeof es_inflexible === 'boolean' ? es_inflexible : false),
        bloque_tipo: tipo,
        estado: 'activo',
      };
    };
    const bloques = [
      ...rutina.fijos.map(b => cleanBloque(b, 'fijo')),
      ...rutina.personales.map(b => cleanBloque(b, 'personal')),
    ];
    console.log('Intentando guardar bloques rutina_base_usuario:', bloques);
    if (bloques.length > 0) {
      const { error, data } = await supabase.from('rutina_base_usuario').insert(bloques);
      if (error) {
        console.error('Error al guardar bloques rutina_base_usuario:', error);
      } else {
        console.log('Bloques rutina_base_usuario guardados:', data);
      }
    }
    // Guardar necesidades básicas
    if (rutina.basicos.length > 0) {
      const basicos = rutina.basicos.map(b => {
        const { tipo, hora, duracion_minutos, rango_flexible } = b;
        return {
          user_id: userId,
          tipo,
          hora,
          duracion_minutos: Number(duracion_minutos) || 60,
          rango_flexible: !!rango_flexible,
        };
      });
      console.log('Intentando guardar necesidades_basicas:', basicos);
      const { error, data } = await supabase.from('necesidades_basicas').insert(basicos);
      if (error) {
        console.error('Error al guardar necesidades_basicas:', error);
      } else {
        console.log('Necesidades_basicas guardadas:', data);
      }
    }
  };

  // Puedes agregar métodos para editar, pausar, etc.

  return { saveRutina };
} 