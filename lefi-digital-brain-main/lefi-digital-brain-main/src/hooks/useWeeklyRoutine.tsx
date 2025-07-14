import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { useProfile } from "./useProfile";

const daysOfWeek = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export type Block = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  color?: string | null;
};

export function useWeeklyRoutine() {
  const { profile } = useProfile();
  const [routine, setRoutine] = useState<Record<string, Block[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.user_id) return;
    setLoading(true);
    supabase
      .from("rutina_base_usuario")
      .select("id, nombre_actividad, hora_inicio, hora_fin, bloque_tipo, dias")
      .eq("user_id", profile.user_id)
      .then(({ data, error }) => {
        if (error) {
          setRoutine({});
        } else {
          const grouped: Record<string, Block[]> = {};
          daysOfWeek.forEach((day) => (grouped[day] = []));
          data?.forEach((block: any) => {
            if (Array.isArray(block.dias)) {
              block.dias.forEach((dia: string) => {
                if (grouped[dia]) {
                  grouped[dia].push({
                    id: block.id,
                    title: block.nombre_actividad,
                    start_time: block.hora_inicio,
                    end_time: block.hora_fin,
                    color: null, // O puedes asignar un color por tipo si lo deseas
                  });
                }
              });
            }
          });
          setRoutine(grouped);
        }
        setLoading(false);
      });
  }, [profile?.user_id]);

  return { routine, loading };
} 