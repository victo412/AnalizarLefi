import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  lefi_code: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('Profile query result:', { data, error });

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create one
          console.log('No profile found, creating one...');
          await createInitialProfile(user);
          return;
        }
        throw error;
      }
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInitialProfile = async (user: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          display_name: user.email?.split('@')[0] || 'Usuario',
          lefi_code: await generateLefiCode()
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      
      toast({
        title: "Perfil creado",
        description: "Tu perfil se creó automáticamente",
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el perfil automáticamente",
        variant: "destructive",
      });
    }
  };

  const generateLefiCode = async () => {
    // Generate a random LEFI code
    const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const code = `LEFI${randomNum}`;
    
    // Check if it exists (basic check)
    const { data } = await supabase
      .from('profiles')
      .select('lefi_code')
      .eq('lefi_code', code)
      .single();
    
    if (data) {
      // If it exists, try again
      return generateLefiCode();
    }
    
    return code;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      toast({
        title: "Perfil actualizado",
        description: "Los cambios se guardaron correctamente",
      });
      
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
      throw error;
    }
  };

  const findUserByLefiCode = async (lefiCode: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('lefi_code', lefiCode.toUpperCase())
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    updateProfile,
    findUserByLefiCode,
    refetch: fetchProfile
  };
};