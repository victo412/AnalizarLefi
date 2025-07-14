import { useRutinaBaseData } from '@/hooks/useRutinaBaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { addDays, startOfWeek } from 'date-fns';
import { EditBlockDialog } from '@/components/dialogs/EditBlockDialog';

const DIAS = [
  { key: 'L', label: 'Lunes', idx: 1 },
  { key: 'M', label: 'Martes', idx: 2 },
  { key: 'X', label: 'Miércoles', idx: 3 },
  { key: 'J', label: 'Jueves', idx: 4 },
  { key: 'V', label: 'Viernes', idx: 5 },
  { key: 'S', label: 'Sábado', idx: 6 },
  { key: 'D', label: 'Domingo', idx: 0 },
];

const TIPO_COLORS: Record<string, string> = {
  fijo: 'bg-blue-50 border-blue-200',
  'básico': 'bg-green-50 border-green-200',
  personal: 'bg-purple-50 border-purple-200',
};

interface WeeklyRoutineTimelineProps {
  onDayClick?: (date: Date) => void;
}

// Agregar función para formatear la hora a HH:mm
function formatHour(time: string) {
  return time.slice(0, 5);
}

export default function WeeklyRoutineTimeline({ onDayClick }: WeeklyRoutineTimelineProps) {
  const { rutina, loading, updateRutinaBaseBlock } = useRutinaBaseData();

  if (loading) return <div className="text-center py-8">Cargando rutina semanal...</div>;

  // Calcular la fecha de cada día de la semana actual (lunes a domingo)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const diasConFecha = DIAS.map((dia, i) => ({
    ...dia,
    date: addDays(weekStart, i)
  }));

  return (
    <Card className="w-full max-w-5xl mx-auto mt-8 shadow-glow">
      <CardHeader>
        <CardTitle className="text-lg gradient-text">Rutina base semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-6">
            {diasConFecha.map(dia => (
              <div key={dia.key} className="flex flex-col items-center space-y-4 min-h-[120px]">
                <div
                  className="font-semibold mb-2 text-muted-foreground text-center text-base tracking-wide cursor-pointer hover:text-primary transition"
                  onClick={() => onDayClick && onDayClick(dia.date)}
                >
                  {dia.label}
                </div>
                {rutina.filter(b => b.dias.includes(dia.key)).length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center">Sin bloques</div>
                ) : (
                  rutina
                    .filter(b => b.dias.includes(dia.key))
                    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                    .map(b => (
                      <EditBlockDialog
                        key={b.id + dia.key}
                        block={{ ...b, category_id: (b as any).category_id || null }}
                        updateBlock={updateRutinaBaseBlock}
                        trigger={
                          <div
                            className={`rounded-xl shadow px-4 py-3 flex flex-col items-center w-full border ${TIPO_COLORS[b.bloque_tipo] || 'bg-gray-50 border-gray-200'} cursor-pointer hover:ring-2 hover:ring-primary/40 transition`}
                            style={{ minWidth: '0', maxWidth: '100%' }}
                          >
                            <span className="font-semibold text-base mb-1 text-primary text-center break-words w-full" title={b.nombre_actividad}>
                              {b.nombre_actividad}
                            </span>
                            <span className="text-xs text-gray-500 mb-2 text-center">{formatHour(b.hora_inicio)} - {formatHour(b.hora_fin)}</span>
                            <div className="flex flex-wrap gap-1 justify-center">
                              <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full border-primary/30 bg-primary/5 text-primary/90">
                                {b.bloque_tipo}
                              </Badge>
                              {b.ubicacion && <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full">{b.ubicacion}</Badge>}
                              {b.requiere_recordatorio && <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">Recordatorio</Badge>}
                            </div>
                          </div>
                        }
                      />
                    ))
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 