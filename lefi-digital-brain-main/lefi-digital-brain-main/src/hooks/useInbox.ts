import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type InboxItem = Tables<'inbox'>;
type InboxInsert = TablesInsert<'inbox'>;
type InboxUpdate = TablesUpdate<'inbox'>;

export interface CapturedNote {
  id: string;
  content: string;
  type: string | null;
  captured_at: string | null;
  processed: boolean | null;
  source: string | null;
  ai_suggestions: any;
  user_id: string;
}

export const useInbox = () => {
  const [notes, setNotes] = useState<CapturedNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setNotes([]);
        return;
      }

      const { data, error } = await supabase
        .from('inbox')
        .select('*')
        .eq('user_id', user.id)
        .order('captured_at', { ascending: false });

      if (error) {
        toast({
          title: "Error al cargar notas",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error al cargar notas",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (noteData: {
    content: string;
    type: 'text' | 'voice';
    source?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error de autenticación",
          description: "Debes iniciar sesión para capturar notas",
          variant: "destructive",
        });
        return;
      }

      const newNote: InboxInsert = {
        content: noteData.content,
        type: noteData.type,
        source: noteData.source || 'manual',
        user_id: user.id,
        processed: false,
      };

      const { error } = await supabase
        .from('inbox')
        .insert(newNote);

      if (error) {
        toast({
          title: "Error al crear nota",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Nota capturada",
        description: "Se ha añadido al inbox para procesar",
      });

      // Refetch notes
      await fetchNotes();
      return true;
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Error al crear nota",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateNote = async (id: string, updates: Partial<InboxUpdate>) => {
    try {
      const { error } = await supabase
        .from('inbox')
        .update(updates)
        .eq('id', id);

      if (error) {
        toast({
          title: "Error al actualizar nota",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setNotes(prev => 
        prev.map(note => 
          note.id === id ? { ...note, ...updates } : note
        )
      );
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error al actualizar nota",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    }
  };

  const markAsProcessed = async (id: string) => {
    await updateNote(id, { processed: true });
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inbox')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Error al eliminar nota",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setNotes(prev => prev.filter(note => note.id !== id));
      
      toast({
        title: "Nota eliminada",
        description: "La nota se ha eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error al eliminar nota",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    }
  };

  const getUnprocessedCount = () => {
    return notes.filter(note => !note.processed).length;
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return {
    notes,
    loading,
    fetchNotes,
    createNote,
    updateNote,
    markAsProcessed,
    deleteNote,
    getUnprocessedCount,
  };
};