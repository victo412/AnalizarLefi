import { useState, useEffect } from 'react';
import { addDays, subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Calendar as CalendarIcon, CheckCircle2, Circle, MoreVertical, Edit, Trash, Play, Pause, Plus, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CreateBlockDialog } from '@/components/dialogs/CreateBlockDialog';
import { QuickCaptureComponent } from '@/components/modules/QuickCaptureComponent';
import { useBlocks } from '@/hooks/useBlocks';
import { toast } from '@/hooks/use-toast';
import { EditBlockDialog } from '@/components/dialogs/EditBlockDialog';
import { useCategories } from '@/hooks/useCategories';
import { useRutinaBaseData } from '@/hooks/useRutinaBaseData';
import { useSyncRutinaBaseToBlocks } from '@/hooks/useSyncRutinaBaseToBlocks';
import { Calendar } from '@/components/ui/calendar';

interface PlannerModuleProps {
  onBlockComplete?: () => void;
  onSwitchToPlanner?: () => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export const PlannerModule = ({ onBlockComplete, onSwitchToPlanner, selectedDate, setSelectedDate }: PlannerModuleProps) => {
  useSyncRutinaBaseToBlocks();
  const { blocks, updateBlock, deleteBlock, loading } = useBlocks();
  const { categories } = useCategories();
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [editBlockId, setEditBlockId] = useState<string | null>(null);
  const { rutina: rutinaBase, loading: loadingRutinaBase } = useRutinaBaseData();
  const [showCalendar, setShowCalendar] = useState(false);

  // Obtener letra del día para la fecha seleccionada
  const getLetterForDate = (date: Date) => {
    const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    return days[date.getDay()];
  };
  const selectedLetter = getLetterForDate(selectedDate);

  // Bloques de rutina base para la fecha seleccionada
  const rutinaBaseDiaMapped = rutinaBase
    .filter(bloque => bloque.dias.includes(selectedLetter))
    .map(rb => {
      const [h, m] = rb.hora_inicio.split(":");
      const [h2, m2] = rb.hora_fin.split(":");
      const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), parseInt(h), parseInt(m), 0);
      const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), parseInt(h2), parseInt(m2), 0);
      return {
        id: `rutina-base-${rb.id}`,
        title: rb.nombre_actividad,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: 'base',
        tier: 2,
        icon: 'calendar',
        color: '',
        created_at: '',
        updated_at: '',
        user_id: rb.user_id,
        source: 'rutina_base',
        category_id: '',
        ...rb
      };
    });

  // Filtrar bloques de la tabla blocks para la fecha seleccionada
  const dateStr = selectedDate.toISOString().slice(0, 10);
  const blocksForDate = blocks.filter(block => {
    const blockDate = new Date(block.start_time).toISOString().slice(0, 10);
    return blockDate === dateStr;
  });

  // Evita duplicados por nombre y hora
  const allBlocks = [
    ...blocksForDate,
    ...rutinaBaseDiaMapped.filter(rb => !blocksForDate.some(b => b.title === rb.title && b.start_time?.slice(11,16) === rb.hora_inicio))
  ];

  const handleCompleteBlock = async (blockId: string) => {
    try {
      await updateBlock(blockId, { status: 'completed' });
      onBlockComplete?.();
      toast({
        title: "¡Bloque completado! ✅",
        description: "Excelente trabajo mantén el ritmo",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar el bloque",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      await deleteBlock(blockId);
      toast({
        title: "Bloque eliminado",
        description: "El bloque ha sido eliminado del timeline",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el bloque",
        variant: "destructive",
      });
    }
  };

  const handleStartBlock = async (blockId: string) => {
    try {
      await updateBlock(blockId, { status: 'in_progress' });
      toast({
        title: "¡Bloque iniciado! 🚀",
        description: "Mantén el foco en tu tarea",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar el bloque",
        variant: "destructive",
      });
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
      case 'in_progress':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'pending':
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in_progress':
        return 'En Progreso';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Pendiente';
    }
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1:
        return 'Alta';
      case 2:
        return 'Media';
      case 3:
        return 'Baja';
      default:
        return 'Media';
    }
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1:
        return 'bg-gradient-to-r from-red-500 to-red-600';
      case 2:
        return 'bg-gradient-to-r from-amber-500 to-amber-600';
      case 3:
        return 'bg-gradient-to-r from-green-500 to-green-600';
      default:
        return 'bg-gradient-to-r from-amber-500 to-amber-600';
    }
  };

  // Calculate overall progress
  const completedBlocks = allBlocks.filter(block => block.status === 'completed').length;
  const totalBlocks = allBlocks.length;
  const progressPercentage = totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0;

  if (loading) {
    return (
      <Card className="shadow-glow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Timeline Diario</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="relative">
                <Clock className="h-10 w-10 mx-auto animate-spin text-primary" />
                <Sparkles className="h-4 w-4 text-primary/60 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <p className="text-muted-foreground">Cargando timeline...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-glow">
      <CardHeader className="pb-4">
        {/* Navegación de días y datepicker visual */}
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <button
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-lg"
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            title="Día anterior"
          >
            &lt;
          </button>
          <span
            className="font-semibold text-lg cursor-pointer hover:underline"
            onClick={() => setShowCalendar((v) => !v)}
          >
            {format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
          </span>
          <button
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-lg"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            title="Día siguiente"
          >
            &gt;
          </button>
          {showCalendar && (
            <div className="absolute z-50 mt-2" onBlur={() => setShowCalendar(false)} tabIndex={-1}>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={date => { if(date) { setSelectedDate(date); setShowCalendar(false); } }}
                className="rounded-md border shadow-md bg-white"
                captionLayout="dropdown"
                fromYear={2024}
                toYear={2030}
                showOutsideDays
                initialFocus
              />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-sm" />
            </div>
            <CardTitle className="text-lg gradient-text">Timeline Diario</CardTitle>
          </div>
          <CreateBlockDialog onBlockCreated={() => {}} />
        </div>
        
        {totalBlocks > 0 && (
          <div className="space-y-3 mt-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progreso del día</span>
              <span className="font-medium">{completedBlocks}/{totalBlocks} bloques</span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-2 rounded-full bg-gray-100"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-2">
        {allBlocks.length === 0 ? (
          <div className="text-center py-12">
            <div className="relative mb-6">
              <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground/60" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full blur-xl" />
            </div>
            <h3 className="text-lg font-semibold mb-3 gradient-text">No hay bloques programados</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Crea tu primer bloque para empezar a organizar tu día de forma inteligente
            </p>
            <CreateBlockDialog />
          </div>
        ) : (
          <div className="space-y-3">
            {allBlocks
              .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
              .map((block) => {
                // Determinar el color de la categoría
                const category = categories.find(cat => cat.id === block.category_id);
                const blockColor = category ? category.color : '#3b82f6';
                const blockGradient = `linear-gradient(90deg, ${blockColor} 0%, ${blockColor}33 100%)`;
                // Determinar si es un bloque de rutina base
                const isRutinaBase = block.source === 'rutina_base';

                return (
                  <EditBlockDialog
                    key={block.id}
                    block={{
                      id: block.id,
                      nombre_actividad: block.title,
                      dias: [], // No disponible en blocks
                      hora_inicio: block.start_time.slice(11,16) + ':00',
                      hora_fin: block.end_time.slice(11,16) + ':00',
                      ubicacion: '', // No disponible en blocks
                      requiere_recordatorio: false, // No disponible en blocks
                      es_inflexible: false, // No disponible en blocks
                      bloque_tipo: 'personal', // No disponible en blocks
                      estado: 'activo', // No disponible en blocks
                      category_id: block.category_id || null,
                    }}
                    updateBlock={updateBlock}
                    trigger={
                      <Card
                        className={`
                          flex flex-col justify-between p-4 mb-3 rounded-xl shadow-md
                          bg-gradient-to-l from-blue-50 to-gray-50
                          border border-gray-200
                          relative
                          transition-all
                          hover:scale-[1.01] hover:shadow-lg
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Circle className="w-5 h-5 text-blue-300 opacity-60" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-lg text-gray-800">{block.title}</span>
                            <span className="text-xs text-gray-500 mt-0.5">
                              {formatTime(block.start_time)} - {formatTime(block.end_time)}
                            </span>
                          </div>
                          {block.source === 'rutina_base' && (
                            <span className="absolute top-2 right-3 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">Rutina base</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`
                            text-xs px-2 py-0.5 rounded-full font-medium
                            ${block.status === 'completed' ? 'bg-green-100 text-green-700' : block.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
                          `}>
                            {getStatusLabel(block.status)}
                          </span>
                          <span className={`
                            text-xs px-2 py-0.5 rounded-full font-medium
                            ${getTierColor(block.tier)}
                          `}>
                            {getTierLabel(block.tier)}
                          </span>
                        </div>
                      </Card>
                    }
                  />
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};