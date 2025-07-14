import { useEffect } from "react";
import { useRutinaBaseData } from "./useRutinaBaseData";
import { useBlocks } from "./useBlocks";

export function useSyncRutinaBaseToBlocks() {
  const { rutina } = useRutinaBaseData();
  const { blocks, createBlock } = useBlocks();

  useEffect(() => {
    if (!rutina || !blocks) return;

    const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    const today = new Date();
    const todayLetter = days[today.getDay()];
    const todayDate = today.toISOString().slice(0, 10); // YYYY-MM-DD

    const rutinaBaseHoy = rutina.filter(b => b.dias.includes(todayLetter));

    // LOGS DE DEPURACIÓN
    console.log('Hoy es:', todayLetter, today.toLocaleDateString());
    console.log('Bloques rutina base para hoy:', rutinaBaseHoy);
    console.log('Bloques diarios:', blocks);

    rutinaBaseHoy.forEach(rb => {
      // Compara por título y hora de inicio (ignorando segundos)
      const exists = blocks.some(b => {
        const blockStart = new Date(b.start_time);
        const blockDate = blockStart.toISOString().slice(0, 10);
        const blockHour = blockStart.toTimeString().slice(0, 5); // HH:MM
        return (
          b.title === rb.nombre_actividad &&
          blockDate === todayDate &&
          blockHour === rb.hora_inicio.slice(0, 5)
        );
      });
      if (!exists) {
        // Usa la fecha local de hoy para evitar desfases de zona horaria
        const [h, m] = rb.hora_inicio.split(":");
        const [h2, m2] = rb.hora_fin.split(":");
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(h), parseInt(m), 0);
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(h2), parseInt(m2), 0);
        createBlock({
          title: rb.nombre_actividad,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          tier: 2,
          icon: "calendar",
          status: "pending",
          source: "rutina_base",
          category_id: "",
        });
      }
    });
  }, [rutina, blocks]);
} 