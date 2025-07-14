
import { useState, useEffect } from 'react';
import { Moon, Sun, Clock, Bed, Coffee, Smartphone, Book, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useSleepSettings } from '@/hooks/useSleepSettings';

interface SleepDisplayData {
  bedtime: string;
  wakeTime: string;
  sleepGoal: number; // horas
  smartAlarmEnabled: boolean;
  sleepScore: number;
}

interface RoutineItem {
  id: string;
  name: string;
  icon: any;
  enabled: boolean;
  time: string;
  type: 'bedtime' | 'morning';
}

export const SleepRoutineModule = () => {
  const { sleepData, loading, updateBedtime, updateAlarmScheme, updateSleepGoals, updateCycleMinutes } = useSleepSettings();
  
  const [displayData, setDisplayData] = useState<SleepDisplayData>({
    bedtime: '23:00',
    wakeTime: '07:00',
    sleepGoal: 8,
    smartAlarmEnabled: true,
    sleepScore: 82
  });

  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([
    {
      id: '1',
      name: 'Dejar el móvil',
      icon: Smartphone,
      enabled: true,
      time: '22:30',
      type: 'bedtime'
    },
    {
      id: '2',
      name: 'Lectura relajante',
      icon: Book,
      enabled: true,
      time: '22:45',
      type: 'bedtime'
    },
    {
      id: '3',
      name: 'Café matutino',
      icon: Coffee,
      enabled: true,
      time: '07:15',
      type: 'morning'
    },
    {
      id: '4',
      name: 'Luz natural',
      icon: Sun,
      enabled: false,
      time: '07:00',
      type: 'morning'
    }
  ]);

  const toggleRoutineItem = (id: string) => {
    setRoutineItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  // Sincronizar datos de Supabase con el estado local
  useEffect(() => {
    if (sleepData) {
      setDisplayData({
        bedtime: sleepData.preferred_bedtime || '23:00',
        wakeTime: '07:00', // Calcular basado en bedtime + cycle_minutes
        sleepGoal: sleepData.cycle_minutes ? sleepData.cycle_minutes / 60 : 8,
        smartAlarmEnabled: sleepData.alarm_scheme === 'smart',
        sleepScore: 82 // Esto se calcularía basado en datos históricos
      });
    }
  }, [sleepData]);

  const handleSleepGoalChange = async (value: number[]) => {
    const newGoal = value[0];
    setDisplayData(prev => ({ ...prev, sleepGoal: newGoal }));
    await updateCycleMinutes(newGoal * 60); // Convertir horas a minutos
  };

  const handleSmartAlarmToggle = async () => {
    const newScheme = displayData.smartAlarmEnabled ? 'fixed' : 'smart';
    setDisplayData(prev => ({ ...prev, smartAlarmEnabled: !prev.smartAlarmEnabled }));
    await updateAlarmScheme(newScheme);
    
    toast({
      title: displayData.smartAlarmEnabled ? "Alarma inteligente desactivada" : "Alarma inteligente activada",
      description: displayData.smartAlarmEnabled 
        ? "La alarma sonará a la hora exacta" 
        : "La alarma buscará el mejor momento para despertarte",
    });
  };

  const handleBedtimeChange = async (newBedtime: string) => {
    setDisplayData(prev => ({ ...prev, bedtime: newBedtime }));
    await updateBedtime(newBedtime);
  };

  const calculateSleepDuration = () => {
    const bedTime = new Date(`2024-01-01 ${displayData.bedtime}`);
    const wakeTime = new Date(`2024-01-02 ${displayData.wakeTime}`);
    const diff = wakeTime.getTime() - bedTime.getTime();
    return Math.round(diff / (1000 * 60 * 60) * 10) / 10;
  };

  const bedtimeRoutines = routineItems.filter(item => item.type === 'bedtime');
  const morningRoutines = routineItems.filter(item => item.type === 'morning');
  const sleepDuration = calculateSleepDuration();

  if (loading) {
    return (
      <Card className="shadow-glow">
        <CardContent className="text-center py-12">
          <div className="space-y-3">
            <div className="relative">
              <Moon className="h-10 w-10 mx-auto animate-pulse text-primary" />
              <Sparkles className="h-4 w-4 text-primary/60 absolute -top-1 -right-1 animate-bounce" />
            </div>
            <p className="text-muted-foreground">Cargando configuración de sueño...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sleep Overview */}
      <Card className="shadow-glow">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Moon className="h-5 w-5 text-primary" />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-sm" />
            </div>
            <div>
              <CardTitle className="text-lg gradient-text">Rutinas & Sueño</CardTitle>
              <CardDescription className="text-sm">
                Optimiza tu descanso con rutinas inteligentes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sleep Score */}
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200/50 dark:border-emerald-800/30">
              <div className="text-3xl font-bold gradient-text mb-2">
                {displayData.sleepScore}
              </div>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                Puntuación del sueño
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Basado en duración y calidad
              </p>
            </div>

            {/* Sleep Duration */}
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200/50 dark:border-blue-800/30">
              <div className="text-3xl font-bold gradient-text mb-2">
                {sleepDuration}h
              </div>
              <Badge variant="outline" className={
                sleepDuration >= displayData.sleepGoal 
                  ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" 
                  : "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800"
              }>
                Duración planificada
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Objetivo: {displayData.sleepGoal}h
              </p>
            </div>

            {/* Next Alarm */}
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200/50 dark:border-purple-800/30">
              <div className="text-3xl font-bold gradient-text mb-2">
                {displayData.wakeTime}
              </div>
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                {displayData.smartAlarmEnabled ? 'Alarma inteligente' : 'Alarma fija'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {displayData.smartAlarmEnabled ? 'Ventana: 06:45-07:15' : 'Hora exacta'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sleep Settings */}
      <Card className="shadow-glow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg gradient-text flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Configuración</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Bedtime Setting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Hora de dormir</label>
              <input
                type="time"
                value={displayData.bedtime}
                onChange={(e) => handleBedtimeChange(e.target.value)}
                className="px-3 py-1 text-sm border rounded-md bg-background"
              />
            </div>
          </div>

          {/* Sleep Goal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Objetivo de sueño</label>
              <span className="text-sm text-muted-foreground">{displayData.sleepGoal}h</span>
            </div>
            <Slider
              value={[displayData.sleepGoal]}
              onValueChange={handleSleepGoalChange}
              max={12}
              min={6}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>6h</span>
              <span>12h</span>
            </div>
          </div>

          {/* Smart Alarm */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="space-y-1">
              <label className="text-sm font-medium">Alarma inteligente</label>
              <p className="text-xs text-muted-foreground">
                Despierta en el momento óptimo de tu ciclo de sueño
              </p>
            </div>
            <Switch
              checked={displayData.smartAlarmEnabled}
              onCheckedChange={handleSmartAlarmToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Routines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bedtime Routines */}
        <Card className="shadow-glow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg gradient-text flex items-center space-x-2">
              <Bed className="h-5 w-5" />
              <span>Rutina nocturna</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {bedtimeRoutines.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:shadow-glow-hover transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    item.enabled 
                      ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
                <Switch
                  checked={item.enabled}
                  onCheckedChange={() => toggleRoutineItem(item.id)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Morning Routines */}
        <Card className="shadow-glow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg gradient-text flex items-center space-x-2">
              <Sun className="h-5 w-5" />
              <span>Rutina matutina</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {morningRoutines.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:shadow-glow-hover transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    item.enabled 
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
                <Switch
                  checked={item.enabled}
                  onCheckedChange={() => toggleRoutineItem(item.id)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
