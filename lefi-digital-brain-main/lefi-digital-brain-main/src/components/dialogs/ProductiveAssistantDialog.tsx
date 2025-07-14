import { useState, useEffect } from 'react';
import { Brain, Clock, CheckCircle, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useBlocks } from '@/hooks/useBlocks';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ExistingBlock {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  icon?: string;
  keep?: boolean;
}

interface ProductiveActivity {
  id: string;
  name: string;
  duration: number; // en minutos
  category: string;
  keep?: boolean;
}

const ACTIVITY_CATEGORIES = [
  'Trabajo',
  'Ejercicio',
  'Lectura',
  'Planificación',
  'Aprendizaje',
  'Meditación',
  'Tareas personales',
  'Creatividad',
  'Descanso activo'
];

const SUGGESTED_ACTIVITIES = [
  { name: 'Revisión de emails', duration: 30, category: 'Trabajo' },
  { name: 'Ejercicio matutino', duration: 45, category: 'Ejercicio' },
  { name: 'Lectura/Aprendizaje', duration: 60, category: 'Lectura' },
  { name: 'Planificación del día', duration: 15, category: 'Planificación' },
  { name: 'Proyecto principal', duration: 120, category: 'Trabajo' },
  { name: 'Meditación', duration: 20, category: 'Meditación' },
  { name: 'Tareas administrativas', duration: 45, category: 'Tareas personales' },
  { name: 'Tiempo creativo', duration: 90, category: 'Creatividad' }
];

interface ProductiveAssistantDialogProps {
  trigger: React.ReactNode;
  targetDate?: Date;
}

export function ProductiveAssistantDialog({ trigger, targetDate = new Date() }: ProductiveAssistantDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [existingBlocks, setExistingBlocks] = useState<ExistingBlock[]>([]);
  const [dayStart, setDayStart] = useState('07:00');
  const [dayEnd, setDayEnd] = useState('22:00');
  const [breakDuration, setBreakDuration] = useState(15);
  const [includeBreaks, setIncludeBreaks] = useState(true);
  const [selectedActivities, setSelectedActivities] = useState<ProductiveActivity[]>([]);
  const [customActivity, setCustomActivity] = useState({ name: '', duration: 60, category: 'Trabajo' });
  const [isGenerating, setIsGenerating] = useState(false);

  const { blocks, createBlock, refetch } = useBlocks();

  useEffect(() => {
    if (open) {
      // Filtrar bloques del día seleccionado
      const targetDateStr = format(targetDate, 'yyyy-MM-dd');
      const dayBlocks = blocks.filter(block => {
        const blockDate = format(new Date(block.start_time), 'yyyy-MM-dd');
        return blockDate === targetDateStr;
      }).map(block => ({
        id: block.id,
        title: block.title,
        start_time: block.start_time,
        end_time: block.end_time,
        icon: block.icon
      }));
      
      setExistingBlocks(dayBlocks);
    }
  }, [open, targetDate]);

  // Separate effect for when dialog opens to reset state
  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedActivities([]);
    }
  }, [open]);

  const handleActivityToggle = (activity: ProductiveActivity) => {
    console.log('Activity toggle clicked:', activity.name);
    setSelectedActivities(prev => {
      const exists = prev.find(a => a.id === activity.id);
      if (exists) {
        console.log('Removing activity:', activity.name);
        return prev.filter(a => a.id !== activity.id);
      } else {
        console.log('Adding activity:', activity.name);
        return [...prev, activity];
      }
    });
  };

  const handleAddCustomActivity = () => {
    if (!customActivity.name.trim()) return;
    
    const newActivity: ProductiveActivity = {
      id: `custom-${Date.now()}`,
      name: customActivity.name,
      duration: customActivity.duration,
      category: customActivity.category
    };
    
    setSelectedActivities(prev => [...prev, newActivity]);
    setCustomActivity({ name: '', duration: 60, category: 'Trabajo' });
  };

  const handleExistingBlockToggle = (blockId: string) => {
    setExistingBlocks(prev => 
      prev.map(block => 
        block.id === blockId 
          ? { ...block, keep: !block.keep }
          : block
      )
    );
  };

  const calculateTimeSlots = () => {
    const startHour = parseInt(dayStart.split(':')[0]);
    const startMinute = parseInt(dayStart.split(':')[1]);
    const endHour = parseInt(dayEnd.split(':')[0]);
    const endMinute = parseInt(dayEnd.split(':')[1]);
    
    const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    
    // Calcular tiempo ocupado por bloques existentes que se mantienen
    const keptBlocks = existingBlocks.filter(block => block.keep);
    const occupiedMinutes = keptBlocks.reduce((total, block) => {
      const start = new Date(block.start_time);
      const end = new Date(block.end_time);
      return total + (end.getTime() - start.getTime()) / (1000 * 60);
    }, 0);
    
    // Calcular tiempo necesario para actividades seleccionadas
    const activitiesMinutes = selectedActivities.reduce((total, activity) => total + activity.duration, 0);
    
    // Calcular tiempo para descansos
    const breaksMinutes = includeBreaks ? (selectedActivities.length - 1) * breakDuration : 0;
    
    return {
      totalMinutes,
      occupiedMinutes,
      activitiesMinutes,
      breaksMinutes,
      availableMinutes: totalMinutes - occupiedMinutes,
      neededMinutes: activitiesMinutes + breaksMinutes
    };
  };

  const generateProductiveDay = async () => {
    setIsGenerating(true);
    
    try {
      const timeSlots = calculateTimeSlots();
      
      if (timeSlots.neededMinutes > timeSlots.availableMinutes) {
        toast({
          title: "No hay tiempo suficiente",
          description: "Las actividades seleccionadas requieren más tiempo del disponible",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      // Generar horarios para las actividades
      const startHour = parseInt(dayStart.split(':')[0]);
      const startMinute = parseInt(dayStart.split(':')[1]);
      let currentTime = new Date(targetDate);
      currentTime.setHours(startHour, startMinute, 0, 0);

      // Crear bloques para cada actividad
      for (let i = 0; i < selectedActivities.length; i++) {
        const activity = selectedActivities[i];
        
        // Verificar que no choque con bloques existentes
        const endTime = new Date(currentTime.getTime() + activity.duration * 60000);
        
        await createBlock({
          title: activity.name,
          start_time: currentTime.toISOString(),
          end_time: endTime.toISOString(),
          icon: getActivityIcon(activity.category),
          color: getActivityColor(activity.category),
          source: 'productive_assistant'
        });

        // Añadir tiempo de descanso
        if (includeBreaks && i < selectedActivities.length - 1) {
          currentTime = new Date(endTime.getTime() + breakDuration * 60000);
        } else {
          currentTime = endTime;
        }
      }

      await refetch();
      
      toast({
        title: "¡Día productivo creado! 🎯",
        description: `Se han añadido ${selectedActivities.length} actividades a tu timeline`,
      });

      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el día productivo",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getActivityIcon = (category: string) => {
    const icons = {
      'Trabajo': '💼',
      'Ejercicio': '🏃',
      'Lectura': '📚',
      'Planificación': '📋',
      'Aprendizaje': '🎓',
      'Meditación': '🧘',
      'Tareas personales': '✅',
      'Creatividad': '🎨',
      'Descanso activo': '🌱'
    };
    return icons[category as keyof typeof icons] || '⭐';
  };

  const getActivityColor = (category: string) => {
    const colors = {
      'Trabajo': '#3b82f6',
      'Ejercicio': '#10b981',
      'Lectura': '#8b5cf6',
      'Planificación': '#f59e0b',
      'Aprendizaje': '#06b6d4',
      'Meditación': '#84cc16',
      'Tareas personales': '#ef4444',
      'Creatividad': '#ec4899',
      'Descanso activo': '#6366f1'
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  };

  const timeSlots = calculateTimeSlots();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>Asistente Día Productivo</span>
          </DialogTitle>
          <DialogDescription>
            Te ayudo a crear un día productivo con actividades personalizadas
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Configuración del día</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Primero necesito saber cuándo empieza y termina tu día productivo
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dayStart">Hora de inicio</Label>
                  <Input
                    id="dayStart"
                    type="time"
                    value={dayStart}
                    onChange={(e) => setDayStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dayEnd">Hora de fin</Label>
                  <Input
                    id="dayEnd"
                    type="time"
                    value={dayEnd}
                    onChange={(e) => setDayEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox
                  id="includeBreaks"
                  checked={includeBreaks}
                  onCheckedChange={(checked) => setIncludeBreaks(checked === true)}
                />
                <Label htmlFor="includeBreaks">Incluir descansos entre actividades</Label>
              </div>
              
              {includeBreaks && (
                <div className="ml-6">
                  <Label htmlFor="breakDuration">Duración de descansos (minutos)</Label>
                  <Input
                    id="breakDuration"
                    type="number"
                    value={breakDuration}
                    onChange={(e) => setBreakDuration(parseInt(e.target.value) || 15)}
                    min="5"
                    max="60"
                    className="w-24"
                  />
                </div>
              )}
            </div>

            {existingBlocks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Tareas existentes en este día</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecciona las tareas que quieres mantener:
                </p>
                <div className="space-y-2">
                  {existingBlocks.map((block) => (
                    <div key={block.id} className="flex items-center space-x-2 p-2 border rounded">
                      <Checkbox
                        checked={block.keep || false}
                        onCheckedChange={() => handleExistingBlockToggle(block.id)}
                      />
                      <div className="flex-1">
                        <span className="font-medium">{block.title}</span>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(block.start_time), 'HH:mm')} - {format(new Date(block.end_time), 'HH:mm')}
                        </div>
                      </div>
                      {block.icon && <span className="text-lg">{block.icon}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

             <div className="flex justify-end">
               <Button 
                 onClick={() => {
                   console.log('Advancing to step 2');
                   setStep(2);
                 }}
               >
                 Continuar <ArrowRight className="h-4 w-4 ml-1" />
               </Button>
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Selecciona actividades productivas</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Elige las actividades que quieres incluir en tu día productivo
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUGGESTED_ACTIVITIES.map((activity, index) => {
                const isSelected = selectedActivities.some(a => a.name === activity.name);
                return (
                  <Card 
                    key={index}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleActivityToggle({
                      id: `suggested-${index}`,
                      ...activity
                    })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{activity.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>{activity.duration} min</span>
                            <Badge variant="outline" className="text-xs">{activity.category}</Badge>
                          </div>
                        </div>
                        <div className="text-lg">{getActivityIcon(activity.category)}</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Añadir actividad personalizada</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Nombre de la actividad"
                    value={customActivity.name}
                    onChange={(e) => setCustomActivity(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Duración (min)"
                    value={customActivity.duration}
                    onChange={(e) => setCustomActivity(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  />
                </div>
                <div>
                  <Select
                    value={customActivity.category}
                    onValueChange={(value) => setCustomActivity(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleAddCustomActivity}
                className="mt-2"
                size="sm"
                disabled={!customActivity.name.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Añadir
              </Button>
            </div>

            {selectedActivities.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Actividades seleccionadas ({selectedActivities.length})</h4>
                <div className="space-y-2">
                  {selectedActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getActivityIcon(activity.category)}</span>
                        <span className="font-medium">{activity.name}</span>
                        <Badge variant="outline">{activity.duration}min</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedActivities(prev => prev.filter(a => a.id !== activity.id))}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-muted rounded">
                  <h5 className="font-medium mb-2">Resumen del tiempo</h5>
                  <div className="text-sm space-y-1">
                    <div>Tiempo total disponible: {Math.floor(timeSlots.availableMinutes / 60)}h {timeSlots.availableMinutes % 60}min</div>
                    <div>Tiempo para actividades: {Math.floor(timeSlots.activitiesMinutes / 60)}h {timeSlots.activitiesMinutes % 60}min</div>
                    {includeBreaks && <div>Tiempo para descansos: {timeSlots.breaksMinutes}min</div>}
                    <div className={timeSlots.neededMinutes > timeSlots.availableMinutes ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                      Tiempo total necesario: {Math.floor(timeSlots.neededMinutes / 60)}h {timeSlots.neededMinutes % 60}min
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Atrás
              </Button>
              <Button 
                onClick={generateProductiveDay}
                disabled={selectedActivities.length === 0 || timeSlots.neededMinutes > timeSlots.availableMinutes || isGenerating}
              >
                {isGenerating ? (
                  <>Generando...</>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Crear Día Productivo
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}