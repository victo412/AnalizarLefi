import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { RutinaBaseUsuario } from "@/integrations/supabase/types";

export function useRutinaBaseData() {
  const { user } = useAuth();
  const [rutina, setRutina] = useState<RutinaBaseUsuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("rutina_base_usuario")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (!error) setRutina(data || []);
        setLoading(false);
      });
  }, [user]);

  // Nueva función para actualizar un bloque de rutina base
  const updateRutinaBaseBlock = async (id: string, updates: Partial<RutinaBaseUsuario>) => {
    if (!user) throw new Error('No autenticado');
    const { data, error } = await (supabase as any)
      .from('rutina_base_usuario')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw error;
    setRutina(prev => prev.map(b => b.id === id ? { ...b, ...updates } as RutinaBaseUsuario : b));
    return data;
  };

  return { rutina, loading, updateRutinaBaseBlock };
} 