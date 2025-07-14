import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Block = Tables<'blocks'>;
type BlockInsert = TablesInsert<'blocks'>;
type BlockUpdate = TablesUpdate<'blocks'>;

export const useBlocks = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch blocks for the current user
  const fetchBlocks = async () => {
    if (!user) {
      setBlocks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blocks')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching blocks:', error);
        return;
      }

      setBlocks(data || []);
    } catch (error) {
      console.error('Error in fetchBlocks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new block
  const createBlock = async (blockData: Omit<BlockInsert, 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('blocks')
      .insert({
        ...blockData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating block:', error);
      throw error;
    }

    if (data) {
      setBlocks(prev => [...prev, data].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ));
    }

    return data;
  };

  // Update an existing block
  const updateBlock = async (id: string, updates: BlockUpdate) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('blocks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating block:', error);
      throw error;
    }

    if (data) {
      setBlocks(prev => prev.map(block => 
        block.id === id ? data : block
      ).sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ));
    }

    return data;
  };

  // Delete a block
  const deleteBlock = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting block:', error);
      throw error;
    }

    setBlocks(prev => prev.filter(block => block.id !== id));
  };

  // Get blocks by status
  const getBlocksByStatus = (status: string) => {
    return blocks.filter(block => block.status === status);
  };

  // Get blocks for today
  const getTodayBlocks = () => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10); // 'YYYY-MM-DD'
    return blocks.filter(block => {
      const blockDate = new Date(block.start_time).toISOString().slice(0, 10);
      return blockDate === todayStr;
    });
  };

  // Fetch blocks when user changes
  useEffect(() => {
    fetchBlocks();
  }, [user]);

  return {
    blocks,
    loading,
    createBlock,
    updateBlock,
    deleteBlock,
    getBlocksByStatus,
    getTodayBlocks,
    refetch: fetchBlocks,
  };
};