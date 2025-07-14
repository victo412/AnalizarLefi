import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type SleepSettings = Tables<'sleep_settings'>;
type SleepSettingsInsert = TablesInsert<'sleep_settings'>;
type SleepSettingsUpdate = TablesUpdate<'sleep_settings'>;

export interface SleepData {
  user_id: string;
  preferred_bedtime: string | null;
  cycle_minutes: number | null;
  last_sleep_start: string | null;
  last_wake: string | null;
  sleep_goals: string[] | null;
  alarm_scheme: string | null;
}

export const useSleepSettings = () => {
  const [sleepData, setSleepData] = useState<SleepData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSleepSettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSleepData(null);
        return;
      }

      const { data, error } = await supabase
        .from('sleep_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        toast({
          title: "Error al cargar configuración de sueño",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setSleepData(data);
    } catch (error) {
      console.error('Error fetching sleep settings:', error);
      toast({
        title: "Error al cargar configuración de sueño",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateSleepSettings = async (settings: Partial<SleepSettingsUpdate>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error de autenticación",
          description: "Debes iniciar sesión para guardar la configuración",
          variant: "destructive",
        });
        return;
      }

      if (sleepData) {
        // Update existing settings
        const { error } = await supabase
          .from('sleep_settings')
          .update(settings)
          .eq('user_id', user.id);

        if (error) {
          toast({
            title: "Error al actualizar configuración",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        setSleepData(prev => prev ? { ...prev, ...settings } : null);
      } else {
        // Create new settings
        const newSettings: SleepSettingsInsert = {
          user_id: user.id,
          cycle_minutes: 90,
          ...settings,
        };

        const { data, error } = await supabase
          .from('sleep_settings')
          .insert(newSettings)
          .select()
          .single();

        if (error) {
          toast({
            title: "Error al crear configuración",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        setSleepData(data);
      }

      toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error) {
      console.error('Error saving sleep settings:', error);
      toast({
        title: "Error al guardar configuración",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    }
  };

  const updateBedtime = async (bedtime: string) => {
    await createOrUpdateSleepSettings({ preferred_bedtime: bedtime });
  };

  const updateAlarmScheme = async (scheme: string) => {
    await createOrUpdateSleepSettings({ alarm_scheme: scheme });
  };

  const updateSleepGoals = async (goals: string[]) => {
    await createOrUpdateSleepSettings({ sleep_goals: goals });
  };

  const updateCycleMinutes = async (minutes: number) => {
    await createOrUpdateSleepSettings({ cycle_minutes: minutes });
  };

  const recordSleepStart = async () => {
    await createOrUpdateSleepSettings({ last_sleep_start: new Date().toISOString() });
  };

  const recordWakeUp = async () => {
    await createOrUpdateSleepSettings({ last_wake: new Date().toISOString() });
  };

  useEffect(() => {
    fetchSleepSettings();
  }, []);

  return {
    sleepData,
    loading,
    fetchSleepSettings,
    createOrUpdateSleepSettings,
    updateBedtime,
    updateAlarmScheme,
    updateSleepGoals,
    updateCycleMinutes,
    recordSleepStart,
    recordWakeUp,
  };
};